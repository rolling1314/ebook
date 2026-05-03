# Kindle 风格笔记系统

## 📖 效果说明

像 Kindle 一样，笔记直接显示在高亮文字的下方，而不是点击后才弹出。

## 🎨 视觉效果

```
正常段落文字，这里有一段被高亮的重要内容，继续阅读...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────────────────┐
│ 📝 今天                                              │
│ 这是我的笔记内容：这段话很重要，需要记住...          │
└─────────────────────────────────────────────────────┘

继续下一段正常文字...
```

## 🔧 实现方案

### 方案 1：使用 CSS 伪元素（推荐）

在 EPUB 的 iframe 中注入自定义样式：

```typescript
// 为每个笔记添加 data 属性
rendition.annotations.highlight(note.cfi, {
  'data-note-id': note.id,
  'data-note-content': note.noteContent,
  'data-note-time': formatDate(note.updatedAt)
})

// 注入 CSS
const style = document.createElement('style')
style.textContent = `
  [data-note-content]::after {
    content: attr(data-note-content);
    display: block;
    margin: 0.75rem 0;
    padding: 0.75rem 1rem;
    background: #fef9e7;
    border-left: 4px solid #f39c12;
    border-radius: 4px;
    font-size: 0.875rem;
    line-height: 1.6;
  }
`
iframe.contentDocument.head.appendChild(style)
```

### 方案 2：DOM 操作（更灵活）

```typescript
const injectNotes = (contents: Contents) => {
  notes.forEach(note => {
    // 获取高亮位置
    const range = rendition.getRange(note.cfi)
    const element = range.commonAncestorContainer.parentElement
    
    // 创建笔记卡片
    const noteCard = document.createElement('div')
    noteCard.className = 'kindle-note'
    noteCard.innerHTML = `
      <div class="kindle-note__header">
        <span>📝</span>
        <span>${formatDate(note.updatedAt)}</span>
      </div>
      <div class="kindle-note__content">
        ${note.noteContent}
      </div>
    `
    
    // 插入到高亮文字后面
    element.parentNode.insertBefore(noteCard, element.nextSibling)
  })
}

// 监听页面渲染
rendition.on('rendered', (section, view) => {
  injectNotes(view.contents)
})
```

## 📝 完整示例代码

```typescript
import { useEffect, useCallback } from 'react'
import ePub from 'epubjs'

function KindleReader({ epubUrl, notes }) {
  const renditionRef = useRef(null)
  
  // 注入笔记到页面
  const injectNotes = useCallback((contents) => {
    const doc = contents.document
    
    notes.forEach(note => {
      try {
        // 获取高亮范围
        const range = renditionRef.current.getRange(note.cfi)
        if (!range) return
        
        // 找到父元素
        const container = range.commonAncestorContainer
        const parent = container.nodeType === Node.TEXT_NODE 
          ? container.parentElement 
          : container
        
        // 找到段落元素
        const paragraph = parent.closest('p') || parent
        
        // 创建笔记卡片
        const noteDiv = doc.createElement('div')
        noteDiv.className = `kindle-note kindle-note--${note.color}`
        noteDiv.innerHTML = `
          <div class="kindle-note__header">
            <span class="kindle-note__icon">📝</span>
            <span class="kindle-note__time">${formatDate(note.updatedAt)}</span>
          </div>
          <div class="kindle-note__content">${note.noteContent}</div>
        `
        
        // 插入笔记（在段落后面）
        paragraph.parentNode.insertBefore(noteDiv, paragraph.nextSibling)
        
      } catch (err) {
        console.error('注入笔记失败:', err)
      }
    })
  }, [notes])
  
  useEffect(() => {
    const book = ePub(epubUrl)
    const rendition = book.renderTo('viewer', {
      width: '100%',
      height: '100%'
    })
    
    renditionRef.current = rendition
    
    // 监听页面渲染完成
    rendition.on('rendered', (section, view) => {
      // 先渲染高亮
      notes.forEach(note => {
        rendition.annotations.highlight(note.cfi, {}, () => {}, '', {
          fill: getColor(note.color),
          'fill-opacity': '0.4'
        })
      })
      
      // 再注入笔记
      setTimeout(() => {
        injectNotes(view.contents)
      }, 100)
    })
    
    rendition.display()
    
    return () => {
      book.destroy()
    }
  }, [epubUrl, notes, injectNotes])
  
  return <div id="viewer" style={{ height: '100vh' }} />
}
```

## 🎨 CSS 样式

```css
/* Kindle 风格笔记卡片 */
.kindle-note {
  margin: 0.75rem 0;
  padding: 0.75rem 1rem;
  background: #fef9e7;
  border-left: 4px solid #f39c12;
  border-radius: 4px;
  font-size: 0.875rem;
  line-height: 1.6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.kindle-note--yellow {
  background: #fef9e7;
  border-left-color: #f39c12;
}

.kindle-note--green {
  background: #e8f8f5;
  border-left-color: #1abc9c;
}

.kindle-note--blue {
  background: #ebf5fb;
  border-left-color: #3498db;
}

.kindle-note__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: #666;
}

.kindle-note__content {
  color: #333;
  white-space: pre-wrap;
}
```

## 🚀 使用方法

```tsx
import { KindleStyleReader } from './KindleStyleReader'
import { mockNotes } from './mockNotes'

function App() {
  const [notes, setNotes] = useState(mockNotes)
  
  return (
    <KindleStyleReader
      epubUrl="/book.epub"
      notes={notes}
      onNoteCreate={(note) => {
        setNotes([...notes, note])
      }}
    />
  )
}
```

## 📊 效果对比

### 之前（点击弹窗）
```
高亮文字 [点击] → 弹出笔记窗口
```

### 现在（Kindle 风格）
```
高亮文字
┌─────────────┐
│ 📝 笔记内容  │
└─────────────┘
继续阅读...
```

## 🎯 关键点

1. **时机**：在 `rendered` 事件后注入笔记
2. **位置**：找到段落元素，在其后插入笔记卡片
3. **样式**：使用浅色背景 + 左侧彩色边框
4. **清理**：翻页时自动清理，重新注入

## 💡 优化建议

### 1. 防止重复注入
```typescript
// 检查是否已存在
const existing = doc.querySelector(`[data-note-id="${note.id}"]`)
if (existing) return

// 添加标记
noteDiv.setAttribute('data-note-id', note.id)
```

### 2. 性能优化
```typescript
// 只注入当前页的笔记
const visibleNotes = notes.filter(note => 
  isInCurrentPage(note.cfi, currentLocation)
)
```

### 3. 响应式设计
```css
@media (max-width: 768px) {
  .kindle-note {
    padding: 0.625rem 0.875rem;
    font-size: 0.8125rem;
  }
}
```

## 🔍 调试技巧

```typescript
// 查看注入的笔记
rendition.on('rendered', (section, view) => {
  console.log('当前章节:', section.href)
  console.log('笔记数量:', notes.length)
  
  setTimeout(() => {
    const injected = view.contents.document.querySelectorAll('.kindle-note')
    console.log('已注入笔记:', injected.length)
  }, 200)
})
```

---

这样就实现了像 Kindle 一样的笔记显示效果！笔记会直接显示在高亮文字的下方，无需点击。
