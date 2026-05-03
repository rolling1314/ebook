"""
从 SQLite 迁移数据到 PostgreSQL
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pathlib import Path
from models import User, Book, Note, Highlight, Base
from config import config

# SQLite 配置
SQLITE_PATH = Path(__file__).parent / "data" / "ebook.db"
SQLITE_URL = f"sqlite:///{SQLITE_PATH}"

# PostgreSQL 配置
db_config = config["database"]
POSTGRES_URL = (
    f"postgresql://{db_config['user']}:{db_config['password']}"
    f"@{db_config['host']}:{db_config['port']}/{db_config['database']}"
)

def migrate_data():
    """迁移数据"""
    if not SQLITE_PATH.exists():
        print(f"✗ SQLite 数据库文件不存在: {SQLITE_PATH}")
        return False
    
    print("=" * 60)
    print("从 SQLite 迁移数据到 PostgreSQL")
    print("=" * 60)
    
    # 连接到 SQLite
    sqlite_engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
    SqliteSession = sessionmaker(bind=sqlite_engine)
    sqlite_session = SqliteSession()
    
    # 连接到 PostgreSQL
    postgres_engine = create_engine(POSTGRES_URL)
    PostgresSession = sessionmaker(bind=postgres_engine)
    postgres_session = PostgresSession()
    
    try:
        # 迁移用户
        print("\n1. 迁移用户数据...")
        users = sqlite_session.query(User).all()
        print(f"   找到 {len(users)} 个用户")
        
        for user in users:
            # 检查是否已存在
            existing = postgres_session.query(User).filter(User.id == user.id).first()
            if not existing:
                new_user = User(
                    id=user.id,
                    username=user.username,
                    email=user.email,
                    hashed_password=user.hashed_password,
                    created_at=user.created_at,
                    updated_at=user.updated_at
                )
                postgres_session.add(new_user)
                print(f"   ✓ 迁移用户: {user.username}")
            else:
                print(f"   - 跳过已存在的用户: {user.username}")
        
        postgres_session.commit()
        print(f"   ✓ 用户迁移完成")
        
        # 迁移书籍
        print("\n2. 迁移书籍数据...")
        books = sqlite_session.query(Book).all()
        print(f"   找到 {len(books)} 本书")
        
        for book in books:
            existing = postgres_session.query(Book).filter(Book.id == book.id).first()
            if not existing:
                new_book = Book(
                    id=book.id,
                    user_id=book.user_id,
                    filename=book.filename,
                    title=book.title,
                    author=book.author,
                    size_bytes=book.size_bytes,
                    created_at=book.created_at,
                    updated_at=book.updated_at
                )
                postgres_session.add(new_book)
                print(f"   ✓ 迁移书籍: {book.filename}")
            else:
                print(f"   - 跳过已存在的书籍: {book.filename}")
        
        postgres_session.commit()
        print(f"   ✓ 书籍迁移完成")
        
        # 迁移笔记
        print("\n3. 迁移笔记数据...")
        notes = sqlite_session.query(Note).all()
        print(f"   找到 {len(notes)} 条笔记")
        
        for note in notes:
            existing = postgres_session.query(Note).filter(Note.id == note.id).first()
            if not existing:
                new_note = Note(
                    id=note.id,
                    user_id=note.user_id,
                    book_id=note.book_id,
                    book_title=note.book_title,
                    chapter_title=note.chapter_title,
                    cfi=note.cfi,
                    selected_text=note.selected_text,
                    note_content=note.note_content,
                    color=note.color,
                    created_at=note.created_at,
                    updated_at=note.updated_at
                )
                postgres_session.add(new_note)
                print(f"   ✓ 迁移笔记: {note.id[:8]}...")
            else:
                print(f"   - 跳过已存在的笔记: {note.id[:8]}...")
        
        postgres_session.commit()
        print(f"   ✓ 笔记迁移完成")
        
        # 迁移高亮
        print("\n4. 迁移高亮数据...")
        highlights = sqlite_session.query(Highlight).all()
        print(f"   找到 {len(highlights)} 条高亮")
        
        for highlight in highlights:
            existing = postgres_session.query(Highlight).filter(Highlight.id == highlight.id).first()
            if not existing:
                new_highlight = Highlight(
                    id=highlight.id,
                    user_id=highlight.user_id,
                    book_id=highlight.book_id,
                    cfi=highlight.cfi,
                    selected_text=highlight.selected_text,
                    color=highlight.color,
                    created_at=highlight.created_at
                )
                postgres_session.add(new_highlight)
                print(f"   ✓ 迁移高亮: {highlight.id[:8]}...")
            else:
                print(f"   - 跳过已存在的高亮: {highlight.id[:8]}...")
        
        postgres_session.commit()
        print(f"   ✓ 高亮迁移完成")
        
        # 统计
        print("\n" + "=" * 60)
        print("迁移统计:")
        print(f"  用户: {postgres_session.query(User).count()} 条")
        print(f"  书籍: {postgres_session.query(Book).count()} 条")
        print(f"  笔记: {postgres_session.query(Note).count()} 条")
        print(f"  高亮: {postgres_session.query(Highlight).count()} 条")
        print("=" * 60)
        print("✓ 数据迁移完成！")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n✗ 迁移失败: {e}")
        postgres_session.rollback()
        return False
        
    finally:
        sqlite_session.close()
        postgres_session.close()


if __name__ == "__main__":
    migrate_data()
