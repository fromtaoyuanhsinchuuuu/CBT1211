import json
from typing import List, Dict, Any

from openai import OpenAI


class AdvancedSemanticAlignmentCalculator:
    """升级版语义契合度分析器（独立模块）。

    说明：
    - 依赖 OpenRouter 兼容的 OpenAI 客户端（传入时由上层注入）。
    - 采用多次 chat.completions 调用，返回结构化 JSON。
    - 这里完全按照你给出的设计拆分各个步骤。
    """

    def __init__(self, client: OpenAI) -> None:
        self.client = client

    # ===== 对外主入口 =====

    def calculate(self, transcript: List[Dict[str, Any]]) -> Dict[str, Any]:
        """完整的语义契合度分析入口。"""
        core_issues = self._extract_patient_core_issues(transcript)
        alignment_analysis = self._evaluate_response_alignment(transcript, core_issues)
        reflective_language = self._detect_reflective_language(transcript)
        cognitive_empathy = self._calculate_cognitive_empathy(
            transcript, core_issues, reflective_language
        )
        response_appropriateness = self._analyze_response_timing(transcript)

        if alignment_analysis:
            overall_alignment = sum(
                float(item.get("alignment_score", 0.0)) for item in alignment_analysis
            ) / len(alignment_analysis)
        else:
            overall_alignment = 0.0

        clinical_insights = self._generate_clinical_insights(
            core_issues, alignment_analysis, reflective_language
        )

        return {
            "core_issues": core_issues,
            "alignment_analysis": alignment_analysis,
            "reflective_language": reflective_language,
            "cognitive_empathy": cognitive_empathy,
            "response_appropriateness": response_appropriateness,
            "overall_alignment": round(overall_alignment, 2),
            "clinical_insights": clinical_insights,
            "interpretation": self._interpret_alignment(overall_alignment),
            "off_topic_count": len(
                [a for a in alignment_analysis if float(a.get("alignment_score", 0.0)) < 0.3]
            ),
        }

    # ===== 子步骤实现 =====

    def _extract_patient_core_issues(self, transcript: List[Dict[str, Any]]) -> List[Dict]:
        patient_turns = [t["text"] for t in transcript if t.get("speaker") == "patient"]
        if not patient_turns:
            return []

        text_block = "\n".join(patient_turns[:20])
        prompt = f"""你是资深 CBT 督导师。从患者的陈述中提取其核心关注议题（最多 3 个）。\n\n患者陈述：\n{text_block}\n\n提取标准：\n1. 出现频率高的主题\n2. 情绪强度大的话题\n3. 与 CBT 治疗目标相关的问题\n\n输出 JSON 格式：\n{{\n  \"core_issues\": [\n    {{\n      \"issue\": \"工作压力与自我价值感\",\n      \"evidence\": \"示例\",\n      \"priority\": \"high\",\n      \"cbt_relevance\": \"示例\"\n    }}\n  ]\n}}"""

        try:
            resp = self.client.chat.completions.create(
                model="openai/gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "你是 CBT 督导专家，擅长识别患者核心议题",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
            )
            content = resp.choices[0].message.content
            data = json.loads(content)
            return data.get("core_issues", [])
        except Exception as e:  # noqa: BLE001
            print(f"核心议题抽取失败: {e}")
            return []

    def _evaluate_response_alignment(
        self, transcript: List[Dict[str, Any]], core_issues: List[Dict]
    ) -> List[Dict[str, Any]]:
        therapist_turns = [t for t in transcript if t.get("speaker") == "therapist"]
        if not therapist_turns or not core_issues:
            return []

        issues_summary = "\n".join(
            f"- {issue.get('issue')} (优先级: {issue.get('priority', 'unknown')})"
            for issue in core_issues
        )

        results: List[Dict[str, Any]] = []
        for idx, turn in enumerate(therapist_turns[:15]):
            turn_text = turn.get("text", "")
            prompt = f"""评估以下治疗师回应与患者核心议题的契合度。\n\n核心议题：\n{issues_summary}\n\n治疗师回应 #{idx + 1}：\n\"{turn_text}\"\n\n评估标准（0-1 分）：\n- 1.0: 直接回应核心议题，提供深度洞察或有效干预\n- 0.7: 与核心议题相关，展现理解\n- 0.5: 部分相关，但未深入\n- 0.3: 表面回应，未触及核心\n- 0.0: 完全偏离主题\n\n输出 JSON：\n{{\n  \"alignment_score\": 0.8,\n  \"addressed_issue\": \"工作压力与自我价值感\",\n  \"technique_used\": \"苏格拉底提问\",\n  \"reasoning\": \"示例\",\n  \"empathy_present\": true\n}}"""
            try:
                resp = self.client.chat.completions.create(
                    model="openai/gpt-4o",
                    messages=[
                        {"role": "system", "content": "你是 CBT 督导专家"},
                        {"role": "user", "content": prompt},
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.3,
                )
                content = resp.choices[0].message.content
                data = json.loads(content)
                results.append(data)
            except Exception as e:  # noqa: BLE001
                print(f"回应契合度评估失败 (turn {idx}): {e}")
        return results

    def _detect_reflective_language(
        self, transcript: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        therapist_utterances = [
            t.get("text", "") for t in transcript if t.get("speaker") == "therapist"
        ]
        if not therapist_utterances:
            return {"reflective_rate": 0.0, "types": {}, "examples": []}

        listing = "\n".join(
            f"{i + 1}. {u}" for i, u in enumerate(therapist_utterances[:20])
        )
        prompt = f"""分析以下治疗师话语中的反映性语言使用情况。\n\n治疗师话语（前 20 句）：\n{listing}\n\n识别以下类型的反映性语言：\n1. 情绪标注（emotion labeling）\n2. 内容复述（content reflection）\n3. 验证性回应（validation）\n4. 开放式提问（open-ended questions）\n\n输出 JSON：\n{{\n  \"reflective_utterances\": [\n    {{\"index\": 3, \"type\": \"emotion_labeling\", \"content\": \"示例\"}}\n  ],\n  \"reflective_count\": 8,\n  \"total_count\": 20,\n  \"reflective_rate\": 0.40\n}}"""
        try:
            resp = self.client.chat.completions.create(
                model="openai/gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
            )
            content = resp.choices[0].message.content
            data = json.loads(content)
            types_count: Dict[str, int] = {}
            for item in data.get("reflective_utterances", []):
                rtype = item.get("type", "unknown")
                types_count[rtype] = types_count.get(rtype, 0) + 1
            return {
                "reflective_rate": data.get("reflective_rate", 0.0),
                "reflective_count": data.get("reflective_count", 0),
                "total_count": data.get("total_count", len(therapist_utterances)),
                "types": types_count,
                "examples": data.get("reflective_utterances", [])[:5],
            }
        except Exception as e:  # noqa: BLE001
            print(f"反映性语言检测失败: {e}")
            return {"reflective_rate": 0.0, "types": {}, "examples": []}

    def _calculate_cognitive_empathy(
        self,
        transcript: List[Dict[str, Any]],
        core_issues: List[Dict[str, Any]],
        reflective_language: Dict[str, Any],
    ) -> Dict[str, Any]:
        reflective_score = min(
            float(reflective_language.get("reflective_rate", 0.0)), 1.0
        )
        # 这里 understanding_score 暂时用常数占位，你后续可以根据 alignment_analysis 细化
        understanding_score = 0.7
        cognitive_empathy_score = 0.6 * reflective_score + 0.4 * understanding_score
        return {
            "cognitive_empathy_score": round(cognitive_empathy_score, 2),
            "reflective_component": round(reflective_score, 2),
            "understanding_component": round(understanding_score, 2),
            "interpretation": self._interpret_cognitive_empathy(cognitive_empathy_score),
        }

    def _analyze_response_timing(
        self, transcript: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        latencies: List[float] = []
        interruptions = 0
        for i in range(len(transcript) - 1):
            cur = transcript[i]
            nxt = transcript[i + 1]
            if cur.get("speaker") != nxt.get("speaker"):
                latency = float(nxt.get("start", 0.0)) - float(cur.get("end", 0.0))
                latencies.append(latency)
                if latency < 0.2:
                    interruptions += 1
        avg_latency = sum(latencies) / len(latencies) if latencies else 0.0
        return {
            "avg_response_latency": round(avg_latency, 2),
            "interruption_count": interruptions,
            "interpretation": self._interpret_timing(avg_latency, interruptions),
        }

    def _generate_clinical_insights(
        self,
        core_issues: List[Dict[str, Any]],
        alignment_analysis: List[Dict[str, Any]],
        reflective_language: Dict[str, Any],
    ) -> Dict[str, Any]:
        addressed = {
            a.get("addressed_issue")
            for a in alignment_analysis
            if float(a.get("alignment_score", 0.0)) > 0.5
        }
        addressed.discard(None)
        unaddressed = [
            issue.get("issue")
            for issue in core_issues
            if issue.get("issue") not in addressed
        ]
        adequate = (
            "充分" if float(reflective_language.get("reflective_rate", 0.0)) > 0.4 else "不足"
        )
        key_rec = (
            f"建议在下次会话重点关注：{', '.join(unaddressed)}" if unaddressed else "核心议题覆盖良好"
        )
        return {
            "addressed_core_issues": list(addressed),
            "unaddressed_issues": unaddressed,
            "reflective_language_adequacy": adequate,
            "key_recommendation": key_rec,
        }

    # ===== 解释函数 =====

    def _interpret_alignment(self, score: float) -> str:
        if score >= 0.7:
            return "高度契合（治疗师精准把握患者需求）"
        if score >= 0.5:
            return "中度契合"
        if score >= 0.4:
            return "契合度偏低（需关注）"
        return "契合度不足（建议督导介入）"

    def _interpret_cognitive_empathy(self, score: float) -> str:
        if score >= 0.7:
            return "认知共情良好（理解并有效反映）"
        if score >= 0.5:
            return "认知共情中等"
        return "认知共情不足"

    def _interpret_timing(self, avg_latency: float, interruptions: int) -> str:
        if interruptions > 5:
            return "频繁打断，可能影响患者表达"
        if avg_latency < 0.5:
            return "响应迅速，但需注意是否给予足够思考空间"
        if avg_latency < 2.0:
            return "响应时机适当"
        return "响应较慢，可能影响对话流畅性"
