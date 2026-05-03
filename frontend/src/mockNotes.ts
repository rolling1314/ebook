/**
 * Mock 笔记数据
 * 用于演示电子书阅读器的笔记功能
 */

export type Note = {
  id: string
  bookId: string
  bookTitle: string
  chapterTitle: string
  cfi: string // EPUB Canonical Fragment Identifier - 用于定位文本位置
  selectedText: string
  noteContent: string
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple'
  createdAt: string
  updatedAt: string
}

export type Highlight = {
  id: string
  bookId: string
  cfi: string
  selectedText: string
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple'
  createdAt: string
}

export type Bookmark = {
  id: string
  bookId: string
  bookTitle: string
  chapterTitle: string
  cfi: string
  pageNumber: number
  createdAt: string
}

// Mock 笔记数据
export const mockNotes: Note[] = [
  {
    id: 'note-001',
    bookId: 'book-123',
    bookTitle: '人类简史',
    chapterTitle: '第一章：认知革命',
    cfi: 'epubcfi(/6/4[chap01]!/4/2/42,/1:0,/1:120)',
    selectedText: '大约在七万年前，智人开始发展出更复杂的语言和思维能力，这被称为认知革命。',
    noteContent: '认知革命是人类历史的重要转折点。语言的发展不仅让人类能够交流具体信息，更重要的是能够讨论虚构的事物，如神话、宗教、国家等概念。这种能力让智人能够进行大规模协作。',
    color: 'yellow',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:35:00Z',
  },
  {
    id: 'note-002',
    bookId: 'book-123',
    bookTitle: '人类简史',
    chapterTitle: '第二章：农业革命',
    cfi: 'epubcfi(/6/6[chap02]!/4/2/28,/1:0,/1:85)',
    selectedText: '农业革命并没有让人类过上更好的生活，反而增加了工作量和疾病。',
    noteContent: '这个观点很有意思！传统观念认为农业革命是进步，但作者指出：\n1. 采集者每天工作3-6小时，农民要工作12小时以上\n2. 农业社会营养更单一，疾病更多\n3. 人口增长反而降低了个体生活质量\n\n这让我重新思考"进步"的定义。',
    color: 'green',
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:25:00Z',
  },
  {
    id: 'note-003',
    bookId: 'book-123',
    bookTitle: '人类简史',
    chapterTitle: '第三章：人类的融合统一',
    cfi: 'epubcfi(/6/8[chap03]!/4/2/56,/1:0,/1:95)',
    selectedText: '金钱是人类最普遍也最有效的互信系统。',
    noteContent: '金钱作为虚构概念的力量：\n- 跨越文化和语言障碍\n- 可以转换成几乎任何东西\n- 基于集体想象和信任\n\n思考：比特币等加密货币是否也是这种集体想象的延续？',
    color: 'blue',
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:20:00Z',
  },
  {
    id: 'note-004',
    bookId: 'book-456',
    bookTitle: '三体',
    chapterTitle: '第一部：地球往事',
    cfi: 'epubcfi(/6/10[part01]!/4/2/102,/1:0,/1:68)',
    selectedText: '给岁月以文明，而不是给文明以岁月。',
    noteContent: '这句话太震撼了！\n\n传统思维：延长文明的时间（给文明以岁月）\n新思维：在有限时间内创造更多价值（给岁月以文明）\n\n联想到人生：不是追求活得更久，而是让每一天都有意义。',
    color: 'pink',
    createdAt: '2024-01-18T20:45:00Z',
    updatedAt: '2024-01-18T20:50:00Z',
  },
  {
    id: 'note-005',
    bookId: 'book-456',
    bookTitle: '三体',
    chapterTitle: '第二部：黑暗森林',
    cfi: 'epubcfi(/6/12[part02]!/4/2/78,/1:0,/1:112)',
    selectedText: '宇宙就是一座黑暗森林，每个文明都是带枪的猎人，像幽灵般潜行于林间。',
    noteContent: '黑暗森林法则的三个前提：\n1. 生存是文明的第一需要\n2. 文明不断增长和扩张，但宇宙中的物质总量保持不变\n3. 猜疑链和技术爆炸\n\n这个理论解释了费米悖论，但也很悲观。是否存在其他可能性？',
    color: 'purple',
    createdAt: '2024-01-19T22:10:00Z',
    updatedAt: '2024-01-19T22:18:00Z',
  },
  {
    id: 'note-006',
    bookId: 'book-789',
    bookTitle: '深度工作',
    chapterTitle: '第一章：深度工作是有价值的',
    cfi: 'epubcfi(/6/14[chap01]!/4/2/34,/1:0,/1:88)',
    selectedText: '在新经济形势下，有三种人将获得特别的优势：高级技术工人、超级明星和所有者。',
    noteContent: '要成为高级技术工人需要：\n1. 快速掌握复杂工具的能力\n2. 在工作质量和速度方面都达到精英层次的能力\n\n这两种能力都依赖于深度工作能力。\n\n行动计划：\n- 每天安排2-4小时深度工作时间\n- 减少社交媒体使用\n- 培养专注力',
    color: 'yellow',
    createdAt: '2024-01-20T08:30:00Z',
    updatedAt: '2024-01-20T08:40:00Z',
  },
]

// Mock 高亮数据
export const mockHighlights: Highlight[] = [
  {
    id: 'highlight-001',
    bookId: 'book-123',
    cfi: 'epubcfi(/6/4[chap01]!/4/2/18,/1:0,/1:45)',
    selectedText: '智人并不是第一种人类，在我们之前还有其他人种。',
    color: 'yellow',
    createdAt: '2024-01-15T10:15:00Z',
  },
  {
    id: 'highlight-002',
    bookId: 'book-123',
    cfi: 'epubcfi(/6/6[chap02]!/4/2/64,/1:0,/1:72)',
    selectedText: '小麦驯化了智人，而不是智人驯化了小麦。',
    color: 'green',
    createdAt: '2024-01-16T14:10:00Z',
  },
  {
    id: 'highlight-003',
    bookId: 'book-456',
    cfi: 'epubcfi(/6/10[part01]!/4/2/88,/1:0,/1:56)',
    selectedText: '弱小和无知不是生存的障碍，傲慢才是。',
    color: 'pink',
    createdAt: '2024-01-18T20:30:00Z',
  },
  {
    id: 'highlight-004',
    bookId: 'book-789',
    cfi: 'epubcfi(/6/14[chap01]!/4/2/92,/1:0,/1:68)',
    selectedText: '深度工作是在无干扰的状态下专注进行职业活动。',
    color: 'blue',
    createdAt: '2024-01-20T08:20:00Z',
  },
]

// Mock 书签数据
export const mockBookmarks: Bookmark[] = [
  {
    id: 'bookmark-001',
    bookId: 'book-123',
    bookTitle: '人类简史',
    chapterTitle: '第一章：认知革命',
    cfi: 'epubcfi(/6/4[chap01]!/4/2)',
    pageNumber: 23,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'bookmark-002',
    bookId: 'book-123',
    bookTitle: '人类简史',
    chapterTitle: '第五章：史上最大骗局',
    cfi: 'epubcfi(/6/12[chap05]!/4/2)',
    pageNumber: 87,
    createdAt: '2024-01-17T15:30:00Z',
  },
  {
    id: 'bookmark-003',
    bookId: 'book-456',
    bookTitle: '三体',
    chapterTitle: '第二部：黑暗森林',
    cfi: 'epubcfi(/6/12[part02]!/4/2)',
    pageNumber: 156,
    createdAt: '2024-01-19T21:45:00Z',
  },
  {
    id: 'bookmark-004',
    bookId: 'book-789',
    bookTitle: '深度工作',
    chapterTitle: '第三章：戒掉浮浅',
    cfi: 'epubcfi(/6/18[chap03]!/4/2)',
    pageNumber: 112,
    createdAt: '2024-01-20T16:20:00Z',
  },
]

// 辅助函数：按书籍分组笔记
export function groupNotesByBook(notes: Note[]): Map<string, Note[]> {
  const grouped = new Map<string, Note[]>()
  for (const note of notes) {
    const existing = grouped.get(note.bookId) || []
    existing.push(note)
    grouped.set(note.bookId, existing)
  }
  return grouped
}

// 辅助函数：搜索笔记
export function searchNotes(notes: Note[], query: string): Note[] {
  const lowerQuery = query.toLowerCase()
  return notes.filter(
    (note) =>
      note.noteContent.toLowerCase().includes(lowerQuery) ||
      note.selectedText.toLowerCase().includes(lowerQuery) ||
      note.chapterTitle.toLowerCase().includes(lowerQuery)
  )
}

// 辅助函数：按颜色筛选
export function filterNotesByColor(
  notes: Note[],
  color: Note['color']
): Note[] {
  return notes.filter((note) => note.color === color)
}

// 辅助函数：获取最近的笔记
export function getRecentNotes(notes: Note[], limit: number = 5): Note[] {
  return [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit)
}

// 辅助函数：导出笔记为 Markdown
export function exportNotesToMarkdown(notes: Note[]): string {
  let markdown = '# 我的阅读笔记\n\n'
  
  const grouped = groupNotesByBook(notes)
  
  for (const [bookId, bookNotes] of grouped) {
    const bookTitle = bookNotes[0]?.bookTitle || '未知书籍'
    markdown += `## ${bookTitle}\n\n`
    
    for (const note of bookNotes) {
      markdown += `### ${note.chapterTitle}\n\n`
      markdown += `> ${note.selectedText}\n\n`
      markdown += `${note.noteContent}\n\n`
      markdown += `*创建时间: ${new Date(note.createdAt).toLocaleString('zh-CN')}*\n\n`
      markdown += '---\n\n'
    }
  }
  
  return markdown
}

// 辅助函数：统计信息
export function getNoteStats(notes: Note[]) {
  const bookCount = new Set(notes.map((n) => n.bookId)).size
  const colorCounts = notes.reduce((acc, note) => {
    acc[note.color] = (acc[note.color] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    totalNotes: notes.length,
    bookCount,
    colorCounts,
    averageNoteLength: Math.round(
      notes.reduce((sum, n) => sum + n.noteContent.length, 0) / notes.length
    ),
  }
}
