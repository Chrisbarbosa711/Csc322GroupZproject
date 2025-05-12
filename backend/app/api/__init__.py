"""API路由包"""

from fastapi import APIRouter

api_router = APIRouter()

# 导入各个子模块的路由
from .endpoints import auth, documents, users, gector

# 包含所有子路由
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(gector.router, prefix="/gector", tags=["gector"]) 