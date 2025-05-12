"""认证相关API路由"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str = None

class User(BaseModel):
    username: str
    email: str = None
    full_name: str = None
    disabled: bool = None

class UserInDB(User):
    hashed_password: str

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: dict):
    """获取访问令牌"""
    return {"access_token": "dummy_token", "token_type": "bearer"}

@router.post("/register", response_model=User)
async def register_user(user: dict):
    """注册新用户"""
    return {
        "username": user.get("username"),
        "email": user.get("email"),
        "full_name": user.get("full_name"),
        "disabled": False
    } 