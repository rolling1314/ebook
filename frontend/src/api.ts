// API 客户端
// 重新导出所有类型
export * from './api-types';
import type { RegisterData, LoginData, AuthResponse, Book, Note, NoteCreate, Highlight } from './api-types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// 获取存储的token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// 设置token
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// 清除token
export const clearToken = (): void => {
  localStorage.removeItem('token');
};

// 获取存储的用户信息
export const getUser = (): any | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// 设置用户信息
export const setUser = (user: any): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

// 清除用户信息
export const clearUser = (): void => {
  localStorage.removeItem('user');
};

// 创建带认证的fetch请求
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // 不要在这里自动跳转，让调用者决定如何处理 401
  return response;
};

// ============ 认证 API ============

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    } catch (e) {
      throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
    }
  }

  return response.json();
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    } catch (e) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }
  }

  return response.json();
};

export const getCurrentUser = async () => {
  const response = await authFetch('/api/auth/me');
  
  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  return response.json();
};

// ============ 书籍 API ============

export const uploadBook = async (file: File): Promise<{ book_id: string; filename: string; epub_url: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await authFetch('/api/books', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Upload failed');
  }

  return response.json();
};

export const getBooks = async (): Promise<Book[]> => {
  const response = await authFetch('/api/books');

  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }

  return response.json();
};

export const deleteBook = async (bookId: string): Promise<void> => {
  const response = await authFetch(`/api/books/${bookId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete book');
  }
};

export const getBookUrl = (bookId: string): string => {
  const token = getToken();
  return `${API_BASE_URL}/api/books/${bookId}/file.epub${token ? `?token=${token}` : ''}`;
};

// ============ 笔记 API ============

export const getNotes = async (bookId: string): Promise<Note[]> => {
  const response = await authFetch(`/api/books/${bookId}/notes`);

  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }

  return response.json();
};

export const createNote = async (bookId: string, data: NoteCreate): Promise<Note> => {
  const response = await authFetch(`/api/books/${bookId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create note');
  }

  return response.json();
};

export const updateNote = async (
  bookId: string,
  noteId: string,
  data: { note_content?: string; color?: string }
): Promise<Note> => {
  const response = await authFetch(`/api/books/${bookId}/notes/${noteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update note');
  }

  return response.json();
};

export const deleteNote = async (bookId: string, noteId: string): Promise<void> => {
  const response = await authFetch(`/api/books/${bookId}/notes/${noteId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete note');
  }
};

// ============ 高亮 API ============

export const getHighlights = async (bookId: string): Promise<Highlight[]> => {
  const response = await authFetch(`/api/books/${bookId}/highlights`);

  if (!response.ok) {
    throw new Error('Failed to fetch highlights');
  }

  return response.json();
};

export const createHighlight = async (
  bookId: string,
  data: { cfi: string; selected_text: string; color?: string }
): Promise<Highlight> => {
  const response = await authFetch(`/api/books/${bookId}/highlights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create highlight');
  }

  return response.json();
};

export const deleteHighlight = async (bookId: string, highlightId: string): Promise<void> => {
  const response = await authFetch(`/api/books/${bookId}/highlights/${highlightId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete highlight');
  }
};
