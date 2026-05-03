"""
EPUB upload and file API with user authentication and database storage.

Run: uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import os
import re
import uuid
import zipfile
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import User, Book, Note, Highlight
from schemas import (
    UserRegister, UserLogin, TokenResponse, UserResponse,
    BookResponse, BookUploadResponse,
    NoteCreate, NoteUpdate, NoteResponse,
    HighlightCreate, HighlightResponse
)
from auth import (
    get_password_hash, authenticate_user, create_access_token, get_current_user, decode_token
)
from config import config

# 创建数据库表
Base.metadata.create_all(bind=engine)

DATA_DIR = Path(os.environ.get("EBOOK_DATA_DIR", Path(__file__).resolve().parent / "data" / "books"))
MAX_UPLOAD_BYTES = config["app"].get("upload_max_mb", 50) * 1024 * 1024
ALLOWED_ORIGINS = config["app"]["allowed_origins"]

app = FastAPI(title="ebook API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
    expose_headers=["Content-Length", "Content-Range", "Accept-Ranges"],
)


@app.on_event("startup")
def _ensure_data_dir() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def _safe_book_id(book_id: str) -> bool:
    return bool(re.fullmatch(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", book_id.lower()))


def _epub_path(book_id: str) -> Path:
    if not _safe_book_id(book_id):
        raise HTTPException(status_code=400, detail="Invalid book id")
    return DATA_DIR / f"{book_id.lower()}.epub"


# ============ 用户认证 API ============

@app.post("/api/auth/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """用户注册"""
    # 检查用户名是否已存在
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # 检查邮箱是否已存在
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # 创建新用户
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 生成访问令牌
    access_token = create_access_token(data={"sub": new_user.id})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.from_orm(new_user)
    )


@app.post("/api/auth/login", response_model=TokenResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """用户登录"""
    user = authenticate_user(db, user_data.username, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 生成访问令牌
    access_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.from_orm(user)
    )


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return UserResponse.from_orm(current_user)


# ============ 书籍 API ============

@app.post("/api/books", response_model=BookUploadResponse)
async def upload_book(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """上传书籍"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")
    if not file.filename.lower().endswith(".epub"):
        raise HTTPException(status_code=400, detail="File must be .epub")

    book_id = str(uuid.uuid4())
    dest = DATA_DIR / f"{book_id}.epub"

    size = 0
    first_chunk: bytes | None = None
    try:
        with dest.open("wb") as out:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                if first_chunk is None:
                    first_chunk = chunk[:4]
                size += len(chunk)
                if size > MAX_UPLOAD_BYTES:
                    raise HTTPException(status_code=413, detail="File too large")
                out.write(chunk)
    except HTTPException:
        if dest.exists():
            dest.unlink(missing_ok=True)
        raise
    except OSError:
        if dest.exists():
            dest.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Failed to save file")

    if size == 0 or first_chunk is None:
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Empty file")
    if first_chunk[:2] != b"PK":
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Not a valid ZIP/EPUB (missing PK header)")

    # 保存书籍信息到数据库
    new_book = Book(
        id=book_id,
        user_id=current_user.id,
        filename=file.filename,
        size_bytes=size
    )
    db.add(new_book)
    db.commit()
    db.refresh(new_book)

    base = os.environ.get("PUBLIC_BASE_URL", "").rstrip("/")
    epub_path = f"/api/books/{book_id}/file.epub"
    epub_url = f"{base}{epub_path}" if base else epub_path

    return BookUploadResponse(
        book_id=book_id,
        filename=file.filename,
        epub_url=epub_url
    )


@app.get("/api/books", response_model=List[BookResponse])
def list_books(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户的所有书籍"""
    books = db.query(Book).filter(Book.user_id == current_user.id).order_by(Book.created_at.desc()).all()
    return [BookResponse.from_orm(book) for book in books]


@app.get("/api/books/{book_id}/file.epub")
def get_book_file(
    book_id: str,
    token: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取书籍文件（支持 query parameter token）"""
    # 从 query parameter 获取 token
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 验证 token
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
    except HTTPException:
        raise
    
    # 验证书籍所有权
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    path = _epub_path(book_id)
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Book file not found")
    
    return FileResponse(
        path,
        media_type="application/epub+zip",
        filename="book.epub",
        content_disposition_type="inline",
    )


@app.get("/api/books/{book_id}/{resource_path:path}")
def get_book_resource(
    book_id: str,
    resource_path: str,
    token: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取 EPUB 内部资源（用于 epubjs）"""
    # 从 query parameter 获取 token
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 验证 token
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
    except HTTPException:
        raise
    
    # 验证书籍所有权
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    epub_path = _epub_path(book_id)
    if not epub_path.is_file():
        raise HTTPException(status_code=404, detail="Book file not found")
    
    # 从 EPUB (ZIP) 文件中读取资源
    try:
        with zipfile.ZipFile(epub_path, 'r') as epub_zip:
            # 尝试读取资源
            try:
                resource_data = epub_zip.read(resource_path)
            except KeyError:
                raise HTTPException(status_code=404, detail=f"Resource not found: {resource_path}")
            
            # 根据文件扩展名确定 MIME 类型
            content_type = "application/octet-stream"
            if resource_path.endswith('.xml'):
                content_type = "application/xml"
            elif resource_path.endswith('.html') or resource_path.endswith('.xhtml'):
                content_type = "application/xhtml+xml"
            elif resource_path.endswith('.css'):
                content_type = "text/css"
            elif resource_path.endswith('.js'):
                content_type = "application/javascript"
            elif resource_path.endswith(('.jpg', '.jpeg')):
                content_type = "image/jpeg"
            elif resource_path.endswith('.png'):
                content_type = "image/png"
            elif resource_path.endswith('.gif'):
                content_type = "image/gif"
            elif resource_path.endswith('.svg'):
                content_type = "image/svg+xml"
            elif resource_path.endswith('.ttf'):
                content_type = "font/ttf"
            elif resource_path.endswith('.otf'):
                content_type = "font/otf"
            elif resource_path.endswith('.woff'):
                content_type = "font/woff"
            elif resource_path.endswith('.woff2'):
                content_type = "font/woff2"
            
            return Response(content=resource_data, media_type=content_type)
    except zipfile.BadZipFile:
        raise HTTPException(status_code=500, detail="Invalid EPUB file")


@app.delete("/api/books/{book_id}")
def delete_book(
    book_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除书籍"""
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # 删除文件
    path = _epub_path(book_id)
    if path.exists():
        path.unlink()
    
    # 删除数据库记录（会级联删除笔记和高亮）
    db.delete(book)
    db.commit()
    
    return JSONResponse({"message": "Book deleted", "book_id": book_id})


# ============ 笔记 API ============

@app.get("/api/books/{book_id}/notes", response_model=List[NoteResponse])
def get_notes(
    book_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取书籍的所有笔记"""
    # 验证书籍所有权
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    notes = db.query(Note).filter(Note.book_id == book_id, Note.user_id == current_user.id).order_by(Note.created_at.desc()).all()
    return [NoteResponse.from_orm(note) for note in notes]


@app.post("/api/books/{book_id}/notes", response_model=NoteResponse)
def create_note(
    book_id: str,
    note_data: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新笔记"""
    if note_data.book_id != book_id:
        raise HTTPException(status_code=400, detail="Book ID mismatch")
    
    # 验证书籍所有权
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    new_note = Note(
        user_id=current_user.id,
        book_id=book_id,
        book_title=note_data.book_title,
        chapter_title=note_data.chapter_title,
        cfi=note_data.cfi,
        selected_text=note_data.selected_text,
        note_content=note_data.note_content,
        color=note_data.color
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    
    return NoteResponse.from_orm(new_note)


@app.put("/api/books/{book_id}/notes/{note_id}", response_model=NoteResponse)
def update_note(
    book_id: str,
    note_id: str,
    note_update: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新笔记"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.book_id == book_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if note_update.note_content is not None:
        note.note_content = note_update.note_content
    if note_update.color is not None:
        note.color = note_update.color
    
    db.commit()
    db.refresh(note)
    
    return NoteResponse.from_orm(note)


@app.delete("/api/books/{book_id}/notes/{note_id}")
def delete_note(
    book_id: str,
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除笔记"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.book_id == book_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(note)
    db.commit()
    
    return JSONResponse({"message": "Note deleted", "note_id": note_id})


# ============ 高亮 API ============

@app.get("/api/books/{book_id}/highlights", response_model=List[HighlightResponse])
def get_highlights(
    book_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取书籍的所有高亮"""
    # 验证书籍所有权
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    highlights = db.query(Highlight).filter(
        Highlight.book_id == book_id,
        Highlight.user_id == current_user.id
    ).order_by(Highlight.created_at.desc()).all()
    return [HighlightResponse.from_orm(h) for h in highlights]


@app.post("/api/books/{book_id}/highlights", response_model=HighlightResponse)
def create_highlight(
    book_id: str,
    highlight_data: HighlightCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新高亮"""
    # 验证书籍所有权
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    new_highlight = Highlight(
        user_id=current_user.id,
        book_id=book_id,
        cfi=highlight_data.cfi,
        selected_text=highlight_data.selected_text,
        color=highlight_data.color
    )
    db.add(new_highlight)
    db.commit()
    db.refresh(new_highlight)
    
    return HighlightResponse.from_orm(new_highlight)


@app.delete("/api/books/{book_id}/highlights/{highlight_id}")
def delete_highlight(
    book_id: str,
    highlight_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除高亮"""
    highlight = db.query(Highlight).filter(
        Highlight.id == highlight_id,
        Highlight.book_id == book_id,
        Highlight.user_id == current_user.id
    ).first()
    
    if not highlight:
        raise HTTPException(status_code=404, detail="Highlight not found")
    
    db.delete(highlight)
    db.commit()
    
    return JSONResponse({"message": "Highlight deleted", "highlight_id": highlight_id})
