import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import { FaEllipsisV } from "react-icons/fa";

function TableComponent({ headers, data, dropMenu, customRenderers = {} }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 
    const headerEntries = Object.entries(headers);
    
    const totalPages = Math.ceil(data.length / itemsPerPage);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);
    
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
            
            if (endPage - startPage < maxPagesToShow - 1) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }
            // first page
            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) {
                    pages.push("ellipsis");
                }
            }
            
            // middle pages
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            
            // last page
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    pages.push("ellipsis");
                }
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    // 渲染单元格内容，支持自定义渲染函数
    const renderCellContent = (row, key) => {
        const value = row[key];
        
        // 如果存在自定义渲染函数，则使用它
        if (customRenderers && customRenderers[key]) {
            return customRenderers[key](value, row);
        }
        
        // 对日期类型数据进行格式化
        if (key.toLowerCase().includes('date') || key.toLowerCase().includes('update')) {
            try {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            } catch (e) {
                return value;
            }
        }
        
        // 对预览内容进行截断
        if (key === "preview" && typeof value === "string") {
            return value.length > 20 ? `${value.substring(0, 20)}...` : value;
        }
        
        return value;
    };

    return (
        <div className="w-full">
            {/* Main Table */}
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {headerEntries.map(([displayText]) => (
                                <TableHead key={displayText}>
                                    {displayText}
                                </TableHead>
                            ))}
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginatedData.length > 0 ? (
                            <>
                                {paginatedData.map((row) => (
                                    <TableRow key={row.id}>
                                        {headerEntries.map(([displayText, fieldKey]) => (
                                            <TableCell key={`${row.id}-${fieldKey}`}>
                                                {renderCellContent(row, fieldKey)}
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {dropMenu.map((menu) => {
                                                        const menuName = typeof menu.name === 'function' ? menu.name(row) : menu.name;
                                                        return (
                                                            <DropdownMenuItem 
                                                                key={menu.id} 
                                                                onClick={() => {
                                                                    // Close dropdown first then trigger action with small delay
                                                                    setTimeout(() => {
                                                                        menu.onClick(row);
                                                                    }, 10);
                                                                }}
                                                            >
                                                                {menuName}
                                                            </DropdownMenuItem>
                                                        );
                                                    })}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </>
                        ) : (
                            <TableRow>
                                <TableCell colSpan={headerEntries.length + 1} className="h-24 text-center">
                                    No data
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4">
                    <Pagination>
                        <PaginationContent>
                            {/* previous page */}
                            <PaginationItem>
                                <PaginationPrevious 
                                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                            
                            {/* page numbers */}
                            {getPageNumbers().map((page, index) => (
                                page === "ellipsis" ? (
                                    <PaginationItem key={`ellipsis-${index}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                ) : (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            isActive={page === currentPage}
                                            onClick={() => handlePageChange(page)}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            ))}
                            
                            {/* next page */}
                            <PaginationItem>
                                <PaginationNext 
                                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    )
}

export default TableComponent;