# EPUB 阅读器笔记系统

一个功能完整的 EPUB 电子书阅读器，支持在正文中直接添加笔记、高亮和书签。

## 📁 文件结构

```
frontend/src/
├── mockNotes.ts                    # Mock 数据和工具函数
├── NotesPanel.tsx                  # 笔记面板组件
├── NotesPanel.css                  # 笔记面板样式
├── EpubReaderWithNotes.tsx         # 带笔记功能的阅读器
├── EpubReaderWithNotes.css         # 阅读器笔记样式
├── FullDemo.tsx                    # 完整演示页面
├── FullDemo.css                    # 演示页面样式
└── NotesDemo.tsx                   # 笔记面板演示
```

## 🎯 核心功能

### 1. 在正文中添加笔记

**使用方法：**
- 在阅读时用鼠标选中任意文字
- 自动弹出笔记对话框
- 选择高亮颜色（5种颜色可选）
- 可以仅添加高亮，或添加带文字的笔记

**代码示例：**
```tsx
import { EpubReaderWithNotes } from './EpubReaderWithNotes'

function App() {
  const handleNoteCreate = (noteData) => {
    console.log('新笔记:', noteData)
    // 保存到数据库或本地存储
  }

  return (
    <EpubReaderWithNotes
      epubUrl="/path/to/book.epub"
      onNoteCreate={handleNoteCreate}
    />
  )
}
```

### 2. 笔记管理面板

**功能特性：**
- ✅ 三个标签页：笔记、高亮、书签
- ✅ 全文搜索功能
- ✅ 按颜色筛选
- ✅ 时间排序（最新在前）
- ✅ 点击跳转到原文位置

**代码示例：**
```tsx
import { NotesPanel } from './NotesPanel'

function App() {
  return (
    <NotesPanel
      notes={notes}
      highlights={highlights}
      bookmarks={bookmarks}
      onNoteClick={(note) => {
        // 跳转到笔记位置
        rendition.display(note.cfi)
      }}
    />
  )
}
```

## 🎨 笔记对话框功能

### 界面元素

1. **选中文本显示**
   - 显示用户选中的原文
   - 斜体样式，带左侧蓝色边框

2. **颜色选择器**
   - 5种颜色：黄色、绿色、蓝色、粉色、紫色
   - 圆形按钮，选中时有边框高亮

3. **操作按钮**
   - **仅高亮**：只添加颜色标记，不写笔记
   - **添加笔记**：聚焦到文本框，输入笔记内容

4. **笔记输入框**
   - 多行文本框
   - 支持换行
   - 输入内容后显示"保存笔记"按钮

### 交互流程

```
用户选中文字
    ↓
弹出笔记对话框
    ↓
选择颜色（默认黄色）
    ↓
两种选择：
    ├─ 点击"仅高亮" → 添加高亮标记 → 关闭对话框
    └─ 输入笔记内容 → 点击"保存笔记" → 添加笔记+高亮 → 关闭对话框
```

## 📊 数据结构

### Note（笔记）
```typescript
type Note = {
  id: string                    // 唯一标识
  bookId: string                // 书籍ID
  bookTitle: string             // 书籍标题
  chapterTitle: string          // 章节标题
  cfi: string                   // EPUB CFI 位置标识
  selectedText: string          // 选中的原文
  noteContent: string           // 笔记内容
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple'
  createdAt: string             // 创建时间
  updatedAt: string             // 更新时间
}
```

### Highlight（高亮）
```typescript
type Highlight = {
  id: string
  bookId: string
  cfi: string
  selectedText: string
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple'
  createdAt: string
}
```

### Bookmark（书签）
```typescript
type Bookmark = {
  id: string
  bookId: string
  bookTitle: string
  chapterTitle: string
  cfi: string
  pageNumber: number
  createdAt: string
}
```

## 🔧 工具函数

### 1. 按书籍分组
```typescript
import { groupNotesByBook } from './mockNotes'

const grouped = groupNotesByBook(notes)
// Map { 'book-123' => [note1, note2], 'book-456' => [note3] }
```

### 2. 搜索笔记
```typescript
import { searchNotes } from './mockNotes'

const results = searchNotes(notes, '认知革命')
// 返回包含关键词的笔记
```

### 3. 按颜色筛选
```typescript
import { filterNotesByColor } from './mockNotes'

const yellowNotes = filterNotesByColor(notes, 'yellow')
```

### 4. 获取最近笔记
```typescript
import { getRecentNotes } from './mockNotes'

const recent = getRecentNotes(notes, 5)
// 返回最近的5条笔记
```

### 5. 导出为 Markdown
```typescript
import { exportNotesToMarkdown } from './mockNotes'

const markdown = exportNotesToMarkdown(notes)
// 生成 Markdown 格式的笔记文档
```

### 6. 统计信息
```typescript
import { getNoteStats } from './mockNotes'

const stats = getNoteStats(notes)
// {
//   totalNotes: 6,
//   bookCount: 3,
//   colorCounts: { yellow: 2, green: 1, blue: 1, pink: 1, purple: 1 },
//   averageNoteLength: 156
// }
```

## 🎬 使用示例

### 完整集成示例

```tsx
import { useState } from 'react'
import { EpubReaderWithNotes } from './EpubReaderWithNotes'
import { NotesPanel } from './NotesPanel'
import type { Note } from './mockNotes'

function MyEbookApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [showNotes, setShowNotes] = useState(false)
  const [epubUrl] = useState('/books/sample.epub')

  // 创建笔记
  const handleNoteCreate = (noteData) => {
    const newNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setNotes([newNote, ...notes])
  }

  // 点击笔记跳转
  const handleNoteClick = (note) => {
    setShowNotes(false)
    // 跳转到笔记位置
    // renditionRef.current?.display(note.cfi)
  }

  return (
    <div>
      <button onClick={() => setShowNotes(!showNotes)}>
        {showNotes ? '返回阅读' : '查看笔记'}
      </button>

      {showNotes ? (
        <NotesPanel
          notes={notes}
          highlights={[]}
          bookmarks={[]}
          onNoteClick={handleNoteClick}
        />
      ) : (
        <EpubReaderWithNotes
          epubUrl={epubUrl}
          onNoteCreate={handleNoteCreate}
        />
      )}
    </div>
  )
}
```

## 🎨 样式定制

### 修改高亮颜色

在 `EpubReaderWithNotes.tsx` 中修改 `getColorHex` 函数：

```typescript
const getColorHex = (color: string): string => {
  const colors: Record<string, string> = {
    yellow: '#fbbf24',  // 修改为你想要的颜色
    green: '#10b981',
    blue: '#3b82f6',
    pink: '#ec4899',
    purple: '#8b5cf6',
  }
  return colors[color] || colors.yellow
}
```

### 修改对话框样式

编辑 `EpubReaderWithNotes.css` 中的 `.note-dialog` 类。

## 📱 响应式设计

所有组件都支持移动端：
- 笔记对话框在小屏幕上自动调整大小
- 笔记面板支持触摸滚动
- 按钮和文字大小适配移动设备

## 🔑 关键技术点

### 1. EPUB CFI（Canonical Fragment Identifier）

CFI 是 EPUB 标准中用于定位文本位置的方法：
```
epubcfi(/6/4[chap01]!/4/2/42,/1:0,/1:120)
```

### 2. 文本选择监听

使用 epub.js 的 `selected` 事件：
```typescript
rendition.on('selected', (cfiRange, contents) => {
  const selection = contents.window.getSelection()
  const text = selection.toString()
  // 处理选中的文本
})
```

### 3. 高亮渲染

使用 epub.js 的 annotations API：
```typescript
rendition.annotations.highlight(
  cfi,
  {},
  onClick,
  '',
  { fill: '#fbbf24', 'fill-opacity': '0.3' }
)
```

## 🚀 下一步开发

- [ ] 持久化存储（LocalStorage / IndexedDB）
- [ ] 后端 API 集成
- [ ] 笔记编辑和删除功能
- [ ] 笔记导出（PDF、Word）
- [ ] 笔记分享功能
- [ ] 多设备同步
- [ ] 笔记标签系统
- [ ] 笔记关联和引用

## 📝 注意事项

1. **CFI 的准确性**：确保 EPUB 文件格式正确，CFI 才能准确定位
2. **性能优化**：大量笔记时考虑虚拟滚动
3. **数据备份**：定期备份用户笔记数据
4. **跨书籍搜索**：实现全局笔记搜索功能

## 🎓 学习资源

- [epub.js 文档](https://github.com/futurepress/epub.js)
- [EPUB CFI 规范](http://www.idpf.org/epub/linking/cfi/)
- [React Hooks 最佳实践](https://react.dev/reference/react)

---

**作者提示**：这是一个完整的笔记系统实现，包含了从 UI 到数据管理的所有功能。你可以根据实际需求进行定制和扩展。
