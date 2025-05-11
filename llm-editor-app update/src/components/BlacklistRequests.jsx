import { useState } from "react";
import TableComponent from "./Table";
import { 
  useFetchBlacklistWords, 
  useHandleBlacklistRequest, 
  useRemoveBlacklistWord,
  useAddBlacklistWord
} from "../costumeQuerys/adminQuery";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

const BlacklistRequests = () => {
    const [newWord, setNewWord] = useState("");
    const { data: blacklistData, isPending, isError } = useFetchBlacklistWords();
    const { mutate: handleBlacklistRequest } = useHandleBlacklistRequest();
    const { mutate: removeBlacklistWord } = useRemoveBlacklistWord();
    const { mutate: addBlacklistWord } = useAddBlacklistWord();
    
    const headers = {
        "Word": "word",
        "Requested By": "requestedBy",
        "Request Date": "requestDate",
        "Status": "status",
        "Reason": "reason"
    };
    
    const handleApproveRequest = (request) => {
        if (!request || !request.id) {
            toast.error("can't handle request");
            return;
        }
        
        handleBlacklistRequest({ 
            requestId: request.id, 
            action: 'approve' 
        });
    };
    
    const handleRejectRequest = (request) => {
        if (!request || !request.id) {
            toast.error("can't handle request");
            return;
        }
        
        handleBlacklistRequest({ 
            requestId: request.id, 
            action: 'reject' 
        });
    };
    
    // remove word from blacklist
    const handleRemoveWord = (word) => {
        if (!word) {
            toast.error("can't remove word");
            return;
        }
        
        removeBlacklistWord(word);
    };
    
    // add word to blacklist
    const handleAddWord = () => {
        if (!newWord.trim()) {
            toast.error("please input a valid word");
            return;
        }
        
        // check if word is already in blacklist
        if (blacklistData?.blacklist?.includes(newWord.trim())) {
            toast.error("this word is already in blacklist");
            return;
        }
        
        addBlacklistWord(newWord.trim(), {
            onSuccess: () => {
                setNewWord("");
            }
        });
    };
    
    // filter out pending requests
    const pendingRequests = blacklistData?.requests?.filter(req => req.status === 'pending') || [];
    
    // define dropdown menu options
    const dropMenu = [
        {
            id: 1,
            name: "Approve",
            onClick: (row) => handleApproveRequest(row)
        },
        {
            id: 2,
            name: "Reject",
            onClick: (row) => handleRejectRequest(row)
        }
    ];
    
    if (isPending) {
        return <div>Loading...</div>;
    }
    
    if (isError) {
        return <div>Error loading blacklist requests</div>;
    }
    
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
                {pendingRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No pending blacklist requests</div>
                ) : (
                    <TableComponent
                        headers={headers}
                        data={pendingRequests}
                        dropMenu={dropMenu}
                    />
                )}
            </div>
            
            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Current Blacklist Words</h2>
                </div>
                <div className="flex items-center space-x-2 my-4">
                        <Input
                            type="text"
                            placeholder="add new word to blacklist"
                            value={newWord}
                            onChange={(e) => setNewWord(e.target.value)}
                            className="w-64"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddWord();
                                }
                            }}
                        />
                        <Button 
                            size="sm"
                            onClick={handleAddWord}
                            className="flex items-center space-x-1"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add</span>
                        </Button>
                    </div>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {blacklistData?.blacklist?.map((word, index) => (
                        <div key={index} className="px-3 py-2 bg-gray-100 rounded-md truncate flex justify-between items-center group">
                            <span className="truncate mr-1">{word}</span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" 
                                onClick={() => handleRemoveWord(word)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                    
                    {(!blacklistData?.blacklist || blacklistData.blacklist.length === 0) && (
                        <div className="col-span-full text-center py-4 text-gray-500">No words in blacklist</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlacklistRequests; 