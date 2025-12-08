import os
import json
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, validator
from dotenv import load_dotenv

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 加载环境变量
load_dotenv()

# 导入LangChain组件
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
# -------------------------------------------------------------------------

# ... (代码其余部分保持不变) ...
# ------------------------------------------------------------


################################################################################
# I. 全局配置与 LLM 初始化 (此部分与之前相同)
################################################################################
def get_api_key() -> str:
    """获取OpenRouter API密钥"""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        logger.warning("未找到环境变量 OPENROUTER_API_KEY")
        api_key = input("请输入您的OpenRouter API密钥: ").strip()
        if not api_key:
            raise ValueError("未提供有效的OpenRouter API密钥")
    return api_key

# 初始化LLM
def init_llm() -> ChatOpenAI:
    try:
        llm = ChatOpenAI(
            model="openai/gpt-4o",
            openai_api_base="https://openrouter.ai/api/v1",
            openai_api_key=get_api_key(),
            # OpenRouter 推荐的头部信息需要通过 default_headers 传入
            default_headers={
                "HTTP-Referer": "CBT_Agent",
                "X-Title": "CBT Homework Evaluator",
            },
            temperature=0.3,
            max_retries=3,
            request_timeout=30
        )
        logger.info("✅ LLM 初始化成功")
        return llm
    except Exception as e:
        logger.error(f"LLM 初始化失败: {str(e)}")
        raise

llm = init_llm()

################################################################################
# II. 工具定义：CBT 作业评估工具 (此部分与之前相同)
################################################################################
class EvaluationReport(BaseModel):
    """CBT作业评估报告"""
    score_context: int = Field(..., ge=0, le=20, description="情境描述分数 (0-20分)")
    score_emotion: int = Field(..., ge=0, le=20, description="情绪识别分数 (0-20分)")
    score_thought: int = Field(..., ge=0, le=20, description="自动思维分数 (0-20分)")
    score_restructuring: int = Field(..., ge=0, le=20, description="认知重构分数 (0-20分)")
    score_action_plan: int = Field(..., ge=0, le=20, description="行动计划分数 (0-20分)")
    doctor_comments: str = Field(..., min_length=10, max_length=2000, description="给医生/督导师看的技术性总结")
    # 给患者看的反馈可以在第二阶段临床转化时再填充，这里允许为空字符串
    patient_feedback: str = Field("", min_length=0, max_length=2000, description="面向来访者的反馈文本")
    total_score: int = Field(..., ge=0, le=100, description="总分 (100分制)")

    @validator('total_score')
    def validate_total_score(cls, v, values):
        """验证总分是否等于各项分数之和"""
        if v != sum([
            values.get('score_context', 0),
            values.get('score_emotion', 0),
            values.get('score_thought', 0),
            values.get('score_restructuring', 0),
            values.get('score_action_plan', 0)
        ]):
            raise ValueError('总分必须等于各项分数之和')
        return v

def analyze_with_llm(submission_text: str) -> Dict[str, Any]:
    """使用LLM分析CBT作业"""
    try:
        # 这里可以添加更复杂的提示工程
        prompt = f"""
        你是一位经验丰富、但非常严谨的 CBT 督导师。

        你的任务是：只对下面这份 CBT 家庭作业做结构化、量表化的质量评估，输出 JSON 数据，不要输出任何多余说明。

        === 学生提交的 CBT 作业文本 ===
        {submission_text}
        === 评估要求 ===

        请从以下 5 个维度为作业打分，每一项 0-20 分，总分 0-100：
        1. 情境描述是否清晰具体（score_context）：包括是否有足够关键信息，是否能判断这是一次真实、具体的事件，而不是非常笼统的描述。
        2. 情绪识别是否准确（score_emotion）：包括是否写出具体情绪、情绪强度，以及这些情绪是否和情境相匹配。
        3. 自动思维分析是否深入（score_thought）：包括是否能写出具体想法，是否真正展开分析其合理性、证据、可能的认知偏差，以及从文字中推断来访者是否认真反思、而不是敷衍完成。
        4. 认知重构是否合理（score_restructuring）：包括是否有替代性想法，这些替代想法是否足够具体、平衡、贴近现实，以及是否能看出一定的练习投入。
        5. 行动计划是否具体可行（score_action_plan）：包括计划是否清晰、可执行、与前面分析一致；并综合考虑这份作业整体看起来是否像是按时认真完成的（而非极度简略或明显事后草草补写）。

        评估输出必须是「单个 JSON 对象」，字段如下（字段名必须完全一致）：
        {{
          "score_context": int,        // 0-20
          "score_emotion": int,        // 0-20
          "score_thought": int,        // 0-20
          "score_restructuring": int,  // 0-20
          "score_action_plan": int,    // 0-20
          "doctor_comments": str,      // 给医生/督导师看的简要技术性总结，1-3 段话，需简要评论：完成度/真实性、时效性（更像按时记录还是事后回忆）、完成态度（合作/敷衍/防御等）
          "total_score": int           // 5 项得分之和
        }}

        极其重要：
        - 只输出 JSON，不要任何额外文字，不要解释
        - 确保 total_score = 5 项得分之和
        - 使用 utf-8 编码兼容的标准 JSON 格式
        """

        response = llm.invoke(prompt)
        raw = getattr(response, "content", response)

        # 兼容不同返回类型（str 或 list）
        if isinstance(raw, list):
            raw_text = "".join([seg.get("text", "") if isinstance(seg, dict) else str(seg) for seg in raw])
        else:
            raw_text = str(raw)

        raw_text = raw_text.strip()

        # 尝试从第一个 "{" 到最后一个 "}" 截出 JSON 片段，避免 ```json 包裹等情况
        start = raw_text.find("{")
        end = raw_text.rfind("}")
        if start != -1 and end != -1 and end > start:
            json_str = raw_text[start:end+1]
        else:
            json_str = raw_text

        try:
            return json.loads(json_str)
        except Exception as parse_err:
            logger.error(f"JSON 解析失败, 原始内容如下:\n{raw_text}")
            raise parse_err
    except Exception as e:
        logger.error(f"LLM分析失败: {str(e)}")
        raise


def cbt_homework_quality_analyzer(submission_text: str) -> EvaluationReport:
    """纯数据层：调用 LLM 进行严谨 JSON 评估，返回 EvaluationReport。

    对应流程中的：
    - 调用专业工具 (CBT Analyzer)
    - API LLM 严谨评估 (JSON Output)
    """
    analysis = analyze_with_llm(submission_text)
    report = EvaluationReport(**analysis)
    return report


def clinical_translation(submission_text: str, report: EvaluationReport) -> str:
    """临床转化层：把结构化评分 + 原始作业，转成面向来访者的温柔反馈。

    对应流程中的：
    - Agent 临床转化
    - 用户反馈（文本部分）
    """
    clinical_prompt = f"""
    你现在是一名富有同理心的 CBT 心理治疗师。

    下面是来访者的一份 CBT 家庭作业原文：
    --- 作业开始 ---
    {submission_text}
    --- 作业结束 ---

    下面是督导师对这份作业给出的结构化量表评估结果（JSON）：
    {report.model_dump_json(ensure_ascii=False)}

    请你基于这份结构化评估结果，用「通俗、温柔、但专业」的中文，给来访者写一段反馈，要求：
    - 先简要肯定其完成作业的努力
    - 点出得分较高的优点
    - 温和指出得分相对较低的部分，并给出 1-3 条具体可操作的改进建议
    - 使用第二人称（“你”），避免专业术语堆砌
    - 用非评判性的方式，简要描述你对这份作业「完成度/是否认真投入」、「看起来更像是当时记录还是事后回忆补写」、「整体完成态度（例如是否愿意自我反思）」的观察，可以用“给我的感觉是…”这类表述，避免武断下结论
    - 字数建议在 200-500 字之间
    """

    clinical_response = llm.invoke(clinical_prompt)
    clinical_text = getattr(clinical_response, "content", clinical_response)
    return str(clinical_text)

@tool
def evaluate_cbt_homework(submission_text: str) -> EvaluationReport:
    """
    评估 CBT 作业质量并返回结构化评分报告
    
    Args:
        submission_text: 学生提交的CBT作业文本
        
    Returns:
        EvaluationReport: 包含详细评分的报告对象
        
    Raises:
        ValueError: 如果输入文本无效或分析失败
    """
    if not submission_text or len(submission_text.strip()) < 10:
        raise ValueError("提交的作业文本过短或无效")
        
    logger.info(f"开始评估CBT作业，文本长度: {len(submission_text)} 字符")
    
    try:
        # 第一步：严谨 JSON 评估（数据层）
        report = cbt_homework_quality_analyzer(submission_text)

        # 第二步：临床转化（体验层）
        clinical_text = clinical_translation(submission_text, report)

        # 用临床转化后的文字填充给患者看的反馈
        report.patient_feedback = clinical_text

        logger.info(f"评估完成，总分: {report.total_score}/100")
        return report

    except Exception as e:
        logger.error(f"评估过程中发生错误: {str(e)}")
        # 返回一个基本的错误报告
        return EvaluationReport(
            score_context=0,
            score_emotion=0,
            score_thought=0,
            score_restructuring=0,
            score_action_plan=0,
            doctor_comments="评估过程中发生错误，请稍后重试（技术层）。",
            patient_feedback="评估过程中发生了一些技术问题，目前暂时无法给出完整反馈，可以稍后再试一次。",
            total_score=0
        )

################################################################################
# III. 测试运行：模拟完整 6 步流程
################################################################################
def simple_intent_recognizer(user_input: str) -> bool:
    """极简意图判断：是否是让 Agent 评估 CBT 作业。

    对应流程中的：Agent 意图判断
    """
    text = user_input.strip().lower()
    return ("评估" in text or "打分" in text) and ("作业" in text or "日志" in text)


if __name__ == "__main__":
    # 1. 用户自然语言指令 + 作业文本（用户作业）
    user_instruction = "请帮我评估一下这份 CBT 作业，并给出改进建议。"
    test_submission = """
    昨天在工作会议上（情境），我的老板当众批评了我的报告不够细致。我感到非常愤怒和羞愧（情绪），
    心想：他根本不理解我的努力，我做得比任何人都好（思维）。我当场反驳了他，导致气氛很尴尬。
    
    冷静下来后，我意识到（认知重构）我总是将批评视为全盘否定，这是一种非黑即白的思维模式。
    实际上，老板的批评可能是对我报告格式的具体建议。我决定（行动计划）明天主动找老板沟通，
    请他详细说明改进方向，并重新提交一份格式规范的报告。
    """

    print("🧪 Step 1: 收到用户输入（指令 + 作业文本）")
    print(user_instruction)

    # 2. Agent 意图判断
    if not simple_intent_recognizer(user_instruction):
        print("❌ 当前输入未被识别为作业评估请求。")
    else:
        print("✅ Step 2: 识别为 CBT 作业评估请求，进入评估流程…")

        # 3-6. 调用评估工具（内部完成 JSON 评估 + 临床转化），并返回用户反馈
        # evaluate_cbt_homework 是一个 StructuredTool，需要通过 .invoke 方式调用
        report = evaluate_cbt_homework.invoke({"submission_text": test_submission})

        print("\n✅ 评估完成！(对应流程 3-6)")
        print("总分:", report.total_score)
        print("情境描述:", report.score_context)
        print("情绪识别:", report.score_emotion)
        print("自动思维:", report.score_thought)
        print("认知重构:", report.score_restructuring)
        print("行动计划:", report.score_action_plan)

        print("\n—— 给医生/督导师的技术性总结 ——")
        print(report.doctor_comments)

        print("\n—— 面向来访者的反馈（可由医生审阅后使用） ——")
        print(report.patient_feedback)
