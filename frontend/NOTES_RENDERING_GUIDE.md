# 笔记在正文中的渲染效果

## 📖 功能说明

现在笔记系统支持在阅读正文时**直接显示**已有的高亮和笔记，而不是只在添加时才显示。

## 🎨 视觉效果

### 1. 高亮显示
```
正常文字 [黄色高亮的文字] 正常文字 [绿色高亮的文字] 正常文字
         ↑                        ↑
    仅高亮，无笔记            仅高亮，无笔记
```

### 2. 带笔记的高亮
```
正常文字 [蓝色高亮的文字📝] 正常文字
         ↑
    有笔记内容，点击可查看
```

### 3. 点击笔记后的弹窗
```
┌─────────────────────────────────┐
│ 📝                      2天前    │
├─────────────────────────────────┤
│ "这是选中的原文内容..."          │
├─────────────────────────────────┤
│ 这是我的笔记内容：               │
│ 1. 第一点思考                    │
│ 2. 第二点思考                    │
├─────────────────────────────────┤
│ 🟡                      [关闭]   │
└─────────────────────────────────┘
```

## 🔧 实现原理

### 1. 初始化时渲染所有笔记
```typescript
// 在书籍加载完成后
rendition.display().then(() => {
  // 渲染所有已有的高亮
  highlights.forEach(h => {
    rendition.annotations.highlight(h.cfi, ...)
  })
  
  // 渲染所有已有的笔记
  notes.forEach(note => {
    rendition.annotations.highlight(note.cfi, ...)
  })
})
```

### 2. 翻页时重新渲染
```typescript
rendition.on('relocated', () => {
  // 每次翻页后重新渲染当前页的高亮和笔记
  renderExistingAnnotations()
})
```

### 3. 点击笔记显示详情
```typescript
rendition.annotations.highlight(
  note.cfi,
  {},
  (e) => {
    // 点击高亮时显示笔记弹窗
    showNotePopup(note, e)
  }
)
```

## 📝 使用示例

### 基础用法
```tsx
import { EpubReaderWithNotes } from './EpubReaderWithNotes'
import { mockNotes, mockHighlights } from './mockNotes'

function App() {
  const [notes, setNotes] = useState(mockNotes)
  const [highlights, setHighlights] = useState(mockHighlights)

  return (
    <EpubReaderWithNotes
      epubUrl="/book.epub"
      notes={notes}              // 传入已有笔记
      highlights={highlights}    // 传入已有高亮
      onNoteCreate={(newNote) => {
        // 添加新笔记
        setNotes([...notes, newNote])
      }}
      onNoteClick={(note) => {
        // 点击笔记时的回调
        console.log('查看笔记:', note)
      }}
    />
  )
}
```

### 完整示例（带笔记管理）
```tsx
function MyApp() {
  const [notes, setNotes] = useState([])
  const [showPanel, setShowPanel] = useState(false)

  // 将笔记也作为高亮显示
  const allHighlights = [
    ...highlights,
    ...notes.map(n => ({ cfi: n.cfi, color: n.color }))
  ]

  return (
    <div>
      <button onClick={() => setShowPanel(!showPanel)}>
        {showPanel ? '返回阅读' : '查看笔记'}
      </button>

      {showPanel ? (
        <NotesPanel notes={notes} />
      ) : (
        <EpubReaderWithNotes
          epubUrl="/book.epub"
          notes={notes}
          highlights={allHighlights}
          onNoteCreate={(note) => setNotes([...notes, note])}
        />
      )}
    </div>
  )
}
```

## 🎯 关键特性

### ✅ 已实现的功能

1. **自动渲染**
   - 打开书籍时自动显示所有高亮和笔记
   - 翻页时自动更新当前页的标注

2. **交互式笔记**
   - 点击高亮文字查看笔记详情
   - 弹窗显示完整笔记内容
   - 显示笔记创建时间和颜色

3. **视觉区分**
   - 仅高亮：半透明颜色背景
   - 带笔记：更深的颜色 + 可点击
   - 5种颜色标记不同类型

4. **实时更新**
   - 添加新笔记后立即显示
   - 笔记列表变化时自动重新渲染

## 🎨 样式定制

### 修改高亮透明度
```typescript
// 在 EpubReaderWithNotes.tsx 中
rendition.annotations.highlight(cfi, {}, {}, '', {
  fill: '#fbbf24',
  'fill-opacity': '0.3',  // 调整这个值 (0-1)
  'mix-blend-mode': 'multiply',
})
```

### 修改笔记弹窗样式
```css
/* 在 EpubReaderWithNotes.css 中 */
.note-popup {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
  /* 自定义样式 */
}
```

## 📊 数据流

```
用户打开书籍
    ↓
加载已有笔记和高亮
    ↓
在正文中渲染所有标注
    ↓
用户阅读时看到高亮
    ↓
点击高亮 → 显示笔记详情
    ↓
选中新文字 → 添加新笔记
    ↓
新笔记立即显示在正文中
```

## 🔍 调试技巧

### 查看渲染的笔记
```typescript
console.log('当前笔记数量:', notes.length)
console.log('当前高亮数量:', highlights.length)

// 在渲染后检查
rendition.annotations.each((annotation) => {
  console.log('标注:', annotation)
})
```

### 检查 CFI 是否正确
```typescript
// CFI 格式示例
'epubcfi(/6/4[chap01]!/4/2/42,/1:0,/1:120)'
//        ↑ 章节    ↑ 段落  ↑ 字符范围
```

## 🚀 性能优化

### 大量笔记时的优化
```typescript
// 只渲染当前页的笔记
const currentPageNotes = notes.filter(note => {
  // 检查 CFI 是否在当前页范围内
  return isInCurrentPage(note.cfi)
})

renderExistingAnnotations(currentPageNotes)
```

### 防抖渲染
```typescript
import { debounce } from 'lodash'

const debouncedRender = debounce(() => {
  renderExistingAnnotations()
}, 300)

rendition.on('relocated', debouncedRender)
```

## 📱 移动端适配

笔记弹窗在移动端会自动调整：
- 宽度适应屏幕
- 位置自动调整避免超出屏幕
- 触摸友好的关闭按钮

## 🎓 最佳实践

1. **持久化存储**
   ```typescript
   // 保存到 localStorage
   localStorage.setItem('notes', JSON.stringify(notes))
   
   // 加载时恢复
   const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]')
   ```

2. **错误处理**
   ```typescript
   try {
     renderExistingAnnotations()
   } catch (error) {
     console.error('渲染笔记失败:', error)
   }
   ```

3. **性能监控**
   ```typescript
   console.time('渲染笔记')
   renderExistingAnnotations()
   console.timeEnd('渲染笔记')
   ```

---

现在你的笔记系统已经完全支持在阅读正文时显示已有的高亮和笔记了！🎉
