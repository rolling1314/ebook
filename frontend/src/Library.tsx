import React, { useState, useEffect, useRef } from 'react';
import { getBooks, uploadBook, deleteBook, getUser, clearToken, clearUser, getBookUrl } from './api';
import type { Book } from './api-types';
import './Library.css';

interface LibraryProps {
  onSelectBook: (bookId: string, bookUrl: string) => void;
  onLogout: () => void;
}

const Library: React.FC<LibraryProps> = ({ onSelectBook, onLogout }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = getUser();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const booksData = await getBooks();
      setBooks(booksData);
      setError('');
    } catch (err: any) {
      setError(err.message || '加载书籍失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.epub')) {
      setError('请选择 EPUB 格式的文件');
      return;
    }

    try {
      setUploading(true);
      setError('');
      await uploadBook(file);
      await loadBooks();
    } catch (err: any) {
      setError(err.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // 重置input，允许重复上传同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDeleteBook = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这本书吗？这将同时删除所有相关的笔记和高亮。')) {
      return;
    }

    try {
      await deleteBook(bookId);
      await loadBooks();
    } catch (err: any) {
      setError(err.message || '删除失败');
    }
  };

  const handleReadBook = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation();
    const bookUrl = getBookUrl(book.id);
    onSelectBook(book.id, bookUrl);
  };

  const handleLogout = () => {
    clearToken();
    clearUser();
    onLogout();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="library-container">
      <header className="library-header">
        <div className="library-title">
          <h1>📚 我的书库</h1>
        </div>
        <div className="user-info">
          <span className="user-name">👤 {user?.username}</span>
          <button onClick={handleLogout} className="logout-button">
            退出登录
          </button>
        </div>
      </header>

      <div className="library-content">
        <div className="upload-section">
          <h2>上传新书</h2>
          <div
            className={`upload-area ${dragging ? 'dragging' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="uploading-status">
                <div className="upload-icon">⏳</div>
                <div>正在上传...</div>
              </div>
            ) : (
              <>
                <div className="upload-icon">📤</div>
                <div className="upload-text">点击或拖拽文件到这里上传</div>
                <div className="upload-hint">支持 EPUB 格式</div>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".epub"
            onChange={handleFileInputChange}
            className="file-input"
          />
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="books-section">
          <h2>我的书籍 ({books.length})</h2>
          
          {loading ? (
            <div className="loading-state">加载中...</div>
          ) : books.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📖</div>
              <div className="empty-text">还没有书籍</div>
              <div className="empty-hint">上传您的第一本电子书开始阅读吧</div>
            </div>
          ) : (
            <div className="books-grid">
              {books.map((book) => (
                <div key={book.id} className="book-card">
                  <div className="book-icon">📕</div>
                  <div className="book-info">
                    <h3 title={book.filename}>{book.filename}</h3>
                    <div className="book-meta">
                      大小: {formatFileSize(book.size_bytes)}
                    </div>
                    <div className="book-meta">
                      上传时间: {formatDate(book.created_at)}
                    </div>
                  </div>
                  <div className="book-actions">
                    <button
                      className="read-button"
                      onClick={(e) => handleReadBook(book, e)}
                    >
                      开始阅读
                    </button>
                    <button
                      className="delete-button"
                      onClick={(e) => handleDeleteBook(book.id, e)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
