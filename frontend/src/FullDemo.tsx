import { useState, useCallback } from 'react'
import { EpubReaderWithNotes } from './EpubReaderWithNotes'
import { NotesPanel } from './NotesPanel'
import { mockNotes, mockHighlights } from './mockNotes'
import type { Note } from './mockNotes'
import './FullDemo.css'

export function FullDemo() {
  const [notes, setNotes] = useState<Note[]>(mockNotes)
  const [highlights, setHighlights] = useState(mockHighlights)
  const [showNotesPanel, setShowNotesPanel] = useState(false)
  const [epubUrl] = useState('https://example.com/sample.epub') // 替换为实际的 EPUB URL

  const handleNoteCreate = useCallback((noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setNotes((prev) => [newNote, ...prev])
    console.log('创建笔记:', newNote)
  }, [])

  const handleNoteClick = useCallback((note: Note) => {
    console.log('点击笔记:', note)
    // 可以在这里添加额外的处理，比如高亮显示等
  }, [])

  // 将笔记转换为高亮格式
  const allHighlights = [
    ...highlights,
    ...notes.map(note => ({
      cfi: note.cfi,
      color: note.color,
    }))
  ]

  return (
    <div className="full-demo">
      <header className="full-demo__header">
        <div className="full-demo__header-content">
          <h1>📚 EPUB 阅读器 - 完整演示</h1>
          <div className="full-demo__header-actions">
            <button
              type="button"
              className="full-demo__btn"
              onClick={() => setShowNotesPanel(!showNotesPanel)}
            >
              {showNotesPanel ? '📖 返回阅读' : '📝 查看笔记'}
            </button>
            <div className="full-demo__stats">
              <span className="stat-badge">{notes.length} 笔记</span>
              <span className="stat-badge">{highlights.length} 高亮</span>
            </div>
          </div>
        </div>
      </header>

      <div className="full-demo__content">
        {showNotesPanel ? (
          <div className="full-demo__notes-view">
            <NotesPanel
              notes={notes}
              highlights={highlights}
              bookmarks={[]}
              onNoteClick={handleNoteClick}
            />
          </div>
        ) : (
          <div className="full-demo__reader-view">
            <EpubReaderWithNotes
              epubUrl={epubUrl}
              notes={notes}
              highlights={allHighlights}
              onNoteCreate={handleNoteCreate}
              onNoteClick={handleNoteClick}
              onMetadata={(title) => console.log('书籍标题:', title)}
            />
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div className="full-demo__instructions">
        <h3>💡 使用说明</h3>
        <ul>
          <li><strong>查看笔记：</strong>阅读时，已有的高亮和笔记会自动显示在正文中</li>
          <li><strong>点击笔记：</strong>点击高亮的文字可以查看完整笔记内容</li>
          <li><strong>添加笔记：</strong>选中新的文字会弹出笔记对话框</li>
          <li><strong>颜色标记：</strong>不同颜色的高亮代表不同类型的笔记</li>
          <li><strong>笔记管理：</strong>点击"查看笔记"按钮进入笔记管理界面</li>
          <li><strong>搜索筛选：</strong>在笔记面板中可以搜索和筛选笔记</li>
        </ul>
      </div>
    </div>
  )
}
