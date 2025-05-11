import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Suggestions from "./Suggestions"
import Collaborators from "./Collaborators"
import { useLocation } from "react-router-dom"
import { useEffect, useState } from "react"

const FunctionTab = () => {
    const location = useLocation();
    const [documentId, setDocumentId] = useState(null);
    
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const docId = searchParams.get('docId');
        setDocumentId(docId);
    }, [location]);
    
    return (
        <Tabs defaultValue="suggestions" className="w-[25vw] h-full">
            <TabsList className="w-full">
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
            </TabsList>
            <TabsContent value="suggestions">
                <Suggestions />
            </TabsContent>
            <TabsContent value="collaborators">
                <Collaborators documentId={documentId} />
            </TabsContent>
        </Tabs>
    )
}
export default FunctionTab