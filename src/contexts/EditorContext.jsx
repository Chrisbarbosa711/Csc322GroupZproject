import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useDeductTokens, useRewardTokens } from '../costumeQuerys/tokenQuery';
import { nanoid } from 'nanoid';
import { useSaveDocument, useUpdateDocument } from '../costumeQuerys/DocumentQuery';

const EditorContext = createContext();


export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};


const DEFAULT_BLACKLIST = ['profanity', 'offensive', 'inappropriate', 'obscene'];

// mock data
const mockCorrections = [
    {
      id: 1,
      type: 'spelling',
      original: 'ia',
      corrected: 'is',
      startIndex: 5,
      endIndex: 7,
      message: 'Correct your spelling',
    },
    {
      id: 2,
      type: 'grammar',
      original: 'ran',
      corrected: 'run',
      startIndex: 15,
      endIndex: 18,
      message: 'Correct your tense',
    }
  ];


export const EditorProvider = ({ children }) => {
  const [text, setText] = useState('');
  const [corrections, setCorrections] = useState([]);
  const [blacklistedWords, setBlacklistedWords] = useState(DEFAULT_BLACKLIST);
  const [submissionStatus, setSubmissionStatus] = useState('idle');
  const [wordCount, setWordCount] = useState(0);
  const [filteredText, setFilteredText] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [activeCorrection, setActiveCorrection] = useState(null);
  const [checkType, setCheckType] = useState('llm');
  const [reEdit, setReEdit] = useState(false);
  const [documentId, setDocumentId] = useState(null);
  const { userInfo, updateLastFreeUse, canUseFree } = useAuth();
  const { deductTokens, rewardTokens } = useDeductTokens();
  const { saveDocument } = useSaveDocument();
  const { updateDocument } = useUpdateDocument();
  const tokenPerWord = 0.05;
  const tokensToDeductLLM = Math.floor(tokenPerWord * wordCount);
  const tokensToDeductSelf = Math.floor(tokensToDeductLLM / 2);



  // Update word count when text changes
  useEffect(() => {
    const count = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    setWordCount(count);
    
    // Filter blacklisted words
    let filtered = text;
    blacklistedWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    setFilteredText(filtered);
  }, [text, blacklistedWords]);

  const clearEditor = useCallback(() => {
    setText('');
    setCorrections([]);
    setSubmissionStatus('idle');
    setDocumentTitle('Untitled Document');
  }, []);

  const removeCorrection = (correctionId) => {
    const filtered = corrections.filter((c) => c.id !== correctionId);
    setCorrections(filtered);

    // if (activeCorrection?.id === correctionId) {
    setActiveCorrection(null);
    // }
  }

  const addToBlacklist = (word) => {
    if (!blacklistedWords.includes(word.toLowerCase())) {
      setBlacklistedWords([...blacklistedWords, word.toLowerCase()]);
      toast({
        title: 'Word added to blacklist',
        description: `"${word}" has been added to the blacklist.`,
      });
    }
  };

  const toastError = (title, description)=> {
    toast.error(<div className='text-left'>
      <p className='font-semibold'>{title}</p>
      <p>{description}</p>
    </div>)
  }

  const toastSuccess = (title, description)=> {
    toast.success(<div className='text-left'>
      <p className='font-semibold'>{title}</p>
      <p>{description}</p>
    </div>)
  }

  const checkForCorrections = async (text) => {
    try {
      // 使用本地运行的简易语法API
      const response = await fetch('http://localhost:7860/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        console.error('API error:', response.status);
        return mockCorrections; // 出错时回退到模拟数据
      }
      
      const data = await response.json();
      console.log('Grammar API response:', data); // 调试用，可以在生产环境中移除
      return data.corrections || [];
    } catch (error) {
      console.error('Error fetching corrections:', error);
      // 如果API调用失败，返回模拟数据作为备选
      return mockCorrections;
    }
  };

  const submitForCorrection = async (type) => {
    toast.dismiss();

    if (wordCount == 0) {
      toastError('Error', 'Please enter at least one word.')
      return;
    }
    if (userInfo?.role === 'free' && wordCount > 20) {
      toastError('Word limit exceeded', 'Free users can only edit texts up to 20 words.');
      return;
    }
    
    // Check for paid userInfo token balance
    if (userInfo?.role === 'paid') {
      if (userInfo.tokens < tokensToDeductLLM) {
        // Penalty: deduct half of available tokens
        deductTokens(Math.floor(userInfo.tokens / 2));
        toastError('Insufficient tokens', `You need ${tokensToDeductLLM} tokens but only have ${userInfo.tokens}. Half of your tokens have been deducted as penalty.`);
        return;
      } 
    }
    
    setSubmissionStatus('submitted');
    
    if (type === 'self') {
      // Self-correction - no actual corrections, just charge tokens
      if (userInfo?.role === 'paid') {
        deductTokens(tokensToDeductSelf)
        toastSuccess('Self-correction completed', `${tokensToDeductSelf} tokens have been deducted for self-correction.`)
      } else if (userInfo?.role === 'free') {
        updateLastFreeUse();
      }
    } else {
      // LLM correction
      if (userInfo?.role === 'paid') {
        deductTokens(tokensToDeductLLM)
        toastSuccess('LLM-correction completed', `${tokensToDeductLLM} tokens have been deducted for LLM-correction.`)
      } else if (userInfo?.role === 'free') {
        updateLastFreeUse();
      }
       
      try {
        const correctionResults = await checkForCorrections(text);
        setCorrections(correctionResults);
        
        if (userInfo?.role === 'paid') {
          if (wordCount > 10 && correctionResults.length === 0) {
            rewardTokens(3);
            toastSuccess('Perfect writing!', 'You earned 3 bonus tokens for error-free writing.')
          }
        } else if (userInfo?.role === 'free') {
          updateLastFreeUse();
        }
      } catch (error) {
        toastError('Error', 'Failed to analyze text. Please try again.')
        setSubmissionStatus('idle');
      }
    }
  };

  const handleCorrectionAction = (action) => {
    if (!userInfo || userInfo.role === 'free') return;
    const correction = corrections.find(c => c.id === activeCorrection);
    if (!correction) {
      console.log('Correction not found:', activeCorrection);
      return;
    }
    
    if (action === 'accept') {
      // Apply the correction to the text
      let newText = text;
      const before = newText.substring(0, correction.startIndex);
      const after = newText.substring(correction.endIndex);
      newText = before + correction.corrected + after;
      setText(newText);
      
      // Adjust indices of other corrections and remove the accepted correction in one step
      const lengthDiff = correction.corrected.length - correction.original.length;
      const updatedCorrections = corrections
        .filter(c => c.id !== correction.id) // Remove the accepted correction
        .map(c => {
          if (c.startIndex > correction.startIndex) {
            // Update indices for corrections that come after the one we just applied
            return {
              ...c,
              startIndex: c.startIndex + lengthDiff,
              endIndex: c.endIndex + lengthDiff
            };
          }
          return c;
        });
      
      // Update corrections state with the updated indices
      setCorrections(updatedCorrections);
      setActiveCorrection(null);
    } else {
      // For reject action, just remove the correction
      removeCorrection(correction.id);
    }
  };

  const reportCorrection = (correction) => {
    // call report incorrect modal
    console.log(correction)
  };

  const addCollaborator = (email) => {
    if (!collaborators.includes(email)) {
      setCollaborators([...collaborators, email]);
      toast({
        title: 'Collaborator added',
        description: `${email} has been added as a collaborator.`,
      });
    }
  };

  const removeCollaborator = (email) => {
    setCollaborators(collaborators.filter(c => c !== email));
    toast({
      title: 'Collaborator removed',
      description: `${email} has been removed from collaborators.`,
    });
  };

  const saveToFile = () => {
    toast.dismiss();
    if (!userInfo || userInfo.role !== 'paid') {
      toastError('Cannot save file', 'Only paid users can save documents.');
      return;
    }
    
    if (userInfo.tokens < 5) {
      toastError('Insufficient tokens', 'You need 5 tokens to save a document.');
      return;
    }
    
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    if (reEdit) {
      updateDocument({
        id: documentId,
        title: documentTitle,
        date: formattedDate,
        content: text,
        wordCount: wordCount,
      });
    } else {
      saveDocument({
        id: nanoid(),
        title: documentTitle,
        date: formattedDate,
        content: text,
        wordCount: wordCount,
      });
    }
    
    // Deduct tokens
    deductTokens(5);
    toastSuccess('Document saved', 'Your document has been saved successfully.');
  };
  
  const canEdit = Boolean(
    userInfo && (
      userInfo.role === 'paid' ||
      userInfo.role === 'super' ||
      (userInfo.role === 'free' && wordCount <= 20 && canUseFree)
    )
  );

  const DownloadFile = () => {
    const element = document.createElement('a');
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${documentTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
  }

  return (
    <EditorContext.Provider
      value={{
        text,
        setText,
        wordCount,
        corrections,
        removeCorrection,
        checkType,
        setCheckType,
        blacklistedWords,
        addToBlacklist,
        submissionStatus,
        setSubmissionStatus,
        submitForCorrection,
        handleCorrectionAction,
        filteredText,
        collaborators,
        addCollaborator,
        removeCollaborator,
        canEdit,
        clearEditor,
        saveToFile,
        documentTitle,
        setDocumentTitle,
        tokensToDeductLLM,
        tokensToDeductSelf,
        reportCorrection,
        activeCorrection, 
        setActiveCorrection,
        DownloadFile,
        setReEdit,
        setDocumentId
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};