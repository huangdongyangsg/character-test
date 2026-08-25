import type { AnswersMap, DimensionScore, Question, Track } from "./types";
import { FYI_DIMENSIONS } from "./fyiDimensions";

/**
 * Borda 计分：
 * Rank 1 得 6 分，Rank 2 得 5 分 … Rank 6 得 1 分。
 * 遍历所有题目后累计每个维度的得分，并标准化为 0–100 指数。
 *
 * 标准化公式：normalized = round((raw - n) / (5 * n) * 100)
 * 其中 n 为有效题目数，raw 取值范围 [n, 6n]。
 */
export function scoreDimensions(
  questions: Question[],
  answers: AnswersMap,
  track: Track
): DimensionScore[] {
  const n = questions.length || 1;
  const totals: Record<string, number> = {};
  track.dimensions.forEach((k) => (totals[k] = 0));

  for (const q of questions) {
    const order = answers[q.id] ?? q.options.map((o) => o.id);
    order.forEach((optionId, idx) => {
      const rank = idx + 1; // 1..6
      const points = 6 - rank + 1; // rank1=6 ... rank6=1
      const opt = q.options.find((o) => o.id === optionId);
      if (opt) {
        totals[opt.dimensionKey] = (totals[opt.dimensionKey] ?? 0) + points;
      }
    });
  }

  const maxScore = 6 * n;
  const scores: DimensionScore[] = track.dimensions.map((key) => {
    const raw = totals[key] ?? 0;
    const normalized = Math.round(((raw - n) / (5 * n)) * 100);
    const dim = FYI_DIMENSIONS[key];
    return {
      key,
      label: dim?.label ?? key,
      fyiname: dim?.fyiname ?? key,
      rawScore: raw,
      maxScore,
      normalized: Math.max(0, Math.min(100, normalized)),
      rank: 0,
    };
  });

  const sorted = [...scores].sort((a, b) => b.normalized - a.normalized);
  sorted.forEach((s, i) => (s.rank = i + 1));

  return scores;
}

/** 返回按分数降序排列的得分（不改动原始顺序数组） */
export function sortByScoreDesc(scores: DimensionScore[]): DimensionScore[] {
  return [...scores].sort((a, b) => b.normalized - a.normalized);
}
