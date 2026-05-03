#!/bin/bash

echo "======================================"
echo "🚀 启动后端服务"
echo "======================================"
echo ""

cd /Users/apple/ebook/backend

echo "检查依赖..."
if python3 -c "import fastapi, sqlalchemy, psycopg2" 2>/dev/null; then
    echo "✅ 依赖已安装"
else
    echo "❌ 依赖未安装，正在安装..."
    pip3 install -r requirements.txt
fi

echo ""
echo "启动后端服务..."
echo "地址: http://localhost:8000"
echo "API 文档: http://localhost:8000/docs"
echo ""

uvicorn main:app --reload --port 8000
