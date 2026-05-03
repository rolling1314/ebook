// 类型定义
export interface Book {
  id: string;
  user_id: string;
  filename: string;
  title?: string;
  author?: string;
  size_bytes?: number;
  created_at: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    username: string;
    email: string;
    created_at: string;
  };
}

export interface Note {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string;
  chapter_title: string;
  cfi: string;
  selected_text: string;
  note_content: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface NoteCreate {
  book_id: string;
  book_title: string;
  chapter_title: string;
  cfi: string;
  selected_text: string;
  note_content: string;
  color?: string;
}

export interface Highlight {
  id: string;
  user_id: string;
  book_id: string;
  cfi: string;
  selected_text: string;
  color: string;
  created_at: string;
}
