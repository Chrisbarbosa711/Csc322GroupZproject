"""GECToR模型处理帮助函数"""

import os
import sys
import logging
import torch
from typing import List, Dict, Any, Tuple, Optional

from ..core.model_handler import ModelHandler
from ...core.config import settings

def get_model_handler() -> ModelHandler:
    """
    创建并返回一个ModelHandler实例，用于处理纠错请求
    
    Returns:
        ModelHandler: 配置好的模型处理器
    """
    try:
        model_path = settings.GECTOR_MODEL_PATH
        vocab_path = settings.VOCAB_PATH
        iterations = settings.ITERATIONS
        
        logging.info(f"Loading GECToR model from {model_path}")
        model_handler = ModelHandler(
            model_path=model_path,
            vocab_path=vocab_path,
            iterations=iterations
        )
        return model_handler
    except Exception as e:
        logging.error(f"Error initializing model handler: {str(e)}")
        raise e 