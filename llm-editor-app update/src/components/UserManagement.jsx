import { useState } from 'react';
import TableComponent from './Table';
import { useFetchUserList, useDeleteUser, useBlockOrUnblockUser } from '../costumeQuerys/adminQuery';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const UserManagement = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Data fetching
  const { data: usersData, isLoading, error, refetch } = useFetchUserList();
  const deleteUser = useDeleteUser();
  const blockOrUnblockUser = useBlockOrUnblockUser();

  // Filter users list - exclude 'super' role users and apply search filter
  const filteredUsers = usersData?.users
    ? usersData.users
        .filter(user => user.role !== 'super') // Exclude users with 'super' role
        .filter(
          (user) =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.role?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : [];

  // Format data for table
  const processedUsers = filteredUsers.map(user => ({
    ...user,
    lastActive: user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Unknown',
    tokensRemaining: user.tokens || 0,
    status: user.status || 'active', // Ensure status is set
    statusDisplay: user.status === 'blocked' ? 'Blocked' : 'Active'
  }));

  // Action handlers
  const openDeleteDialog = (user) => {
    // Create a clean copy of the user object to avoid reference issues
    setSelectedUser({...user});
    setIsDeleteDialogOpen(true);
  };

  const openBlockDialog = (user) => {
    // Create a clean copy of the user object to avoid reference issues
    setSelectedUser({...user});
    setIsBlockDialogOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    deleteUser.mutate(selectedUser.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        
        // Allow the dialog to close before clearing the user
        setTimeout(() => {
          setSelectedUser(null);
          refetch();
        }, 300);
      },
      onError: (error) => {
        console.error("Failed to delete user:", error);
      }
    });
  };

  // Handle block user
  const handleBlockUser = () => {
    if (!selectedUser) return;
    
    const action = selectedUser.status === 'blocked' ? 'unblock' : 'block';
    
    blockOrUnblockUser.mutate(
      { userId: selectedUser.id, action },
      {
        onSuccess: () => {
          setIsBlockDialogOpen(false);
          
          // Allow the dialog to close before clearing the user
          setTimeout(() => {
            setSelectedUser(null);
            refetch();
          }, 300);
        },
        onError: (error) => {
          console.error("Failed to update user status:", error);
        }
      }
    );
  };

  // Table dropdown menu
  const dropMenu = [
    {
      id: 1,
      name: "Delete",
      onClick: (user) => openDeleteDialog(user)
    },
    {
      id: 2,
      name: (user) => user.status === 'blocked' ? "Unblock" : "Block",
      onClick: (user) => openBlockDialog(user)
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          Failed to load user data: {error.message}
        </div>
      )}

      {/* Table with dropdown menu */}
      <TableComponent
        headers={{
          "Username": "username",
          "Email": "email",
          "Role": "role",
          "Tokens": "tokensRemaining",
          "Last Active": "lastActive",
          "Status": "statusDisplay"
        }}
        data={processedUsers}
        dropMenu={dropMenu}
      />

      {/* Delete user confirmation dialog */}
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteDialogOpen(false);
            setTimeout(() => setSelectedUser(null), 200);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm User Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the user "{selectedUser?.username}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUser.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block user confirmation dialog */}
      <AlertDialog 
        open={isBlockDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsBlockDialogOpen(false);
            setTimeout(() => setSelectedUser(null), 200);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.status === 'blocked' ? 'Unblock User' : 'Block User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.status === 'blocked'
                ? `Are you sure you want to unblock the user "${selectedUser?.username}"? They will be able to log into the system again.`
                : `Are you sure you want to block the user "${selectedUser?.username}"? They will no longer be able to log into the system.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockUser}
              className={selectedUser?.status === 'blocked' 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-red-600 hover:bg-red-700"}
            >
              {blockOrUnblockUser.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                selectedUser?.status === 'blocked' ? "Unblock" : "Block"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement; 