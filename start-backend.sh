#!/bin/bash

echo "启动后端服务..."
cd backend
uvicorn main:app --reload --port 8000
