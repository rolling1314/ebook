import { useState, useMemo } from 'react'
import type { Note, Highlight, Bookmark } from './mockNotes'
import './NotesPanel.css'

type Tab = 'notes' | 'highlights' | 'bookmarks'

type Props = {
  notes: Note[]
  highlights: Highlight[]
  bookmarks: Bookmark[]
  onNoteClick?: (note: Note) => void
  onHighlightClick?: (highlight: Highlight) => void
  onBookmarkClick?: (bookmark: Bookmark) => void
}

export function NotesPanel({
  notes,
  highlights,
  bookmarks,
  onNoteClick,
  onHighlightClick,
  onBookmarkClick,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('notes')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedColor, setSelectedColor] = useState<string>('all')

  // 筛选笔记
  const filteredNotes = useMemo(() => {
    let result = notes

    // 按颜色筛选
    if (selectedColor !== 'all') {
      result = result.filter((note) => note.color === selectedColor)
    }

    // 按搜索词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (note) =>
          note.noteContent.toLowerCase().includes(query) ||
          note.selectedText.toLowerCase().includes(query) ||
          note.chapterTitle.toLowerCase().includes(query) ||
          note.bookTitle.toLowerCase().includes(query)
      )
    }

    // 按时间倒序排列
    return result.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }, [notes, searchQuery, selectedColor])

  // 筛选高亮
  const filteredHighlights = useMemo(() => {
    let result = highlights

    if (selectedColor !== 'all') {
      result = result.filter((h) => h.color === selectedColor)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((h) =>
        h.selectedText.toLowerCase().includes(query)
      )
    }

    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [highlights, searchQuery, selectedColor])

  // 筛选书签
  const filteredBookmarks = useMemo(() => {
    let result = bookmarks

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (b) =>
          b.bookTitle.toLowerCase().includes(query) ||
          b.chapterTitle.toLowerCase().includes(query)
      )
    }

    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [bookmarks, searchQuery])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getColorLabel = (color: string) => {
    const labels: Record<string, string> = {
      yellow: '黄色',
      green: '绿色',
      blue: '蓝色',
      pink: '粉色',
      purple: '紫色',
    }
    return labels[color] || color
  }

  return (
    <div className="notes-panel">
      <div className="notes-panel__header">
        <h2>我的笔记</h2>
        <div className="notes-panel__stats">
          <span>{notes.length} 条笔记</span>
          <span>{highlights.length} 处高亮</span>
          <span>{bookmarks.length} 个书签</span>
        </div>
      </div>

      {/* 标签页 */}
      <div className="notes-panel__tabs">
        <button
          type="button"
          className={`notes-panel__tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          笔记 ({filteredNotes.length})
        </button>
        <button
          type="button"
          className={`notes-panel__tab ${activeTab === 'highlights' ? 'active' : ''}`}
          onClick={() => setActiveTab('highlights')}
        >
          高亮 ({filteredHighlights.length})
        </button>
        <button
          type="button"
          className={`notes-panel__tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookmarks')}
        >
          书签 ({filteredBookmarks.length})
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="notes-panel__filters">
        <input
          type="search"
          className="notes-panel__search"
          placeholder="搜索笔记内容..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {(activeTab === 'notes' || activeTab === 'highlights') && (
          <div className="notes-panel__color-filter">
            <button
              type="button"
              className={`color-btn ${selectedColor === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedColor('all')}
            >
              全部
            </button>
            {['yellow', 'green', 'blue', 'pink', 'purple'].map((color) => (
              <button
                key={color}
                type="button"
                className={`color-btn color-btn--${color} ${selectedColor === color ? 'active' : ''}`}
                onClick={() => setSelectedColor(color)}
                title={getColorLabel(color)}
              >
                <span className="color-dot" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="notes-panel__content">
        {activeTab === 'notes' && (
          <div className="notes-list">
            {filteredNotes.length === 0 ? (
              <div className="notes-panel__empty">
                {searchQuery || selectedColor !== 'all'
                  ? '没有找到匹配的笔记'
                  : '还没有笔记，开始阅读并添加笔记吧！'}
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`note-card note-card--${note.color}`}
                  onClick={() => onNoteClick?.(note)}
                >
                  <div className="note-card__header">
                    <h3 className="note-card__book">{note.bookTitle}</h3>
                    <span className="note-card__date">
                      {formatDate(note.updatedAt)}
                    </span>
                  </div>
                  <div className="note-card__chapter">{note.chapterTitle}</div>
                  <blockquote className="note-card__quote">
                    {note.selectedText}
                  </blockquote>
                  <div className="note-card__content">{note.noteContent}</div>
                  <div className="note-card__footer">
                    <span className={`note-card__color-tag color-tag--${note.color}`}>
                      {getColorLabel(note.color)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'highlights' && (
          <div className="highlights-list">
            {filteredHighlights.length === 0 ? (
              <div className="notes-panel__empty">
                {searchQuery || selectedColor !== 'all'
                  ? '没有找到匹配的高亮'
                  : '还没有高亮内容'}
              </div>
            ) : (
              filteredHighlights.map((highlight) => (
                <div
                  key={highlight.id}
                  className={`highlight-card highlight-card--${highlight.color}`}
                  onClick={() => onHighlightClick?.(highlight)}
                >
                  <blockquote className="highlight-card__text">
                    {highlight.selectedText}
                  </blockquote>
                  <div className="highlight-card__footer">
                    <span className={`color-tag color-tag--${highlight.color}`}>
                      {getColorLabel(highlight.color)}
                    </span>
                    <span className="highlight-card__date">
                      {formatDate(highlight.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="bookmarks-list">
            {filteredBookmarks.length === 0 ? (
              <div className="notes-panel__empty">
                {searchQuery ? '没有找到匹配的书签' : '还没有书签'}
              </div>
            ) : (
              filteredBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="bookmark-card"
                  onClick={() => onBookmarkClick?.(bookmark)}
                >
                  <div className="bookmark-card__icon">🔖</div>
                  <div className="bookmark-card__content">
                    <h3 className="bookmark-card__book">{bookmark.bookTitle}</h3>
                    <div className="bookmark-card__chapter">
                      {bookmark.chapterTitle}
                    </div>
                    <div className="bookmark-card__meta">
                      <span>第 {bookmark.pageNumber} 页</span>
                      <span>{formatDate(bookmark.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
