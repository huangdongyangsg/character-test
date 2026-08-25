// 全局类型定义 —— 贯穿整个测评系统

export type TrackId = "campus" | "sales" | "tech" | "leadership";

/** 测评套件的视觉主题（静态 Tailwind class，保证可被扫描） */
export interface TrackTheme {
  gradient: string;
  text: string;
  bg: string;
  border: string;
  chip: string;
  button: string;
  dot: string;
}

/** 测评套件元数据 */
export interface Track {
  id: TrackId;
  name: string;
  enName: string;
  tagline: string;
  audience: string;
  description: string;
  /** 考察的 6 个 FYI 维度 key（与 questionBank 中的选项一一对应） */
  dimensions: string[];
  theme: TrackTheme;
}

/** FYI 胜任力维度 */
export interface FyiDimension {
  key: string;
  /** Korn Ferry《FYI: For Your Improvement》英文胜任力名称 */
  fyiname: string;
  /** 中文短标签 */
  label: string;
  /** FYI 定义 */
  definition: string;
  /** 当该维度为优势时的行为风格描述 */
  strength: string;
  /** 过度使用该特质可能导致的过载风险 */
  overuseRisk: string;
  /** 当该维度较弱时可能暴露的能力短板场景 */
  blindSpot: string;
  /** 发展建议 */
  developmentTip: string;
  /** 面试官 STAR 追问问题 */
  interviewQuestions: InterviewQuestion[];
}

export interface InterviewQuestion {
  prompt: string;
  greenFlags: string[];
  redFlags: string[];
}

/** 单个行动选项 */
export interface Option {
  id: string;
  dimensionKey: string;
  text: string;
}

/** 情境题 */
export interface Question {
  id: string;
  trackId: TrackId;
  scenario: string;
  /** 6 个选项，严格一一对应套件的 6 个维度 */
  options: Option[];
}

/** 排序结果：option id 的数组，index 0 = Rank 1 */
export type Ranking = string[];
export type AnswersMap = Record<string, Ranking>;

/** 单维度得分 */
export interface DimensionScore {
  key: string;
  label: string;
  fyiname: string;
  /** Borda 原始累计分 */
  rawScore: number;
  /** 满分 */
  maxScore: number;
  /** 标准化 0–100 指数 */
  normalized: number;
  /** 排名 1..6（1 为最高） */
  rank: number;
}

export interface StrengthInsight {
  key: string;
  label: string;
  fyiname: string;
  normalized: number;
  strength: string;
  overuseRisk: string;
}

export interface BlindSpotInsight {
  key: string;
  label: string;
  fyiname: string;
  normalized: number;
  blindSpot: string;
  developmentTip: string;
}

export interface InterviewKitItem {
  key: string;
  label: string;
  fyiname: string;
  normalized: number;
  focusReason: string;
  question: InterviewQuestion;
}

/** 最终报告数据 */
export interface ReportData {
  candidateName: string;
  email: string;
  position: string;
  trackId: TrackId;
  trackName: string;
  trackEnName: string;
  generatedAt: string;
  questionCount: number;
  scores: DimensionScore[];
  strengths: StrengthInsight[];
  blindSpots: BlindSpotInsight[];
  interviewKit: InterviewKitItem[];
}

/** 会话信息（选轨页 → 答题页） */
export interface SessionData {
  candidateName: string;
  email: string;
  position: string;
  trackId: TrackId;
}
