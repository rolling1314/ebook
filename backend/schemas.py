"""
Pydantic模型定义（用于API请求和响应）
"""
from pydantic import BaseModel, Field, field_validator
import re
from typing import Optional
from datetime import datetime


# ============ 用户相关 ============

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    password: str = Field(..., min_length=6)
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        # 简单的邮箱格式验证
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        return v


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ============ 书籍相关 ============

class BookResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    title: Optional[str] = None
    author: Optional[str] = None
    size_bytes: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BookUploadResponse(BaseModel):
    book_id: str
    filename: str
    epub_url: str


# ============ 笔记相关 ============

class NoteCreate(BaseModel):
    book_id: str
    book_title: str
    chapter_title: str
    cfi: str
    selected_text: str
    note_content: str
    color: str = "yellow"


class NoteUpdate(BaseModel):
    note_content: Optional[str] = None
    color: Optional[str] = None


class NoteResponse(BaseModel):
    id: str
    user_id: str
    book_id: str
    book_title: str
    chapter_title: str
    cfi: str
    selected_text: str
    note_content: str
    color: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ 高亮相关 ============

class HighlightCreate(BaseModel):
    cfi: str
    selected_text: str
    color: str = "yellow"


class HighlightResponse(BaseModel):
    id: str
    user_id: str
    book_id: str
    cfi: str
    selected_text: str
    color: str
    created_at: datetime

    class Config:
        from_attributes = True
