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

### 1b) 患者端前端 (frontend/patient-app)

- 進入目錄：`cd frontend/patient-app`
- 安裝依賴：`npm install`
- 開發啟動：`npm run dev`（預設 <http://localhost:5174> 或 5173 旁邊的可用埠）
- 主要入口：`App.tsx`（手機框 UI，含 Home/Profile/TaskRecord/TaskSubmission/Timeline 等頁）
- 設定後端位址：複製 `.env.example` 為 `.env.local`，可調整 `VITE_API_BASE`（預設 <http://localhost:3001>）

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

#### 啟用 LLM（預設為 mock，開啟後才會真連線）

- 設定金鑰：`export OPENROUTER_API_KEY=your_key`（無金鑰時會用本地簡化計算）
- 安裝依賴：`cd backend/python-api && pip install -r requirements.txt`
- 啟動 FastAPI demo：`uvicorn api_demo:app --reload --port 8000`
- 測試呼叫：`curl -X POST http://localhost:8000/evaluate_cbt -H 'Content-Type: application/json' -d '{"submission_text":"..."}'`
- 若要在其他服務使用 `compatibility_agent.py`：建立 `OpenAI` 客戶端（openrouter base URL + key），再注入到代理類別，即可使用真實語義/共情計分；未注入時使用 mock/fallback。

## 目錄說明

- `frontend/`：前端 UI（Vite + React）
- `frontend/patient-app/`：患者端 Vite React App
- `backend/`：Express 假資料 API
- `backend/python-api/`：Python LLM/分析原型
- `archive/design-prototype/`：設計原型打包
- `archive/legacy-react-prototype/`：早期 React 範例元件（含 fetch 假資料的基礎版 `HomeworkCenter`）

## 常見問題

- 前端若需呼叫後端，可在 `frontend` 設 `.env` 設定 `VITE_API_BASE=http://localhost:3001` 後在程式中引用。
- 後端資料在記憶體中，重啟會重置。
