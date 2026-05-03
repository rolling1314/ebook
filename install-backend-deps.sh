#!/bin/bash

echo "======================================"
echo "快速安装后端依赖"
echo "======================================"
echo ""

cd /Users/apple/ebook/backend

echo "正在安装 Python 依赖..."
echo ""

pip3 install fastapi uvicorn python-multipart sqlalchemy psycopg2-binary pyyaml passlib bcrypt "python-jose[cryptography]" "pydantic[email]"

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "✅ 依赖安装成功！"
    echo "======================================"
    echo ""
    echo "下一步："
    echo "1. 初始化数据库: python3 init_db.py"
    echo "2. 启动后端: uvicorn main:app --reload --port 8000"
    echo ""
else
    echo ""
    echo "❌ 依赖安装失败"
    echo "请检查错误信息"
fi
