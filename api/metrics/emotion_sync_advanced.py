import numpy as np
from scipy.stats import pearsonr
from dtaidistance import dtw
from typing import List, Dict, Tuple


class AdvancedEmotionSynchronyCalculator:
    """升级版情绪同步分析器（独立模块）。

    功能：
    - 构建治疗师/患者的情绪时间曲线
    - 即时同步（Pearson）
    - 滞后同步（不同 lag 下的相关）
    - DTW 相似度
    - 治疗师情绪稳定性
    - 过度同化风险
    - Permutation test 显著性
    """

    def __init__(self, time_window: int = 10, max_lag: int = 3) -> None:
        self.time_window = time_window
        self.max_lag = max_lag

    # ===== 对外主入口 =====

    def calculate(self, emotion_timeline: List[Dict]) -> Dict:
        """完整的情绪同步分析入口。"""
        if not emotion_timeline:
            return self._empty_result()

        therapist_curve, patient_curve, time_bins = self._build_emotion_curves(
            emotion_timeline
        )

        instant_sync = self._calculate_instant_sync(therapist_curve, patient_curve)
        lagged_sync = self._calculate_lagged_sync(therapist_curve, patient_curve)
        dtw_similarity = self._calculate_dtw_similarity(therapist_curve, patient_curve)
        therapist_stability = self._analyze_therapist_stability(
            therapist_curve, patient_curve
        )
        over_sync_risk = self._detect_over_synchronization(
            therapist_curve, patient_curve, emotion_timeline
        )
        empathy_indicators = self._synthesize_empathy_indicators(
            instant_sync, lagged_sync, therapist_stability, over_sync_risk
        )
        significance_test = self._permutation_test(therapist_curve, patient_curve)

        return {
            "instant_sync": instant_sync,
            "lagged_sync": lagged_sync,
            "dtw_similarity": dtw_similarity,
            "therapist_stability": therapist_stability,
            "over_synchronization_risk": over_sync_risk,
            "empathy_indicators": empathy_indicators,
            "significance_test": significance_test,
            "visualization_data": {
                "time_bins": time_bins.tolist(),
                "therapist_curve": therapist_curve.tolist(),
                "patient_curve": patient_curve.tolist(),
            },
        }

    # ===== 内部步骤 =====

    def _build_emotion_curves(
        self, emotion_timeline: List[Dict]
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """构建治疗师/患者的情绪时间曲线。"""
        max_time = max(e["timestamp"] for e in emotion_timeline)
        time_bins = np.arange(0, max_time + self.time_window, self.time_window)

        therapist_vals: List[float] = []
        patient_vals: List[float] = []

        for t in time_bins:
            t_vs = [
                e["valence"]
                for e in emotion_timeline
                if e["speaker"] == "therapist" and t <= e["timestamp"] < t + self.time_window
            ]
            p_vs = [
                e["valence"]
                for e in emotion_timeline
                if e["speaker"] == "patient" and t <= e["timestamp"] < t + self.time_window
            ]
            therapist_vals.append(float(np.mean(t_vs)) if t_vs else 0.0)
            patient_vals.append(float(np.mean(p_vs)) if p_vs else 0.0)

        return (
            np.array(therapist_vals, dtype=float),
            np.array(patient_vals, dtype=float),
            time_bins,
        )

    def _calculate_instant_sync(
        self, therapist_curve: np.ndarray, patient_curve: np.ndarray
    ) -> Dict:
        if len(therapist_curve) < 2 or len(patient_curve) < 2:
            return {
                "correlation": 0.0,
                "p_value": 1.0,
                "significance": "数据不足",
                "interpretation": "数据不足",
            }
        r, p = pearsonr(therapist_curve, patient_curve)
        r = float(r)
        p = float(p)
        return {
            "correlation": round(r, 3),
            "p_value": round(p, 4),
            "significance": "显著" if p < 0.05 else "不显著",
            "interpretation": self._interpret_correlation(r),
        }

    def _calculate_lagged_sync(
        self, therapist_curve: np.ndarray, patient_curve: np.ndarray
    ) -> Dict:
        lag_range = range(-self.max_lag, self.max_lag + 1)
        correlations: List[Dict[str, float]] = []

        for lag in lag_range:
            if lag == 0:
                r, _ = pearsonr(therapist_curve, patient_curve)
            elif lag > 0:
                t_shifted = therapist_curve[lag:]
                p_base = patient_curve[:-lag]
                if len(t_shifted) > 2:
                    r, _ = pearsonr(t_shifted, p_base)
                else:
                    r = 0.0
            else:
                p_shifted = patient_curve[-lag:]
                t_base = therapist_curve[:lag]
                if len(p_shifted) > 2:
                    r, _ = pearsonr(t_base, p_shifted)
                else:
                    r = 0.0
            correlations.append(
                {"lag_seconds": lag * self.time_window, "correlation": round(float(r), 3)}
            )

        best = max(correlations, key=lambda x: abs(x["correlation"]))
        return {
            "best_correlation": best["correlation"],
            "optimal_lag_seconds": best["lag_seconds"],
            "lag_interpretation": self._interpret_lag(float(best["lag_seconds"])),
            "all_lags": correlations,
        }

    def _calculate_dtw_similarity(
        self, therapist_curve: np.ndarray, patient_curve: np.ndarray
    ) -> Dict:
        try:
            distance = float(dtw.distance(therapist_curve, patient_curve))
            max_possible = float(np.sqrt(len(therapist_curve)) * 2.0) or 1.0
            similarity = max(0.0, 1.0 - distance / max_possible)
            return {
                "dtw_distance": round(distance, 2),
                "similarity_score": round(similarity, 3),
                "interpretation": (
                    "高度相似" if similarity > 0.7 else "中度相似" if similarity > 0.4 else "相似度低"
                ),
            }
        except Exception as e:  # noqa: BLE001
            print(f"DTW 计算失败: {e}")
            return {"dtw_distance": None, "similarity_score": 0.0, "interpretation": "计算失败"}

    def _analyze_therapist_stability(
        self, therapist_curve: np.ndarray, patient_curve: np.ndarray
    ) -> Dict:
        t_vol = float(np.std(therapist_curve))
        p_vol = float(np.std(patient_curve))
        ratio = t_vol / p_vol if p_vol > 0 else 0.0

        if ratio < 0.5:
            level, color = "优秀", "🟢"
        elif ratio < 0.8:
            level, color = "良好", "🔵"
        elif ratio < 1.2:
            level, color = "需关注", "🟡"
        else:
            level, color = "风险（可能过度卷入）", "🔴"

        return {
            "therapist_volatility": round(t_vol, 3),
            "patient_volatility": round(p_vol, 3),
            "volatility_ratio": round(ratio, 2),
            "stability_level": level,
            "stability_color": color,
            "interpretation": self._interpret_stability(ratio),
        }

    def _detect_over_synchronization(
        self,
        therapist_curve: np.ndarray,
        patient_curve: np.ndarray,
        emotion_timeline: List[Dict],
    ) -> Dict:
        negative_idx = [
            i for i, p_val in enumerate(patient_curve) if p_val < -0.3
        ]
        if negative_idx:
            t_neg = therapist_curve[negative_idx]
            p_neg = patient_curve[negative_idx]
            if len(t_neg) > 1 and len(p_neg) > 1:
                r_neg, _ = pearsonr(t_neg, p_neg)
            else:
                r_neg = 0.0
            t_neg_vol = float(np.std(t_neg))
        else:
            r_neg = 0.0
            t_neg_vol = 0.0

        t_vol = float(np.std(therapist_curve))
        p_vol = float(np.std(patient_curve))

        risk_score = 0.0
        factors: List[str] = []

        if r_neg > 0.7:
            risk_score += 0.4
            factors.append("在负性情绪区域高度同步")
        if p_vol > 0 and t_vol > p_vol * 0.8:
            risk_score += 0.3
            factors.append("治疗师情绪波动接近患者水平")
        if t_vol > 0 and t_neg_vol > t_vol * 1.2:
            risk_score += 0.3
            factors.append("治疗师在患者负性情绪时波动加剧")

        if risk_score >= 0.7:
            level, color = "高风险", "🔴"
            rec = "强烈建议督导介入，评估治疗师是否出现过度卷入或替代性创伤"
        elif risk_score >= 0.4:
            level, color = "中风险", "🟡"
            rec = "建议在督导中讨论情绪边界管理"
        else:
            level, color = "低风险", "🟢"
            rec = "情绪调节良好"

        return {
            "risk_score": round(risk_score, 2),
            "risk_level": level,
            "risk_color": color,
            "risk_factors": factors,
            "negative_sync_correlation": round(float(r_neg), 3),
            "therapist_negative_volatility": round(t_neg_vol, 3),
            "recommendation": rec,
        }

    def _synthesize_empathy_indicators(
        self,
        instant_sync: Dict,
        lagged_sync: Dict,
        therapist_stability: Dict,
        over_sync_risk: Dict,
    ) -> Dict:
        healthy = 0.0
        if lagged_sync.get("optimal_lag_seconds", 0) > 0:
            healthy = max(0.0, float(lagged_sync.get("best_correlation", 0.0)))

        stability = max(0.0, 1.0 - float(therapist_stability.get("volatility_ratio", 0.0)))
        penalty = float(over_sync_risk.get("risk_score", 0.0))

        score = 0.4 * healthy + 0.4 * stability - 0.2 * penalty
        score = max(0.0, min(1.0, score))

        return {
            "empathy_emotion_score": round(score, 2),
            "healthy_sync_score": round(healthy, 2),
            "stability_score": round(stability, 2),
            "over_sync_penalty": round(penalty, 2),
            "interpretation": self._interpret_empathy_score(score),
        }

    def _permutation_test(
        self,
        therapist_curve: np.ndarray,
        patient_curve: np.ndarray,
        n_permutations: int = 1000,
    ) -> Dict:
        if len(therapist_curve) < 2 or len(patient_curve) < 2:
            return {
                "observed_correlation": 0.0,
                "permutation_p_value": 1.0,
                "z_score": 0.0,
                "is_significant": False,
                "interpretation": "数据不足",
            }

        obs_r, _ = pearsonr(therapist_curve, patient_curve)
        obs_r = float(obs_r)

        perms: List[float] = []
        for _ in range(n_permutations):
            shuffled = np.random.permutation(therapist_curve)
            r_perm, _ = pearsonr(shuffled, patient_curve)
            perms.append(float(r_perm))

        arr = np.array(perms, dtype=float)
        p_val = float(np.mean(np.abs(arr) >= abs(obs_r)))
        mean = float(np.mean(arr))
        std = float(np.std(arr))
        z = (obs_r - mean) / std if std > 0 else 0.0

        return {
            "observed_correlation": round(obs_r, 3),
            "permutation_p_value": round(p_val, 4),
            "z_score": round(z, 2),
            "is_significant": p_val < 0.05,
            "interpretation": (
                f"观察到的同步显著高于随机水平（z={z:.2f}, p={p_val:.4f}）"
                if p_val < 0.05
                else "观察到的同步可能由随机因素导致"
            ),
        }

    # ===== 文本解释 & 空结果 =====

    def _interpret_correlation(self, r: float) -> str:
        if r > 0.7:
            return "高度同步"
        if r > 0.4:
            return "中度同步"
        if r > 0:
            return "弱同步"
        if r > -0.4:
            return "不同步"
        return "反向情绪（需警惕）"

    def _interpret_lag(self, lag_seconds: float) -> str:
        if lag_seconds > 10:
            return "治疗师情绪响应存在明显延迟（可能是深思熟虑或疏离）"
        if lag_seconds > 0:
            return "治疗师情绪适度跟随患者（典型的共情响应模式）"
        if lag_seconds == 0:
            return "即时情绪共鸣"
        return "治疗师情绪领先于患者（可能在引导情绪）"

    def _interpret_stability(self, ratio: float) -> str:
        if ratio < 0.5:
            return "治疗师情绪高度稳定，有效调节"
        if ratio < 0.8:
            return "治疗师情绪基本稳定"
        if ratio < 1.2:
            return "治疗师情绪波动较大，需关注边界管理"
        return "治疗师可能被患者情绪过度影响"

    def _interpret_empathy_score(self, score: float) -> str:
        if score >= 0.7:
            return "健康的共情模式（情绪同步 + 专业边界）"
        if score >= 0.5:
            return "中等共情水平"
        if score >= 0.3:
            return "共情不足或过度同化风险"
        return "共情问题明显，建议督导介入"

    def _empty_result(self) -> Dict:
        return {
            "instant_sync": {"correlation": 0.0, "interpretation": "数据不足"},
            "lagged_sync": {"best_correlation": 0.0, "optimal_lag_seconds": 0},
            "dtw_similarity": {"dtw_distance": None, "similarity_score": 0.0, "interpretation": "数据不足"},
            "therapist_stability": {},
            "over_synchronization_risk": {},
            "empathy_indicators": {"empathy_emotion_score": 0.0},
            "significance_test": {},
            "visualization_data": {"time_bins": [], "therapist_curve": [], "patient_curve": []},
        }
