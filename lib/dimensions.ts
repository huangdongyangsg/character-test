import type { TrackId } from "./types";

/**
 * 4 大套件的 8 大底层能力维度映射表。
 * 每个套件严格定义 d1~d8 共 8 个维度代码，与题库中每道题的 8 个选项一一对应。
 * - code：维度代码（d1~d8）
 * - key：语义 key（用于关联 fyiDimensions 中的理论内容与计分）
 * - label：大白话标签（面向业务/HR 的可读名称）
 * - en：英文通用能力名称（现代人才管理术语）
 */
export interface DimDef {
  code: string;
  key: string;
  label: string;
  en: string;
}

export const TRACK_DIMENSIONS: Record<TrackId, DimDef[]> = {
  campus: [
    { code: "d1", key: "learning_agility", label: "快速学习与消化", en: "Learning Agility" },
    { code: "d2", key: "resilience_composure", label: "抗挫与情绪稳定", en: "Composure & Resilience" },
    { code: "d3", key: "action_oriented", label: "主动出击与担当", en: "Action Oriented" },
    { code: "d4", key: "peer_relationships", label: "团队协作与人际", en: "Peer Collaboration" },
    { code: "d5", key: "self_knowledge", label: "自我反思与认知", en: "Self-Reflection" },
    { code: "d6", key: "functional_execution", label: "基础任务严密交付", en: "Execution & Delivery" },
    { code: "d7", key: "problem_solving", label: "逻辑思考与问题解决", en: "Problem Solving" },
    { code: "d8", key: "customer_empathy", label: "用户/服务感知意识", en: "User Empathy" },
  ],
  sales: [
    { code: "d1", key: "business_acumen", label: "商业敏锐与洞察", en: "Business Acumen" },
    { code: "d2", key: "drive_for_results", label: "坚定结果导向", en: "Drive for Results" },
    { code: "d3", key: "negotiating", label: "谈判博弈与说服", en: "Negotiation & Influence" },
    { code: "d4", key: "customer_focus", label: "客户价值绑定", en: "Customer Centricity" },
    { code: "d5", key: "interpersonal_savvy", label: "人际机敏与破冰", en: "Interpersonal Savvy" },
    { code: "d6", key: "resilience", label: "高压逆境抗挫", en: "Resilience" },
    { code: "d7", key: "strategic_agility", label: "市场机会前瞻", en: "Market Foresight" },
    { code: "d8", key: "priority_setting", label: "商机优先级取舍", en: "Priority Setting" },
  ],
  tech: [
    { code: "d1", key: "decision_quality", label: "严密逻辑与高质量决策", en: "Decision Quality" },
    { code: "d2", key: "complex_problem_solving", label: "复杂技术/业务攻坚", en: "Complex Problem Solving" },
    { code: "d3", key: "innovation_mgmt", label: "技术与业务破局创新", en: "Innovation" },
    { code: "d4", key: "dealing_with_ambiguity", label: "驾驭模糊与需求变动", en: "Dealing with Ambiguity" },
    { code: "d5", key: "cross_functional", label: "跨职能高效协同", en: "Cross-functional Alignment" },
    { code: "d6", key: "technical_depth", label: "专业精益与技术深度", en: "Technical Excellence" },
    { code: "d7", key: "process_management", label: "架构思维与流程管理", en: "Process & Architecture" },
    { code: "d8", key: "customer_centric_tech", label: "业务价值对齐", en: "Business Value Focus" },
  ],
  leadership: [
    { code: "d1", key: "strategic_agility", label: "战略远见与布局", en: "Strategic Agility" },
    { code: "d2", key: "developing_others", label: "下属赋能与人才培养", en: "Developing Others" },
    { code: "d3", key: "conflict_management", label: "冲突化解与博弈", en: "Conflict Management" },
    { code: "d4", key: "motivating_others", label: "愿景感召与团队激励", en: "Inspiring & Motivating" },
    { code: "d5", key: "organizational_agility", label: "组织敏锐与资源推动", en: "Organizational Agility" },
    { code: "d6", key: "decision_quality_macro", label: "宏观决断与风险取舍", en: "Macro Decision Making" },
    { code: "d7", key: "building_effective_teams", label: "打造高效协作团队", en: "Team Building" },
    { code: "d8", key: "command_skills", label: "危机领导力与决断", en: "Crisis Command" },
  ],
};

/** 根据套件与语义 key 取大白话标签 */
export function dimLabel(trackId: TrackId, key: string): string {
  return TRACK_DIMENSIONS[trackId].find((d) => d.key === key)?.label ?? key;
}

/** 根据套件与语义 key 取维度代码（d1~d8） */
export function dimCode(trackId: TrackId, key: string): string {
  return TRACK_DIMENSIONS[trackId].find((d) => d.key === key)?.code ?? "d?";
}
