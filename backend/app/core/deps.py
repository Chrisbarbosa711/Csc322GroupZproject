"""依赖项函数"""

from typing import Generator, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from ..db.base import get_db
from ..db.models import User
from .config import settings

# OAuth2密码流，用于获取令牌
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    """
    获取当前用户
    """
    # 这里是实现JWT令牌验证和获取用户的逻辑
    # 实际项目中需要完善此逻辑
    
    # 模拟返回一个用户
    user = db.query(User).filter(User.username == "testuser").first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user 