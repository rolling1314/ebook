# 快速启动指南

## 一键安装

运行安装脚本：

```bash
cd /Users/apple/ebook
./setup.sh
```

这个脚本会自动：
1. 检查 PostgreSQL 是否安装和运行
2. 安装后端 Python 依赖
3. 初始化数据库表
4. 安装前端依赖

## 手动安装步骤

如果自动安装脚本失败，可以手动执行以下步骤：

### 1. 确保 PostgreSQL 数据库已创建

```bash
# 登录 PostgreSQL
psql -U postgres

# 在 psql 中执行：
CREATE DATABASE ebook;
CREATE USER crush WITH PASSWORD '123456';
GRANT ALL PRIVILEGES ON DATABASE ebook TO crush;
\q
```

### 2. 安装后端依赖

```bash
cd /Users/apple/ebook/backend
pip3 install -r requirements.txt
```

### 3. 初始化数据库

```bash
cd /Users/apple/ebook/backend
python3 init_db.py
```

应该看到：
```
Creating database tables...
Database tables created successfully!
```

### 4. 安装前端依赖

```bash
cd /Users/apple/ebook/frontend
pnpm install
# 或者
npm install
```

## 启动服务

### 方式一：使用启动脚本

**终端 1 - 启动后端：**
```bash
cd /Users/apple/ebook
./start-backend.sh
```

**终端 2 - 启动前端：**
```bash
cd /Users/apple/ebook
./start-frontend.sh
```

### 方式二：手动启动

**终端 1 - 启动后端：**
```bash
cd /Users/apple/ebook/backend
uvicorn main:app --reload --port 8000
```

**终端 2 - 启动前端：**
```bash
cd /Users/apple/ebook/frontend
pnpm dev
# 或者
npm run dev
```

## 访问应用

打开浏览器访问：**http://localhost:5173**

## 使用流程

1. **注册账户**
   - 输入用户名（至少3个字符）
   - 输入邮箱
   - 输入密码（至少6个字符）

2. **上传书籍**
   - 登录后会看到书库页面
   - 点击或拖拽上传 EPUB 文件

3. **开始阅读**
   - 点击书籍卡片上的"开始阅读"按钮
   - 使用左右方向键翻页

4. **创建笔记**
   - 选中文字会弹出笔记对话框
   - 选择颜色
   - 可以只创建高亮，或添加笔记内容
   - 笔记会显示在高亮文字下方

## 故障排除

### 后端启动失败

**错误：ModuleNotFoundError**
```bash
# 重新安装依赖
cd /Users/apple/ebook/backend
pip3 install -r requirements.txt
```

**错误：数据库连接失败**
```bash
# 检查 PostgreSQL 是否运行
brew services list | grep postgresql
# 或
ps aux | grep postgres

# 启动 PostgreSQL
brew services start postgresql
```

**错误：表不存在**
```bash
# 重新初始化数据库
cd /Users/apple/ebook/backend
python3 init_db.py
```

### 前端启动失败

**错误：端口被占用**
```bash
# 查找占用端口的进程
lsof -i :5173
# 杀死进程
kill -9 <PID>
```

**错误：依赖安装失败**
```bash
# 清除缓存重新安装
cd /Users/apple/ebook/frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 无法登录

1. 检查后端是否运行在 http://localhost:8000
2. 打开浏览器开发者工具查看网络请求
3. 检查数据库中是否有用户数据：
   ```bash
   psql -U crush -d ebook
   SELECT * FROM users;
   ```

### 笔记无法保存

1. 检查浏览器控制台是否有错误
2. 确认已登录
3. 检查后端日志
4. 验证数据库连接：
   ```bash
   psql -U crush -d ebook
   SELECT * FROM notes;
   ```

## 数据库管理

### 查看所有表
```bash
psql -U crush -d ebook
\dt
```

### 查看用户
```sql
SELECT id, username, email, created_at FROM users;
```

### 查看书籍
```sql
SELECT id, filename, created_at FROM books;
```

### 查看笔记
```sql
SELECT id, book_title, note_content, color, created_at FROM notes;
```

### 清空数据（谨慎使用）
```sql
TRUNCATE TABLE highlights, notes, books, users CASCADE;
```

## 配置修改

### 修改数据库配置
编辑 `/Users/apple/ebook/backend/config.yaml`

### 修改 JWT 密钥（生产环境必须）
编辑 `/Users/apple/ebook/backend/config.yaml` 中的 `jwt.secret_key`

### 修改上传文件大小限制
编辑 `/Users/apple/ebook/backend/config.yaml` 中的 `app.upload_max_mb`

### 修改前端 API 地址
编辑 `/Users/apple/ebook/frontend/.env.development`

## 技术支持

如果遇到问题：
1. 查看后端日志（终端输出）
2. 查看浏览器控制台（F12）
3. 检查数据库连接
4. 确认所有依赖已正确安装
