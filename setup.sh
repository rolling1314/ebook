#!/bin/bash

echo "======================================"
echo "电子书阅读器系统 - 安装脚本"
echo "======================================"
echo ""

# 检查 PostgreSQL
echo "1. 检查 PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL 未安装，请先安装 PostgreSQL"
    exit 1
fi
echo "✅ PostgreSQL 已安装"
echo ""

# 检查数据库连接
echo "2. 检查数据库连接..."
if psql -U crush -d ebook -c "SELECT 1;" &> /dev/null; then
    echo "✅ 数据库连接成功"
else
    echo "⚠️  无法连接到数据库，请确保："
    echo "   - PostgreSQL 正在运行"
    echo "   - 数据库 'ebook' 已创建"
    echo "   - 用户 'crush' 存在且密码为 '123456'"
    echo ""
    echo "创建数据库的命令："
    echo "  psql -U postgres"
    echo "  CREATE DATABASE ebook;"
    echo "  CREATE USER crush WITH PASSWORD '123456';"
    echo "  GRANT ALL PRIVILEGES ON DATABASE ebook TO crush;"
fi
echo ""

# 安装后端依赖
echo "3. 安装后端依赖..."
cd backend
if pip3 install -r requirements.txt; then
    echo "✅ 后端依赖安装成功"
else
    echo "❌ 后端依赖安装失败"
    exit 1
fi
echo ""

# 初始化数据库
echo "4. 初始化数据库表..."
if python3 init_db.py; then
    echo "✅ 数据库表创建成功"
else
    echo "❌ 数据库表创建失败"
    exit 1
fi
echo ""

# 安装前端依赖
echo "5. 安装前端依赖..."
cd ../frontend
if command -v pnpm &> /dev/null; then
    echo "使用 pnpm 安装..."
    pnpm install
elif command -v npm &> /dev/null; then
    echo "使用 npm 安装..."
    npm install
else
    echo "❌ 未找到 npm 或 pnpm"
    exit 1
fi
echo "✅ 前端依赖安装成功"
echo ""

echo "======================================"
echo "✅ 安装完成！"
echo "======================================"
echo ""
echo "启动服务："
echo ""
echo "1. 启动后端（在 backend 目录）："
echo "   cd backend"
echo "   uvicorn main:app --reload --port 8000"
echo ""
echo "2. 启动前端（在 frontend 目录，新终端）："
echo "   cd frontend"
echo "   pnpm dev  # 或 npm run dev"
echo ""
echo "3. 访问应用："
echo "   http://localhost:5173"
echo ""
