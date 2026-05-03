"""
数据库模型定义
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


def generate_uuid():
    """生成UUID字符串"""
    return str(uuid.uuid4())


class User(Base):
    """用户表"""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关系
    books = relationship("Book", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    highlights = relationship("Highlight", back_populates="user", cascade="all, delete-orphan")


class Book(Base):
    """书籍表"""
    __tablename__ = "books"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    title = Column(String(500))
    author = Column(String(255))
    size_bytes = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关系
    user = relationship("User", back_populates="books")
    notes = relationship("Note", back_populates="book", cascade="all, delete-orphan")
    highlights = relationship("Highlight", back_populates="book", cascade="all, delete-orphan")


class Note(Base):
    """笔记表"""
    __tablename__ = "notes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    book_id = Column(String(36), ForeignKey("books.id", ondelete="CASCADE"), nullable=False, index=True)
    book_title = Column(String(500))
    chapter_title = Column(String(500))
    cfi = Column(Text, nullable=False)
    selected_text = Column(Text, nullable=False)
    note_content = Column(Text, nullable=False)
    color = Column(String(20), default="yellow")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关系
    user = relationship("User", back_populates="notes")
    book = relationship("Book", back_populates="notes")


class Highlight(Base):
    """高亮表"""
    __tablename__ = "highlights"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    book_id = Column(String(36), ForeignKey("books.id", ondelete="CASCADE"), nullable=False, index=True)
    cfi = Column(Text, nullable=False)
    selected_text = Column(Text, nullable=False)
    color = Column(String(20), default="yellow")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    user = relationship("User", back_populates="highlights")
    book = relationship("Book", back_populates="highlights")
