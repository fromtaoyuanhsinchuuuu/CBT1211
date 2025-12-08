from typing import Dict, List, Any


class EmpathyCompositeCalculator:
    """共情综合评分计算器（Emotion + Language 综合）。

    输入：
    - emotion_sync_data: 来自 AdvancedEmotionSynchronyCalculator 的结果
    - semantic_alignment_data: 来自 AdvancedSemanticAlignmentCalculator 的结果
    - linguistic_mirroring_data: 语言镜像的简要结果（可选）

    输出：
    - empathy_composite_score: 0-100
    - grade: A/B/C/D/F
    - components: 各子维度得分（0-100）
    - interpretation: 文本解释
    - clinical_recommendations: 建议列表
    """

    def calculate(
        self,
        emotion_sync_data: Dict[str, Any],
        semantic_alignment_data: Dict[str, Any],
        linguistic_mirroring_data: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        reflective_rate = float(
            semantic_alignment_data.get("reflective_language", {}).get("reflective_rate", 0.0)
        )
        semantic_alignment = float(semantic_alignment_data.get("overall_alignment", 0.0))
        cognitive_empathy = float(
            semantic_alignment_data.get("cognitive_empathy", {}).get(
                "cognitive_empathy_score", 0.0
            )
        )

        empathy_ind = emotion_sync_data.get("empathy_indicators", {})
        healthy_sync = float(empathy_ind.get("healthy_sync_score", 0.0))
        stability_score = float(empathy_ind.get("stability_score", 0.0))
        over_sync_penalty = float(
            emotion_sync_data.get("over_synchronization_risk", {}).get("risk_score", 0.0)
        )

        weights = {
            "reflective": 0.25,
            "semantic": 0.25,
            "cognitive": 0.15,
            "sync": 0.15,
            "stability": 0.15,
            "over_sync_penalty": 0.05,
        }

        empathy_score_0_1 = (
            weights["reflective"] * reflective_rate
            + weights["semantic"] * semantic_alignment
            + weights["cognitive"] * cognitive_empathy
            + weights["sync"] * healthy_sync
            + weights["stability"] * stability_score
            - weights["over_sync_penalty"] * over_sync_penalty
        )
        empathy_score_0_1 = max(0.0, min(1.0, empathy_score_0_1))
        empathy_score = empathy_score_0_1 * 100.0

        grade = self._get_grade(empathy_score)
        interpretation = self._interpret_score(empathy_score)
        recommendations = self._generate_recommendations(
            empathy_score,
            {
                "reflective_rate": reflective_rate,
                "over_sync_penalty": over_sync_penalty,
                "semantic_alignment": semantic_alignment,
            },
        )

        return {
            "empathy_composite_score": round(empathy_score, 1),
            "grade": grade,
            "components": {
                "reflective_language": round(reflective_rate * 100.0, 1),
                "semantic_alignment": round(semantic_alignment * 100.0, 1),
                "cognitive_empathy": round(cognitive_empathy * 100.0, 1),
                "healthy_synchrony": round(healthy_sync * 100.0, 1),
                "emotional_stability": round(stability_score * 100.0, 1),
                "over_sync_risk": round(over_sync_penalty * 100.0, 1),
            },
            "interpretation": interpretation,
            "clinical_recommendations": recommendations,
        }

    # ===== 评分解释 =====

    def _get_grade(self, score: float) -> str:
        if score >= 85:
            return "A（优秀）"
        if score >= 70:
            return "B（良好）"
        if score >= 60:
            return "C（合格）"
        if score >= 50:
            return "D（需改进）"
        return "F（需督导介入）"

    def _interpret_score(self, score: float) -> str:
        if score >= 85:
            return "治疗师展现出高水平的共情能力，有效理解并回应患者需求，同时保持专业边界"
        if score >= 70:
            return "共情能力良好，但仍有提升空间"
        if score >= 60:
            return "基本的共情能力，建议加强反映性语言和情绪调节"
        if score >= 50:
            return "共情能力不足，建议参加专业培训或督导"
        return "共情能力严重不足或存在过度卷入风险，强烈建议督导介入"

    def _generate_recommendations(
        self, score: float, components: Dict[str, float]
    ) -> List[str]:
        recs: List[str] = []
        if components.get("reflective_rate", 0.0) < 0.3:
            recs.append("增加反映性语言的使用（情绪标注、内容复述）")
        if components.get("over_sync_penalty", 0.0) > 0.5:
            recs.append("注意情绪边界管理，避免被患者情绪过度影响")
        if components.get("semantic_alignment", 0.0) < 0.5:
            recs.append("加强对患者核心议题的理解和回应")
        if score < 60:
            recs.append("建议在下次督导中重点讨论共情技术的运用")
        return recs if recs else ["继续保持当前良好的共情实践"]
