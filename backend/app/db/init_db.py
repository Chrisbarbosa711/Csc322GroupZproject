"""数据库初始化脚本"""

import logging
from datetime import datetime
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from .base import Base, engine, get_db
from .models import User, Document, document_collaborators
from ..core.config import settings

# 设置密码上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 初始用户数据
mock_users = {
    "test": {
        "id": 1,
        "username": "test",
        "hashed_password": pwd_context.hash("test"),
        "email": "test@gmail.com",
        "role": "free",
        "tokens": 0,
        "status": "active"
    },
    "admin": {
        "id": 2,
        "username": "admin",
        "hashed_password": pwd_context.hash("admin"),
        "email": "admin@gmail.com",
        "role": "super",
        "tokens": 0,
        "status": "active"
    },
    "paid_user": {
        "id": 3,
        "username": "paid_user",
        "hashed_password": pwd_context.hash("paid"),
        "email": "paid_user@gmail.com",
        "role": "paid",
        "tokens": 100,
        "status": "active"
    },
    "paid_user2": {
        "id": 4,
        "username": "paid_user2",
        "hashed_password": pwd_context.hash("paid"),
        "email": "paid_user2@gmail.com",
        "role": "paid",
        "tokens": 200,
        "status": "active"
    },
    "paid_user3": {
        "id": 5,
        "username": "paid_user3",
        "hashed_password": pwd_context.hash("paid"),
        "email": "paid_user3@gmail.com",
        "role": "paid",
        "tokens": 300,
        "status": "active"
    },
    "paid_user4": {
        "id": 6,
        "username": "paid_user4",
        "hashed_password": pwd_context.hash("paid"),
        "email": "paid_user4@gmail.com",
        "role": "paid",
        "tokens": 400,
        "status": "active"
    }
}

# 初始文档数据
mock_documents = {
    '1': {
        'id': 1,
        'title': 'document1',
        'latest_update': '2025-02-01',
        'created_date': '2025-01-01',
        'word_count': 100,
        'preview': 'preview1',
        'content': 'content1',
        'owner_id': 3  # paid_user
    },
    '2': {
        'id': 2,
        'title': 'document2',
        'latest_update': '2025-02-03',
        'created_date': '2025-01-03',
        'word_count': 200,
        'preview': 'preview2',
        'content': 'content2',
        'owner_id': 3  # paid_user
    },
    '3': {
        'id': 3,
        'title': 'document3',
        'latest_update': '2025-02-05',
        'created_date': '2025-01-05',
        'word_count': 300,
        'preview': 'preview3',
        'content': 'content3',
        'owner_id': 3  # paid_user
    },
    '4': {
        'id': 4,
        'title': 'document4',
        'latest_update': '2025-02-07',
        'created_date': '2025-01-07',
        'word_count': 400,
        'preview': 'preview4',
        'content': 'content4',
        'owner_id': 3  # paid_user
    },
    '5': {
        'id': 5,
        'title': 'document5',
        'latest_update': '2025-02-09',
        'created_date': '2025-01-09',
        'word_count': 500,
        'preview': 'preview5',
        'content': 'content5',
        'owner_id': 3  # paid_user
    },
    '6': {
        'id': 6,
        'title': 'document6',
        'latest_update': '2025-02-11',
        'created_date': '2025-01-11',
        'word_count': 600,
        'preview': 'preview6',
        'content': 'content6',
        'owner_id': 3  # paid_user
    },
    '7': {
        'id': 7,
        'title': 'document7',
        'latest_update': '2025-02-13',
        'created_date': '2025-01-13',
        'word_count': 700,
        'preview': 'preview7',
        'content': 'content7',
        'owner_id': 3  # paid_user
    },
    '8': {
        'id': 8,
        'title': 'document8',
        'latest_update': '2025-02-15',
        'created_date': '2025-01-15',
        'word_count': 800,
        'preview': 'preview8',
        'content': 'content8',
        'owner_id': 3  # paid_user
    },
    '9': {
        'id': 9,
        'title': 'document9',
        'latest_update': '2025-02-17',
        'created_date': '2025-01-17',
        'word_count': 900,
        'preview': 'preview9',
        'content': 'content9',
        'owner_id': 3  # paid_user
    },
    '10': {
        'id': 10,
        'title': 'document10',
        'latest_update': '2025-02-19',
        'created_date': '2025-01-19',
        'word_count': 1000,
        'preview': 'preview10',
        'content': 'content10',
        'owner_id': 3  # paid_user
    },
    '11': {
        'id': 11,
        'title': 'document11',
        'latest_update': '2025-02-21',
        'created_date': '2025-01-21',
        'word_count': 1100,
        'preview': 'preview11',
        'content': 'content11',
        'owner_id': 3  # paid_user
    },
    '12': { 
        'id': 12,
        'title': 'document12',
        'latest_update': '2025-02-23',
        'created_date': '2025-01-23',
        'word_count': 1200,
        'preview': 'preview12', 
        'content': 'content12',
        'owner_id': 3  # paid_user
    }
}

# 文档协作者关系
mock_document_collaborators = {
    1: [4, 5],  # document 1 的协作者: paid_user2, paid_user3
    3: [6],     # document 3 的协作者: paid_user4
    5: [4],     # document 5 的协作者: paid_user2
    7: [5, 6],  # document 7 的协作者: paid_user3, paid_user4
}

# 全局变量，模拟数据存储
token_stats = {}
collaborators = {}
blacklist_data = {
    "words": ["bad", "terrible", "awful", "stupid", "idiot", "hate", "dangerous", "toxic"],
    "requests": []
}
complaints_data = {
    "complaints": []
}
suggestions_data = {
    "suggestions": []
}
invitations_data = {
    "invitations": []
}

def init_db() -> None:
    """初始化数据库，创建表并填充初始数据"""
    try:
        # 创建所有表
        Base.metadata.create_all(bind=engine)
        logging.info("创建数据库表成功")
        
        # 获取数据库会话
        db = next(get_db())
        
        # 填充用户数据
        create_initial_users(db)
        
        # 填充文档数据
        create_initial_documents(db)
        
        # 填充文档协作者关系
        create_document_collaborators(db)
        
        logging.info("数据库初始化完成")
    except Exception as e:
        logging.error(f"数据库初始化失败: {str(e)}")
        raise

def create_initial_users(db: Session) -> None:
    """创建初始用户数据"""
    for username, user_data in mock_users.items():
        # 检查用户是否已存在
        existing_user = db.query(User).filter(User.username == username).first()
        if not existing_user:
            # 创建用户对象
            user = User(
                id=user_data["id"],
                username=username,
                email=user_data["email"],
                hashed_password=user_data["hashed_password"],
                full_name=None,
                is_active=user_data["status"] == "active",
                role=user_data["role"],
                tokens=user_data["tokens"]
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logging.info(f"创建用户: {username}")

def create_initial_documents(db: Session) -> None:
    """创建初始文档数据"""
    for doc_id, doc_data in mock_documents.items():
        # 检查文档是否已存在
        existing_doc = db.query(Document).filter(Document.id == int(doc_id)).first()
        if not existing_doc:
            # 解析日期
            created_date = datetime.strptime(doc_data["created_date"], "%Y-%m-%d")
            updated_date = datetime.strptime(doc_data["latest_update"], "%Y-%m-%d")
            
            # 创建文档对象
            document = Document(
                id=doc_data["id"],
                title=doc_data["title"],
                content=doc_data["content"],
                owner_id=doc_data["owner_id"],
                created_at=created_date,
                updated_at=updated_date,
                word_count=doc_data["word_count"],
                preview=doc_data["preview"]
            )
            db.add(document)
            db.commit()
            db.refresh(document)
            logging.info(f"创建文档: {doc_data['title']}")

def create_document_collaborators(db: Session) -> None:
    """创建文档协作者关系"""
    for doc_id, collaborator_ids in mock_document_collaborators.items():
        # 检查文档是否存在
        document = db.query(Document).filter(Document.id == doc_id).first()
        if document:
            for collaborator_id in collaborator_ids:
                # 检查用户是否存在
                collaborator = db.query(User).filter(User.id == collaborator_id).first()
                if collaborator:
                    # 检查协作关系是否已存在
                    existing_relation = db.query(document_collaborators).filter(
                        document_collaborators.c.document_id == doc_id,
                        document_collaborators.c.user_id == collaborator_id
                    ).first()
                    
                    if not existing_relation:
                        # 添加协作关系
                        stmt = document_collaborators.insert().values(
                            document_id=doc_id,
                            user_id=collaborator_id
                        )
                        db.execute(stmt)
                        db.commit()
                        logging.info(f"为文档 {doc_id} 添加协作者 {collaborator_id}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_db() 