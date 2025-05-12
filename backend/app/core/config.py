"""应用配置设置"""

import os
import secrets
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """应用配置类"""
    
    # API配置
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 天
    
    # CORS配置
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # 数据库配置
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "password")
    DB_NAME: str = os.getenv("DB_NAME", "llm_editor_db")
    
    @property
    def DATABASE_URI(self) -> str:
        """生成MySQL连接URI"""
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    # 启用模拟数据
    USE_MOCK_DATA: bool = os.getenv("USE_MOCK_DATA", "True").lower() in ("true", "1", "t")
    
    # GECToR模型配置
    GECTOR_MODEL_PATH: str = os.getenv(
        "GECTOR_MODEL_PATH", 
        "../app/gector/models/xlnet_0_gector.th"
    )
    VOCAB_PATH: str = os.getenv(
        "VOCAB_PATH", 
        "../app/gector/data/output_vocabulary"
    )
    ITERATIONS: int = int(os.getenv("ITERATIONS", "5"))
    
    class Config:
        case_sensitive = True
        env_file = ".env"

# 实例化设置
settings = Settings() 