import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import TextArea from '@/components/TextArea';
import FunctionTab from '@/components/FunctionTab';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useEditor } from '@/contexts/EditorContext';
import { useDocumentDetail } from '@/costumeQuerys/DocumentQuery';
import { toast } from 'sonner';

const EditorPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const docId = searchParams.get('docId');
  
  // Get document data from location state if available (from RecentEdits navigation)
  const preloadedDocData = location.state?.documentData;
  
  const { data: documentData, isPending, isError } = useDocumentDetail(docId);
  const { setText, setDocumentTitle, clearEditor } = useEditor();
  
  // Use ref to track if document has been loaded to prevent double loading
  const documentLoadedRef = useRef(false);
  
  // Reset the loaded flag when document ID changes
  useEffect(() => {
    if (docId) {
      documentLoadedRef.current = false;
    }
  }, [docId]);
  
  // Combined effect to load document from either preloaded data or query result
  useEffect(() => {
    if (!docId || documentLoadedRef.current) return;
    
    // Try to load from preloaded data first
    if (preloadedDocData?.document) {
      documentLoadedRef.current = true;
      const doc = preloadedDocData.document;
      setText(doc.content);
      setDocumentTitle(doc.title);
      //toast.success('file loaded');
      return;
    }
    
    // Otherwise try to load from query result
    if (documentData?.document) {
      documentLoadedRef.current = true;
      const doc = documentData.document;
      setText(doc.content);
      setDocumentTitle(doc.title);
      //toast.success('file loaded');
      return;
    }
    
    // Show error message if the query has failed
    if (isError) {
      toast.error('load file failed, please try again later');
    }
  }, [docId, preloadedDocData, documentData, isError, setText, setDocumentTitle]);
  
  useEffect(() => {
    return () => {
      clearEditor();
    };
  }, [clearEditor]);

  // Consider document loading if both data sources are unavailable and document hasn't been loaded
  const isDocumentLoading = docId && !documentLoadedRef.current && 
    !preloadedDocData?.document && (isPending || !documentData?.document);

  return (
    <div className="flex flex-row min-h-screen">
      <Sidebar />
      
      <div className="flex flex-1 flex-col">
        <Navbar />

        <main className="flex-1 p-8 flex flex-row">
          {isDocumentLoading ? (
            <div className="flex items-center justify-center w-full">
              <p>loading file...</p>
            </div>
          ) : (
            <>
              <div className='shadow-sm p-4 flex-1'>
                <TextArea />
              </div>
              <div className='shadow-sm p-4'>
                <FunctionTab />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
export default EditorPage