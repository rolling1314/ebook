# Kindle 风格笔记系统 - 快速开始

## 🎯 核心特性

**像 Kindle 一样，笔记直接显示在高亮文字的下方！**

```
正常文字 [黄色高亮的重要内容] 正常文字
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────────────────┐
│ 📝 今天                                              │
│ 这是我的笔记：这段话很重要，需要重点理解...          │
└─────────────────────────────────────────────────────┘

继续下一段文字...
```

## 🚀 快速使用

### 1. 基础用法

```tsx
import { KindleStyleReaderSimple } from './KindleStyleReaderSimple'
import { mockNotes } from './mockNotes'

function App() {
  return (
    <KindleStyleReaderSimple
      epubUrl="/path/to/book.epub"
      notes={mockNotes}
    />
  )
}
```

### 2. 完整示例

```tsx
import { useState } from 'react'
import { KindleStyleReaderSimple } from './KindleStyleReaderSimple'

function MyReader() {
  const [notes, setNotes] = useState([
    {
      id: 'note-1',
      cfi: 'epubcfi(/6/4[chap01]!/4/2/42,/1:0,/1:120)',
      selectedText: '这是高亮的文字',
      noteContent: '这是我的笔记内容',
      color: 'yellow',
      bookId: 'book-1',
      bookTitle: '书名',
      chapterTitle: '第一章',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ])

  return (
    <div style={{ height: '100vh' }}>
      <KindleStyleReaderSimple
        epubUrl="/book.epub"
        notes={notes}
        onNoteCreate={(newNote) => {
          setNotes([...notes, {
            ...newNote,
            id: `note-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }])
        }}
      />
    </div>
  )
}
```

## 📁 文件说明

### 核心文件
- `KindleStyleReaderSimple.tsx` - 简化版阅读器（100行代码）
- `KindleStyleReader.css` - Kindle 风格样式
- `mockNotes.ts` - 示例数据

### 演示文件
- `KindleDemo.tsx` - 完整演示页面
- `KINDLE_STYLE_GUIDE.md` - 详细实现指南

## 🎨 效果展示

### 笔记卡片样式

**黄色笔记**
```
┌─────────────────────────────────────┐
│ 📝 今天                              │  ← 浅黄色背景
│ 笔记内容...                          │  ← 左侧橙色边框
└─────────────────────────────────────┘
```

**绿色笔记**
```
┌─────────────────────────────────────┐
│ 📝 昨天                              │  ← 浅绿色背景
│ 笔记内容...                          │  ← 左侧绿色边框
└─────────────────────────────────────┘
```

## 🔧 工作原理

### 1. 渲染高亮
```typescript
rendition.annotations.highlight(note.cfi, {}, () => {}, '', {
  fill: '#fbbf24',           // 颜色
  'fill-opacity': '0.4',     // 透明度
  'mix-blend-mode': 'multiply',
})
```

### 2. 注入笔记
```typescript
// 在 rendered 事件后
rendition.on('rendered', (section, view) => {
  notes.forEach(note => {
    // 获取高亮位置
    const range = rendition.getRange(note.cfi)
    
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
    
    // 插入到段落后
    paragraph.parentNode.insertBefore(noteCard, paragraph.nextSibling)
  })
})
```

## 📊 数据格式

```typescript
type Note = {
  id: string
  cfi: string              // EPUB 位置标识
  selectedText: string     // 高亮的原文
  noteContent: string      // 笔记内容
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple'
  bookId: string
  bookTitle: string
  chapterTitle: string
  createdAt: string
  updatedAt: string
}
```

## 🎯 关键特性

### ✅ 自动显示
- 打开书籍时自动渲染所有笔记
- 翻页时自动更新当前页笔记
- 无需点击，直接可见

### ✅ 视觉效果
- 5种颜色标记（黄、绿、蓝、粉、紫）
- 浅色背景 + 彩色左边框
- 显示创建时间（今天、昨天、X天前）

### ✅ 性能优化
- 防止重复注入（data-note-id 检查）
- 延迟注入（100ms 后执行）
- 自动清理（翻页时重新渲染）

## 💡 使用技巧

### 1. 自定义颜色
```css
.kindle-note--yellow {
  background: #fef9e7;      /* 修改背景色 */
  border-left-color: #f39c12; /* 修改边框色 */
}
```

### 2. 调整间距
```css
.kindle-note {
  margin: 0.75rem 0;        /* 上下间距 */
  padding: 0.75rem 1rem;    /* 内边距 */
}
```

### 3. 修改字体
```css
.kindle-note__content {
  font-size: 0.875rem;      /* 字体大小 */
  line-height: 1.6;         /* 行高 */
}
```

## 🐛 常见问题

### Q: 笔记没有显示？
A: 检查以下几点：
1. CFI 是否正确
2. 是否在 `rendered` 事件后注入
3. 查看控制台是否有错误

### Q: 笔记重复显示？
A: 添加重复检查：
```typescript
if (doc.querySelector(`[data-note-id="${note.id}"]`)) return
```

### Q: 翻页后笔记消失？
A: 确保在每次 `rendered` 事件时都重新注入笔记

## 📱 移动端适配

```css
@media (max-width: 768px) {
  .kindle-note {
    padding: 0.625rem 0.875rem;
    font-size: 0.8125rem;
  }
  
  .kindle-note__header {
    font-size: 0.7rem;
  }
}
```

## 🎓 进阶功能

### 1. 点击笔记跳转
```typescript
noteCard.addEventListener('click', () => {
  // 跳转到笔记管理页面
  onNoteClick?.(note)
})
```

### 2. 编辑笔记
```typescript
noteCard.addEventListener('dblclick', () => {
  // 显示编辑对话框
  showEditDialog(note)
})
```

### 3. 删除笔记
```typescript
const deleteBtn = document.createElement('button')
deleteBtn.textContent = '删除'
deleteBtn.onclick = () => onNoteDelete(note.id)
noteCard.appendChild(deleteBtn)
```

## 🚀 下一步

- [ ] 添加笔记编辑功能
- [ ] 支持笔记折叠/展开
- [ ] 添加笔记搜索高亮
- [ ] 支持笔记导出
- [ ] 添加笔记分享功能

---

**现在你的阅读器已经支持 Kindle 风格的笔记显示了！** 🎉

笔记会自动显示在高亮文字的下方，就像真正的 Kindle 一样。
