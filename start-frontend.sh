#!/bin/bash

echo "启动前端服务..."
cd frontend
if command -v pnpm &> /dev/null; then
    pnpm dev
else
    npm run dev
fi
