import type {
  AnswersMap,
  ConsistencyReport,
  DimensionScore,
  Question,
  Track,
} from "./types";
import { FYI_DIMENSIONS } from "./fyiDimensions";

/**
 * Borda 计分（通用，支持任意选项数）：
 * Rank 1 得 rankCount 分，Rank 2 得 rankCount-1 分 … 最后一名得 1 分。
 * 遍历所有题目后累计每个维度的得分，并标准化为 0–100 指数。
 *
 * 标准化公式：normalized = round((raw - n) / ((rankCount - 1) * n) * 100)
 */
export function scoreDimensions(
  questions: Question[],
  answers: AnswersMap,
  track: Track
): DimensionScore[] {
  const n = questions.length || 1;
  const rankCount = questions[0]?.options.length || 8;
  const totals: Record<string, number> = {};
  track.dimensions.forEach((k) => (totals[k] = 0));

  for (const q of questions) {
    const order = answers[q.id] ?? q.options.map((o) => o.id);
    order.forEach((optionId, idx) => {
      const rank = idx + 1;
      const points = rankCount - rank + 1;
      const opt = q.options.find((o) => o.id === optionId);
      if (opt) totals[opt.dimensionKey] = (totals[opt.dimensionKey] ?? 0) + points;
    });
  }

  const maxScore = rankCount * n;
  const scores: DimensionScore[] = track.dimensions.map((key) => {
    const raw = totals[key] ?? 0;
    const normalized = Math.round(((raw - n) / ((rankCount - 1) * n)) * 100);
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

/**
 * 答题真实性与一致性防作弊指数：
 * 1) 一致性：统计每个维度跨题目的排名标准差，越低越内洽，映射为 0–100。
 * 2) 直线作答：检测候选人是否反复使用相同的排序模式（未认真阅读情境）。
 */
export function computeConsistency(
  questions: Question[],
  answers: AnswersMap,
  track: Track
): ConsistencyReport {
  const rankCount = questions[0]?.options.length || 8;
  const rankByDim: Record<string, number[]> = {};
  track.dimensions.forEach((k) => (rankByDim[k] = []));

  for (const q of questions) {
    const order = answers[q.id] ?? q.options.map((o) => o.id);
    order.forEach((optionId, idx) => {
      const rank = idx + 1;
      const opt = q.options.find((o) => o.id === optionId);
      if (opt && rankByDim[opt.dimensionKey]) {
        rankByDim[opt.dimensionKey].push(rank);
      }
    });
  }

  const stds = track.dimensions.map((k) => {
    const ranks = rankByDim[k] ?? [];
    if (ranks.length === 0) return 0;
    const mean = ranks.reduce((a, b) => a + b, 0) / ranks.length;
    const variance =
      ranks.reduce((a, b) => a + (b - mean) * (b - mean), 0) / ranks.length;
    return Math.sqrt(variance);
  });
  const avgStd = stds.reduce((a, b) => a + b, 0) / (stds.length || 1);
  const maxStd = Math.sqrt((rankCount * rankCount - 1) / 12); // 均匀分布标准差
  const score = Math.round(
    Math.max(0, Math.min(100, 100 - (avgStd / maxStd) * 100))
  );

  // 直线作答检测
  const patterns = new Set<string>();
  for (const q of questions) {
    const order = answers[q.id] ?? q.options.map((o) => o.id);
    const pattern = order
      .map((id) => q.options.find((o) => o.id === id)?.dimensionKey ?? "")
      .join("|");
    patterns.add(pattern);
  }
  const distinctRatio = patterns.size / Math.max(1, questions.length);

  let label = "极高";
  let flagType: ConsistencyReport["flagType"] = "ok";
  if (score < 55) {
    label = "较低";
    flagType = "danger";
  } else if (score < 70) {
    label = "中等";
    flagType = "warn";
  } else if (score < 85) {
    label = "良好";
  }

  let flag: string;
  if (flagType === "danger") {
    flag = "作答一致性偏低，可能存在随机作答或未认真阅读情境，建议结合面试验证。";
  } else if (flagType === "warn") {
    flag = "作答存在一定波动，建议对关键维度做针对性追问验证。";
  } else {
    flag = "作答逻辑高度内洽，信度良好。";
  }

  if (distinctRatio <= 0.25 && questions.length >= 4) {
    flag += " 另检测到排序模式高度重复，存在「直线作答」风险。";
    if (flagType === "ok") flagType = "warn";
  }

  return { score, label, flag, flagType };
}

