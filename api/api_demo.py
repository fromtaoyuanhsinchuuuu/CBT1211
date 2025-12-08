from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict

from agent_homework_evaluator import evaluate_cbt_homework

app = FastAPI(title="CBT Homework Evaluator API")

# 添加 CORS 中间件，允许前端跨域调用
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发环境允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HomeworkRequest(BaseModel):
    submission_text: str


class HomeworkResponse(BaseModel):
    total_score: int
    score_context: int
    score_emotion: int
    score_thought: int
    score_restructuring: int
    score_action_plan: int
    doctor_comments: str
    patient_feedback: str


@app.post("/evaluate_cbt", response_model=HomeworkResponse)
async def evaluate_cbt(req: HomeworkRequest) -> HomeworkResponse:
    """评估一份 CBT 作业并返回两份报告（医生版 + 患者版）。"""
    report = evaluate_cbt_homework.invoke({"submission_text": req.submission_text})

    return HomeworkResponse(
        total_score=report.total_score,
        score_context=report.score_context,
        score_emotion=report.score_emotion,
        score_thought=report.score_thought,
        score_restructuring=report.score_restructuring,
        score_action_plan=report.score_action_plan,
        doctor_comments=report.doctor_comments,
        patient_feedback=report.patient_feedback,
    )


# 方便直接用 `python api_demo.py` 本地跑
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api_demo:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
    )
