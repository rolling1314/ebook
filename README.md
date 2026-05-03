# 电子书阅读器系统

一个功能完整的电子书阅读器，支持用户认证、书籍管理、笔记和高亮功能，所有数据存储在 PostgreSQL 数据库中。

## 功能特性

- ✅ 用户注册和登录
- ✅ 书籍上传和管理
- ✅ EPUB 阅读器（Kindle 风格）
- ✅ 笔记和高亮功能
- ✅ 所有数据存储在 PostgreSQL 数据库
- ✅ JWT 认证
- ✅ 响应式设计

## 技术栈

### 后端
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT 认证
- Bcrypt 密码加密

### 前端
- React + TypeScript
- Vite
- epub.js
- CSS3

## 安装和配置

### 1. 数据库设置

确保 PostgreSQL 已安装并运行，然后创建数据库：

```bash
# 登录 PostgreSQL
psql -U postgres

# 创建数据库和用户（如果还没有）
CREATE DATABASE ebook;
CREATE USER crush WITH PASSWORD '123456';
GRANT ALL PRIVILEGES ON DATABASE ebook TO crush;
```

### 2. 后端设置

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置文件已经创建在 config.yaml
# 数据库配置：
#   host: localhost
#   port: 5432
#   database: ebook
#   user: crush
#   password: 123456

# 初始化数据库表
python init_db.py

# 启动后端服务
uvicorn main:app --reload --port 8000
```

### 3. 前端设置

```bash
cd frontend

# 安装依赖
pnpm install
# 或者
npm install

# 启动开发服务器
pnpm dev
# 或者
npm run dev
```

前端将在 http://localhost:5173 运行

## 使用说明

### 1. 注册/登录

- 首次使用需要注册账户
- 用户名至少 3 个字符
- 密码至少 6 个字符
- 需要提供有效的邮箱地址

### 2. 上传书籍

- 登录后进入书库页面
- 点击或拖拽上传 EPUB 格式的电子书
- 支持最大 50MB 的文件

### 3. 阅读和笔记

- 点击"开始阅读"打开书籍
- 选中文字可以创建高亮或笔记
- 支持 5 种颜色标记
- 笔记会显示在高亮文字下方（Kindle 风格）
- 使用左右方向键翻页

### 4. 笔记管理

- 所有笔记和高亮自动保存到数据库
- 每本书的笔记独立存储
- 支持多用户，数据隔离

## 数据库结构

### users 表
- id: 用户ID
- username: 用户名（唯一）
- email: 邮箱（唯一）
- hashed_password: 加密密码
- created_at: 创建时间
- updated_at: 更新时间

### books 表
- id: 书籍ID
- user_id: 所属用户
- filename: 文件名
- title: 书名
- author: 作者
- size_bytes: 文件大小
- created_at: 上传时间

### notes 表
- id: 笔记ID
- user_id: 所属用户
- book_id: 所属书籍
- book_title: 书名
- chapter_title: 章节标题
- cfi: EPUB CFI 位置
- selected_text: 选中的文字
- note_content: 笔记内容
- color: 颜色标记
- created_at: 创建时间
- updated_at: 更新时间

### highlights 表
- id: 高亮ID
- user_id: 所属用户
- book_id: 所属书籍
- cfi: EPUB CFI 位置
- selected_text: 选中的文字
- color: 颜色标记
- created_at: 创建时间

## API 端点

### 认证
- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录
- GET `/api/auth/me` - 获取当前用户信息

### 书籍
- POST `/api/books` - 上传书籍
- GET `/api/books` - 获取用户的所有书籍
- GET `/api/books/{book_id}/file.epub` - 获取书籍文件
- DELETE `/api/books/{book_id}` - 删除书籍

### 笔记
- GET `/api/books/{book_id}/notes` - 获取书籍的所有笔记
- POST `/api/books/{book_id}/notes` - 创建笔记
- PUT `/api/books/{book_id}/notes/{note_id}` - 更新笔记
- DELETE `/api/books/{book_id}/notes/{note_id}` - 删除笔记

### 高亮
- GET `/api/books/{book_id}/highlights` - 获取书籍的所有高亮
- POST `/api/books/{book_id}/highlights` - 创建高亮
- DELETE `/api/books/{book_id}/highlights/{highlight_id}` - 删除高亮

## 安全性

- 密码使用 bcrypt 加密存储
- JWT token 用于身份验证
- 所有 API 端点都需要认证（除了注册和登录）
- 用户只能访问自己的数据
- 文件上传有大小限制和格式验证

## 配置文件

`backend/config.yaml` 包含所有配置：

```yaml
database:
  host: localhost
  port: 5432
  database: ebook
  user: crush
  password: "123456"

jwt:
  secret_key: "your-secret-key-change-this-in-production"
  algorithm: HS256
  access_token_expire_minutes: 10080  # 7 days

app:
  upload_max_mb: 50
  allowed_origins:
    - "http://localhost:5173"
```

**重要**: 在生产环境中，请修改 `jwt.secret_key` 为一个强随机字符串！

## 故障排除

### 数据库连接失败
- 检查 PostgreSQL 是否运行
- 验证 config.yaml 中的数据库配置
- 确保数据库用户有正确的权限

### 前端无法连接后端
- 确保后端在 http://localhost:8000 运行
- 检查 CORS 配置
- 查看浏览器控制台的错误信息

### 文件上传失败
- 检查文件是否为 EPUB 格式
- 确认文件大小不超过 50MB
- 查看后端日志

## 开发

### 后端开发
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 前端开发
```bash
cd frontend
pnpm dev
```

### 数据库迁移
如果修改了模型，重新运行：
```bash
python init_db.py
```

## 许可证

MIT
# ebook
