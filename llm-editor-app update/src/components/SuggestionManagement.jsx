import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { 
  useFetchIncorrectionSuggestions, 
  useHandleSuggestionRequest 
} from "../costumeQuerys/adminQuery";
import { Checkbox } from "./ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ReloadIcon } from "@radix-ui/react-icons";

const SuggestionManagement = () => {
  // State
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [useToImprove, setUseToImprove] = useState(true);

  // Data fetching
  const { data, isLoading, isError, error } = useFetchIncorrectionSuggestions();
  const handleRequest = useHandleSuggestionRequest();

  // Handle viewing a suggestion detail
  const handleViewSuggestion = (suggestion) => {
    // Reset state first
    setUseToImprove(true);
    // Use a clean copy of the suggestion
    setSelectedSuggestion({...suggestion});
    setIsDialogOpen(true);
  };

  // Process a suggestion (approve/reject)
  const handleProcessSuggestion = (id, action) => {
    handleRequest.mutate({ suggestionId: id, action }, {
      onSuccess: () => {
        setIsDialogOpen(false);
      }
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Generate badge for status
  const getStatusBadge = (status) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200/80",
      approved: "bg-green-100 text-green-800 hover:bg-green-200/80",
      rejected: "bg-red-100 text-red-800 hover:bg-red-200/80"
    };
    
    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Filter and search suggestions
  const filteredSuggestions = data?.suggestions
    ? data.suggestions
        .filter(suggestion => 
          statusFilter === "all" || suggestion.status === statusFilter)
        .filter(suggestion => 
          suggestion.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          suggestion.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          suggestion.llmSuggestion.toLowerCase().includes(searchQuery.toLowerCase()) ||
          suggestion.userExplanation.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Incorrection Suggestions</h1>
        <div className="flex space-x-2">
          <Input
            placeholder="Search suggestions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <ReloadIcon className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      ) : isError ? (
        <div className="text-center text-red-500 p-4">
          Error loading suggestions: {error?.message || "Unknown error"}
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="text-center text-gray-500 p-8">
          No suggestions found matching your criteria.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Original Text</TableHead>
              <TableHead>LLM Suggestion</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuggestions.map((suggestion) => (
              <TableRow key={suggestion.id}>
                <TableCell className="font-medium">{suggestion.username}</TableCell>
                <TableCell className="max-w-xs truncate">{suggestion.originalText}</TableCell>
                <TableCell className="max-w-xs truncate">{suggestion.llmSuggestion}</TableCell>
                <TableCell>{getStatusBadge(suggestion.status)}</TableCell>
                <TableCell>{formatDate(suggestion.createdAt)}</TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewSuggestion(suggestion)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedSuggestion && (
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            if (!open) {
              // First close the dialog visually
              setIsDialogOpen(false);
              // Then clean up state with a slightly longer delay
              setTimeout(() => {
                setSelectedSuggestion(null);
                setUseToImprove(true);
              }, 200);
            }
          }}
          modal={true}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Suggestion Details</DialogTitle>
              <DialogDescription>
                Submitted by {selectedSuggestion.username} on {formatDate(selectedSuggestion.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div>
                <h3 className="font-semibold mb-1">Original Text</h3>
                <ScrollArea className="h-28 border rounded-md p-2">
                  <p className="whitespace-pre-wrap">{selectedSuggestion.originalText}</p>
                </ScrollArea>
              </div>

              <div>
                <h3 className="font-semibold mb-1">LLM Suggestion</h3>
                <ScrollArea className="h-28 border rounded-md p-2">
                  <p className="whitespace-pre-wrap">{selectedSuggestion.llmSuggestion}</p>
                </ScrollArea>
              </div>

              <div>
                <h3 className="font-semibold mb-1">User Explanation</h3>
                <ScrollArea className="h-28 border rounded-md p-2">
                  <p className="whitespace-pre-wrap">{selectedSuggestion.userExplanation}</p>
                </ScrollArea>
              </div>

              {selectedSuggestion.status === 'pending' && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="improveModel" 
                    checked={useToImprove}
                    onCheckedChange={setUseToImprove}
                  />
                  <label htmlFor="improveModel" className="text-sm">
                    Use this suggestion to improve our models
                  </label>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-1">Status</h3>
                <p>{getStatusBadge(selectedSuggestion.status)}</p>
              </div>
            </div>

            <DialogFooter>
              {selectedSuggestion.status === 'pending' ? (
                <div className="flex space-x-2">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleProcessSuggestion(selectedSuggestion.id, 'reject')}
                    disabled={handleRequest.isPending}
                  >
                    {handleRequest.isPending ? 'Processing...' : 'Reject Suggestion'}
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => handleProcessSuggestion(selectedSuggestion.id, 'approve')}
                    disabled={handleRequest.isPending}
                  >
                    {handleRequest.isPending ? 'Processing...' : 
                      useToImprove ? "Approve & Improve Model" : "Approve Suggestion"}
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

export default SuggestionManagement; 