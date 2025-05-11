import { useState } from "react";
import TableComponent from "./Table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  useFetchComplaints,
  useHandleComplaint
} from "../costumeQuerys/adminQuery";

const ComplaintRequests = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [applyPenalty, setApplyPenalty] = useState(false);
  const [penalties, setPenalties] = useState({
    blockUser: false,
    deductTokens: 0
  });

  const { data: complaintsData, isPending: isLoading, isError } = useFetchComplaints('');
  const { mutate: handleComplaint } = useHandleComplaint();

  const headers = {
    "Reported By": "username",
    "Collaborator": "collaborator",
    "Subject": "subject",
    "Status": "statusDisplay",
    "Date": "createdAt"
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "pending":
        return <span className="text-yellow-600">Pending</span>;
      case "approved":
      case "resolved":
      case "in_progress":
        return <span className="text-green-600">Approved</span>;
      case "rejected":
        return <span className="text-red-600">Rejected</span>;
      default:
        return <span className="text-gray-600">Unknown</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewDetails = (complaint) => {
    setApplyPenalty(false);
    setPenalties({
      blockUser: false,
      deductTokens: 0
    });
    setSelectedComplaint({...complaint});
    setDialogOpen(true);
  };

  const handleRejectComplaint = () => {
    if (!selectedComplaint) return;
    
    handleComplaint({
      complaintId: selectedComplaint.id,
      action: 'reject',
      response: "",
      penalty: {}
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        setTimeout(() => {
          setSelectedComplaint(null);
          setApplyPenalty(false);
          setPenalties({
            blockUser: false,
            deductTokens: 0
          });
        }, 200);
      }
    });
  };

  const handleApproveComplaint = () => {
    if (!selectedComplaint) return;
    
    const penalty = applyPenalty ? {
      block: penalties.blockUser,
      deductTokens: penalties.deductTokens
    } : {};
    
    handleComplaint({
      complaintId: selectedComplaint.id,
      action: 'approve',
      response: "",
      penalty
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        setTimeout(() => {
          setSelectedComplaint(null);
          setApplyPenalty(false);
          setPenalties({
            blockUser: false,
            deductTokens: 0
          });
        }, 200);
      }
    });
  };

  const processData = (data) => {
    if (!data) return [];
    
    return data.map(item => ({
      ...item,
      statusDisplay: getStatusBadge(item.status),
      createdAt: formatDate(item.createdAt)
    }));
  };

  const dropMenu = [
    {
      id: 1,
      name: "View Details",
      onClick: (row) => handleViewDetails(row)
    }
  ];

  if (isLoading) {
    return <div className="flex justify-center p-8">
      <div className="text-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">Loading complaints...</p>
      </div>
    </div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Error loading complaints. Please try again later.</div>
  }

  const complaints = complaintsData?.complaints || [];
  const processedData = processData(complaints);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-6">
        Review and address complaints from paid users about collaborator behavior
      </p>

      <TableComponent 
        headers={headers}
        data={processedData}
        dropMenu={dropMenu}
      />

      <Dialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            document.body.style.pointerEvents = "none";
            setTimeout(() => {
              document.body.style.pointerEvents = "";
              setSelectedComplaint(null);
              setApplyPenalty(false);
              setPenalties({
                blockUser: false,
                deductTokens: 0
              });
            }, 200);
          }
        }}
        modal={true}
      >
        {selectedComplaint && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Collaboration Complaint
              </DialogTitle>
              <DialogDescription>
                <div className="flex flex-col sm:flex-row sm:justify-between mt-1">
                  <span>
                    Reported by <span className="font-semibold">{selectedComplaint.username}</span> on {formatDate(selectedComplaint.createdAt)}
                  </span>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-5">
              <div className="bg-amber-50 px-4 py-3 rounded-md border border-amber-200">
                <div className="flex gap-2 text-amber-800 mb-1 items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span className="font-medium">Reported Collaborator: {selectedComplaint.collaborator}</span>
                </div>
                <p className="text-sm text-amber-700">Subject: {selectedComplaint.subject}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Complaint Details:</h4>
                <p className="text-sm p-3 border rounded-md bg-gray-50">{selectedComplaint.content}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Reason/Evidence:</h4>
                <p className="text-sm p-3 border rounded-md bg-gray-50">{selectedComplaint.reason}</p>
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-sm">Status:</span> 
                {getStatusBadge(selectedComplaint.status)}
              </div>

              {selectedComplaint.status === 'pending' && (
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox 
                      id="apply-penalty" 
                      checked={applyPenalty}
                      onCheckedChange={(checked) => setApplyPenalty(checked)}
                    />
                    <Label htmlFor="apply-penalty" className="font-medium">
                      Apply penalties to reported collaborator
                    </Label>
                  </div>

                  {applyPenalty && (
                    <div className="pl-6 space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="block-user" 
                          checked={penalties.blockUser}
                          onCheckedChange={(checked) => setPenalties({...penalties, blockUser: checked})}
                        />
                        <Label htmlFor="block-user">
                          Block collaborator (14 days)
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deduct-tokens" className="flex items-center gap-2">
                          Deduct tokens: <span className="font-normal text-sm">({penalties.deductTokens} tokens)</span>
                        </Label>
                        <div className="flex space-x-2 flex-wrap gap-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPenalties({...penalties, deductTokens: 50})}
                            className={penalties.deductTokens === 50 ? "bg-blue-50" : ""}
                          >
                            50
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPenalties({...penalties, deductTokens: 100})}
                            className={penalties.deductTokens === 100 ? "bg-blue-50" : ""}
                          >
                            100
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPenalties({...penalties, deductTokens: 200})}
                            className={penalties.deductTokens === 200 ? "bg-blue-50" : ""}
                          >
                            200
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPenalties({...penalties, deductTokens: 500})}
                            className={penalties.deductTokens === 500 ? "bg-blue-50" : ""}
                          >
                            500
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPenalties({...penalties, deductTokens: 1000})}
                            className={penalties.deductTokens === 1000 ? "bg-blue-50" : ""}
                          >
                            1000
                          </Button>
                          <Input
                            type="number"
                            min="0"
                            step="10"
                            value={penalties.deductTokens}
                            onChange={(e) => setPenalties({...penalties, deductTokens: parseInt(e.target.value) || 0})}
                            className="w-20 h-9"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter className="flex justify-between sm:justify-between">
              {selectedComplaint.status === 'pending' ? (
                <div className="flex gap-2">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleRejectComplaint}
                  >
                    Reject Complaint
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleApproveComplaint}
                  >
                    {applyPenalty ? "Apply Penalties" : "Approve Complaint"}
                  </Button>
                </div>
              ) : (
                <DialogClose asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    Close
                  </Button>
                </DialogClose>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default ComplaintRequests; 