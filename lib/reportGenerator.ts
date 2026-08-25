import type {
  AnswersMap,
  BlindSpotInsight,
  InterviewKitItem,
  Question,
  ReportData,
  StrengthInsight,
  Track,
} from "./types";
import { FYI_DIMENSIONS } from "./fyiDimensions";
import { scoreDimensions, sortByScoreDesc } from "./scoring";

/**
 * 基于 FYI 理论生成面试官洞察报告：
 * - Borda 计分 → 6 大维度 0–100 指数
 * - Top 2 核心优势 + 过载风险
 * - Bottom 2 潜在盲点/发展区 + 发展建议
 * - 面试官定制 STAR 追问指南（最低 2 维 + 最高 1 维，共 3 问）
 */
export function generateReport(input: {
  candidateName: string;
  email: string;
  position: string;
  track: Track;
  questions: Question[];
  answers: AnswersMap;
}): ReportData {
  const { candidateName, email, position, track, questions, answers } = input;
  const scores = scoreDimensions(questions, answers, track);
  const sortedDesc = sortByScoreDesc(scores);

  const top2 = sortedDesc.slice(0, 2);
  const bottom2 = sortedDesc.slice(-2).reverse(); // [最低, 次低]

  const strengths: StrengthInsight[] = top2.map((s) => {
    const d = FYI_DIMENSIONS[s.key];
    return {
      key: s.key,
      label: d.label,
      fyiname: d.fyiname,
      normalized: s.normalized,
      strength: d.strength,
      overuseRisk: d.overuseRisk,
    };
  });

  const blindSpots: BlindSpotInsight[] = bottom2.map((s) => {
    const d = FYI_DIMENSIONS[s.key];
    return {
      key: s.key,
      label: d.label,
      fyiname: d.fyiname,
      normalized: s.normalized,
      blindSpot: d.blindSpot,
      developmentTip: d.developmentTip,
    };
  });

  // 面试追问目标：最低 2 维（盲点）+ 最高 1 维（过载风险探测）
  const lowest = sortedDesc[5];
  const secondLowest = sortedDesc[4];
  const highest = sortedDesc[0];

  const interviewKit: InterviewKitItem[] = [
    {
      key: lowest.key,
      label: FYI_DIMENSIONS[lowest.key].label,
      fyiname: FYI_DIMENSIONS[lowest.key].fyiname,
      normalized: lowest.normalized,
      focusReason: "核心发展盲点",
      question: FYI_DIMENSIONS[lowest.key].interviewQuestions[0],
    },
    {
      key: secondLowest.key,
      label: FYI_DIMENSIONS[secondLowest.key].label,
      fyiname: FYI_DIMENSIONS[secondLowest.key].fyiname,
      normalized: secondLowest.normalized,
      focusReason: "次要发展区",
      question: FYI_DIMENSIONS[secondLowest.key].interviewQuestions[0],
    },
    {
      key: highest.key,
      label: FYI_DIMENSIONS[highest.key].label,
      fyiname: FYI_DIMENSIONS[highest.key].fyiname,
      normalized: highest.normalized,
      focusReason: "优势过载风险探测",
      question: FYI_DIMENSIONS[highest.key].interviewQuestions[1],
    },
  ];

  return {
    candidateName,
    email,
    position,
    trackId: track.id,
    trackName: track.name,
    trackEnName: track.enName,
    generatedAt: new Date().toISOString(),
    questionCount: questions.length,
    scores,
    strengths,
    blindSpots,
    interviewKit,
  };
}

/** 生成可复制的面试摘要文本 */
export function buildSummaryText(report: ReportData): string {
  const lines: string[] = [];
  lines.push(`【职场胜任力测评报告】`);
  lines.push(`候选人：${report.candidateName}`);
  lines.push(`邮箱：${report.email || "未填写"}`);
  lines.push(`应聘岗位：${report.position || "未填写"}`);
  lines.push(`测评套件：${report.trackName} (${report.trackEnName})`);
  lines.push(`生成时间：${new Date(report.generatedAt).toLocaleString("zh-CN")}`);
  lines.push(``);
  lines.push(`— 六维胜任力指数（0–100）—`);
  const sorted = sortByScoreDesc(report.scores);
  sorted.forEach((s, i) => {
    lines.push(
      `${i + 1}. ${s.label}（${s.fyiname}）：${s.normalized} 分`
    );
  });
  lines.push(``);
  lines.push(`— 核心优势（Top 2）—`);
  report.strengths.forEach((s) => {
    lines.push(`◆ ${s.label}（${s.fyiname}）${s.normalized} 分`);
    lines.push(`  ${s.strength}`);
    lines.push(`  过载风险：${s.overuseRisk}`);
  });
  lines.push(``);
  lines.push(`— 潜在盲点 / 发展区（Bottom 2）—`);
  report.blindSpots.forEach((b) => {
    lines.push(`◆ ${b.label}（${b.fyiname}）${b.normalized} 分`);
    lines.push(`  ${b.blindSpot}`);
    lines.push(`  发展建议：${b.developmentTip}`);
  });
  lines.push(``);
  lines.push(`— 面试官 STAR 追问指南 —`);
  report.interviewKit.forEach((item, i) => {
    lines.push(
      `${i + 1}. [${item.focusReason}] ${item.label}（${item.fyiname}）`
    );
    lines.push(`  追问：${item.question.prompt}`);
    lines.push(`  ✅ Green Flag：${item.question.greenFlags.join("；")}`);
    lines.push(`  ⚠️ Red Flag：${item.question.redFlags.join("；")}`);
  });
  return lines.join("\n");
}
