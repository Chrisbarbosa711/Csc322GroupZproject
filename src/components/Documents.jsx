import { useState, useMemo } from "react"
import TableComponent from "./Table"
import { useDocumentList, useDeleteDocument } from "../costumeQuerys/DocumentQuery"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useEditor } from "../contexts/EditorContext"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Search } from "lucide-react"
import { Badge } from "./ui/badge"

const Documents = () => {
    const navigate = useNavigate()
    const { userInfo } = useAuth()
    const { setText, setReEdit, setDocumentId, setDocumentTitle } = useEditor()
    const [filterType, setFilterType] = useState(null)
    const [sortBy, setSortBy] = useState("latest_update")
    const [searchQuery, setSearchQuery] = useState("")
    
    const headers = {
        "Title": "title",
        "Preview": "preview",
        "Latest Edit": "latest_update",
        "Author": "user",
        "Type": "type"
    }
    const { data: documents, isPending, isError } = useDocumentList(filterType, sortBy)
    const { deleteDocument } = useDeleteDocument()
    
    // 根据搜索查询过滤文档
    const filteredDocuments = useMemo(() => {
        if (!documents || !Array.isArray(documents)) return [];
        if (!searchQuery.trim()) return documents;
        
        const query = searchQuery.toLowerCase().trim();
        return documents.filter(doc => 
            doc.title.toLowerCase().includes(query)
        );
    }, [documents, searchQuery]);
    
    // 处理文档数据，添加类型标识
    const processedDocuments = useMemo(() => {
        if (!filteredDocuments || !Array.isArray(filteredDocuments)) return [];
        
        return filteredDocuments.map(doc => ({
            ...doc,
            type: doc.is_owner ? "owner" : "collaborator"
        }));
    }, [filteredDocuments]);
    
    const handleDeleteDocument = (docId) => {
        if (!docId) {
            toast.error("can't delete document")
            return
        }
        deleteDocument(docId)
    }
    
    const handleOpenDocument = (document) => {
        if (!document || !document.id) {
            toast.error("can't open document")
            return
        }
        
        const docId = document.id
        setReEdit(true)
        setDocumentId(docId)
        setDocumentTitle(document.title)
        if (document.content) {
            setText(document.content)
        }
        
        navigate('/app')
    }
    
    const dropMenu = [
        {
            id: 1,
            name: "Open",
            onClick: (row) => handleOpenDocument(row)
        },
        {
            id: 2,
            name: "Delete",
            onClick: (row) => handleDeleteDocument(row.id)
        }
    ]
    
    // 自定义渲染函数，为作者列添加高亮样式，为类型列添加徽章
    const customRenderers = {
        user: (value, row) => {
            const isOwner = row.is_owner
            const bgClass = isOwner 
                ? "bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-bold" 
                : "bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-bold"
            return <span className={bgClass}>{value}</span>
        },
        type: (value, row) => {
            if (value === "owner") {
                return <Badge variant="default">Owner</Badge>
            } else {
                return <Badge variant="secondary">Collaborator</Badge>
            }
        }
    }
    
    if (isPending) {
        return <div>Loading...</div>
    }
    if (isError) {
        return <div>Error</div>
    }
    
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative w-1/4">
                    <Input
                        type="text"
                        placeholder="Search by document title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                
                <div className="flex justify-end gap-2">
                <Select value={filterType || "all"} onValueChange={(value) => setFilterType(value === "all" ? null : value)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter documents" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Documents</SelectItem>
                        <SelectItem value="own">My Documents</SelectItem>
                        <SelectItem value="collaborated">Collaborated Docs</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="latest_update">Latest Edit</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                
            </div>
            
            <TableComponent
                headers={headers}
                data={processedDocuments}
                dropMenu={dropMenu}
                customRenderers={customRenderers}
            />
        </div>
    )
}

export default Documents