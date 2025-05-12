"""创建MySQL数据库脚本"""

import mysql.connector
import logging
from dotenv import load_dotenv
import os

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

def create_database():
    """创建MySQL数据库（如果不存在）"""
    try:
        # 加载环境变量
        load_dotenv()
        
        # 获取数据库连接信息
        host = os.getenv("DB_HOST", "localhost")
        port = int(os.getenv("DB_PORT", "3306"))
        user = os.getenv("DB_USER", "root")
        password = os.getenv("DB_PASSWORD", "password")
        db_name = os.getenv("DB_NAME", "llm_editor_db")
        
        # 连接到MySQL服务器
        connection = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password
        )
        
        cursor = connection.cursor()
        
        # 创建数据库
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        logger.info(f"数据库 {db_name} 创建成功或已存在")
        
        # 关闭连接
        cursor.close()
        connection.close()
        
        return True
    except Exception as e:
        logger.error(f"创建数据库失败: {str(e)}")
        return False

if __name__ == "__main__":
    logger.info("开始创建数据库...")
    success = create_database()
    if success:
        logger.info("数据库创建完成，可以启动应用")
    else:
        logger.error("数据库创建失败，请检查配置和权限") 