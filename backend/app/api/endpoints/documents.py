"""文档相关API路由"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class Document(BaseModel):
    id: str
    title: str
    content: str
    owner_id: str
    created_at: datetime
    updated_at: datetime
    collaborators: Optional[List[str]] = []

@router.get("/", response_model=List[Document])
async def get_documents():
    """获取所有文档"""
    return []

@router.post("/", response_model=Document)
async def create_document(document: dict):
    """创建新文档"""
    now = datetime.now()
    return {
        "id": "doc_id",
        "title": document.get("title", "Untitled"),
        "content": document.get("content", ""),
        "owner_id": "user_id",
        "created_at": now,
        "updated_at": now,
        "collaborators": []
    }

@router.get("/{doc_id}", response_model=Document)
async def get_document(doc_id: str):
    """获取特定文档"""
    return {
        "id": doc_id,
        "title": "Sample Document",
        "content": "Sample content",
        "owner_id": "user_id",
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "collaborators": []
    }

@router.put("/{doc_id}", response_model=Document)
async def update_document(doc_id: str, document: dict):
    """更新文档"""
    return {
        "id": doc_id,
        "title": document.get("title", "Untitled"),
        "content": document.get("content", ""),
        "owner_id": "user_id",
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "collaborators": document.get("collaborators", [])
    }

@router.delete("/{doc_id}")
async def delete_document(doc_id: str):
    """删除文档"""
    return {"status": "success", "message": f"Document {doc_id} deleted"} 