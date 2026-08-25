import type { Track, TrackId } from "./types";

/**
 * 4 套测评套件（Track Matrix）。
 * 每套聚焦 6 个 FYI 胜任力维度，与 lib/questionBank.ts 中的选项一一对应。
 */
export const TRACKS: Record<TrackId, Track> = {
  campus: {
    id: "campus",
    name: "校招 / 管培生潜能版",
    enName: "Campus Agility",
    tagline: "识别高潜新人的学习力与适应力",
    audience: "应届生 · 管培生 · 初级员工",
    description:
      "聚焦新人在陌生环境中快速学习、抗压、行动、协同与自我认知的底层潜能，帮助企业识别未来可塑之才。",
    dimensions: [
      "learning_agility",
      "resilience_composure",
      "action_oriented",
      "peer_relationships",
      "self_knowledge",
      "functional_execution",
    ],
    theme: {
      gradient: "from-indigo-500 to-violet-600",
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      chip: "bg-indigo-50 text-indigo-700 border-indigo-100",
      button: "bg-indigo-600 hover:bg-indigo-700",
      dot: "bg-indigo-500",
    },
  },
  sales: {
    id: "sales",
    name: "社招业务与增长版",
    enName: "Sales & GTM Pro",
    tagline: "识别驱动业绩与客户价值的关键特质",
    audience: "销售 · 客户成功 · 市场 · GTM",
    description:
      "聚焦商业敏锐度、结果驱动、谈判、客户中心、人际敏锐与逆境韧性，帮助企业筛选能真正带来增长的业务人才。",
    dimensions: [
      "business_acumen",
      "drive_for_results",
      "negotiating",
      "customer_focus",
      "interpersonal_savvy",
      "resilience",
    ],
    theme: {
      gradient: "from-violet-500 to-fuchsia-600",
      text: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
      chip: "bg-violet-50 text-violet-700 border-violet-100",
      button: "bg-violet-600 hover:bg-violet-700",
      dot: "bg-violet-500",
    },
  },
  tech: {
    id: "tech",
    name: "社招产研与技术版",
    enName: "Tech & Product Pro",
    tagline: "识别复杂问题解决与工程卓越能力",
    audience: "研发 · 产品 · 数据 · 技术管理",
    description:
      "聚焦高质量决策、复杂问题解决、创新管理、驾驭模糊、跨职能协作与专业深度，帮助企业筛选能攻坚复杂系统的技术人才。",
    dimensions: [
      "decision_quality",
      "problem_solving",
      "innovation_mgmt",
      "dealing_with_ambiguity",
      "cross_functional",
      "technical_depth",
    ],
    theme: {
      gradient: "from-sky-500 to-blue-600",
      text: "text-sky-600",
      bg: "bg-sky-50",
      border: "border-sky-100",
      chip: "bg-sky-50 text-sky-700 border-sky-100",
      button: "bg-sky-600 hover:bg-sky-700",
      dot: "bg-sky-500",
    },
  },
  leadership: {
    id: "leadership",
    name: "团队管理与领导力版",
    enName: "Leadership Pro",
    tagline: "识别战略远见与带团队的核心领导力",
    audience: "团队管理者 · 总监 · 高管",
    description:
      "聚焦战略远见、培养下属、冲突化解、团队激励、组织敏锐与宏观决策，帮助企业评估管理者能否带领团队走向长期成功。",
    dimensions: [
      "strategic_agility",
      "developing_others",
      "conflict_management",
      "motivating_others",
      "organizational_agility",
      "decision_quality_macro",
    ],
    theme: {
      gradient: "from-slate-700 to-slate-900",
      text: "text-slate-700",
      bg: "bg-slate-100",
      border: "border-slate-200",
      chip: "bg-slate-100 text-slate-700 border-slate-200",
      button: "bg-slate-800 hover:bg-slate-900",
      dot: "bg-slate-600",
    },
  },
};

export const TRACK_LIST: Track[] = Object.values(TRACKS);

export function getTrack(id: string | undefined): Track | undefined {
  if (!id) return undefined;
  return (TRACKS as Record<string, Track>)[id];
}
