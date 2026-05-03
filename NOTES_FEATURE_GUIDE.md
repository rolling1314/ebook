# 📝 Kindle 风格笔记功能使用指南

## ✅ 功能已完成

### 后端 API（运行在 8001 端口）
- ✅ 创建笔记
- ✅ 获取笔记列表
- ✅ 更新笔记
- ✅ 删除笔记
- ✅ 创建高亮
- ✅ 获取高亮列表
- ✅ 数据持久化到 JSON 文件

### 前端功能
- ✅ 选中文字弹出笔记对话框
- ✅ 5 种颜色选择（黄、绿、蓝、粉、紫）
- ✅ 仅高亮功能
- ✅ 添加笔记功能
- ✅ 自动加载笔记
- ✅ Kindle 风格渲染（笔记显示在高亮文字下方）

## 🚀 使用方法

### 1. 启动服务

**后端（已启动）：**
```bash
cd /Users/apple/ebook/backend
python -m uvicorn main:app --reload --port 8001
```

**前端（已启动）：**
```bash
cd /Users/apple/ebook/frontend
pnpm run dev
# 访问 http://localhost:5175/
```

### 2. 添加笔记

1. **打开书籍** - 上传或选择已有的 EPUB 文件
2. **选中文字** - 用鼠标选中书中的任意文字
3. **弹出对话框** - 会自动弹出笔记对话框
4. **选择颜色** - 点击颜色按钮选择高亮颜色
5. **两种选择**：
   - **仅高亮** - 点击"仅高亮"按钮，只标记文字
   - **添加笔记** - 输入笔记内容后点击"保存笔记"

### 3. 查看笔记

- **内嵌显示** - 笔记会直接显示在高亮文字下方（Kindle 风格）
- **笔记面板** - 点击右上角"📝 查看笔记"按钮查看所有笔记
- **自动加载** - 下次打开同一本书，笔记会自动加载

## 📂 数据存储

笔记数据存储在：
```
/Users/apple/ebook/backend/data/notes/{book_id}.json
```

示例数据结构：
```json
{
  "notes": [
    {
      "id": "fe5d6022-785c-492a-97df-d57e854fe429",
      "book_id": "96bb69c2-84e7-4f85-bee2-22ab838a9d4a",
      "book_title": "反脆弱",
      "chapter_title": "第一章",
      "cfi": "epubcfi(/6/22!/4/4)",
      "selected_text": "测试文字",
      "note_content": "这是我的笔记",
      "color": "yellow",
      "created_at": "2026-05-03T10:38:41.584521Z",
      "updated_at": "2026-05-03T10:38:41.584521Z"
    }
  ]
}
```

## 🎨 颜色说明

| 颜色 | 用途建议 |
|------|---------|
| 🟡 黄色 | 重要内容 |
| 🟢 绿色 | 好的想法 |
| 🔵 蓝色 | 需要深入思考 |
| 🩷 粉色 | 有趣的观点 |
| 🟣 紫色 | 需要记住的内容 |

## 🔧 API 端点

### 笔记相关
- `GET /api/books/{book_id}/notes` - 获取笔记列表
- `POST /api/books/{book_id}/notes` - 创建笔记
- `PUT /api/books/{book_id}/notes/{note_id}` - 更新笔记
- `DELETE /api/books/{book_id}/notes/{note_id}` - 删除笔记

### 高亮相关
- `GET /api/books/{book_id}/highlights` - 获取高亮列表
- `POST /api/books/{book_id}/highlights` - 创建高亮
- `DELETE /api/books/{book_id}/highlights/{highlight_id}` - 删除高亮

## 🧪 测试

### 测试 API
```bash
# 获取笔记
curl http://localhost:8001/api/books/{book_id}/notes

# 创建笔记
curl -X POST http://localhost:8001/api/books/{book_id}/notes \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": "{book_id}",
    "book_title": "书名",
    "chapter_title": "章节",
    "cfi": "epubcfi(...)",
    "selected_text": "选中的文字",
    "note_content": "笔记内容",
    "color": "yellow"
  }'
```

### 当前测试数据
书籍 ID: `96bb69c2-84e7-4f85-bee2-22ab838a9d4a`（反脆弱）
- 已有 2 条测试笔记
- 1 条黄色笔记
- 1 条蓝色笔记

## 🎯 技术实现

### Kindle 风格笔记渲染

笔记通过以下方式实现 Kindle 风格：

1. **注入 CSS** - 在 EPUB 的 iframe 内部注入样式
2. **DOM 插入** - 根据 CFI 定位，在段落后插入笔记 div
3. **高亮渲染** - 使用 epubjs 的 annotations API 渲染高亮
4. **自动清理** - 翻页时清除旧笔记，重新注入当前页笔记

### 关键代码位置

- **前端阅读器**: `/Users/apple/ebook/frontend/src/KindleStyleReaderWithSidebar.tsx`
- **后端 API**: `/Users/apple/ebook/backend/main.py`
- **笔记数据**: `/Users/apple/ebook/backend/data/notes/`

## 📝 下一步可以做的

- [ ] 添加笔记编辑功能
- [ ] 添加笔记删除功能
- [ ] 添加笔记搜索功能
- [ ] 添加笔记导出功能（Markdown/PDF）
- [ ] 添加笔记同步功能
- [ ] 添加笔记分享功能

## 🐛 故障排除

### 笔记无法保存
- 检查后端是否运行在 8001 端口
- 检查 Vite 代理配置是否指向 8001
- 查看浏览器控制台错误信息

### 笔记不显示
- 确认笔记已成功保存（检查 JSON 文件）
- 刷新页面重新加载
- 检查 CFI 是否正确

### 后端端口问题
- 8000 端口运行的是旧代码（没有笔记 API）
- 8001 端口运行的是新代码（有笔记 API）
- 前端已配置连接到 8001 端口

## ✨ 享受阅读和笔记吧！

现在你可以像使用 Kindle 一样，在阅读时随时添加笔记和高亮了！
