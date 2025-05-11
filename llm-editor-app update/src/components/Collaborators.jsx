import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEditor } from '../contexts/EditorContext';
import { FaSearch, FaUserPlus, FaUserTimes, FaUsers } from 'react-icons/fa';
import { FaRegFlag, FaPlus } from 'react-icons/fa6';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useInviteCollaborator, 
  useFetchCollaboratorList,
  useSearchCollaborator 
} from '../costumeQuerys/collaboratorQuery';
import {
  useDocumentCollaborators,
  useAddDocumentCollaborator,
  useRemoveDocumentCollaborator
} from '../costumeQuerys/DocumentQuery';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ComplaintModal } from './Modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const Collaborators = ({ documentId }) => {
  const { userInfo } = useAuth();
  const {
    openRemoveEditorModal
  } = useEditor();
  
  // 状态
  const [searchName, setSearchName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 查询 Hooks
  const { data: generalCollaborators, isPending: isLoadingGeneralCollaborators } = useFetchCollaboratorList();
  const { data: documentData, isPending: isLoadingDocumentCollaborators } = useDocumentCollaborators(documentId);
  const { data: searchResult, isPending: isSearching } = useSearchCollaborator(searchQuery);
  const { inviteCollaborator, isPending: isInvitingCollaborator } = useInviteCollaborator();
  const { addCollaborator, isPending: isAddingCollaborator } = useAddDocumentCollaborator();
  const { removeCollaborator, isPending: isRemovingCollaborator } = useRemoveDocumentCollaborator();
  
  const documentCollaborators = documentData?.collaborators || [];
  
  // 显示编辑按钮的条件：这里禁用所有 Remove from document 按钮，确保从 Recent Edit 和 History Page 点进来时体验一致
  const showEditButtons = false;

  const UserCard = ({ editor, isDocumentCollab = false }) => {
    return (
      <div
        key={editor.id}
        className="flex items-center justify-between p-4 bg-white border-gray-200"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <Avatar>
              <AvatarFallback className='bg-gray-200 text-gray-700 font-semibold'>{editor.username.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <p className="font-medium">{editor.username}</p>
            <p className="text-sm text-gray-500">{editor.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* 移除 Remove from document 按钮 */}
          {editor.id !== userInfo.id && (
            <TooltipProvider className='p-2'>
              <Tooltip>
                <TooltipTrigger>
                  <ComplaintModal collaborator={editor.username} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Report collaborator</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    )
  }

  const handleSearch = () => {
    if (!searchName.trim()) {
      toast.error("Please enter a username to search");
      return;
    }
    setSearchQuery(searchName.trim());
  };

  const handleInputChange = (e) => {
    setSearchName(e.target.value);
  };

  const handleInvite = (username) => {
    if (documentId) {
      addCollaborator({ documentId, username });
    } else {
      inviteCollaborator(username);
    }
  };
  
  const handleRemoveDocumentCollaborator = (username) => {
    if (documentId) {
      removeCollaborator({ documentId, username });
    }
  };

  if (userInfo?.role !== 'paid') {
    return <div className='text-center text-gray-500 py-4'>
      <p>Only paid users can invite collaborators.</p>
    </div>
  }

  // 搜索结果的用户卡片组件
  const SearchResultCard = ({ user }) => {
    return (
      <div
        key={user.id}
        className="flex items-center justify-between p-4 bg-white border-gray-200"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <Avatar>
              <AvatarFallback className='bg-gray-200 text-gray-700 font-semibold'>{user.username.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <p className="font-medium">{user.username}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <TooltipProvider className='p-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-primary hover:bg-primary/10" 
                onClick={() => handleInvite(user.username)}
                disabled={isInvitingCollaborator || isAddingCollaborator}
              >
                <FaPlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{documentId ? 'Add to document' : 'Invite as collaborator'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {documentId ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Current Collaborators</h4>
            <span className="text-sm text-gray-500">
              {documentCollaborators?.length || 0} collaborators
            </span>
          </div>
          
          <ScrollArea className="h-[250px]">
            {isLoadingDocumentCollaborators ? (
              <div className="text-center py-4">Loading collaborators...</div>
            ) : documentCollaborators.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No collaborators for this document</div>
            ) : (
              documentCollaborators.map(editor => (
                <UserCard key={editor.id} editor={editor} isDocumentCollab={true} />
              ))
            )}
          </ScrollArea>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Current Collaborators</h4>
            <span className="text-sm text-gray-500">
              {generalCollaborators?.length || 0} collaborators
            </span>
          </div>

          <ScrollArea className="h-[250px]">
            {isLoadingGeneralCollaborators ? (
              <div className="text-center py-4">Loading collaborators...</div>
            ) : generalCollaborators?.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No collaborators</div>
            ) : (
              generalCollaborators.map(editor => (
                <UserCard key={editor.id} editor={editor} />
              ))
            )}
          </ScrollArea>
        </section>
      )}

      {/* Invite User Section */}
      <section className="space-y-4">
        <h4 className="font-semibold">
          {documentId ? 'Add User to Document' : 'Invite Collaborator'}
        </h4>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search by username..."
              value={searchName}
              onChange={handleInputChange}
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
            >
              <FaSearch />
            </button>
          </div>
        </div>

        {searchResult?.length > 0 && (
          <div className="space-y-2">
            {searchResult.map((user) => (
              <SearchResultCard key={user.id} user={user} />
            ))}
          </div>
        )}

        {searchQuery && !isSearching && searchResult?.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No users found matching "{searchQuery}"
          </div>
        )}
      </section>
    </div>
  );
};

export default Collaborators;


