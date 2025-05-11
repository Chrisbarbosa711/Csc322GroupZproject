import React, { useCallback, useMemo, useEffect } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { useAuth } from '../contexts/AuthContext';
import { RiUploadCloud2Line } from "react-icons/ri";
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
function TextArea() {
  const { text, 
          setText, 
          wordCount, 
          corrections, 
          checkType,
          activeCorrection, 
          clearEditor,
          saveToFile,
          documentTitle, 
          setDocumentTitle, 
          tokensToDeductSelf, 
          tokensToDeductLLM,
          submissionStatus } = useEditor();
  const { isAuthenticated, userInfo, tokenAmount } = useAuth();
  
  const maxWords = !isAuthenticated || userInfo?.role === 'free' ? 20 : Infinity;
  const tokensToDeduct = checkType === 'llm' ? tokensToDeductLLM : tokensToDeductSelf;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result;
      setText(fileContent);

      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setDocumentTitle(fileName);
    };
    reader.readAsText(file);
  };

    const DeleteButton = () => {
      return (
        <Button variant='outline' onClick={clearEditor}>
          Clear
        </Button>
      )
    }
  
    const SaveButton = () => {
      return (
        <Button variant='outline' onClick={saveToFile}>
          Save
        </Button>
      )
    }

  const editor = useMemo(() => {
    const slateEditor = withHistory(withReact(createEditor()));
    return slateEditor;
  }, []);
  

  const initialValue = useMemo(() => [
    {
      type: 'paragraph',
      children: [{ text: text || '' }],
    },
  ], [text]);
  

  const handleChange = value => {
    const plainText = value[0]?.children[0]?.text || '';
    setText(plainText);
  };


  useEffect(() => {
    if (editor && text !== undefined) {
      const newValue = [
        {
          type: 'paragraph',
          children: [{ text: text || '' }],
        },
      ];
      editor.children = newValue;
      editor.onChange();
    }
  }, [text, editor]);


  const renderLeaf = useCallback(props => {
    const { attributes, children, leaf } = props;
    let style = {};

    if (leaf.error) {
      style.backgroundColor = 'rgba(255, 200, 200, 0.5';
    }
    
    if (leaf.active) {
      style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
      style.border = '1px solid red';
    }
    
    return (
      <span {...attributes} style={style}>
        {children}
      </span>
    );
  }, []);
  

  const decorate = useCallback(([node, path]) => {
    const ranges = [];
    
    if (!node.text || corrections.length === 0) {
      return ranges;
    }
    console.log(activeCorrection)
    console.log(corrections)
    corrections.forEach(error => {
      const start = error.startIndex;
      const end = error.endIndex;
      
      if (start >= 0 && end <= node.text.length) {
        ranges.push({
          anchor: { path, offset: start },
          focus: { path, offset: end },
          error: true,
          active: activeCorrection === error.id
        });
      }
    });

    return ranges;
  }, [corrections, activeCorrection]);

  return (
    <div className="w-full relative">
      <div className='text-left my-2 flex justify-between items-center'>
        <div className='flex flex-row items-center gap-2'>
            <Label className='text-lg font-semibold mr-3 text-gray-500'>
                Title
            </Label>
          <Input
            type='text' 
            name='documentTitle' 
            value={documentTitle}
            className='border border-gray-300 rounded-lg px-3 py-1.5 text-center font-semibold text-gray-500'
            onChange={(e) => setDocumentTitle(e.target.value)}
          />
        </div>
        {/* upload file button */}
        <div className="text-right"> 
          <Label className="inline-flex text-sm text-gray-600 font-semibold rounded-md border border-gray-300 hover:border-primary hover:bg-primary/10 cursor-pointer px-3 py-2">
            <RiUploadCloud2Line className="mr-2" size={20}/>
            <span>upload text file</span>
            <Input 
              type="file" 
              className="hidden" 
              accept=".txt,.doc,.docx"
              onChange={handleFileUpload}
            />
          </Label>
        </div>
      </div>

      <div className='grid sm:grid-cols-1 md:grid-cols-2 border-t border-gray-300 mt-4'>
        <div className="mt-2 text-sm text-gray-600">
            <span>
              Word count: {wordCount}/{maxWords === Infinity ? <>&infin;</> : maxWords}
            </span>
            {wordCount > maxWords && (
              <span className="ml-2 text-red-500">
                Maximum word limit reached
              </span>
            )}
          </div>

          <div className="mt-2 text-sm text-gray-600">
            <span>
            Deducting tokens: {tokensToDeduct}/{tokenAmount}
            </span>
            { tokensToDeduct > tokenAmount && (
              <span className="ml-2 text-red-500">
                Maximum token limit reached
              </span>
            )}
          </div>
      </div>

      <div className="h-[560px] overflow-y-auto overflow-x-hidden p-4">
        <Slate 
          editor={editor} 
          initialValue={initialValue}
          onChange={handleChange}
        >
          <Editable
            renderLeaf={renderLeaf}
            decorate={decorate}
            className="text-left p-4 focus:outline-none w-full max-w-full break-all"
            readOnly={checkType === 'llm' && submissionStatus === 'submitted'}
            onKeyDown={(event) => {
              if (checkType === 'llm' && submissionStatus === 'submitted') {
                event.preventDefault();
              }
            }}
            placeholder={
              maxWords === Infinity 
                ? "Enter your text here..." 
                : `Enter your text here (max ${maxWords} words)...`
            }
          />
        </Slate>  
      </div>

      <div className='grid grid-cols-2 gap-8 absolute bottom-0 center-0 left-1/2 transform -translate-x-1/2'>
        <DeleteButton/>
        <SaveButton/>
      </div>

    </div>
  );
}

export default TextArea;
