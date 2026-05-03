import { useCallback, useEffect, useRef, useState } from 'react'
import ePub, { type Rendition, type Book, type NavItem } from 'epubjs'
import './EpubReader.css'

type Props = {
  epubUrl: string
  onMetadata?: (title: string) => void
}

export function EpubReader({ epubUrl, onMetadata }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const bookRef = useRef<Book | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [toc, setToc] = useState<NavItem[]>([])
  const [showToc, setShowToc] = useState<boolean>(true)

  useEffect(() => {
    if (!hostRef.current || !epubUrl) return

    setError(null)
    const host = hostRef.current
    const book = ePub(epubUrl)
    bookRef.current = book
    let cancelled = false

    const measure = () => {
      const w = Math.floor(host.clientWidth)
      const h = Math.floor(host.clientHeight)
      return {
        w: Math.max(w, 320),
        h: Math.max(h, 400),
      }
    }

    const { w: initW, h: initH } = measure()

    book.loaded.metadata
      .then((meta) => {
        if (!cancelled) onMetadata?.(meta.title ?? '')
      })
      .catch(() => {
        if (!cancelled) onMetadata?.('')
      })

    // 加载目录
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
    
    // 设置为双页模式，最小宽度800px时显示两页
    rendition.spread('always', 800)
    renditionRef.current = rendition

    const layout = () => {
      if (cancelled) return
      const { w, h } = measure()
      if (w > 0 && h > 0) rendition.resize(w, h)
    }

    const ro = new ResizeObserver(() => layout())
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
        
        // 监听位置变化以更新页码
        rendition.on('relocated', (location: any) => {
          if (cancelled) return
          const current = location.start.displayed.page
          const total = location.start.displayed.total
          setCurrentPage(current)
          setTotalPages(total)
        })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : String(err))
      })

    return () => {
      cancelled = true
      ro.disconnect()
      renditionRef.current = null
      bookRef.current = null
      book.destroy()
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
        <div className="epub-reader__toolbar">
          <button type="button" onClick={prev}>
            上一页
          </button>
          <button type="button" onClick={next}>
            下一页
          </button>
          <span className="epub-reader__hint">左右方向键翻页</span>
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
