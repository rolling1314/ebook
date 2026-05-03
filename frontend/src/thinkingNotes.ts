/**
 * 基于《思考，快与慢》的 Mock 笔记数据
 */

export type Note = {
  id: string
  bookId: string
  bookTitle: string
  chapterTitle: string
  cfi: string
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

// 《思考，快与慢》的笔记
export const thinkingNotes: Note[] = [
  {
    id: 'note-001',
    bookId: 'thinking-fast-slow',
    bookTitle: '思考，快与慢',
    chapterTitle: '第1章 一张愤怒的脸和一道乘法题',
    cfi: 'epubcfi(/6/4[chap01]!/4/2/12,/1:0,/1:85)',
    selectedText: '思要观察你在什动脑筋下的大脑活动，请看图1。',
    noteContent: '这是系统1和系统2的核心概念引入。\n\n系统1：快速、自动、无意识\n系统2：慢速、需要努力、有意识\n\n这个双系统理论是全书的基础框架，后面所有内容都围绕这个展开。',
    color: 'yellow',
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:35:00Z',
  },
  {
    id: 'note-002',
    bookId: 'thinking-fast-slow',
    bookTitle: '思考，快与慢',
    chapterTitle: '第1章 一张愤怒的脸和一道乘法题',
    cfi: 'epubcfi(/6/4[chap01]!/4/2/28,/1:0,/1:120)',
    selectedText: '你能立刻知道这是一道乘法题，也许你还会想到有答案，就能够出答案。你还会知道你没有做出有个概略的直觉认识，能很快知道12 609和123不可能是答案。',
    noteContent: '这段话完美展示了系统1的特点：\n1. 瞬间识别（知道是乘法题）\n2. 自动反应（排除明显错误答案）\n3. 不需要努力\n\n但要真正计算出17×24，就需要系统2介入，需要集中注意力和工作记忆。',
    color: 'green',
    createdAt: '2024-01-20T11:15:00Z',
    updatedAt: '2024-01-20T11:20:00Z',
  },
  {
    id: 'note-003',
    bookId: 'thinking-fast-slow',
    bookTitle: '思考，快与慢',
    chapterTitle: '第1章 一张愤怒的脸和一道乘法题',
    cfi: 'epubcfi(/6/4[chap01]!/4/2/45,/1:0,/1:95)',
    selectedText: '你还知道这是一道乘法题，也许你还会想到有答案，就能够出答案。你还会知道你没有做出有个概略的直觉认识。',
    noteContent: '系统1的局限性：\n- 只能给出"大概"的判断\n- 无法进行复杂计算\n- 容易被直觉误导\n\n联想到日常决策：很多时候我们依赖系统1做重要决定，但系统1可能给出错误答案。比如投资决策、职业选择等，都需要启动系统2进行深度思考。',
    color: 'blue',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:35:00Z',
  },
  {
    id: 'note-004',
    bookId: 'thinking-fast-slow',
    bookTitle: '思考，快与慢',
    chapterTitle: '第1章 一张愤怒的脸和一道乘法题',
    cfi: 'epubcfi(/6/4[chap01]!/4/2/58,/1:0,/1:110)',
    selectedText: '的。你还知道这是在动脑筋，此外，你还可以根据自己的观察对我行为进行预测。你能够看出这位女性正要说一些刻薄话，也许她还又又刻薄。',
    noteContent: '这里讲的是系统1的社交认知能力：\n\n1. 快速识别情绪（愤怒的脸）\n2. 预测他人行为\n3. 理解社交情境\n\n这些能力是进化的产物，帮助我们快速应对社交场景。但也可能导致刻板印象和偏见。',
    color: 'pink',
    createdAt: '2024-01-20T16:45:00Z',
    updatedAt: '2024-01-20T16:50:00Z',
  },
  {
    id: 'note-005',
    bookId: 'thinking-fast-slow',
    bookTitle: '思考，快与慢',
    chapterTitle: '第2章 电影的主角与配角',
    cfi: 'epubcfi(/6/6[chap02]!/4/2/22,/1:0,/1:88)',
    selectedText: '系统1运行是无意识且快速的，不怎么费脑力，没有感觉，完全处于自主控制状态。',
    noteContent: '系统1的5个关键特征：\n1. 无意识\n2. 快速\n3. 不费力\n4. 自动\n5. 难以控制\n\n这解释了为什么改变习惯这么难——习惯是系统1的自动程序，要改变它需要系统2持续监控和干预。',
    color: 'yellow',
    createdAt: '2024-01-21T09:20:00Z',
    updatedAt: '2024-01-21T09:25:00Z',
  },
  {
    id: 'note-006',
    bookId: 'thinking-fast-slow',
    bookTitle: '思考，快与慢',
    chapterTitle: '第2章 电影的主角与配角',
    cfi: 'epubcfi(/6/6[chap02]!/4/2/35,/1:0,/1:95)',
    selectedText: '系统2将注意力转移到需要费脑力的大脑活动上来，例如复杂的运算。系统2的运行通常与行为、选择和专注等主观体验相关联。',
    noteContent: '系统2的特点：\n- 需要注意力\n- 消耗认知资源\n- 有主观体验\n- 可以控制\n\n重要启示：\n系统2的资源是有限的！当我们疲劳、压力大或分心时，系统2的监控能力下降，更容易被系统1的直觉误导。\n\n这就是为什么重要决策最好在精力充沛时做。',
    color: 'purple',
    createdAt: '2024-01-21T10:40:00Z',
    updatedAt: '2024-01-21T10:45:00Z',
  },
  {
    id: 'note-007',
    bookId: 'thinking-fast-slow',
    bookTitle: '思考，快与慢',
    chapterTitle: '第3章 惰性思维与延迟满足的矛盾',
    cfi: 'epubcfi(/6/8[chap03]!/4/2/18,/1:0,/1:75)',
    selectedText: '大脑的一条基本原则是：能不费力就不费力，这就是"认知放松"。',
    noteContent: '认知吝啬鬼（Cognitive Miser）理论：\n\n大脑倾向于使用最少的认知资源来完成任务。这是进化的结果——节省能量。\n\n但在现代社会，这可能导致：\n- 过度依赖直觉\n- 避免深度思考\n- 接受第一个"看起来对"的答案\n\n解决方法：培养"慢思考"的习惯，在重要问题上强迫自己启动系统2。',
    color: 'green',
    createdAt: '2024-01-21T14:15:00Z',
    updatedAt: '2024-01-21T14:20:00Z',
  },
  {
    id: 'note-008',
    bookId: 'thinking-fast-slow',
    bookTitle: '思考，快与慢',
    chapterTitle: '第5章 你的直觉有可能只是错觉',
    cfi: 'epubcfi(/6/12[chap05]!/4/2/28,/1:0,/1:92)',
    selectedText: '系统1的一个重要特点是：它会自动且快速地构建一个连贯的故事，即使信息不完整或有矛盾。',
    noteContent: 'WYSIATI原则：What You See Is All There Is（眼见即为全部）\n\n系统1的问题：\n1. 忽略缺失的信息\n2. 过度自信\n3. 构建虚假的因果关系\n\n实例：\n- 看到一个人的照片就判断性格\n- 根据有限信息做出投资决策\n- 相信阴谋论（因为它提供了"完整"的解释）\n\n对策：主动寻找反证，问"我不知道什么？"',
    color: 'blue',
    createdAt: '2024-01-22T11:30:00Z',
    updatedAt: '2024-01-22T11:35:00Z',
  },
]

// 高亮（无笔记）
export const thinkingHighlights: Highlight[] = [
  {
    id: 'highlight-001',
    bookId: 'thinking-fast-slow',
    cfi: 'epubcfi(/6/4[chap01]!/4/2/8,/1:0,/1:45)',
    selectedText: '第1章 一张愤怒的脸和一道乘法题',
    color: 'yellow',
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'highlight-002',
    bookId: 'thinking-fast-slow',
    cfi: 'epubcfi(/6/4[chap01]!/4/2/65,/1:0,/1:68)',
    selectedText: '系统1的运行是无意识且快速的，不怎么费脑力，完全处于自主控制状态。',
    color: 'green',
    createdAt: '2024-01-20T11:00:00Z',
  },
  {
    id: 'highlight-003',
    bookId: 'thinking-fast-slow',
    cfi: 'epubcfi(/6/6[chap02]!/4/2/42,/1:0,/1:55)',
    selectedText: '系统2的运行通常与行为、选择和专注等主观体验相关联。',
    color: 'blue',
    createdAt: '2024-01-21T10:00:00Z',
  },
]

// 工具函数保持不变
export function groupNotesByBook(notes: Note[]): Map<string, Note[]> {
  const grouped = new Map<string, Note[]>()
  for (const note of notes) {
    const existing = grouped.get(note.bookId) || []
    existing.push(note)
    grouped.set(note.bookId, existing)
  }
  return grouped
}

export function searchNotes(notes: Note[], query: string): Note[] {
  const lowerQuery = query.toLowerCase()
  return notes.filter(
    (note) =>
      note.noteContent.toLowerCase().includes(lowerQuery) ||
      note.selectedText.toLowerCase().includes(lowerQuery) ||
      note.chapterTitle.toLowerCase().includes(lowerQuery)
  )
}

export function filterNotesByColor(notes: Note[], color: Note['color']): Note[] {
  return notes.filter((note) => note.color === color)
}

export function getRecentNotes(notes: Note[], limit: number = 5): Note[] {
  return [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit)
}

export function exportNotesToMarkdown(notes: Note[]): string {
  let markdown = '# 《思考，快与慢》读书笔记\n\n'
  
  const grouped = groupNotesByBook(notes)
  
  for (const [bookId, bookNotes] of grouped) {
    const bookTitle = bookNotes[0]?.bookTitle || '未知书籍'
    markdown += `## ${bookTitle}\n\n`
    
    // 按章节分组
    const byChapter = new Map<string, Note[]>()
    bookNotes.forEach(note => {
      const chapter = note.chapterTitle
      const existing = byChapter.get(chapter) || []
      existing.push(note)
      byChapter.set(chapter, existing)
    })
    
    for (const [chapter, chapterNotes] of byChapter) {
      markdown += `### ${chapter}\n\n`
      
      for (const note of chapterNotes) {
        markdown += `> ${note.selectedText}\n\n`
        markdown += `${note.noteContent}\n\n`
        markdown += `*标记颜色: ${note.color} | 创建时间: ${new Date(note.createdAt).toLocaleString('zh-CN')}*\n\n`
        markdown += '---\n\n'
      }
    }
  }
  
  return markdown
}

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

// 导出默认数据
export const mockNotes = thinkingNotes
export const mockHighlights = thinkingHighlights
