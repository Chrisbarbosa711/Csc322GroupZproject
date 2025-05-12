"""数据库模型定义"""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base

# 用户与文档多对多关系的中间表（协作者）
document_collaborators = Table(
    "document_collaborators",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("document_id", Integer, ForeignKey("documents.id")),
)

class User(Base):
    """用户模型"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 新增字段，支持原始mock数据
    role = Column(String(50), default="free")  # free, paid, super
    tokens = Column(Integer, default=0)

    # 关系：用户拥有的文档
    owned_documents = relationship("Document", back_populates="owner")
    # 关系：用户协作的文档
    collaborating_documents = relationship(
        "Document",
        secondary=document_collaborators,
        back_populates="collaborators"
    )


class Document(Base):
    """文档模型"""
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    content = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 新增字段，支持原始mock数据
    word_count = Column(Integer, default=0)
    preview = Column(String(255), nullable=True)

    # 关系：文档的所有者
    owner = relationship("User", back_populates="owned_documents")
    # 关系：文档的协作者
    collaborators = relationship(
        "User",
        secondary=document_collaborators,
        back_populates="collaborating_documents"
    ) 