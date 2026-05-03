// 简化版 Kindle 风格阅读器 - 笔记直接显示在高亮下方
import { useCallback, useEffect, useRef, useState } from 'react'
import ePub, { type Rendition, type Book, type Contents } from 'epubjs'
import type { Note } from './mockNotes'
import './KindleStyleReader.css'
import './EpubReader.css'

type Props = {
  epubUrl: string
  notes?: Note[]
  onNoteCreate?: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function KindleStyleReader({ epubUrl, notes = [], onNoteCreate }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const renditionRef = useRef<Rendition | null>(null)

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  // 在页面中注入笔记（Kindle 风格）
  const injectNotes = useCallback((contents: Contents) => {
    const doc = contents.document
    if (!doc) return

    notes.forEach(note => {
      try {
        const range = renditionRef.current?.getRange(note.cfi)
        if (!range) return

        const container = range.commonAncestorContainer
        const parent = container.nodeType === Node.TEXT_NODE 
          ? container.parentElement 
          : container as HTMLElement

        if (!parent) return

        // 检查是否已添加
        if (doc.querySelector(`[data-note-id="${note.id}"]`)) return

        // 创建笔记卡片
        const noteCard = doc.createElement('div')
        noteCard.className = `kindle-note kindle-note--${note.color}`
        noteCard.setAttribute('data-note-id', note.id)
        noteCard.innerHTML = `
          <div class="kindle-note__header">
            <span class="kindle-note__icon">📝</span>
            <span class="kindle-note__time">${formatDate(note.updatedAt)}</span>
          </div>
          <div class="kindle-note__content">${note.noteContent}</div>
        `

        // 插入到段落后
        const paragraph = parent.closest('p') || parent
        if (paragraph.parentNode) {
          paragraph.parentNode.insertBefore(noteCard, paragraph.nextSibling)
        }
      } catch (err) {
        console.error('注入笔记失败:', err)
      }
    })
  }, [notes])

  useEffect(() => {
    if (!hostRef.current || !epubUrl) return

    const book = ePub(epubUrl)
    const rendition = book.renderTo(hostRef.current, {
      width: '100%',
      height: '100%',
    })
    
    renditionRef.current = rendition

    // 监听页面渲染
    rendition.on('rendered', (section: any, view: any) => {
      // 渲染高亮
      notes.forEach(note => {
        const colors: Record<string, string> = {
          yellow: '#fbbf24', green: '#10b981', blue: '#3b82f6',
          pink: '#ec4899', purple: '#8b5cf6'
        }
        rendition.annotations.highlight(note.cfi, {}, () => {}, '', {
          fill: colors[note.color] || colors.yellow,
          'fill-opacity': '0.4',
          'mix-blend-mode': 'multiply',
        })
      })

      // 注入笔记
      setTimeout(() => {
        if (view?.contents) injectNotes(view.contents)
      }, 100)
    })

    rendition.display()

    return () => {
      book.destroy()
    }
  }, [epubUrl, notes, injectNotes])

  return <div ref={hostRef} style={{ width: '100%', height: '100%' }} />
}
