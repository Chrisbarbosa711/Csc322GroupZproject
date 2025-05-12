"""GECToR API路由"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import os
import sys
import time
import logging
from typing import List, Dict, Any, Optional

# 设置路径以导入GECToR模块
gector_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "app", "gector")
if gector_path not in sys.path:
    sys.path.append(gector_path)

# 导入GECToR相关模块 (这些将在后续实现)
from ...gector.utils.helpers import get_model_handler

router = APIRouter()

# 定义请求和响应模型
class GECRequest(BaseModel):
    text: str
    batch_size: Optional[int] = 128
    max_len: Optional[int] = 50

class GECResponse(BaseModel):
    corrected_text: str
    corrections: List[Dict[str, Any]]
    time_taken: float

# 全局变量存储模型
model_handler = None

@router.on_event("startup")
async def startup_event():
    """启动时加载模型"""
    global model_handler
    try:
        model_handler = get_model_handler()
        logging.info("GECToR model loaded successfully")
    except Exception as e:
        logging.error(f"Failed to load GECToR model: {str(e)}")
        model_handler = None

@router.post("/correct", response_model=GECResponse)
async def correct_text(request: GECRequest):
    """文本纠错endpoint"""
    global model_handler
    
    if model_handler is None:
        try:
            model_handler = get_model_handler()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Model not loaded: {str(e)}")
    
    start_time = time.time()
    
    try:
        # 执行文本纠错
        corrected_text, corrections = model_handler.handle_text(
            request.text, 
            batch_size=request.batch_size,
            max_len=request.max_len
        )
        
        time_taken = time.time() - start_time
        
        return {
            "corrected_text": corrected_text,
            "corrections": corrections,
            "time_taken": time_taken
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing text: {str(e)}")

@router.get("/health")
async def health_check():
    """健康检查endpoint"""
    if model_handler is None:
        return {"status": "error", "message": "Model not loaded"}
    return {"status": "ok", "message": "GECToR service is running"} 