"""主应用入口"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

from .api import api_router
from .core.config import settings
from .db.init_db import init_db

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("backend.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="LLM Editor API",
    description="LLM编辑器后端API，集成GECToR语法纠错功能",
    version="0.1.0",
)

# 设置CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # 开发模式下允许所有来源
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# 包含API路由
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    """健康检查路由"""
    return {"message": "LLM Editor API is running"}

@app.on_event("startup")
async def startup_event():
    """应用启动时的事件处理"""
    logger.info("Starting up the application")
    
    # 初始化数据库
    try:
        if settings.USE_MOCK_DATA:
            logger.info("初始化数据库并导入模拟数据")
            init_db()
        else:
            logger.info("初始化数据库，不导入模拟数据")
            # 只创建表，不填充数据
            from .db.base import Base, engine
            Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.error(f"数据库初始化失败: {str(e)}")
    
    # 将进程ID写入文件，方便管理
    with open("backend.pid", "w") as f:
        f.write(str(os.getpid()))

@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时的事件处理"""
    logger.info("Shutting down the application")
    # 删除PID文件
    if os.path.exists("backend.pid"):
        os.remove("backend.pid")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

