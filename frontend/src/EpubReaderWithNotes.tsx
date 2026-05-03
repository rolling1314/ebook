import { useCallback, useEffect, useRef, useState } from 'react'
import ePub, { type Rendition, type Book, type NavItem, type Contents } from 'epubjs'
import type { Note } from './mockNotes'
import './EpubReader.css'
import './EpubReaderWithNotes.css'

type Props = {
  epubUrl: string
  notes?: Note[]  // 已有的笔记列表
  highlights?: Array<{ cfi: string; color: string }>  // 已有的高亮列表
  onMetadata?: (title: string) => void
  onNoteCreate?: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
  onNoteClick?: (note: Note) => void  // 点击笔记时的回调
}

type SelectionInfo = {
  text: string
  cfi: string
  range: Range
}

export function EpubReaderWithNotes({ 
  epubUrl, 
  notes = [], 
  highlights = [], 
  onMetadata, 
  onNoteCreate,
  onNoteClick 
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const bookRef = useRef<Book | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [toc, setToc] = useState<NavItem[]>([])
  const [showToc, setShowToc] = useState<boolean>(true)
  
  // 笔记相关状态
  const [selection, setSelection] = useState<SelectionInfo | null>(null)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [selectedColor, setSelectedColor] = useState<'yellow' | 'green' | 'blue' | 'pink' | 'purple'>('yellow')
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!hostRef.current || !epubUrl) return

    setError(null)
    const host = hostRef.current
    let cancelled = false
    let ro: ResizeObserver | null = null

    const measure = () => {
      const w = Math.floor(host.clientWidth)
      const h = Math.floor(host.clientHeight)
      return {
        w: Math.max(w, 320),
        h: Math.max(h, 400),
      }
    }

    const loadBook = async () => {
      const response = await fetch(epubUrl)
      if (!response.ok) {
        throw new Error(`Failed to load EPUB: ${response.statusText}`)
      }
      const arrayBuffer = await response.arrayBuffer()
      return ePub(arrayBuffer)
    }

    loadBook().then((book) => {
      if (cancelled) return
      bookRef.current = book

      const { w: initW, h: initH } = measure()

      book.loaded.metadata
        .then((meta) => {
          if (!cancelled) onMetadata?.(meta.title ?? '')
        })
        .catch(() => {
          if (!cancelled) onMetadata?.('')
        })

      book.loaded.navigation
        .then((navigation) => {
          if (!cancelled) {
            setToc(navigation.toc)
          }
        })
        .catch(() => {
          if (!cancelled) setToc([])
        })

      const rendition = book.renderTo(host, {
        width: initW,
        height: initH,
        spread: 'always',
        allowScriptedContent: true,
      })
      rendition.flow('paginated')
      rendition.spread('always', 800)
      renditionRef.current = rendition

      const layout = () => {
        if (cancelled) return
        const { w, h } = measure()
        if (w > 0 && h > 0) rendition.resize(w, h)
      }

      ro = new ResizeObserver(() => layout())
      ro.observe(host)

      void book.ready
        .then(() => {
          if (cancelled) return
          return rendition.display()
        })
        .then(() => {
          if (cancelled) return
          layout()
          requestAnimationFrame(layout)

          renderExistingAnnotations()

          rendition.on('relocated', (location: any) => {
            if (cancelled) return
            const current = location.start.displayed.page
            const total = location.start.displayed.total
            setCurrentPage(current)
            setTotalPages(total)

            renderExistingAnnotations()
          })

          rendition.on('selected', (cfiRange: string, contents: Contents) => {
            if (cancelled) return

            const selection = contents.window.getSelection()
            if (!selection || selection.rangeCount === 0) return

            const range = selection.getRangeAt(0)
            const text = selection.toString().trim()

            if (text.length === 0) return

            const rect = range.getBoundingClientRect()
            const iframe = contents.document.defaultView?.frameElement as HTMLIFrameElement
            const iframeRect = iframe?.getBoundingClientRect()

            if (iframeRect) {
              setDialogPosition({
                x: iframeRect.left + rect.left + rect.width / 2,
                y: iframeRect.top + rect.top - 10,
              })
            }

            setSelection({
              text,
              cfi: cfiRange,
              range,
            })
            setShowNoteDialog(true)
          })
        })
        .catch((err: unknown) => {
          if (cancelled) return
          setError(err instanceof Error ? err.message : String(err))
        })
    }).catch((err: unknown) => {
      if (cancelled) return
      setError(err instanceof Error ? err.message : String(err))
    })

    return () => {
      cancelled = true
      ro?.disconnect()
      renditionRef.current = null
      if (bookRef.current) {
        bookRef.current.destroy()
        bookRef.current = null
      }
      host.replaceChildren()
    }
  }, [epubUrl, onMetadata])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        renditionRef.current?.prev()
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        renditionRef.current?.next()
      }
      if (e.key === 'Escape') {
        setShowNoteDialog(false)
        setSelection(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const prev = useCallback(() => {
    renditionRef.current?.prev()
  }, [])

  const next = useCallback(() => {
    renditionRef.current?.next()
  }, [])

  const goToChapter = useCallback((href: string) => {
    renditionRef.current?.display(href)
  }, [])

  const toggleToc = useCallback(() => {
    setShowToc((prev) => !prev)
  }, [])

  // 添加高亮
  const addHighlight = useCallback((color: string) => {
    if (!selection || !renditionRef.current) return

    // 在 EPUB 中添加高亮标记
    renditionRef.current.annotations.highlight(
      selection.cfi,
      {},
      (e: MouseEvent) => {
        console.log('点击高亮:', e)
      },
      '',
      {
        fill: getColorHex(color),
        'fill-opacity': '0.3',
        'mix-blend-mode': 'multiply',
      }
    )

    setShowNoteDialog(false)
    setSelection(null)
  }, [selection])

  // 添加笔记
  const addNote = useCallback(() => {
    if (!selection || !noteContent.trim()) return

    const note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
      bookId: 'current-book',
      bookTitle: 'Current Book',
      chapterTitle: 'Current Chapter',
      cfi: selection.cfi,
      selectedText: selection.text,
      noteContent: noteContent.trim(),
      color: selectedColor,
    }

    // 添加高亮
    if (renditionRef.current) {
      renditionRef.current.annotations.highlight(
        selection.cfi,
        {},
        (e: MouseEvent) => {
          console.log('点击笔记:', e)
        },
        '',
        {
          fill: getColorHex(selectedColor),
          'fill-opacity': '0.3',
          'mix-blend-mode': 'multiply',
        }
      )
    }

    onNoteCreate?.(note)
    
    setShowNoteDialog(false)
    setSelection(null)
    setNoteContent('')
  }, [selection, noteContent, selectedColor, onNoteCreate])

  const cancelNote = useCallback(() => {
    setShowNoteDialog(false)
    setSelection(null)
    setNoteContent('')
  }, [])

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

  // 渲染已有的高亮和笔记
  const renderExistingAnnotations = useCallback(() => {
    if (!renditionRef.current) return

    // 清除之前的标注
    renditionRef.current.annotations.remove('*', 'highlight')

    // 渲染所有高亮
    highlights.forEach((highlight) => {
      renditionRef.current?.annotations.highlight(
        highlight.cfi,
        {},
        () => {}, // 空的点击处理
        '',
        {
          fill: getColorHex(highlight.color),
          'fill-opacity': '0.3',
          'mix-blend-mode': 'multiply',
        }
      )
    })

    // 渲染所有笔记（带高亮 + 图标）
    notes.forEach((note) => {
      renditionRef.current?.annotations.highlight(
        note.cfi,
        {},
        (e: MouseEvent) => {
          // 点击笔记高亮时显示笔记内容
          e.preventDefault()
          showNotePopup(note, e)
        },
        '',
        {
          fill: getColorHex(note.color),
          'fill-opacity': '0.4',
          'mix-blend-mode': 'multiply',
        }
      )

      // 在高亮旁边添加笔记图标
      renditionRef.current?.annotations.mark(
        note.cfi,
        {},
        (e: MouseEvent) => {
          e.preventDefault()
          showNotePopup(note, e)
        }
      )
    })
  }, [notes, highlights])

  // 显示笔记弹窗
  const showNotePopup = (note: Note, event: MouseEvent) => {
    // 创建笔记预览弹窗
    const popup = document.createElement('div')
    popup.className = 'note-popup'
    popup.innerHTML = `
      <div class="note-popup__header">
        <span class="note-popup__icon">📝</span>
        <span class="note-popup__date">${formatNoteDate(note.updatedAt)}</span>
      </div>
      <div class="note-popup__quote">"${note.selectedText}"</div>
      <div class="note-popup__content">${note.noteContent}</div>
      <div class="note-popup__footer">
        <span class="note-popup__color" style="background: ${getColorHex(note.color)}"></span>
        <button class="note-popup__close">关闭</button>
      </div>
    `
    
    popup.style.position = 'fixed'
    popup.style.left = `${event.clientX}px`
    popup.style.top = `${event.clientY + 10}px`
    popup.style.zIndex = '10001'
    
    document.body.appendChild(popup)
    
    // 点击关闭按钮
    const closeBtn = popup.querySelector('.note-popup__close')
    closeBtn?.addEventListener('click', () => {
      document.body.removeChild(popup)
    })
    
    // 点击外部关闭
    const closeOnClickOutside = (e: MouseEvent) => {
      if (!popup.contains(e.target as Node)) {
        if (document.body.contains(popup)) {
          document.body.removeChild(popup)
        }
        document.removeEventListener('click', closeOnClickOutside)
      }
    }
    setTimeout(() => {
      document.addEventListener('click', closeOnClickOutside)
    }, 100)
    
    // 通知父组件
    onNoteClick?.(note)
  }

  const formatNoteDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    })
  }

  // 当笔记或高亮变化时重新渲染
  useEffect(() => {
    if (renditionRef.current) {
      renderExistingAnnotations()
    }
  }, [notes, highlights, renderExistingAnnotations])

  const renderTocItem = (item: NavItem, level = 0) => {
    return (
      <div key={item.id || item.href}>
        <button
          type="button"
          className="epub-reader__toc-item"
          style={{ paddingLeft: `${level * 1 + 0.75}rem` }}
          onClick={() => goToChapter(item.href)}
        >
          {item.label}
        </button>
        {item.subitems && item.subitems.length > 0 && (
          <div className="epub-reader__toc-subitems">
            {item.subitems.map((subitem) => renderTocItem(subitem, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="epub-reader">
      {showToc && (
        <aside className="epub-reader__sidebar">
          <div className="epub-reader__sidebar-header">
            <h3>目录</h3>
            <button
              type="button"
              className="epub-reader__sidebar-close"
              onClick={toggleToc}
              title="隐藏目录"
            >
              ✕
            </button>
          </div>
          <nav className="epub-reader__toc">
            {toc.length > 0 ? (
              toc.map((item) => renderTocItem(item))
            ) : (
              <p className="epub-reader__toc-empty">暂无目录</p>
            )}
          </nav>
        </aside>
      )}
      <div className="epub-reader__main">
        {error ? <p className="epub-reader__error">{error}</p> : null}
        {!showToc && (
          <button
            type="button"
            className="epub-reader__toc-toggle"
            onClick={toggleToc}
            title="显示目录"
          >
            ☰ 目录
          </button>
        )}
        <div className="epub-reader__stage" ref={hostRef} />
        
        {/* 笔记对话框 */}
        {showNoteDialog && selection && (
          <div
            className="note-dialog"
            style={{
              position: 'fixed',
              left: `${dialogPosition.x}px`,
              top: `${dialogPosition.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="note-dialog__header">
              <h4>添加笔记</h4>
              <button
                type="button"
                className="note-dialog__close"
                onClick={cancelNote}
              >
                ✕
              </button>
            </div>
            
            <div className="note-dialog__selected-text">
              "{selection.text}"
            </div>

            <div className="note-dialog__colors">
              {(['yellow', 'green', 'blue', 'pink', 'purple'] as const).map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-picker-btn color-picker-btn--${color} ${
                    selectedColor === color ? 'active' : ''
                  }`}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                />
              ))}
            </div>

            <div className="note-dialog__actions">
              <button
                type="button"
                className="note-dialog__btn note-dialog__btn--highlight"
                onClick={() => addHighlight(selectedColor)}
              >
                仅高亮
              </button>
              <button
                type="button"
                className="note-dialog__btn note-dialog__btn--note"
                onClick={() => {
                  // 切换到笔记输入模式
                  const textarea = document.querySelector('.note-dialog__textarea') as HTMLTextAreaElement
                  textarea?.focus()
                }}
              >
                添加笔记
              </button>
            </div>

            <textarea
              className="note-dialog__textarea"
              placeholder="输入你的笔记..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
            />

            {noteContent.trim() && (
              <button
                type="button"
                className="note-dialog__btn note-dialog__btn--save"
                onClick={addNote}
              >
                保存笔记
              </button>
            )}
          </div>
        )}

        <div className="epub-reader__toolbar">
          <button type="button" onClick={prev}>
            上一页
          </button>
          <button type="button" onClick={next}>
            下一页
          </button>
          <span className="epub-reader__hint">
            左右方向键翻页 | 选中文字添加笔记
          </span>
          {totalPages > 0 && (
            <span className="epub-reader__page-info">
              第 {currentPage} 页 / 共 {totalPages} 页
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
