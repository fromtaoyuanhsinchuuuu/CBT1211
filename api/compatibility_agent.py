import math
import os
import statistics
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from openai import OpenAI
from dotenv import load_dotenv

from metrics.emotion_sync_advanced import AdvancedEmotionSynchronyCalculator
from metrics.semantic_alignment_advanced import AdvancedSemanticAlignmentCalculator
from metrics.empathy_composite import EmpathyCompositeCalculator

# =============================
# 数据模型
# =============================

@dataclass
class TranscriptTurn:
    speaker: str  # "therapist" / "patient"
    text: str
    start: float
    end: float


@dataclass
class EmotionPoint:
    speaker: str  # "therapist" / "patient"
    timestamp: float
    valence: float  # -1 ~ 1
    arousal: float  # 0 ~ 1


@dataclass
class CBTIndicators:
    techniques_used: List[str] = field(default_factory=list)
    technique_quality: float = 0.0


@dataclass
class HomeworkQuality:
    completion_rate: float = 0.0
    discussion_depth: float = 0.0


@dataclass
class SessionInput:
    session_id: str
    patient_id: str
    therapist_id: str
    session_date: str
    transcript: List[Dict[str, Any]]
    emotion_timeline: List[Dict[str, Any]]
    cbt_indicators: Dict[str, Any] = field(default_factory=dict)
    homework_quality: Dict[str, Any] = field(default_factory=dict)


@dataclass
class MetricWithTrend:
    current: float
    trend: str
    change_rate: Optional[str]
    label: str
    historical_avg: Optional[float]
    historical_values: List[float]


@dataclass
class TherapistReport:
    session_id: str
    metrics_summary: Dict[str, MetricWithTrend]
    clinical_interpretation: Dict[str, Any]
    alerts: List[Dict[str, Any]]


@dataclass
class PatientFamilyReport:
    summary: str
    key_points: List[str]
    progress: str


@dataclass
class ArchiveData:
    session_id: str
    patient_id: str
    therapist_id: str
    session_date: str
    raw_metrics: Dict[str, float]
    computed_fields: Dict[str, Any]


@dataclass
class CompatibilityOutput:
    therapist_report: TherapistReport
    patient_family_report: PatientFamilyReport
    archive_data: ArchiveData
    alerts: List[Dict[str, Any]]


# =============================
# 工具函数
# =============================


def _safe_pearson(xs: List[float], ys: List[float]) -> Optional[float]:
    """简单实现 Pearson 相关，避免额外依赖。"""
    if len(xs) != len(ys) or len(xs) < 2:
        return None
    if len(set(xs)) == 1 or len(set(ys)) == 1:
        return None
    mean_x = statistics.mean(xs)
    mean_y = statistics.mean(ys)
    num = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys))
    den_x = math.sqrt(sum((x - mean_x) ** 2 for x in xs))
    den_y = math.sqrt(sum((y - mean_y) ** 2 for y in ys))
    if den_x == 0 or den_y == 0:
        return None
    return num / (den_x * den_y)


def _jaccard_similarity(a: List[str], b: List[str]) -> float:
    sa = set(w for w in a if w)
    sb = set(w for w in b if w)
    if not sa or not sb:
        return 0.0
    inter = len(sa & sb)
    union = len(sa | sb)
    return inter / union if union > 0 else 0.0


# =============================
# 主 Agent
# =============================


class CompatibilityMetricsAgent:
    """契合度指标计算 Agent（简化实现版本）。

    目标：
    - 接收单次会话的综合数据（转写、情绪时间线、CBT 指标等）
    - 计算 5 个核心契合度指标
    - 和历史数据（当前内存版）做简单趋势分析
    - 生成：
      - 治疗师专业报告
      - 患者/家属易懂报告
      - 归档 JSON 数据
    """

    def __init__(self) -> None:
        # 极简“历史数据库”：仅存在内存里，按 patient_id 记录历史指标
        self._history: Dict[str, List[Dict[str, float]]] = {}

        # 高级分析器（情绪同步、语义契合、共情综合）
        self._emotion_advanced = AdvancedEmotionSynchronyCalculator()
        self._semantic_client: Optional[OpenAI] = None
        self._semantic_advanced: Optional[AdvancedSemanticAlignmentCalculator] = None
        self._empathy_composite = EmpathyCompositeCalculator()

        # 最近一次会话的详细分析结果缓存（用于报告/归档）
        self._last_emotion_detail: Optional[Dict[str, Any]] = None
        self._last_semantic_detail: Optional[Dict[str, Any]] = None
        self._last_empathy_composite: Optional[Dict[str, Any]] = None

    def set_semantic_client(self, client: OpenAI) -> None:
        """由外部注入 OpenRouter/OpenAI 客户端，用于高级语义契合分析。"""
        self._semantic_client = client
        self._semantic_advanced = AdvancedSemanticAlignmentCalculator(client)

    # ======= 对外主入口 =======

    def analyze_session(self, session_data: Dict[str, Any]) -> CompatibilityOutput:
        session = SessionInput(**session_data)

        # 1. 计算 5 个指标（当前值）
        metrics = self._compute_current_metrics(session)

        # 1.5 计算情绪+语义的共情综合评分（如果有高级结果）
        self._last_empathy_composite = None
        if self._last_emotion_detail is not None and self._last_semantic_detail is not None:
            try:
                self._last_empathy_composite = self._empathy_composite.calculate(
                    emotion_sync_data=self._last_emotion_detail,
                    semantic_alignment_data=self._last_semantic_detail,
                    linguistic_mirroring_data={"overall_score": metrics.get("linguistic_mirroring", 0.0)},
                )
            except Exception:
                self._last_empathy_composite = None

        # 2. 加载历史并做趋势分析
        trends = self._analyze_trends(session.patient_id, metrics)

        # 3. 告警检查
        alerts = self._check_alerts(session.patient_id, session.therapist_id, trends)

        # 4. 组装报告
        therapist_report = self._build_therapist_report(
            session, trends, alerts, self._last_empathy_composite
        )
        patient_report = self._build_patient_report(session, trends)
        archive_data = self._build_archive_data(
            session, metrics, trends, self._last_empathy_composite
        )

        # 5. 写入“历史”（内存版）
        self._append_history(session.patient_id, metrics)

        return CompatibilityOutput(
            therapist_report=therapist_report,
            patient_family_report=patient_report,
            archive_data=archive_data,
            alerts=alerts,
        )

    # ======= 指标计算 =======

    def _compute_current_metrics(self, session: SessionInput) -> Dict[str, float]:
        transcript = [TranscriptTurn(**t) for t in session.transcript]
        emotions = [EmotionPoint(**e) for e in session.emotion_timeline]

        emotion_sync = self._metric_emotion_synchrony(emotions)
        linguistic_mirroring = self._metric_linguistic_mirroring(transcript)
        semantic_alignment = self._metric_semantic_alignment(transcript)
        talk_ratio = self._metric_talk_ratio(transcript)
        response_latency = self._metric_response_latency(transcript)

        return {
            "emotion_synchrony": emotion_sync,
            "linguistic_mirroring": linguistic_mirroring,
            "semantic_alignment": semantic_alignment,
            "talk_ratio": talk_ratio,
            "response_latency": response_latency,
        }

    def _metric_emotion_synchrony(self, emotions: List[EmotionPoint]) -> float:
        """情绪同步指数：优先使用高级分析器，失败时回退到简化版。"""
        if not emotions:
            self._last_emotion_detail = None
            return 0.0

        # 使用高级分析器
        try:
            timeline = [
                {
                    "speaker": e.speaker,
                    "timestamp": e.timestamp,
                    "valence": e.valence,
                    "arousal": e.arousal,
                }
                for e in emotions
            ]
            detail = self._emotion_advanced.calculate(timeline)
            self._last_emotion_detail = detail
            corr = float(detail.get("instant_sync", {}).get("correlation", 0.0))
            # 把 [-1,1] 映射到 [0,1]
            return round((corr + 1.0) / 2.0, 3)
        except Exception:  # noqa: BLE001
            # 回退到原来的简化 Pearson 版本
            emotions_sorted = sorted(emotions, key=lambda e: e.timestamp)
            max_ts = max(e.timestamp for e in emotions_sorted)
            if max_ts <= 0:
                return 0.0
            bins = list(range(int(math.floor(max_ts)) + 1))
            therapist_vals: List[float] = []
            patient_vals: List[float] = []
            for i in bins:
                t_in_bin = [e.valence for e in emotions_sorted if e.speaker == "therapist" and i <= e.timestamp < i + 1]
                p_in_bin = [e.valence for e in emotions_sorted if e.speaker == "patient" and i <= e.timestamp < i + 1]
                therapist_vals.append(statistics.mean(t_in_bin) if t_in_bin else 0.0)
                patient_vals.append(statistics.mean(p_in_bin) if p_in_bin else 0.0)
            r = _safe_pearson(therapist_vals, patient_vals)
            if r is None:
                return 0.0
            return round((r + 1.0) / 2.0, 3)

    def _metric_linguistic_mirroring(self, transcript: List[TranscriptTurn]) -> float:
        """语言镜像率（简化版：词汇 Jaccard + 语义近似缺省）。"""
        patient_words: List[str] = []
        therapist_words: List[str] = []
        for t in transcript:
            words = t.text.replace("\n", " ").split()
            if t.speaker == "patient":
                patient_words.extend(words)
            elif t.speaker == "therapist":
                therapist_words.extend(words)
        lexical = _jaccard_similarity(patient_words, therapist_words)
        # 暂无 embedding，语义镜像近似为词汇镜像
        semantic = lexical
        overall = 0.3 * lexical + 0.7 * semantic
        return round(overall, 3)

    def _metric_semantic_alignment(self, transcript: List[TranscriptTurn]) -> float:
        """语义契合度：优先使用高级语义模块，失败时回退到简化版。"""
        # 如已配置高级语义分析器，则调用 LLM 模块
        if self._semantic_advanced is not None:
            try:
                transcript_dicts = [
                    {
                        "speaker": t.speaker,
                        "text": t.text,
                        "start": t.start,
                        "end": t.end,
                    }
                    for t in transcript
                ]
                detail = self._semantic_advanced.calculate(transcript_dicts)
                self._last_semantic_detail = detail
                overall = float(detail.get("overall_alignment", 0.0))
                return round(overall, 3)
            except Exception:  # noqa: BLE001
                # 如果高级分析失败，继续走简化逻辑
                self._last_semantic_detail = None

        # 简化启发式版本：patient→therapist 邻接轮次 Jaccard
        pairs: List[Tuple[str, str]] = []
        for i in range(len(transcript) - 1):
            a, b = transcript[i], transcript[i + 1]
            if a.speaker == "patient" and b.speaker == "therapist":
                pairs.append((a.text, b.text))
        if not pairs:
            return 0.0
        scores: List[float] = []
        for p_text, t_text in pairs:
            p_words = p_text.replace("\n", " ").split()
            t_words = t_text.replace("\n", " ").split()
            s = _jaccard_similarity(p_words, t_words)
            scores.append(s)
        return round(statistics.mean(scores), 3) if scores else 0.0

    def _metric_talk_ratio(self, transcript: List[TranscriptTurn]) -> float:
        """谈话比例：返回治疗师说话占比（0~1）。"""
        if not transcript:
            return 0.0
        therapist_secs = 0.0
        patient_secs = 0.0
        for t in transcript:
            dur = max(0.0, t.end - t.start)
            if t.speaker == "therapist":
                therapist_secs += dur
            elif t.speaker == "patient":
                patient_secs += dur
        total = therapist_secs + patient_secs
        if total <= 0:
            return 0.0
        return round(therapist_secs / total, 3)

    def _metric_response_latency(self, transcript: List[TranscriptTurn]) -> float:
        """响应潜伏时间：平均轮换时的间隔（秒）。"""
        if len(transcript) < 2:
            return 0.0
        gaps: List[float] = []
        for i in range(len(transcript) - 1):
            cur = transcript[i]
            nxt = transcript[i + 1]
            if cur.speaker != nxt.speaker:
                gap = nxt.start - cur.end
                if gap >= 0:
                    gaps.append(gap)
        if not gaps:
            return 0.0
        return round(statistics.mean(gaps), 3)

    # ======= 历史与趋势 =======

    def _append_history(self, patient_id: str, metrics: Dict[str, float]) -> None:
        self._history.setdefault(patient_id, []).append(metrics)

    def _analyze_trends(self, patient_id: str, metrics: Dict[str, float]) -> Dict[str, MetricWithTrend]:
        history = self._history.get(patient_id, [])
        trends: Dict[str, MetricWithTrend] = {}
        for name, current in metrics.items():
            hist_values = [h[name] for h in history if name in h]
            if not hist_values:
                trends[name] = MetricWithTrend(
                    current=current,
                    trend="基线",
                    change_rate=None,
                    label=self._label_metric(name, current, trend=None),
                    historical_avg=None,
                    historical_values=[],
                )
                continue
            last = hist_values[-1]
            if math.isclose(last, 0.0):
                change_rate = None
            else:
                change_rate_val = (current - last) / last * 100
                change_rate = f"{change_rate_val:+.1f}%"
            if current > last:
                t = "上升"
            elif current < last:
                t = "下降"
            else:
                t = "持平"
            avg = statistics.mean(hist_values)
            label = self._label_metric(name, current, trend=t)
            trends[name] = MetricWithTrend(
                current=current,
                trend=t,
                change_rate=change_rate,
                label=label,
                historical_avg=avg,
                historical_values=hist_values + [current],
            )
        return trends

    def _label_metric(self, name: str, value: float, trend: Optional[str]) -> str:
        """根据当前值 + 趋势生成简单标签。"""
        base = ""
        if name in {"emotion_synchrony", "linguistic_mirroring", "semantic_alignment"}:
            if value >= 0.7:
                base = "🟢 优秀"
            elif value >= 0.4:
                base = "🔵 良好"
            elif value >= 0.2:
                base = "🟡 需关注"
            else:
                base = "🔴 警戒"
        elif name == "talk_ratio":
            # 治疗师 30%~60% 视为理想
            if 0.3 <= value <= 0.6:
                base = "🟢 平衡"
            elif 0.2 <= value <= 0.7:
                base = "🔵 可接受"
            else:
                base = "🟡 失衡"
        elif name == "response_latency":
            if value < 0.5:
                base = "🟡 过快"
            elif value < 2.5:
                base = "🟢 自然"
            else:
                base = "🟡 偏慢"
        if trend in {"上升", "下降"}:
            arrow = "⬆️" if trend == "上升" else "⬇️"
            return f"{base} {arrow}"
        return base

    # ======= 告警 =======

    def _check_alerts(self, patient_id: str, therapist_id: str, trends: Dict[str, MetricWithTrend]) -> List[Dict[str, Any]]:
        alerts: List[Dict[str, Any]] = []
        # 规则示例 1：语义契合度连续低（这里简单看当前值）
        sem = trends.get("semantic_alignment")
        if sem and sem.current < 0.4:
            alerts.append({
                "type": "semantic_alignment_low",
                "severity": "medium",
                "message": f"本次语义契合度偏低（{sem.current:.2f}），建议在下次会话中更多围绕患者核心关切展开。",
                "patient_id": patient_id,
                "therapist_id": therapist_id,
            })
        # 规则示例 2：情绪同步急剧下降
        emo = trends.get("emotion_synchrony")
        if emo and emo.change_rate is not None and emo.trend == "下降":
            try:
                rate = float(emo.change_rate.replace("%", ""))
                if rate <= -30.0:
                    alerts.append({
                        "type": "emotion_synchrony_drop",
                        "severity": "medium",
                        "message": f"情绪同步指数较上次下降 {rate:.1f}%，可能存在共情断裂。",
                        "patient_id": patient_id,
                        "therapist_id": therapist_id,
                    })
            except Exception:
                pass
        # 规则示例 3：谈话比例失衡
        talk = trends.get("talk_ratio")
        if talk and (talk.current < 0.2 or talk.current > 0.7):
            alerts.append({
                "type": "talk_ratio_imbalanced",
                "severity": "low",
                "message": f"本次治疗师说话占比为 {talk.current:.2f}，建议关注患者表达空间。",
                "patient_id": patient_id,
                "therapist_id": therapist_id,
            })
        return alerts

    # ======= 报告构建 =======

    def _build_therapist_report(
        self,
        session: SessionInput,
        trends: Dict[str, MetricWithTrend],
        alerts: List[Dict[str, Any]],
        empathy_composite: Optional[Dict[str, Any]],
    ) -> TherapistReport:
        # 非 LLM 版本的非常简洁“临床解读”
        overall_comment = "总体沟通质量："  # 占位简单规则
        sem = trends.get("semantic_alignment")
        emo = trends.get("emotion_synchrony")
        talk = trends.get("talk_ratio")
        if sem and emo:
            if sem.current >= 0.6 and emo.current >= 0.6:
                overall_comment += "良好（患者较易感到被理解）。"
            elif sem.current < 0.4:
                overall_comment += "需关注语义契合度，避免答非所问。"
            else:
                overall_comment += "中等，可在下次会话中进一步加强围绕核心主题的探索。"
        key_findings: List[str] = []
        if sem:
            key_findings.append(f"语义契合度为 {sem.current:.2f}，标签：{sem.label}。")
        if emo:
            key_findings.append(f"情绪同步指数为 {emo.current:.2f}，标签：{emo.label}。")
        if talk:
            key_findings.append(f"治疗师说话占比为 {talk.current:.2f}。")
        # 如已计算共情综合评分，在报告中加入一条摘要
        if empathy_composite is not None:
            score = empathy_composite.get("empathy_composite_score")
            grade = empathy_composite.get("grade")
            if score is not None and grade is not None:
                key_findings.append(
                    f"共情综合评分为 {score:.1f}（等级：{grade}）。"
                )
        clinical_interpretation = {
            "overall_rating": overall_comment,
            "key_findings": key_findings,
            "recommendations": [
                "可适当增加开放式提问，鼓励患者扩展自己的叙述。",
                "回顾患者多次提到的关键信念或主题，避免频繁转移话题。",
            ],
        }
        return TherapistReport(
            session_id=session.session_id,
            metrics_summary=trends,
            clinical_interpretation=clinical_interpretation,
            alerts=alerts,
        )

    def _build_patient_report(
        self,
        session: SessionInput,
        trends: Dict[str, MetricWithTrend],
    ) -> PatientFamilyReport:
        """给患者/家属看的易懂版本（当前为非 LLM 简化版）。"""
        sem = trends.get("semantic_alignment")
        emo = trends.get("emotion_synchrony")
        talk = trends.get("talk_ratio")
        summary_parts: List[str] = []
        if emo and emo.current >= 0.6:
            summary_parts.append("本次咨询中，医生整体上比较能和你的情绪同频。")
        if sem and sem.current >= 0.5:
            summary_parts.append("医生的回应大多围绕你真正关心的问题展开。")
        if not summary_parts:
            summary_parts.append("本次咨询整体沟通质量尚可，后续还可以继续调整和优化。")
        progress = "这是系统给出的自动分析结果，仅供你和医生参考，不代表正式诊断。"
        key_points: List[str] = []
        if talk:
            if 0.3 <= talk.current <= 0.6:
                key_points.append("你和医生的说话时间比较平衡。")
            else:
                key_points.append("可以在咨询中多表达自己的想法和感受。")
        return PatientFamilyReport(
            summary="".join(summary_parts),
            key_points=key_points,
            progress=progress,
        )

    def _build_archive_data(
        self,
        session: SessionInput,
        metrics: Dict[str, float],
        trends: Dict[str, MetricWithTrend],
        empathy_composite: Optional[Dict[str, Any]],
    ) -> ArchiveData:
        """构建结构化归档数据。"""
        overall_score = statistics.mean(metrics.values()) if metrics else 0.0
        computed_fields = {
            "overall_compatibility_score": round(overall_score * 10, 2),  # 粗略映射到 0-10
            "risk_level": "low",  # 简化：暂时不细分
        }
        if empathy_composite is not None:
            computed_fields["empathy_composite_score"] = empathy_composite.get(
                "empathy_composite_score"
            )
            computed_fields["empathy_grade"] = empathy_composite.get("grade")
        return ArchiveData(
            session_id=session.session_id,
            patient_id=session.patient_id,
            therapist_id=session.therapist_id,
            session_date=session.session_date,
            raw_metrics=metrics,
            computed_fields=computed_fields,
        )


# 便于直接本地简单测试
if __name__ == "__main__":
    # 尝试从 .env 加载 OPENROUTER_API_KEY，用于高级语义分析
    load_dotenv()
    api_key = os.getenv("OPENROUTER_API_KEY")

    agent = CompatibilityMetricsAgent()

    if api_key:
        try:
            semantic_client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=api_key,
            )
            agent.set_semantic_client(semantic_client)
            print("✅ 已为契合度 Agent 配置 OpenRouter 语义分析客户端")
        except Exception as e:  # noqa: BLE001
            print(f"⚠️ 配置 OpenRouter 语义分析客户端失败，将使用简化语义指标: {e}")
    else:
        print("⚠️ 未找到 OPENROUTER_API_KEY，高级语义契合度分析将被跳过，使用简化版本。")

    dummy_session = {
        "session_id": "session_001",
        "patient_id": "patient_001",
        "therapist_id": "therapist_001",
        "session_date": datetime.now().isoformat(),
        "transcript": [
            {"speaker": "therapist", "text": "你好，最近感觉怎么样？", "start": 0.0, "end": 2.5},
            {"speaker": "patient", "text": "最近压力挺大的，总觉得自己做得不够好。", "start": 3.0, "end": 8.0},
            {"speaker": "therapist", "text": "听起来你对自己的要求很高。", "start": 8.5, "end": 11.0},
            {"speaker": "patient", "text": "是的，总觉得如果做不好就完蛋了。", "start": 11.5, "end": 15.0},
        ],
        "emotion_timeline": [
            {"speaker": "patient", "timestamp": 1.0, "valence": -0.2, "arousal": 0.6},
            {"speaker": "therapist", "timestamp": 1.0, "valence": 0.1, "arousal": 0.4},
            {"speaker": "patient", "timestamp": 4.0, "valence": -0.4, "arousal": 0.7},
            {"speaker": "therapist", "timestamp": 5.0, "valence": -0.1, "arousal": 0.5},
            {"speaker": "patient", "timestamp": 12.0, "valence": -0.5, "arousal": 0.7},
            {"speaker": "therapist", "timestamp": 13.0, "valence": -0.2, "arousal": 0.5},
        ],
        "cbt_indicators": {"techniques_used": ["苏格拉底提问"], "technique_quality": 0.7},
        "homework_quality": {"completion_rate": 0.8, "discussion_depth": 0.6},
    }

    out = agent.analyze_session(dummy_session)
    print("===== 治疗师报告 =====")
    print(out.therapist_report.clinical_interpretation)
    print("\n===== 患者/家属报告 =====")
    print(asdict(out.patient_family_report))
    print("\n===== 归档数据 =====")
    print(asdict(out.archive_data))
