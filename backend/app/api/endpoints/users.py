"""用户相关API路由"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class User(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    is_active: bool = True

@router.get("/me", response_model=User)
async def read_users_me():
    """获取当前用户信息"""
    return {
        "id": "user_id",
        "username": "testuser",
        "email": "test@example.com",
        "full_name": "Test User",
        "is_active": True
    }

@router.get("/", response_model=List[User])
async def read_users():
    """获取所有用户"""
    return [
        {
            "id": "user_id",
            "username": "testuser",
            "email": "test@example.com",
            "full_name": "Test User",
            "is_active": True
        }
    ]

@router.put("/me", response_model=User)
async def update_user(user: dict):
    """更新当前用户信息"""
    return {
        "id": "user_id",
        "username": user.get("username", "testuser"),
        "email": user.get("email", "test@example.com"),
        "full_name": user.get("full_name", "Test User"),
        "is_active": True
    } 