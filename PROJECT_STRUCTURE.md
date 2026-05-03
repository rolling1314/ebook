# 项目结构

```
/Users/apple/ebook/
├── backend/                      # 后端服务
│   ├── main.py                  # FastAPI 主应用（API 路由）
│   ├── models.py                # SQLAlchemy 数据库模型
│   ├── database.py              # 数据库连接配置
│   ├── schemas.py               # Pydantic 数据验证模型
│   ├── auth.py                  # JWT 认证和密码加密
│   ├── config.py                # 配置文件加载
│   ├── config.yaml              # 配置文件（数据库、JWT等）
│   ├── init_db.py               # 数据库初始化脚本
│   ├── requirements.txt         # Python 依赖
│   └── data/                    # 数据目录
│       └── books/               # 上传的 EPUB 文件
│
├── frontend/                     # 前端应用
│   ├── src/
│   │   ├── main.tsx            # React 入口
│   │   ├── App.tsx             # 主应用组件（路由控制）
│   │   ├── App.css             # 主应用样式
│   │   ├── Auth.tsx            # 登录/注册组件
│   │   ├── Auth.css            # 认证页面样式
│   │   ├── Library.tsx         # 书库管理组件
│   │   ├── Library.css         # 书库样式
│   │   ├── KindleStyleReaderWithSidebar.tsx  # 阅读器组件
│   │   ├── EpubReaderWithNotes.css          # 阅读器样式
│   │   └── api.ts              # API 客户端
│   ├── .env.development        # 开发环境配置
│   ├── package.json            # 前端依赖
│   ├── vite.config.ts          # Vite 配置
│   └── index.html              # HTML 模板
│
├── setup.sh                     # 一键安装脚本
├── start-backend.sh            # 后端启动脚本
├── start-frontend.sh           # 前端启动脚本
├── README.md                   # 项目说明文档
└── QUICKSTART.md               # 快速启动指南
```

## 核心文件说明

### 后端核心文件

#### `main.py`
- FastAPI 应用主文件
- 定义所有 API 端点
- 包含用户认证、书籍管理、笔记和高亮的 CRUD 操作

#### `models.py`
- SQLAlchemy ORM 模型
- 定义 4 个表：users, books, notes, highlights
- 设置表关系和级联删除

#### `database.py`
- 数据库连接管理
- 创建 SQLAlchemy 引擎和会话
- 提供 `get_db()` 依赖注入函数

#### `auth.py`
- JWT token 生成和验证
- 密码加密（bcrypt）
- 用户认证中间件

#### `schemas.py`
- Pydantic 模型用于 API 请求/响应验证
- 数据序列化和反序列化

#### `config.yaml`
- 数据库配置（host, port, database, user, password）
- JWT 配置（secret_key, algorithm, expire_time）
- 应用配置（upload_max_mb, allowed_origins）

### 前端核心文件

#### `App.tsx`
- 主应用组件
- 管理三个视图：认证、书库、阅读器
- 处理路由和状态管理

#### `Auth.tsx`
- 用户登录和注册界面
- 表单验证
- JWT token 存储

#### `Library.tsx`
- 书库管理界面
- 书籍上传（拖拽支持）
- 书籍列表展示
- 书籍删除

#### `KindleStyleReaderWithSidebar.tsx`
- EPUB 阅读器（使用 epub.js）
- 侧边栏目录
- 文本选择和笔记创建
- 高亮渲染
- 笔记内嵌显示（Kindle 风格）

#### `api.ts`
- API 客户端封装
- 自动添加 JWT token
- 处理认证失败
- 提供所有 API 调用函数

## 数据流

### 用户注册/登录流程
```
前端 Auth.tsx
  ↓ POST /api/auth/register 或 /api/auth/login
后端 main.py
  ↓ 验证数据 (schemas.py)
  ↓ 加密密码 (auth.py)
  ↓ 保存到数据库 (models.py, database.py)
  ↓ 生成 JWT token (auth.py)
  ↓ 返回 token 和用户信息
前端 api.ts
  ↓ 存储 token 到 localStorage
  ↓ 跳转到书库页面
```

### 上传书籍流程
```
前端 Library.tsx
  ↓ 选择 EPUB 文件
  ↓ POST /api/books (带 JWT token)
后端 main.py
  ↓ 验证用户身份 (auth.py)
  ↓ 验证文件格式和大小
  ↓ 保存文件到 data/books/
  ↓ 创建数据库记录 (models.Book)
  ↓ 返回 book_id 和 epub_url
前端 Library.tsx
  ↓ 刷新书籍列表
```

### 创建笔记流程
```
前端 KindleStyleReaderWithSidebar.tsx
  ↓ 用户选中文字
  ↓ 显示笔记对话框
  ↓ 用户输入笔记内容
  ↓ POST /api/books/{book_id}/notes (带 JWT token)
后端 main.py
  ↓ 验证用户身份和书籍所有权
  ↓ 创建笔记记录 (models.Note)
  ↓ 返回笔记数据
前端 KindleStyleReaderWithSidebar.tsx
  ↓ 重新加载笔记
  ↓ 渲染高亮和笔记卡片
```

## 安全机制

1. **密码加密**：使用 bcrypt 加密存储
2. **JWT 认证**：所有 API（除注册/登录）需要 token
3. **数据隔离**：用户只能访问自己的数据
4. **文件验证**：检查文件格式和大小
5. **SQL 注入防护**：使用 SQLAlchemy ORM
6. **CORS 配置**：限制允许的来源

## 扩展建议

### 功能扩展
- [ ] 笔记编辑和删除功能
- [ ] 书签功能
- [ ] 阅读进度保存
- [ ] 笔记导出（Markdown, PDF）
- [ ] 书籍分类和标签
- [ ] 全文搜索
- [ ] 社交分享

### 技术优化
- [ ] Redis 缓存
- [ ] 文件存储迁移到 S3
- [ ] 图片压缩和 CDN
- [ ] WebSocket 实时同步
- [ ] 服务端渲染（SSR）
- [ ] Docker 容器化
- [ ] CI/CD 自动部署

### 性能优化
- [ ] 数据库索引优化
- [ ] API 响应缓存
- [ ] 前端代码分割
- [ ] 图片懒加载
- [ ] 虚拟滚动
