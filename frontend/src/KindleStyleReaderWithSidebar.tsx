// Kindle 风格阅读器 - 带侧边栏目录 + 笔记内嵌显示 + 创建笔记功能 + 数据库集成
import { useCallback, useEffect, useRef, useState } from 'react'
import ePub, { type Rendition, type Book, type NavItem, type Contents } from 'epubjs'
import { getNotes, createNote as apiCreateNote, getHighlights, createHighlight as apiCreateHighlight, getToken } from './api'
import './EpubReaderWithNotes.css'

type Props = {
  epubUrl: string
  bookId: string
  onMetadata?: (title: string) => void
}

type SelectionInfo = {
  text: string
  cfi: string
  chapterTitle: string
}

type Note = {
  id: string
  cfi: string
  selectedText: string
  noteContent: string
  color: string
  updatedAt: string
}

type Highlight = {
  id: string
  cfi: string
  selectedText: string
  color: string
}

export function KindleStyleReaderWithSidebar({ 
  epubUrl,
  bookId,
  onMetadata,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const bookRef = useRef<Book | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [toc, setToc] = useState<NavItem[]>([])
  const [showToc, setShowToc] = useState<boolean>(true)
  const [bookTitle, setBookTitle] = useState<string>('')
  const [currentChapter, setCurrentChapter] = useState<string>('未知章节')
  
  const [notes, setNotes] = useState<Note[]>([])
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [loadingEpub, setLoadingEpub] = useState(true)
  
  const [selection, setSelection] = useState<SelectionInfo | null>(null)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [selectedColor, setSelectedColor] = useState<'yellow' | 'green' | 'blue' | 'pink' | 'purple'>('yellow')
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(false)

  const loadNotesAndHighlights = useCallback(async () => {
    try {
      setLoadingData(true)
      const [notesData, highlightsData] = await Promise.all([
        getNotes(bookId),
        getHighlights(bookId)
      ])
      
      setNotes(notesData.map(n => ({
        id: n.id,
        cfi: n.cfi,
        selectedText: n.selected_text,
        noteContent: n.note_content,
        color: n.color,
        updatedAt: n.updated_at
      })))
      
      setHighlights(highlightsData.map(h => ({
        id: h.id,
        cfi: h.cfi,
        selectedText: h.selected_text,
        color: h.color
      })))
    } catch (err) {
      console.error('加载笔记失败:', err)
    } finally {
      setLoadingData(false)
    }
  }, [bookId])

  useEffect(() => {
    loadNotesAndHighlights()
  }, [loadNotesAndHighlights])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  const getColorHex = (color: string): string => {
    const colors: Record<string, string> = {
      yellow: '#fbbf24',
      green: '#10b981',
      blue: '#3b82f6',
      pink: '#ec4899',
      purple: '#8b5cf6',
    }
    return colors[color] || colors.yellow
  }

  const createNote = useCallback(async () => {
    if (!selection || !noteContent.trim() || loading) return
    setLoading(true)
    try {
      await apiCreateNote(bookId, {
        book_id: bookId,
        book_title: bookTitle,
        chapter_title: selection.chapterTitle,
        cfi: selection.cfi,
        selected_text: selection.text,
        note_content: noteContent.trim(),
        color: selectedColor,
      })
      setShowNoteDialog(false)
      setSelection(null)
      setNoteContent('')
      await loadNotesAndHighlights()
    } catch (err) {
      console.error('创建笔记失败:', err)
      alert('创建笔记失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [selection, noteContent, selectedColor, bookId, bookTitle, loading, loadNotesAndHighlights])

  const createHighlight = useCallback(async () => {
    if (!selection || loading) return
    setLoading(true)
    try {
      await apiCreateHighlight(bookId, {
        cfi: selection.cfi,
        selected_text: selection.text,
        color: selectedColor,
      })
      setShowNoteDialog(false)
      setSelection(null)
      await loadNotesAndHighlights()
    } catch (err) {
      console.error('创建高亮失败:', err)
      alert('创建高亮失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [selection, selectedColor, bookId, loading, loadNotesAndHighlights])

  const injectStyles = useCallback((contents: Contents) => {
    const doc = contents.document
    if (!doc || doc.querySelector('#kindle-note-styles')) return
    const style = doc.createElement('style')
    style.id = 'kindle-note-styles'
    style.textContent = `
      .kindle-note { display: block !important; margin: 1rem 0 !important; padding: 0.75rem 1rem !important; border-radius: 4px !important; font-size: 0.9em !important; line-height: 1.6 !important; cursor: pointer !important; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important; }
      .kindle-note--yellow { background: #fef9e7 !important; border-left: 4px solid #f39c12 !important; }
      .kindle-note--green { background: #e8f8f5 !important; border-left: 4px solid #1abc9c !important; }
      .kindle-note--blue { background: #ebf5fb !important; border-left: 4px solid #3498db !important; }
      .kindle-note--pink { background: #fdeef4 !important; border-left: 4px solid #ec4899 !important; }
      .kindle-note--purple { background: #f3e8ff !important; border-left: 4px solid #8b5cf6 !important; }
      .kindle-note__header { display: flex !important; align-items: center !important; gap: 0.5rem !important; margin-bottom: 0.5rem !important; font-size: 0.75rem !important; color: #666 !important; }
      .kindle-note__content { color: #333 !important; white-space: pre-wrap !important; }
    `
    doc.head.appendChild(style)
  }, [])

  const injectNotesIntoPage = useCallback((contents: Contents) => {
    const doc = contents.document
    if (!doc) return
    injectStyles(contents)
    doc.querySelectorAll('[data-note-id]').forEach(el => el.remove())
    notes.forEach(note => {
      try {
        const range = renditionRef.current?.getRange(note.cfi)
        if (!range) return
        const container = range.commonAncestorContainer
        const parent = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as HTMLElement
        if (!parent || doc.querySelector(`[data-note-id="${note.id}"]`)) return
        const noteCard = doc.createElement('div')
        noteCard.className = `kindle-note kindle-note--${note.color}`
        noteCard.setAttribute('data-note-id', note.id)
        noteCard.innerHTML = `<div class="kindle-note__header"><span>📝</span><span>${formatDate(note.updatedAt)}</span></div><div class="kindle-note__content">${note.noteContent}</div>`
        const paragraph = parent.closest('p') || parent.closest('div') || parent
        if (paragraph.parentNode) paragraph.parentNode.insertBefore(noteCard, paragraph.nextSibling)
      } catch (err) {
        console.error('注入笔记失败:', err)
      }
    })
  }, [notes, injectStyles])

  const renderHighlights = useCallback(() => {
    if (!renditionRef.current) return
    renditionRef.current.annotations.remove('*', 'highlight')
    highlights.forEach((highlight) => {
      renditionRef.current?.annotations.highlight(highlight.cfi, {}, () => {}, '', { fill: getColorHex(highlight.color), 'fill-opacity': '0.3', 'mix-blend-mode': 'multiply' })
    })
    notes.forEach((note) => {
      renditionRef.current?.annotations.highlight(note.cfi, {}, () => {}, '', { fill: getColorHex(note.color), 'fill-opacity': '0.4', 'mix-blend-mode': 'multiply' })
    })
  }, [notes, highlights])

  useEffect(() => {
    if (!hostRef.current || !epubUrl) return
    setError(null)
    setLoadingEpub(true)
    const host = hostRef.current
    
    let book: Book | null = null
    let cancelled = false
    let ro: ResizeObserver | null = null
    
    const measure = () => {
      const w = Math.floor(host.clientWidth)
      const h = Math.floor(host.clientHeight)
      return { w: Math.max(w, 320), h: Math.max(h, 400) }
    }
    
    // 使用 fetch 下载 EPUB 文件为 ArrayBuffer
    const loadBook = async () => {
      try {
        const response = await fetch(epubUrl)
        if (!response.ok) {
          throw new Error(`Failed to load EPUB: ${response.statusText}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        return ePub(arrayBuffer)
      } catch (err) {
        console.error('Failed to load EPUB:', err)
        throw err
      }
    }
    
    loadBook().then((loadedBook) => {
      if (cancelled) return
      book = loadedBook
      bookRef.current = book
      
      const { w: initW, h: initH } = measure()
      
      book.loaded.metadata
        .then((meta) => { 
          if (!cancelled) { 
            const title = meta.title ?? ''
            setBookTitle(title)
            onMetadata?.(title)
            setLoadingEpub(false)
          } 
        })
        .catch(() => { 
          if (!cancelled) { 
            onMetadata?.('')
            setLoadingEpub(false)
          } 
        })
      
      book.loaded.navigation
        .then((navigation) => { 
          if (!cancelled && navigation) setToc(navigation.toc || []) 
        })
        .catch((err) => { 
          console.warn('Failed to load navigation:', err)
          if (!cancelled) setToc([]) 
        })
      
      let rendition: Rendition | null = null
      try {
        rendition = book.renderTo(host, { width: initW, height: initH, spread: 'always', allowScriptedContent: true })
        rendition.flow('paginated')
        rendition.spread('always', 800)
        renditionRef.current = rendition
      } catch (err) {
        console.error('Failed to create rendition:', err)
        setError('无法渲染 EPUB 文件')
        setLoadingEpub(false)
        return
      }
      
      const layout = () => {
        if (cancelled || !renditionRef.current) return
        const { w, h } = measure()
        if (w > 0 && h > 0) {
          try { renditionRef.current.resize(w, h) } catch (err) { console.warn('Resize failed:', err) }
        }
      }
      
      ro = new ResizeObserver(() => { if (renditionRef.current) layout() })
      ro.observe(host)
      
      void book.ready.then(() => { 
        if (cancelled) return
        return rendition.display() 
      }).then(() => {
      }).then(() => {
        if (cancelled) return
        layout()
        requestAnimationFrame(layout)
        rendition.on('rendered', (section: any, view: any) => {
          if (cancelled) return
          renderHighlights()
          setTimeout(() => { if (view?.contents) injectNotesIntoPage(view.contents) }, 100)
        })
        rendition.on('relocated', (location: any) => {
          if (cancelled) return
          const current = location.start.displayed.page
          const total = location.start.displayed.total
          setCurrentPage(current)
          setTotalPages(total)
          const spine = book.spine.get(location.start.cfi)
          if (spine) setCurrentChapter(spine.href)
        })
        rendition.on('selected', (cfiRange: string, contents: Contents) => {
          if (cancelled) return
          const sel = contents.window.getSelection()
          if (!sel || sel.rangeCount === 0) return
          const range = sel.getRangeAt(0)
          const text = sel.toString().trim()
          if (text.length === 0) return
          const rect = range.getBoundingClientRect()
          const iframe = contents.document.defaultView?.frameElement as HTMLIFrameElement
          const iframeRect = iframe?.getBoundingClientRect()
          if (iframeRect) {
            setDialogPosition({ x: iframeRect.left + rect.left + rect.width / 2, y: iframeRect.top + rect.top - 10 })
          }
          setSelection({ text, cfi: cfiRange, chapterTitle: currentChapter })
          setShowNoteDialog(true)
        })
      }).catch((err: unknown) => { 
        if (cancelled) return
        console.error('EPUB loading error:', err)
        setError(err instanceof Error ? err.message : String(err))
        setLoadingEpub(false)
      })
    }).catch((err: unknown) => {
      if (cancelled) return
      console.error('Failed to load EPUB file:', err)
      setError(err instanceof Error ? err.message : 'Failed to load EPUB file')
      setLoadingEpub(false)
    })
    
    return () => {
      cancelled = true
      if (ro) {
        ro.disconnect()
      }
      if (book) {
        book.destroy()
      }
      host.replaceChildren()
      renditionRef.current = null
      bookRef.current = null
    }
  }, [epubUrl, onMetadata, renderHighlights, injectNotesIntoPage, currentChapter])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); renditionRef.current?.prev() }
      if (e.key === 'ArrowRight') { e.preventDefault(); renditionRef.current?.next() }
      if (e.key === 'Escape') { setShowNoteDialog(false); setSelection(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const prev = useCallback(() => { renditionRef.current?.prev() }, [])
  const next = useCallback(() => { renditionRef.current?.next() }, [])
  const goToChapter = useCallback((href: string) => { renditionRef.current?.display(href) }, [])
  const toggleToc = useCallback(() => { setShowToc((prev) => !prev) }, [])

  const renderTocItem = (item: NavItem, level = 0) => {
    return (
      <div key={item.id || item.href}>
        <button type="button" className="epub-reader__toc-item" style={{ paddingLeft: `${level * 1 + 0.75}rem` }} onClick={() => goToChapter(item.href)}>{item.label}</button>
        {item.subitems && item.subitems.length > 0 && (<div className="epub-reader__toc-subitems">{item.subitems.map((subitem) => renderTocItem(subitem, level + 1))}</div>)}
      </div>
    )
  }

  return (
    <div className="epub-reader">
      {showToc && (
        <aside className="epub-reader__sidebar">
          <div className="epub-reader__sidebar-header">
            <h3>目录</h3>
            <button type="button" className="epub-reader__sidebar-close" onClick={toggleToc} title="隐藏目录">✕</button>
          </div>
          <nav className="epub-reader__toc">{toc.length > 0 ? toc.map((item) => renderTocItem(item)) : <p className="epub-reader__toc-empty">暂无目录</p>}</nav>
        </aside>
      )}
      <div className="epub-reader__main">
        {error ? <p className="epub-reader__error">{error}</p> : null}
        {loadingEpub && <div className="epub-reader__loading-overlay"><div className="epub-reader__spinner"></div><p>正在加载书籍...</p></div>}
        {loadingData && <p className="epub-reader__loading">加载笔记中...</p>}
        {!showToc && <button type="button" className="epub-reader__toc-toggle" onClick={toggleToc} title="显示目录">☰ 目录</button>}
        <div className="epub-reader__stage" ref={hostRef} />
        {showNoteDialog && selection && (
          <div className="note-dialog" style={{ position: 'fixed', left: `${dialogPosition.x}px`, top: `${dialogPosition.y}px`, transform: 'translate(-50%, -100%)' }}>
            <div className="note-dialog__header">
              <h4>添加笔记</h4>
              <button type="button" className="note-dialog__close" onClick={() => { setShowNoteDialog(false); setSelection(null); setNoteContent('') }}>✕</button>
            </div>
            <div className="note-dialog__selected-text">"{selection.text}"</div>
            <div className="note-dialog__colors">
              {(['yellow', 'green', 'blue', 'pink', 'purple'] as const).map((color) => (
                <button key={color} type="button" className={`color-picker-btn color-picker-btn--${color} ${selectedColor === color ? 'active' : ''}`} onClick={() => setSelectedColor(color)} title={color} />
              ))}
            </div>
            <div className="note-dialog__actions">
              <button type="button" className="note-dialog__btn note-dialog__btn--highlight" onClick={createHighlight} disabled={loading}>{loading ? '保存中...' : '仅高亮'}</button>
            </div>
            <textarea className="note-dialog__textarea" placeholder="输入你的笔记..." value={noteContent} onChange={(e) => setNoteContent(e.target.value)} rows={4} />
            {noteContent.trim() && <button type="button" className="note-dialog__btn note-dialog__btn--save" onClick={createNote} disabled={loading}>{loading ? '保存中...' : '保存笔记'}</button>}
          </div>
        )}
        <div className="epub-reader__toolbar">
          <button type="button" onClick={prev}>上一页</button>
          <button type="button" onClick={next}>下一页</button>
          <span className="epub-reader__hint">左右方向键翻页 | 笔记显示在高亮文本下方 | 共 {notes.length} 条笔记</span>
          {totalPages > 0 && <span className="epub-reader__page-info">第 {currentPage} 页 / 共 {totalPages} 页</span>}
        </div>
      </div>
    </div>
  )
}
