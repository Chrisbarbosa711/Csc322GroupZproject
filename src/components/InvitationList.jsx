import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useFetchInvitations, useHandleInvitation } from "../costumeQuerys/collaboratorQuery";

export default function InvitationList() {
  const { data: invitations, isPending, isError } = useFetchInvitations();
  const { handleInvitation, isPending: isProcessing } = useHandleInvitation();
  const [expandedInvitation, setExpandedInvitation] = useState(null);

  const toggleExpand = (id) => {
    if (expandedInvitation === id) {
      setExpandedInvitation(null);
    } else {
      setExpandedInvitation(id);
    }
  };

  const acceptInvitation = (invitationId) => {
    handleInvitation({
      invitationId,
      action: "accept"
    });
  };

  const rejectInvitation = (invitationId) => {
    handleInvitation({
      invitationId,
      action: "reject"
    });
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const receivedInvitations = invitations?.received || [];

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Loading invitations...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            Failed to load invitations
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Invitations</span>
          {receivedInvitations.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {receivedInvitations.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {receivedInvitations.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No pending invitations
          </div>
        ) : (
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-3">
              {receivedInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="border rounded-lg p-3 hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {invitation.inviter.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{invitation.inviter}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(invitation.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => rejectInvitation(invitation.id)}
                        disabled={isProcessing}
                      >
                        Reject
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => acceptInvitation(invitation.id)}
                        disabled={isProcessing}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
} 