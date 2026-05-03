import { useState } from 'react'
import { KindleStyleReaderSimple } from './KindleStyleReaderSimple'
import { mockNotes } from './mockNotes'
import type { Note } from './mockNotes'

export function KindleDemo() {
  const [notes] = useState<Note[]>(mockNotes)
  const epubUrl = 'https://example.com/sample.epub' // 替换为实际 URL

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      background: '#f5f5f5'
    }}>
      {/* 头部 */}
      <header style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem' }}>
          📚 Kindle 风格阅读器
        </h1>
        <p style={{ margin: '0.5rem 0 0', opacity: 0.9, fontSize: '0.875rem' }}>
          笔记直接显示在高亮文字下方，就像 Kindle 一样
        </p>
      </header>

      {/* 阅读器 */}
      <div style={{ flex: 1, padding: '1rem', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <KindleStyleReaderSimple
            epubUrl={epubUrl}
            notes={notes}
          />
        </div>
      </div>

      {/* 说明 */}
      <footer style={{
        padding: '1rem 1.5rem',
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          fontSize: '0.875rem'
        }}>
          <div>
            <strong>✨ Kindle 风格</strong>
            <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
              笔记直接显示在高亮下方
            </p>
          </div>
          <div>
            <strong>🎨 彩色标记</strong>
            <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
              5种颜色区分不同类型
            </p>
          </div>
          <div>
            <strong>📝 实时显示</strong>
            <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
              无需点击，自动展示
            </p>
          </div>
          <div>
            <strong>📱 响应式</strong>
            <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
              适配各种屏幕尺寸
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
