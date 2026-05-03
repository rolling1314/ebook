import { useState, useEffect, useCallback } from 'react';
import Auth from './Auth';
import Library from './Library';
import { EpubReaderWithNotes } from './EpubReaderWithNotes';
import { getToken, getUser, getCurrentUser, clearToken, clearUser, getNotes, createNote, getHighlights } from './api';
import type { NoteCreate } from './api-types';
import type { Note as ReaderNote } from './mockNotes';
import './App.css';

type ViewMode = 'auth' | 'library' | 'reader';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('auth');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedBookUrl, setSelectedBookUrl] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [bookTitle, setBookTitle] = useState('');
  const [notes, setNotes] = useState<ReaderNote[]>([]);
  const [highlights, setHighlights] = useState<Array<{ cfi: string; color: string }>>([]);

  useEffect(() => {
    const validateAuth = async () => {
      const token = getToken();
      const user = getUser();
      console.log('[validateAuth] Token exists:', !!token, 'User:', user?.username)
      
      if (token && user) {
        try {
          await getCurrentUser();
          const savedBookId = localStorage.getItem('currentBookId');
          const savedBookUrl = localStorage.getItem('currentBookUrl');
          console.log('[validateAuth] Saved book:', savedBookId)
          if (savedBookId && savedBookUrl) {
            setSelectedBookId(savedBookId);
            setSelectedBookUrl(savedBookUrl);
            setViewMode('reader');
          } else {
            setViewMode('library');
          }
        } catch (err) {
          console.error('Token validation failed:', err);
          clearToken();
          clearUser();
          setViewMode('auth');
        }
      } else {
        setViewMode('auth');
      }
      
      setIsValidating(false);
    };
    
    validateAuth();
  }, []);

  const loadNotesAndHighlights = useCallback(async (bookId: string) => {
    console.log('[loadNotesAndHighlights] Loading for bookId:', bookId)
    try {
      const [notesData, highlightsData] = await Promise.all([
        getNotes(bookId),
        getHighlights(bookId)
      ]);
      console.log('[loadNotesAndHighlights] Loaded:', {
        notes: notesData.length,
        highlights: highlightsData.length
      })
      const validColors = ['yellow', 'green', 'blue', 'pink', 'purple'] as const;
      type ValidColor = typeof validColors[number];
      const toValidColor = (c: string): ValidColor => 
        validColors.includes(c as ValidColor) ? (c as ValidColor) : 'yellow';

      setNotes(notesData.map(n => ({
        id: n.id,
        bookId: n.book_id,
        bookTitle: n.book_title,
        chapterTitle: n.chapter_title,
        cfi: n.cfi,
        selectedText: n.selected_text,
        noteContent: n.note_content,
        color: toValidColor(n.color),
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      })));
      setHighlights(highlightsData.map(h => ({
        cfi: h.cfi,
        color: h.color,
      })));
    } catch (err) {
      console.error('Failed to load notes/highlights:', err);
      // 401 错误时清空笔记，避免显示旧数据
      setNotes([]);
      setHighlights([]);
    }
  }, []);

  useEffect(() => {
    if (selectedBookId && viewMode === 'reader') {
      loadNotesAndHighlights(selectedBookId);
    }
  }, [selectedBookId, viewMode, loadNotesAndHighlights]);

  const handleAuthSuccess = () => {
    setViewMode('library');
  };

  const handleLogout = () => {
    clearToken();
    clearUser();
    localStorage.removeItem('currentBookId');
    localStorage.removeItem('currentBookUrl');
    setViewMode('auth');
    setSelectedBookId(null);
    setSelectedBookUrl(null);
  };

  const handleSelectBook = (bookId: string, bookUrl: string) => {
    setSelectedBookId(bookId);
    setSelectedBookUrl(bookUrl);
    setViewMode('reader');
    localStorage.setItem('currentBookId', bookId);
    localStorage.setItem('currentBookUrl', bookUrl);
    loadNotesAndHighlights(bookId);
  };

  const handleBackToLibrary = () => {
    setViewMode('library');
    setSelectedBookId(null);
    setSelectedBookUrl(null);
    setNotes([]);
    setHighlights([]);
    localStorage.removeItem('currentBookId');
    localStorage.removeItem('currentBookUrl');
  };

  const handleNoteCreate = useCallback(async (noteData: Omit<ReaderNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedBookId) return;
    try {
      const data: NoteCreate = {
        book_id: selectedBookId,
        book_title: bookTitle || noteData.bookTitle || '',
        chapter_title: noteData.chapterTitle || '',
        cfi: noteData.cfi,
        selected_text: noteData.selectedText,
        note_content: noteData.noteContent,
        color: noteData.color,
      };
      await createNote(selectedBookId, data);
      await loadNotesAndHighlights(selectedBookId);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  }, [selectedBookId, bookTitle, loadNotesAndHighlights]);

  if (isValidating) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div>验证登录状态...</div>
      </div>
    );
  }

  return (
    <div className="app">
      {viewMode === 'auth' && <Auth onAuthSuccess={handleAuthSuccess} />}
      
      {viewMode === 'library' && (
        <Library onSelectBook={handleSelectBook} onLogout={handleLogout} />
      )}
      
      {viewMode === 'reader' && selectedBookId && selectedBookUrl && (
        <div className="app__reader-view">
          <div className="app__reader-header">
            <button onClick={handleBackToLibrary} className="back-button">
              ← 返回书库
            </button>
          </div>
          <EpubReaderWithNotes
            key={selectedBookId}
            epubUrl={selectedBookUrl}
            notes={notes}
            highlights={highlights}
            onMetadata={(title) => setBookTitle(title)}
            onNoteCreate={handleNoteCreate}
          />
        </div>
      )}
    </div>
  );
}

export default App;
