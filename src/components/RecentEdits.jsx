import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useDocumentList, useDocumentDetail } from "../costumeQuerys/DocumentQuery";
import { FaRegFileAlt, FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function RecentEdits() {
  const { data: documents, isPending, isError } = useDocumentList(1, 5);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Edits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Loading documents...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Edits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            Failed to load documents
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Recent Edits</span>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/documents-history">View All</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!documents || documents.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No documents found
          </div>
        ) : (
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-3">
              {documents.map((doc) => (
                <DocumentItem 
                  key={doc.id} 
                  doc={doc} 
                  formatDate={formatDate} 
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// Separate component for document item with pre-fetching capability
function DocumentItem({ doc, formatDate }) {
  // Prefetch document data when hovering over the document item
  const { data: documentData } = useDocumentDetail(doc.id);
  
  return (
    <div className="border rounded-lg p-3 hover:bg-accent/5 transition-colors">
      <div className="flex items-start gap-3">
        <div className="text-primary mt-1">
          <FaRegFileAlt size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="font-medium truncate" title={doc.title}>
              {doc.title}
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {formatDate(doc.latest_update)}
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1 truncate">
            {doc.word_count} words
          </div>
        </div>
        <Link 
          to={`/app?docId=${doc.id}`}
          className="text-primary hover:text-primary/80"
          title="Edit document"
          state={{ 
            documentData: documentData 
          }}
        >
          <FaEdit size={16} />
        </Link>
      </div>
    </div>
  );
} 