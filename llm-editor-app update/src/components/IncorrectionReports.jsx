import { useState } from "react";
import TableComponent from "./Table";
import { 
  useFetchIncorrectionSuggestions,
  useHandleSuggestionRequest
} from "../costumeQuerys/adminQuery";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogClose
} from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { MoreHorizontal, ChevronDown } from "lucide-react";

const IncorrectionReports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [useToImprove, setUseToImprove] = useState(true);
  const [error, setError] = useState(null);

  const { 
    data: reports, 
    isLoading: isLoadingReports,
    error: fetchError,
    refetch
  } = useFetchIncorrectionSuggestions();

  const { 
    mutate: processSuggestion, 
    isLoading: isProcessing 
  } = useHandleSuggestionRequest({
    onSuccess: () => {
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      setError(`Failed to process report: ${error.message}`);
    }
  });

  const headers = {
    "User": "username",
    "Original Text": "originalText", 
    "LLM Suggestion": "llmSuggestion",
    "Date": "date",
    "Status": "statusDisplay"
  };

  const getStatusBadge = (status) => {
    if (status === 'pending') {
      return <span className="text-yellow-600">Pending</span>;
    } else if (status === 'approved') {
      return <span className="text-green-600">Approved</span>;
    } else if (status === 'rejected') {
      return <span className="text-red-600">Rejected</span>;
    }
    return <span className="text-gray-600">{status}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const handleViewReport = (report) => {
    setUseToImprove(true);
    setSelectedReport({...report});
    setIsDialogOpen(true);
  };

  const handleProcessReport = (id, action) => {
    processSuggestion({ 
      suggestionId: id, 
      action,
      improveModel: useToImprove
    });
    setIsDialogOpen(false);
  };

  const processData = (data) => {
    if (!data) return [];
    const suggestions = Array.isArray(data) ? data : data?.suggestions || [];
    
    return suggestions.map(report => ({
      ...report,
      originalText: report.originalText?.length > 30 
        ? report.originalText.substring(0, 30) + '...' 
        : report.originalText,
      llmSuggestion: report.llmSuggestion?.length > 30 
        ? report.llmSuggestion.substring(0, 30) + '...' 
        : report.llmSuggestion,
      date: formatDate(report.createdAt),
      statusDisplay: getStatusBadge(report.status)
    }));
  };

  const dropMenu = [
    {
      id: 1,
      name: "View Details",
      onClick: (report) => handleViewReport(report)
    }
  ];

  if (isLoadingReports) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">LLM Suggestion Reports</h2>
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md">
        <h2 className="text-xl font-semibold text-red-800">Error loading reports</h2>
        <p className="text-red-600">Please try again later or contact support.</p>
      </div>
    );
  }

  const processedData = processData(reports);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground mb-6">
        Review and address report from users about incorrect LLM suggestions
      </p>
        <Button 
          onClick={() => refetch()}
          variant="outline" 
          disabled={isLoadingReports}
        >
          {isLoadingReports ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/15 p-3 rounded-md text-destructive mb-4">
          {error}
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2" 
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {fetchError && (
        <div className="bg-destructive/15 p-3 rounded-md text-destructive mb-4">
          Failed to fetch reports: {fetchError.message}
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2" 
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      <TableComponent 
        headers={{
          "User": "username",
          "Original Text": "originalText", 
          "LLM Suggestion": "llmSuggestion",
          "Date": "date",
          "Status": "statusDisplay"
        }}
        data={processedData}
        dropMenu={dropMenu}
      />

      {selectedReport && (
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            if (!open) {
              setIsDialogOpen(false);
              setTimeout(() => {
                setSelectedReport(null);
                setUseToImprove(true);
              }, 200);
            }
          }}
          modal={true}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
              <DialogDescription>
                Report ID: {selectedReport.id} | Status: {selectedReport.status}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div>
                <h3 className="font-semibold mb-1">Submitted by</h3>
                <p>{selectedReport.username} on {formatDate(selectedReport.createdAt)}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Original Text</h3>
                <ScrollArea className="h-32 border rounded-md p-2">
                  <p className="whitespace-pre-wrap">{selectedReport.originalText}</p>
                </ScrollArea>
              </div>

              <div>
                <h3 className="font-semibold mb-1">LLM Suggestion</h3>
                <ScrollArea className="h-32 border rounded-md p-2">
                  <p className="whitespace-pre-wrap">{selectedReport.llmSuggestion}</p>
                </ScrollArea>
              </div>

              <div>
                <h3 className="font-semibold mb-1">User Explanation</h3>
                <ScrollArea className="h-32 border rounded-md p-2">
                  <p className="whitespace-pre-wrap">{selectedReport.userExplanation}</p>
                </ScrollArea>
              </div>

              {/* 只对pending状态的报告显示改进模型选项 */}
              {selectedReport.status === 'pending' && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="improveModel" 
                    checked={useToImprove}
                    onCheckedChange={setUseToImprove}
                  />
                  <label htmlFor="improveModel" className="text-sm">
                    Use this report to improve our models
                  </label>
                </div>
              )}
            </div>

            <DialogFooter>
              {/* 只对pending状态的报告显示审批按钮 */}
              {selectedReport.status === 'pending' ? (
                <div className="flex space-x-2">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleProcessReport(selectedReport.id, 'reject')}
                  >
                    Reject Report
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => handleProcessReport(selectedReport.id, 'approve')}
                  >
                    {useToImprove ? "Apply & Improve" : "Approve Report"}
                  </Button>
                </div>
              ) : (
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default IncorrectionReports; 