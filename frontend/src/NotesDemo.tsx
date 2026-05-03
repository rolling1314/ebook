import { NotesPanel } from './NotesPanel'
import { mockNotes, mockHighlights, mockBookmarks } from './mockNotes'
import type { Note, Highlight, Bookmark } from './mockNotes'
import './NotesDemo.css'

export function NotesDemo() {
  const handleNoteClick = (note: Note) => {
    console.log('点击笔记:', note)
    // 这里可以跳转到书籍的对应位置
    // rendition.display(note.cfi)
  }

  const handleHighlightClick = (highlight: Highlight) => {
    console.log('点击高亮:', highlight)
    // rendition.display(highlight.cfi)
  }

  const handleBookmarkClick = (bookmark: Bookmark) => {
    console.log('点击书签:', bookmark)
    // rendition.display(bookmark.cfi)
  }

  return (
    <div className="notes-demo">
      <div className="notes-demo__header">
        <h1>笔记系统演示</h1>
        <p>展示如何渲染和管理电子书笔记、高亮和书签</p>
      </div>

      <div className="notes-demo__content">
        <NotesPanel
          notes={mockNotes}
          highlights={mockHighlights}
          bookmarks={mockBookmarks}
          onNoteClick={handleNoteClick}
          onHighlightClick={handleHighlightClick}
          onBookmarkClick={handleBookmarkClick}
        />
      </div>

      <div className="notes-demo__info">
        <h2>功能说明</h2>
        <ul>
          <li>✅ 三种类型：笔记、高亮、书签</li>
          <li>✅ 搜索功能：支持全文搜索</li>
          <li>✅ 颜色筛选：5种颜色标记</li>
          <li>✅ 时间排序：最新的在前</li>
          <li>✅ 点击跳转：点击可跳转到书籍位置</li>
          <li>✅ 响应式设计：适配移动端</li>
        </ul>

        <h2>集成到你的应用</h2>
        <pre className="notes-demo__code">
{`import { NotesPanel } from './NotesPanel'
import { mockNotes, mockHighlights, mockBookmarks } from './mockNotes'

function App() {
  return (
    <NotesPanel
      notes={mockNotes}
      highlights={mockHighlights}
      bookmarks={mockBookmarks}
      onNoteClick={(note) => {
        // 跳转到笔记位置
        rendition.display(note.cfi)
      }}
    />
  )
}`}
        </pre>
      </div>
    </div>
  )
}
