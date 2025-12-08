# Backend (Express mock API)

簡易假資料 API，提供前端測試使用，資料存於記憶體。

## 快速啟動

1. `cd backend`
2. `npm install`
3. `npm start`（預設 <http://localhost:3001>，可設 `PORT=4001` 避免佔用；提供醫生/患者端假資料）

## API 端點

- `GET /api/patients`
- `GET /api/sessions`
- `GET /api/homeworks`
- `POST /api/homeworks`：新增作業（儲存在記憶體，重啟會重置）

## 檔案

- `server.js`：Express 入口
- `db.js`：假資料來源

### Python LLM 原型 (`backend/python-api`)

- 進入目錄：`cd backend/python-api`
- 安裝：`pip install -r requirements.txt`
- 設定：`export OPENROUTER_API_KEY=...`
- 跑 FastAPI demo：`uvicorn api_demo:app --reload --port 8000`
