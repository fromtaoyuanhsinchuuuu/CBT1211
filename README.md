# CBT1211 Demo

心理治疗/CBT 演示專案，包含：

- 醫生端前端（Vite + React）
- 範例 Express 後端（假資料 API）
- LLM/數據分析原型腳本（Python）

## 快速開始

### 1) 醫生端前端 (frontend)

- 進入目錄：`cd frontend`
- 安裝依賴：`npm install`
- 開發啟動：`npm run dev`（預設 <http://localhost:5173>）
- 主要入口：`src/App.tsx`（Splash -> HomeworkCenter 多步流程）

### 2) 範例後端 (backend)

- 進入目錄：`cd backend`
- 安裝依賴：`npm install`
- 啟動：`npm start`（預設 <http://localhost:3001>，可用 `PORT=4001 npm start` 避免佔用）
- 提供端點：
  - `GET /api/patients`
  - `GET /api/sessions`
  - `GET /api/homeworks`
  - `POST /api/homeworks`（存於記憶體）

### 3) LLM 原型腳本 (backend/python-api)

- 進入目錄：`cd backend/python-api`
- 建議建立虛擬環境
- 安裝依賴：`pip install -r requirements.txt`
- 設定環境變數：`export OPENROUTER_API_KEY=...`
- 腳本示例：
  - `agent_homework_evaluator.py`：用 LLM 評分作業並生成回饋
  - `compatibility_agent.py`：計算情緒同步/語義契合等指標並生成報告

## 目錄說明

- `frontend/`：前端 UI（Vite + React）
- `backend/`：Express 假資料 API
- `backend/python-api/`：Python LLM/分析原型
- `archive/design-prototype/`：設計原型打包
- `archive/legacy-react-prototype/`：早期 React 範例元件（含 fetch 假資料的基礎版 `HomeworkCenter`）

## 常見問題

- 前端若需呼叫後端，可在 `frontend` 設 `.env` 設定 `VITE_API_BASE=http://localhost:3001` 後在程式中引用。
- 後端資料在記憶體中，重啟會重置。
