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
  /** 考察的 8 个胜任力维度 key（与 questionBank 中的选项一一对应） */
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
  /** 8 个选项，严格一一对应套件的 8 个维度 */
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
  /** 排名 1..8（1 为最高） */
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

/** 高管画像核心标签与一句话总结 */
export interface ArchetypeSummary {
  tags: string[];
  summary: string;
}

/** Top 4 胜任力高亮卡 */
export interface StatCard {
  key: string;
  label: string;
  fyiname: string;
  normalized: number;
}

/** 单个职场元动力的倾向 */
export interface DynamicLean {
  title: string;
  lean: string;
  description: string;
}

/** 底层驱动力与价值观 */
export interface DriverDynamics {
  title: string;
  primary: string;
  secondary: string;
  weaker: string;
  description: string;
}

/** 四大深度职场工作元动力 */
export interface WorkplaceDynamics {
  decisionLogic: DynamicLean;
  leadership: DynamicLean;
  communication: DynamicLean;
  drivers: DriverDynamics;
}

/** 胜任力过载风险 */
export interface OveruseRisk {
  key: string;
  label: string;
  fyiname: string;
  normalized: number;
  overuseRisk: string;
}

/** 角色与工作环境匹配度 */
export interface RoleFit {
  highFit: string[];
  lowFit: string[];
  bestEnv: string;
  frictionEnv: string;
}

export type FlagType = "ok" | "warn" | "danger";

/** 答题真实性与一致性防作弊指数 */
export interface ConsistencyReport {
  score: number;
  label: string;
  flag: string;
  flagType: FlagType;
}

/** 最终报告数据（16 大白话模块） */
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
  consistency: ConsistencyReport;
  exec: ExecModule;
  role: RoleModule;
  stage: StageModule;
  competency: CompetencyModule;
  talents: TalentsModule;
  personality: PersonalityModule;
  thinking: ThinkingModule;
  motivation: MotivationModule;
  values: ValuesModule;
  preferences: PreferencesModule;
  conflict: ConflictModule;
  risk: RiskModule;
  crisis: CrisisModule;
  team: TeamModule;
  onboarding: OnboardingModule;
  interview: InterviewModule;
}

export interface ExecModule {
  callout: string;
  code: string;
  codeEn: string;
  takeaways: Takeaway[];
}

export interface RoleModule {
  callout: string;
  topRoles: RoleRec[];
  cautionRoles: RoleRec[];
}

export interface StageFit {
  name: string;
  score: number;
  desc: string;
}

export interface StageModule {
  callout: string;
  stages: StageFit[];
}

export interface CompetencyModule {
  callout: string;
  items: CompetencyItem[];
}

export interface TalentsModule {
  callout: string;
  talents: { label: string; en: string; desc: string }[];
  battleTypes: string[];
}

export interface PersonalityModule {
  callout: string;
  style: string;
  styleEn: string;
  styleDesc: string;
  dims: { name: string; score: number }[];
}

export interface ThinkingModule {
  callout: string;
  macroLean: string;
  macroDesc: string;
  resourceLogic: string;
}

export interface MotivationModule {
  callout: string;
  drivers: MotivationDriver[];
  fitEnv: string;
  chokeEnv: string;
}

export interface ValuesModule {
  callout: string;
  corePursuit: string;
  triggers: string;
}

export interface PreferencesModule {
  callout: string;
  items: DynamicLean[];
}

export interface ConflictModule {
  callout: string;
  style: string;
  styleDesc: string;
  persuadeMode: string;
}

export interface RiskModule {
  callout: string;
  overuse: OveruseItem[];
  derailment: Derailment[];
}

export interface CrisisModule {
  callout: string;
  resilienceIndex: number;
  resilienceLabel: string;
  mode: string;
  modeDesc: string;
}

export interface TeamModule {
  callout: string;
  position: string;
  positionDesc: string;
  complement: string;
  complementDesc: string;
}

export interface OnboardingModule {
  callout: string;
  manageTips: string[];
  donts: string[];
  milestones: string[];
}

export interface InterviewModule {
  callout: string;
  tracks: InterviewTrack[];
}

export interface Takeaway {
  title: string;
  content: string;
}

export interface ExecutiveSummary {
  code: string;
  codeEn: string;
  takeaways: Takeaway[];
}

export interface RoleRec {
  role: string;
  reason: string;
}

export interface RoleAlignment {
  topRoles: RoleRec[];
  cautionRoles: RoleRec[];
  teamPosition: string;
  teamPositionDesc: string;
  complement: string;
  complementDesc: string;
}

export interface CompetencyItem {
  key: string;
  label: string;
  fyiname: string;
  score: number;
  percentile: number;
  band: "high" | "mid" | "low";
  category: string;
  anchor: string;
}

export interface CompetencyBreakdown {
  items: CompetencyItem[];
  categories: string[];
}

export interface CognitiveModel {
  processingMode: DynamicLean;
  decisionBalance: DynamicLean;
  ambiguityIndex: number;
  ambiguityLabel: string;
  ambiguityDesc: string;
}

export interface DynamicsDetail {
  thinking: DynamicLean;
  interpersonal: DynamicLean;
  communication: DynamicLean;
  changeAgility: DynamicLean;
}

export interface MotivationDriver {
  name: string;
  score: number;
}

export interface MotivationProfile {
  drivers: MotivationDriver[];
  fitCulture: string;
  frictionCulture: string;
}

export interface LeadershipProfile {
  archetype: string;
  archetypeEn: string;
  description: string;
  microControl: number;
  faultTolerance: number;
  conflictRigidity: number;
}

export interface OveruseItem {
  label: string;
  fyiname: string;
  risk: string;
}

export interface Derailment {
  trigger: string;
  advice: string;
}

export interface RiskReport {
  overuse: OveruseItem[];
  derailment: Derailment[];
}

export interface CrisisReport {
  resilienceIndex: number;
  resilienceLabel: string;
  mode: string;
  modeDesc: string;
}

export interface OnboardingGuide {
  manageTips: string[];
  donts: string[];
  milestones: string[];
}

export interface IDPPriority {
  label: string;
  fyiname: string;
  goal: string;
}

export interface IDP {
  priorities: IDPPriority[];
  onTheJob: string[];
  learnFromOthers: string[];
  reflection: string[];
}

export interface InterviewQuestionFull {
  dimensionKey: string;
  dimensionLabel: string;
  intent: string;
  prompt: string;
  probes: string[];
  greenFlags: string[];
  redFlags: string[];
}

export interface InterviewTrack {
  track: string;
  trackDesc: string;
  items: InterviewQuestionFull[];
}

export interface InterviewKit {
  tracks: InterviewTrack[];
}

/** 会话信息（选轨页 → 答题页） */
export interface SessionData {
  candidateName: string;
  email: string;
  position: string;
  trackId: TrackId;
}
