#!/bin/bash

echo "======================================"
echo "系统健康检查"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 PostgreSQL
echo "1. 检查 PostgreSQL..."
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓${NC} PostgreSQL 已安装"
    
    # 检查数据库连接
    if PGPASSWORD=123456 psql -U crush -d ebook -c "SELECT 1;" &> /dev/null; then
        echo -e "${GREEN}✓${NC} 数据库连接成功"
        
        # 检查表是否存在
        TABLES=$(PGPASSWORD=123456 psql -U crush -d ebook -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
        if [ "$TABLES" -ge 4 ]; then
            echo -e "${GREEN}✓${NC} 数据库表已创建 ($TABLES 个表)"
        else
            echo -e "${YELLOW}⚠${NC} 数据库表未完全创建，请运行: python3 backend/init_db.py"
        fi
    else
        echo -e "${RED}✗${NC} 无法连接到数据库"
        echo "  请确保："
        echo "  - PostgreSQL 正在运行"
        echo "  - 数据库 'ebook' 已创建"
        echo "  - 用户 'crush' 存在且密码为 '123456'"
    fi
else
    echo -e "${RED}✗${NC} PostgreSQL 未安装"
fi
echo ""

# 检查 Python 依赖
echo "2. 检查 Python 依赖..."
if python3 -c "import fastapi, sqlalchemy, psycopg2, yaml, passlib, jose" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Python 依赖已安装"
else
    echo -e "${YELLOW}⚠${NC} Python 依赖未完全安装"
    echo "  请运行: cd backend && pip3 install -r requirements.txt"
fi
echo ""

# 检查后端文件
echo "3. 检查后端文件..."
BACKEND_FILES=("backend/main.py" "backend/models.py" "backend/database.py" "backend/auth.py" "backend/config.yaml")
ALL_BACKEND_OK=true
for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file 不存在"
        ALL_BACKEND_OK=false
    fi
done
echo ""

# 检查前端文件
echo "4. 检查前端文件..."
FRONTEND_FILES=("frontend/src/App.tsx" "frontend/src/Auth.tsx" "frontend/src/Library.tsx" "frontend/src/api.ts" "frontend/package.json")
ALL_FRONTEND_OK=true
for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file 不存在"
        ALL_FRONTEND_OK=false
    fi
done
echo ""

# 检查 Node.js 和包管理器
echo "5. 检查 Node.js 环境..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js 已安装 ($NODE_VERSION)"
else
    echo -e "${RED}✗${NC} Node.js 未安装"
fi

if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✓${NC} pnpm 已安装 ($PNPM_VERSION)"
elif command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm 已安装 ($NPM_VERSION)"
else
    echo -e "${RED}✗${NC} npm/pnpm 未安装"
fi
echo ""

# 检查前端依赖
echo "6. 检查前端依赖..."
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} 前端依赖已安装"
else
    echo -e "${YELLOW}⚠${NC} 前端依赖未安装"
    echo "  请运行: cd frontend && pnpm install"
fi
echo ""

# 检查端口占用
echo "7. 检查端口占用..."
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} 端口 8000 已被占用（后端可能正在运行）"
else
    echo -e "${GREEN}✓${NC} 端口 8000 可用"
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} 端口 5173 已被占用（前端可能正在运行）"
else
    echo -e "${GREEN}✓${NC} 端口 5173 可用"
fi
echo ""

# 总结
echo "======================================"
echo "检查完成"
echo "======================================"
echo ""

if [ "$ALL_BACKEND_OK" = true ] && [ "$ALL_FRONTEND_OK" = true ]; then
    echo -e "${GREEN}✓ 所有文件完整${NC}"
    echo ""
    echo "下一步："
    echo "1. 如果依赖未安装，运行: ./setup.sh"
    echo "2. 启动后端: ./start-backend.sh"
    echo "3. 启动前端: ./start-frontend.sh"
    echo "4. 访问: http://localhost:5173"
else
    echo -e "${RED}✗ 部分文件缺失，请检查项目完整性${NC}"
fi
echo ""
