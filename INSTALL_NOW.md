# 安装和启动指南

## 系统已完成的工作

✅ 所有代码文件已创建
✅ 数据库配置文件已创建
✅ 前端正在运行（http://localhost:5174）
✅ 修复了 epub 文件认证问题（支持 query parameter token）

## 需要手动完成的步骤

### 1. 安装后端 Python 依赖

打开新终端，运行：

```bash
cd /Users/apple/ebook/backend
pip3 install -r requirements.txt
```

或者单独安装：

```bash
pip3 install fastapi uvicorn python-multipart sqlalchemy psycopg2-binary pyyaml passlib bcrypt "python-jose[cryptography]" "pydantic[email]"
```

### 2. 初始化数据库

确保 PostgreSQL 正在运行，然后：

```bash
cd /Users/apple/ebook/backend
python3 init_db.py
```

应该看到：
```
Creating database tables...
Database tables created successfully!
```

### 3. 启动后端服务

```bash
cd /Users/apple/ebook/backend
uvicorn main:app --reload --port 8000
```

### 4. 访问应用

前端已经在运行，打开浏览器访问：
**http://localhost:5174**

## 如果数据库还没创建

```bash
# 登录 PostgreSQL
psql -U postgres

# 创建数据库和用户
CREATE DATABASE ebook;
CREATE USER crush WITH PASSWORD '123456';
GRANT ALL PRIVILEGES ON DATABASE ebook TO crush;
\q
```

## 验证系统

1. **检查后端**：访问 http://localhost:8000/docs 查看 API 文档
2. **检查前端**：访问 http://localhost:5174
3. **注册账户**：在前端注册一个新用户
4. **上传书籍**：上传一个 EPUB 文件
5. **开始阅读**：点击"开始阅读"
6. **创建笔记**：选中文字，添加笔记

## 故障排除

### 后端启动失败

**错误：ModuleNotFoundError**
```bash
# 重新安装依赖
pip3 install -r requirements.txt
```

**错误：数据库连接失败**
```bash
# 检查 PostgreSQL 是否运行
ps aux | grep postgres

# 如果使用 Homebrew 安装的 PostgreSQL
brew services start postgresql
```

### 前端已经在运行

前端已经在 5174 端口运行（因为 5173 被占用）。如果需要重启：

```bash
# 停止当前运行（Ctrl+C）
# 然后重新启动
cd /Users/apple/ebook/frontend
pnpm dev
```

## 重要修改说明

### EPUB 文件认证

由于 epub.js 无法在请求中发送 Bearer token，我已经修改了后端 API，支持通过 query parameter 传递 token：

```
GET /api/books/{book_id}/file.epub?token={jwt_token}
```

前端代码已经自动处理这个问题。

## 下一步

1. 在新终端安装后端依赖
2. 初始化数据库
3. 启动后端服务
4. 访问 http://localhost:5174 开始使用

所有代码都已经准备好，只需要安装依赖和启动服务即可！
