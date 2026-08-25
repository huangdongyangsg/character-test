import type {
  AnswersMap,
  ArchetypeSummary,
  BlindSpotInsight,
  DriverDynamics,
  DynamicLean,
  InterviewKitItem,
  OveruseRisk,
  Question,
  ReportData,
  RoleFit,
  StatCard,
  StrengthInsight,
  Track,
  TrackId,
  WorkplaceDynamics,
} from "./types";
import { FYI_DIMENSIONS } from "./fyiDimensions";
import { computeConsistency, scoreDimensions, sortByScoreDesc } from "./scoring";

/** 维度 → 高管画像英文标签 */
const TAG_MAP: Record<string, string> = {
  learning_agility: "Learning-agile",
  resilience_composure: "Composed",
  action_oriented: "Action-oriented",
  peer_relationships: "Collaborative",
  self_knowledge: "Self-aware",
  functional_execution: "Delivery-focused",
  problem_solving: "Problem-solver",
  customer_empathy: "Empathetic",
  business_acumen: "Business-savvy",
  drive_for_results: "Impact-driven",
  negotiating: "Negotiating",
  customer_focus: "Customer-centric",
  interpersonal_savvy: "Interpersonally-savvy",
  resilience: "Resilient",
  strategic_agility: "Strategic",
  priority_setting: "Priority-driven",
  decision_quality: "Decisive",
  complex_problem_solving: "Problem-solver",
  innovation_mgmt: "Innovative",
  dealing_with_ambiguity: "Ambiguity-tolerant",
  cross_functional: "Cross-functional",
  technical_depth: "Technically-deep",
  process_management: "Process-oriented",
  customer_centric_tech: "Value-aligned",
  developing_others: "Developer",
  conflict_management: "Conflict-resolver",
  motivating_others: "Motivating",
  organizational_agility: "Org-astute",
  decision_quality_macro: "Macro-decisive",
  building_effective_teams: "Team-builder",
  command_skills: "Command-presence",
};

const ROLE_FIT: Record<TrackId, RoleFit> = {
  campus: {
    highFit: ["管理培训生 / 轮岗生", "战略 / 咨询分析助理", "产品助理 (APM)", "增长 / 运营专员", "跨部门项目协调"],
    lowFit: ["高度重复的事务性岗位", "强 SOP 流水线操作", "单一职能深度专家岗", "无反馈的独立后台岗"],
    bestEnv: "高成长性、轮岗机会多、反馈及时、允许试错的平台型组织",
    frictionEnv: "论资排辈、流程僵化、层级森严、重复执行的传统组织",
  },
  sales: {
    highFit: ["大客户销售 (KA)", "客户成功 / 增长负责人", "商务拓展 (BD)", "GTM / 渠道管理", "销售运营负责人"],
    lowFit: ["纯后台风控 / 合规岗", "强 SOP 的客服执行", "重流程的行政岗", "长期无结果反馈的岗位"],
    bestEnv: "结果导向、高激励、客户前线、快速迭代的创业 / 增长型组织",
    frictionEnv: "强层级审批、低授权、重内部政治、KPI 模糊的组织",
  },
  tech: {
    highFit: ["技术负责人 / Tech Lead", "高级工程师 / 架构师", "数据科学家", "技术产品经理", "基础架构工程师"],
    lowFit: ["纯业务销售岗", "强 SOP 的运维值守", "重复性 CRUD 外包", "无技术深度的流程岗"],
    bestEnv: "工程文化强、鼓励创新、允许试错、重视长期质量的技术组织",
    frictionEnv: "重文档审批、技术债横行、频繁打断、忽视工程质量的组织",
  },
  leadership: {
    highFit: ["事业部总经理", "团队 / 部门总监", "项目群负责人 (PMO Head)", "合伙人 / COO", "变革推动负责人"],
    lowFit: ["纯执行的一线专员", "无需带人的独立专家", "强 SOP 的中层执行", "无决策权的协调岗"],
    bestEnv: "高授权、结果与长期价值并重、需要变革引领的组织",
    frictionEnv: "强中央集权、决策上收、仅需传声筒式执行的组织",
  },
};

function avgOf(scores: ReturnType<typeof scoreDimensions>, keys: string[]): number {
  const vals = keys
    .map((k) => scores.find((s) => s.key === k)?.normalized)
    .filter((v): v is number => typeof v === "number");
  if (vals.length === 0) return 50;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

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

  const top3 = sortedDesc.slice(0, 3);
  const bottom2 = sortedDesc.slice(-2).reverse();

  const archetype: ArchetypeSummary = {
    tags: top3.map((s) => TAG_MAP[s.key] ?? s.label),
    summary: `高${top3.map((s) => s.label).join("、高")}；低${bottom2
      .map((s) => s.label)
      .join("、低")}。`,
  };

  const topStats: StatCard[] = sortedDesc.slice(0, 4).map((s) => ({
    key: s.key,
    label: s.label,
    fyiname: s.fyiname,
    normalized: s.normalized,
  }));

  const decisionLogic: DynamicLean = (() => {
    const data = avgOf(scores, [
      "decision_quality",
      "complex_problem_solving",
      "technical_depth",
      "business_acumen",
      "problem_solving",
    ]);
    const intuitive = avgOf(scores, [
      "action_oriented",
      "dealing_with_ambiguity",
      "innovation_mgmt",
      "learning_agility",
      "strategic_agility",
    ]);
    return data >= intuitive
      ? {
          title: "决策与思考模式",
          lean: "Data & Evidence Driven",
          description:
            "倾向于基于数据、事实与严密逻辑做决策，追求可解释、可复现的判断，而非凭直觉快速拍板。",
        }
      : {
          title: "决策与思考模式",
          lean: "Intuitive & Agile",
          description:
            "倾向于在信息不完备时快速形成判断、边做边调，用行动验证假设，而非等待完整证据。",
        };
  })();

  const leadership: DynamicLean = (() => {
    const empowering = avgOf(scores, [
      "developing_others",
      "motivating_others",
      "peer_relationships",
      "cross_functional",
      "building_effective_teams",
    ]);
    const directive = avgOf(scores, [
      "command_skills",
      "drive_for_results",
      "decision_quality_macro",
      "organizational_agility",
    ]);
    return empowering >= directive
      ? {
          title: "管理与协同风格",
          lean: "Low-ego Empowering",
          description:
            "倾向于放权赋能、激发团队自主性，以信任和培养带动协作，而非靠命令与控制。",
        }
      : {
          title: "管理与协同风格",
          lean: "Directive & High-control",
          description:
            "倾向于明确指令、强管控与高掌控，追求执行确定性，在关键节点亲自拍板。",
        };
  })();

  const communication: DynamicLean = (() => {
    const consensus = avgOf(scores, [
      "conflict_management",
      "interpersonal_savvy",
      "customer_focus",
      "peer_relationships",
      "customer_empathy",
    ]);
    const direct = avgOf(scores, ["command_skills", "negotiating", "drive_for_results"]);
    return consensus >= direct
      ? {
          title: "沟通与冲突偏好",
          lean: "Purposeful Consensus",
          description:
            "倾向于先理解各方、求同存异，用共识推进，处理冲突时注重关系与结果的双赢。",
        }
      : {
          title: "沟通与冲突偏好",
          lean: "Direct Confrontational",
          description:
            "倾向于直接、坦诚、直面问题，宁可正面交锋也不回避，追求高效达成结果。",
        };
  })();

  const drivers: DriverDynamics = (() => {
    const growth = avgOf(scores, [
      "learning_agility",
      "self_knowledge",
      "developing_others",
      "technical_depth",
      "complex_problem_solving",
      "problem_solving",
    ]);
    const impact = avgOf(scores, [
      "drive_for_results",
      "business_acumen",
      "strategic_agility",
      "motivating_others",
      "customer_focus",
      "customer_empathy",
      "customer_centric_tech",
    ]);
    const challenge = avgOf(scores, [
      "resilience",
      "resilience_composure",
      "dealing_with_ambiguity",
      "innovation_mgmt",
      "command_skills",
    ]);
    const ranked = [
      { name: "成长", value: growth },
      { name: "影响力", value: impact },
      { name: "挑战", value: challenge },
    ].sort((a, b) => b.value - a.value);
    return {
      title: "底层驱动力与价值观",
      primary: ranked[0].name,
      secondary: ranked[1].name,
      weaker: ranked[2].name,
      description: `核心驱动力为「${ranked[0].name}」，次级驱动为「${ranked[1].name}」，对「${ranked[2].name}」的驱动相对较弱。`,
    };
  })();

  const dynamics: WorkplaceDynamics = {
    decisionLogic,
    leadership,
    communication,
    drivers,
  };

  const strengths: StrengthInsight[] = sortedDesc.slice(0, 3).map((s) => {
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

  const overuseRisks: OveruseRisk[] = sortedDesc.slice(0, 2).map((s) => {
    const d = FYI_DIMENSIONS[s.key];
    return {
      key: s.key,
      label: d.label,
      fyiname: d.fyiname,
      normalized: s.normalized,
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

  const roleFit: RoleFit = ROLE_FIT[track.id];
  const consistency = computeConsistency(questions, answers, track);

  const interviewKit: InterviewKitItem[] = [
    {
      key: bottom2[0].key,
      label: FYI_DIMENSIONS[bottom2[0].key].label,
      fyiname: FYI_DIMENSIONS[bottom2[0].key].fyiname,
      normalized: bottom2[0].normalized,
      focusReason: "核心发展盲点",
      question: FYI_DIMENSIONS[bottom2[0].key].interviewQuestions[0],
    },
    {
      key: bottom2[1].key,
      label: FYI_DIMENSIONS[bottom2[1].key].label,
      fyiname: FYI_DIMENSIONS[bottom2[1].key].fyiname,
      normalized: bottom2[1].normalized,
      focusReason: "次要发展区",
      question: FYI_DIMENSIONS[bottom2[1].key].interviewQuestions[0],
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
    archetype,
    topStats,
    dynamics,
    strengths,
    overuseRisks,
    blindSpots,
    roleFit,
    consistency,
    interviewKit,
  };
}

/** 生成可复制的 HR 摘要文本 */
export function buildSummaryText(report: ReportData): string {
  const lines: string[] = [];
  lines.push(`【职场胜任力测评报告】`);
  lines.push(`候选人：${report.candidateName}`);
  lines.push(`邮箱：${report.email || "未填写"}`);
  lines.push(`应聘岗位：${report.position || "未填写"}`);
  lines.push(`测评套件：${report.trackName} (${report.trackEnName})`);
  lines.push(`生成时间：${new Date(report.generatedAt).toLocaleString("zh-CN")}`);
  lines.push(``);
  lines.push(`— 高管画像 —`);
  lines.push(`标签：${report.archetype.tags.join(" · ")}`);
  lines.push(`总结：${report.archetype.summary}`);
  lines.push(``);
  lines.push(`— 八大胜任力指数（0–100）—`);
  sortByScoreDesc(report.scores).forEach((s, i) => {
    lines.push(`${i + 1}. ${s.label}（${s.fyiname}）：${s.normalized} 分`);
  });
  lines.push(``);
  lines.push(`— 核心优势（Top 3）—`);
  report.strengths.forEach((s) => {
    lines.push(`◆ ${s.label}（${s.fyiname}）${s.normalized} 分`);
    lines.push(`  ${s.strength}`);
  });
  lines.push(``);
  lines.push(`— 过载风险 —`);
  report.overuseRisks.forEach((r) => {
    lines.push(`⚠️ ${r.label}：${r.overuseRisk}`);
  });
  lines.push(``);
  lines.push(`— 潜在盲点 / 发展区（Bottom 2）—`);
  report.blindSpots.forEach((b) => {
    lines.push(`◆ ${b.label}（${b.fyiname}）${b.normalized} 分`);
    lines.push(`  ${b.blindSpot}`);
    lines.push(`  建议：${b.developmentTip}`);
  });
  lines.push(``);
  lines.push(`— 角色与环境匹配 —`);
  lines.push(`高匹配：${report.roleFit.highFit.join("、")}`);
  lines.push(`较低匹配：${report.roleFit.lowFit.join("、")}`);
  lines.push(`最佳环境：${report.roleFit.bestEnv}`);
  lines.push(`摩擦环境：${report.roleFit.frictionEnv}`);
  lines.push(``);
  lines.push(`— 答题一致性指数 —`);
  lines.push(
    `${report.consistency.score}%（${report.consistency.label}）：${report.consistency.flag}`
  );
  lines.push(``);
  lines.push(`— 面试官 STAR 追问指南 —`);
  report.interviewKit.forEach((item, i) => {
    lines.push(`${i + 1}. [${item.focusReason}] ${item.label}（${item.fyiname}）`);
    lines.push(`  追问：${item.question.prompt}`);
    lines.push(`  ✅ Green Flag：${item.question.greenFlags.join("；")}`);
    lines.push(`  ⚠️ Red Flag：${item.question.redFlags.join("；")}`);
  });
  return lines.join("\n");
}

