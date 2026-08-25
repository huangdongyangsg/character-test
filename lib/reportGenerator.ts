import type {
  AnswersMap,
  CompetencyItem,
  ConflictModule,
  CrisisModule,
  Derailment,
  DynamicLean,
  ExecModule,
  InterviewModule,
  InterviewQuestionFull,
  InterviewTrack,
  MotivationDriver,
  MotivationModule,
  OnboardingModule,
  OveruseItem,
  PersonalityModule,
  PreferencesModule,
  Question,
  ReportData,
  RiskModule,
  RoleModule,
  RoleRec,
  StageFit,
  StageModule,
  TalentsModule,
  TeamModule,
  ThinkingModule,
  Track,
  TrackId,
  ValuesModule,
} from "./types";
import { FYI_DIMENSIONS } from "./fyiDimensions";
import { computeConsistency, scoreDimensions, sortByScoreDesc } from "./scoring";
import { dimLabel, dimCode } from "./dimensions";

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}
function scoreOf(scores: ReturnType<typeof scoreDimensions>, key: string): number {
  return scores.find((s) => s.key === key)?.normalized ?? 50;
}
function avgOf(scores: ReturnType<typeof scoreDimensions>, keys: string[]): number {
  const vals = keys.map((k) => scores.find((s) => s.key === k)?.normalized).filter((v): v is number => typeof v === "number");
  if (vals.length === 0) return 50;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}
function percentileOf(score: number): number {
  return clamp(Math.round(100 / (1 + Math.exp(-(score - 50) / 12))), 1, 99);
}

const CATEGORY_MAP: Record<string, string> = {
  strategic_agility: "战略与决策", decision_quality: "战略与决策", decision_quality_macro: "战略与决策",
  business_acumen: "战略与决策", priority_setting: "战略与决策", complex_problem_solving: "战略与决策", problem_solving: "战略与决策",
  dealing_with_ambiguity: "创新与适应", learning_agility: "创新与适应", resilience_composure: "创新与适应",
  resilience: "创新与适应", self_knowledge: "创新与适应", innovation_mgmt: "创新与适应",
  peer_relationships: "协同与影响", cross_functional: "协同与影响", interpersonal_savvy: "协同与影响",
  negotiating: "协同与影响", customer_focus: "协同与影响", customer_empathy: "协同与影响", developing_others: "协同与影响",
  motivating_others: "协同与影响", conflict_management: "协同与影响", organizational_agility: "协同与影响",
  building_effective_teams: "协同与影响", command_skills: "协同与影响",
  action_oriented: "执行与交付", functional_execution: "执行与交付", drive_for_results: "执行与交付",
  technical_depth: "执行与交付", process_management: "执行与交付", customer_centric_tech: "执行与交付",
};

const ARCHETYPE_MAP: Record<string, { code: string; codeEn: string }> = {
  strategic_agility: { code: "战略前瞻型破局者", codeEn: "Strategic Catalyst" },
  decision_quality: { code: "理性决断型操盘手", codeEn: "Decisive Operator" },
  decision_quality_macro: { code: "全局权衡型掌舵者", codeEn: "Macro Strategist" },
  business_acumen: { code: "商业洞察型增长引擎", codeEn: "Business Accelerator" },
  priority_setting: { code: "聚焦攻坚型排头兵", codeEn: "Priority Sharpshooter" },
  complex_problem_solving: { code: "复杂攻坚型解题者", codeEn: "Complex Problem Solver" },
  problem_solving: { code: "务实拆解型解题者", codeEn: "Pragmatic Solver" },
  dealing_with_ambiguity: { code: "驭变求索型先锋", codeEn: "Ambiguity Navigator" },
  learning_agility: { code: "高潜学习型破局者", codeEn: "Learning Catalyst" },
  resilience_composure: { code: "沉着稳健型定海针", codeEn: "Composed Stabilizer" },
  resilience: { code: "韧性持久型攻坚者", codeEn: "Resilient Perseverer" },
  self_knowledge: { code: "内省成长型自驱者", codeEn: "Self-Aware Grower" },
  innovation_mgmt: { code: "创新催化型突破者", codeEn: "Innovation Catalyst" },
  peer_relationships: { code: "协同赋能型连接者", codeEn: "Collaborative Connector" },
  cross_functional: { code: "跨域整合型枢纽", codeEn: "Cross-functional Integrator" },
  interpersonal_savvy: { code: "人际敏锐型影响者", codeEn: "Interpersonal Influencer" },
  negotiating: { code: "双赢博弈型谈判者", codeEn: "Win-win Negotiator" },
  customer_focus: { code: "客户价值型守护者", codeEn: "Customer Champion" },
  customer_empathy: { code: "用户共情型服务者", codeEn: "Empathetic Server" },
  developing_others: { code: "育人赋能型教练", codeEn: "People Developer" },
  motivating_others: { code: "愿景激励型领袖", codeEn: "Inspirational Leader" },
  conflict_management: { code: "冲突化解型协调者", codeEn: "Conflict Resolver" },
  organizational_agility: { code: "组织洞察型推动者", codeEn: "Organizational Navigator" },
  building_effective_teams: { code: "团队架构型搭建者", codeEn: "Team Architect" },
  command_skills: { code: "危机指挥型领袖", codeEn: "Command Leader" },
  action_oriented: { code: "雷厉风行型行动派", codeEn: "Action Driver" },
  functional_execution: { code: "精益交付型压舱石", codeEn: "Delivery Anchor" },
  drive_for_results: { code: "结果导向型攻坚者", codeEn: "Results Engine" },
  technical_depth: { code: "技术深耕型专家", codeEn: "Technical Virtuoso" },
  process_management: { code: "流程架构型优化师", codeEn: "Process Architect" },
  customer_centric_tech: { code: "价值对齐型工程专家", codeEn: "Value-aligned Engineer" },
};

const ROLE_ROLES: Record<TrackId, { high: string[]; low: string[] }> = {
  campus: { high: ["管理培训生 / 轮岗生", "战略 / 咨询分析助理", "产品助理 (APM)", "增长 / 运营专员", "跨部门项目协调"], low: ["高度重复的事务性岗位", "强 SOP 流水线操作", "单一职能深度专家岗", "无反馈的独立后台岗"] },
  sales: { high: ["大客户销售 (KA)", "客户成功 / 增长负责人", "商务拓展 (BD)", "GTM / 渠道管理", "销售运营负责人"], low: ["纯后台风控 / 合规岗", "强 SOP 的客服执行", "重流程的行政岗", "长期无结果反馈的岗位"] },
  tech: { high: ["技术负责人 / Tech Lead", "高级工程师 / 架构师", "数据科学家", "技术产品经理", "基础架构工程师"], low: ["纯业务销售岗", "强 SOP 的运维值守", "重复性 CRUD 外包", "无技术深度的流程岗"] },
  leadership: { high: ["事业部总经理", "团队 / 部门总监", "项目群负责人 (PMO Head)", "合伙人 / COO", "变革推动负责人"], low: ["纯执行的一线专员", "无需带人的独立专家", "强 SOP 的中层执行", "无决策权的协调岗"] },
};

const CULTURE: Record<TrackId, { fit: string; friction: string }> = {
  campus: { fit: "高成长性、轮岗机会多、反馈及时、允许试错的平台型 / 扁平敏捷组织", friction: "论资排辈、流程僵化、层级森严、重复执行的传统科层组织" },
  sales: { fit: "结果导向、高激励、客户前线、快速迭代的创业 / 增长型组织", friction: "强层级审批、低授权、重内部政治、KPI 模糊的组织" },
  tech: { fit: "工程文化强、鼓励创新、允许试错、重视长期质量的技术组织", friction: "重文档审批、技术债横行、频繁打断、忽视工程质量的组织" },
  leadership: { fit: "高授权、结果与长期价值并重、需要变革引领的组织", friction: "强中央集权、决策上收、仅需传声筒式执行的组织" },
};
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
  const lowest = sortedDesc[sortedDesc.length - 1];
  const d = FYI_DIMENSIONS;
  const labelOf = (k: string) => dimLabel(track.id, k);
  const enOf = (k: string) => d[k]?.fyiname ?? k;

  const top1 = labelOf(top3[0].key);
  const top2 = labelOf(top3[1].key);
  const top3l = labelOf(top3[2].key);
  const bottom1 = labelOf(bottom2[0].key);
  const bottom2l = labelOf(bottom2[1].key);

  // —— 模块 1：高管 1 分钟决策速览 ——
  const archetype = ARCHETYPE_MAP[top3[0].key] ?? { code: "复合型人才", codeEn: "Versatile Talent" };
  const consistency = computeConsistency(questions, answers, track);
  const verdict =
    consistency.score >= 70 ? "建议强推" : consistency.score >= 55 ? "建议推荐（补短板追问后决策）" : "建议谨慎（需线下交叉验证）";
  const exec: ExecModule = {
    callout: `${archetype.code}：以「${top1}」「${top2}」为双引擎，战力明确，${verdict}。`,
    code: archetype.code,
    codeEn: archetype.codeEn,
    takeaways: [
      { title: "核心定位", content: `以「${top1}」「${top2}」为第一天赋，叠加「${top3l}」构成差异化壁垒，是典型的${archetype.code}。` },
      { title: "战斗力与阶段", content: `其「${top1}」长板需要在与之匹配的业务阶段才能最大化发挥，详见「业务发展阶段匹配」模块。` },
      { title: "录用建议", content: `作答一致性 ${consistency.score}%（${consistency.label}），${verdict}。` },
    ],
  };

  // —— 模块 3：业务发展阶段的作战匹配度 ——
  const stageRaw = [
    { name: "0-1 开拓", score: avgOf(scores, ["innovation_mgmt", "dealing_with_ambiguity", "action_oriented", "learning_agility", "strategic_agility"]), desc: "方向模糊、规则未定，靠快速试错打开局面的从 0 到 1。" },
    { name: "1-10 扩张", score: avgOf(scores, ["drive_for_results", "customer_focus", "business_acumen", "cross_functional", "priority_setting"]), desc: "跑通模型后复制放量，靠结果驱动与跨团队协同做规模。" },
    { name: "成熟精细化", score: avgOf(scores, ["process_management", "functional_execution", "technical_depth", "decision_quality", "customer_centric_tech"]), desc: "存量市场的精细化运营，靠流程、质量与稳定交付守成。" },
    { name: "衰退转型", score: avgOf(scores, ["command_skills", "conflict_management", "organizational_agility", "strategic_agility", "resilience"]), desc: "业务下行期的破釜沉舟，靠决断、变革推动与危机领导力翻盘。" },
  ].sort((a, b) => b.score - a.score);
  const stage: StageModule = {
    callout: `最适合打「${stageRaw[0].name}」战，最不适合「${stageRaw[3].name}」战。`,
    stages: stageRaw,
  };

  // —— 模块 2：岗位胜任与最适配角色推荐 ——
  const roles = ROLE_ROLES[track.id];
  const role: RoleModule = {
    callout: `在「${roles.high[0]}」等岗位能直接出战功；但在「${roles.low[0]}」类岗位易因「${bottom1}」短板而内耗。`,
    topRoles: roles.high.slice(0, 3).map((r, i): RoleRec => ({ role: r, reason: `${r}最吃「${labelOf(top3[Math.min(i, top3.length - 1)].key)}」，正是其天赋所在，可快速出活。` })),
    cautionRoles: roles.low.slice(0, 2).map((r): RoleRec => ({ role: r, reason: `该岗位高度依赖「${bottom1}」，与其短板冲突，易反复受挫、产生内耗。` })),
  };

  // —— 模块 4：8 项核心职场能力打分 ——
  const competency = {
    callout: `最强长板是「${top1}」（${top3[0].normalized} 分），最大短板是「${bottom1}」（${bottom2[0].normalized} 分），两端反差鲜明。`,
    items: sortedDesc.map((s): CompetencyItem => ({
      key: s.key,
      label: labelOf(s.key),
      fyiname: enOf(s.key),
      score: s.normalized,
      percentile: percentileOf(s.normalized),
      band: s.normalized >= 75 ? "high" : s.normalized >= 50 ? "mid" : "low",
      category: CATEGORY_MAP[s.key] ?? "其他",
      anchor: d[s.key].definition,
    })),
  } satisfies import("./types").CompetencyModule;

  // —— 模块 5：天生优势与才干特征 ——
  const battleByCat: Record<string, string[]> = {
    战略与决策: ["战略规划", "重大决策", "业务转型"],
    协同与影响: ["跨团队攻坚", "客户 / 伙伴谈判", "组织协同"],
    执行与交付: ["交付攻坚", "流程优化", "结果冲刺"],
    创新与适应: ["0-1 破局", "创新孵化", "变革探索"],
  };
  const topCat = (() => {
    const sums: Record<string, number> = {}; const counts: Record<string, number> = {};
    for (const s of scores) { const c = CATEGORY_MAP[s.key] ?? "其他"; sums[c] = (sums[c] ?? 0) + s.normalized; counts[c] = (counts[c] ?? 0) + 1; }
    return Object.keys(sums).sort((a, b) => (sums[b] / counts[b]) - (sums[a] / counts[a]))[0];
  })();
  const talents: TalentsModule = {
    callout: `无需刻意努力就能做好的天赋是「${top1}」与「${top2}」，最该被放到${battleByCat[topCat]?.[0] ?? "攻坚"}型硬仗中。`,
    talents: top3.map((s) => ({ label: labelOf(s.key), en: enOf(s.key), desc: d[s.key].strength })),
    battleTypes: battleByCat[topCat] ?? ["攻坚", "破局", "交付"],
  };

  // —— 模块 6：职场性格与做事风格画像 ——
  const persRaw = [
    { name: "开拓主导", en: "Pioneer", score: avgOf(scores, ["action_oriented", "innovation_mgmt", "drive_for_results", "strategic_agility"]) },
    { name: "热情影响", en: "Influencer", score: avgOf(scores, ["motivating_others", "interpersonal_savvy", "customer_focus", "customer_empathy", "negotiating"]) },
    { name: "稳健支持", en: "Supporter", score: avgOf(scores, ["peer_relationships", "cross_functional", "developing_others", "conflict_management"]) },
    { name: "严谨合规", en: "Precisionist", score: avgOf(scores, ["decision_quality", "process_management", "technical_depth", "functional_execution", "complex_problem_solving"]) },
  ].sort((a, b) => b.score - a.score);
  const styleDesc: Record<string, string> = {
    开拓主导: "雷厉风行、目标感强，喜欢抢滩攻坚、快速拿结果，不喜拖泥带水。",
    热情影响: "以人推动事、感染力强，擅长动员与说服，靠影响力把事做成。",
    稳健支持: "稳扎稳打、乐于成就他人，靠团队协作与长期信任稳步推进。",
    严谨合规: "严谨细致、追求可控与品质，凡事讲逻辑、重流程、守底线。",
  };
  const personality: PersonalityModule = {
    callout: `做事风格偏「${persRaw[0].name}」：${styleDesc[persRaw[0].name]}`,
    style: persRaw[0].name,
    styleEn: persRaw[0].en,
    styleDesc: styleDesc[persRaw[0].name],
    dims: persRaw,
  };

  // —— 模块 7：业务思考与问题解决习惯 ——
  const macro = avgOf(scores, ["strategic_agility", "complex_problem_solving", "innovation_mgmt", "dealing_with_ambiguity"]);
  const micro = avgOf(scores, ["functional_execution", "technical_depth", "process_management", "action_oriented"]);
  const thinking: ThinkingModule = {
    callout: `面对复杂局面他更偏「${macro >= micro ? "宏观战略派" : "微观落地派"}」——${macro >= micro ? "先看全局再下手" : "先把手头做实再谈全局"}。`,
    macroLean: macro >= micro ? "宏观战略派" : "微观落地派",
    macroDesc: macro >= micro
      ? "习惯先看清全局框架、方向与因果链路，再下沉到细节落地；适合做「想清楚再做」的复杂规划。"
      : "习惯先从具体问题、可执行步骤切入，把事做实做透，再逐步上升为体系；适合「先跑起来再说」的落地攻坚。",
    resourceLogic: scoreOf(scores, "priority_setting") >= scoreOf(scores, "action_oriented")
      ? "资源匮乏时先做取舍、聚焦最高价值项，宁可少做也要把关键事做透。"
      : "资源匮乏时先动起来、用最小成本快速试错，边做边筛掉低价值项。",
  };

  // —— 模块 8：工作动力与最喜欢的团队氛围 ——
  const drivers: MotivationDriver[] = [
    { name: "成就驱动", score: avgOf(scores, ["drive_for_results", "functional_execution", "decision_quality_macro", "action_oriented"]) },
    { name: "自主权需求", score: avgOf(scores, ["dealing_with_ambiguity", "action_oriented", "strategic_agility", "innovation_mgmt", "command_skills"]) },
    { name: "智力挑战", score: avgOf(scores, ["complex_problem_solving", "problem_solving", "technical_depth", "learning_agility", "innovation_mgmt"]) },
    { name: "团队归属", score: avgOf(scores, ["peer_relationships", "cross_functional", "developing_others", "motivating_others", "building_effective_teams", "customer_focus"]) },
    { name: "即时回报", score: avgOf(scores, ["priority_setting", "drive_for_results", "negotiating", "business_acumen"]) },
  ];
  const topDriver = [...drivers].sort((a, b) => b.score - a.score)[0];
  const motivation: MotivationModule = {
    callout: `最能激发他的是「${topDriver.name}」；而${CULTURE[track.id].friction}最容易让他想走人。`,
    drivers,
    fitEnv: CULTURE[track.id].fit,
    chokeEnv: CULTURE[track.id].friction,
  };

  // —— 模块 9：职场底层价值观与安全感来源 ——
  const pursuitByDriver: Record<string, string> = {
    成就驱动: "把事做成、拿到看得见的结果",
    自主权需求: "被信任、拥有自己的决策空间",
    智力挑战: "解决有难度、有含金量的问题",
    团队归属: "被团队接纳、有并肩作战的伙伴",
    即时回报: "付出能被快速看见与兑现",
  };
  const values: ValuesModule = {
    callout: `他骨子里最看重「${pursuitByDriver[topDriver.name]}」；一旦「${bottom1}」被反复挑战或身处${CULTURE[track.id].friction}，就会强烈抵触与不安。`,
    corePursuit: pursuitByDriver[topDriver.name],
    triggers: `当「${bottom1}」被持续挑战、长期处于${CULTURE[track.id].friction}、或成果得不到及时认可时，会触发其强烈抵触与不安全感。`,
  };

  // —— 模块 10：日常工作四大偏好 ——
  const preferences: PreferencesModule = {
    callout: `日常作风一句话：决策${thinking.macroLean.includes("宏观") ? "看全局" : "抓落地"}、协同${scoreOf(scores, "peer_relationships") >= scoreOf(scores, "command_skills") ? "重协作" : "重主导"}、沟通${scoreOf(scores, "decision_quality") >= scoreOf(scores, "interpersonal_savvy") ? "求精炼" : "重共情"}、应变${scoreOf(scores, "innovation_mgmt") >= scoreOf(scores, "process_management") ? "爱求变" : "偏好稳"}。`,
    items: [
      { title: "决策", lean: scoreOf(scores, "decision_quality") >= scoreOf(scores, "action_oriented") ? "先想清楚再动" : "先动起来再调", description: scoreOf(scores, "decision_quality") >= scoreOf(scores, "action_oriented") ? "倾向用推演与数据降低风险，追求决策质量。" : "倾向用行动与试错换取先机，追求速度与迭代。" },
      { title: "带人协同", lean: scoreOf(scores, "developing_others") >= scoreOf(scores, "command_skills") ? "放权赋能" : "亲抓关键", description: scoreOf(scores, "developing_others") >= scoreOf(scores, "command_skills") ? "倾向授权、培养，让团队自己跑起来。" : "倾向亲自盯关键节点，确保执行不跑偏。" },
      { title: "沟通表达", lean: scoreOf(scores, "decision_quality") >= scoreOf(scores, "interpersonal_savvy") ? "精炼直接" : "共情叙事", description: scoreOf(scores, "decision_quality") >= scoreOf(scores, "interpersonal_savvy") ? "结论先行、直奔主题，追求信息密度。" : "善用故事与情感感染人，重视关系温度。" },
      { title: "求变求稳", lean: scoreOf(scores, "innovation_mgmt") >= scoreOf(scores, "process_management") ? "拥抱变化" : "依赖秩序", description: scoreOf(scores, "innovation_mgmt") >= scoreOf(scores, "process_management") ? "乐于探索新路、打破惯性，是变革第一波推动者。" : "更信赖成熟流程与稳定秩序，倾向渐进优化。" },
    ],
  };

  // —— 模块 11：跨部门沟通与冲突化解习惯 ——
  const cmScore = scoreOf(scores, "conflict_management");
  const conflictStyle = cmScore >= 60 ? "追求双赢" : scoreOf(scores, "command_skills") >= scoreOf(scores, "interpersonal_savvy") ? "据理力争" : "退让顾全大局";
  const conflict: ConflictModule = {
    callout: `跨部门扯皮时他更倾向「${conflictStyle}」；${conflictStyle === "追求双赢" ? "先搞清各方诉求再找共同解" : conflictStyle === "据理力争" ? "摆事实讲道理、守住己方立场" : "以退为进、维护长期关系"}。`,
    style: conflictStyle,
    styleDesc: conflictStyle === "追求双赢"
      ? "面对利益摩擦，习惯先挖出各方真实诉求，再寻找双方都能接受的方案，兼顾结果与关系。"
      : conflictStyle === "据理力争"
      ? "面对扯皮会直接摆事实、讲逻辑、守底线，宁可正面交锋也不回避，追求高效解决。"
      : "面对冲突倾向先让一步、顾全大局，以退为进维护长期关系，避免撕破脸。",
    persuadeMode: scoreOf(scores, "interpersonal_savvy") >= scoreOf(scores, "decision_quality")
      ? "更擅长以人情与信任说服：先建立关系与认同，再顺势推进。"
      : "更擅长以事实与逻辑说服：摆数据、讲道理，用严密的论证让对方服气。",
  };

  // —— 模块 12：压力过大时的潜在风险与盲点 ——
  const risk: RiskModule = {
    callout: `极度疲劳或承压时，他最可能把「${top1}」用过头，变成${d[top3[0].key].overuseRisk.slice(0, 24)}…`,
    overuse: sortedDesc.slice(0, 2).map((s): OveruseItem => ({ label: labelOf(s.key), fyiname: enOf(s.key), risk: d[s.key].overuseRisk })),
    derailment: bottom2.map((s): Derailment => ({ trigger: d[s.key].blindSpot, advice: d[s.key].developmentTip })),
  };

  // —— 模块 13：面对重大挫折与危机的复原力 ——
  const resilienceIndex = clamp(avgOf(scores, ["resilience", "resilience_composure", "dealing_with_ambiguity", "command_skills", "self_knowledge"]));
  const resilienceLabel = resilienceIndex >= 75 ? "很快（强复原）" : resilienceIndex >= 55 ? "较快（较稳）" : resilienceIndex >= 40 ? "一般（需缓冲）" : "偏慢（需支持）";
  const crisisMode = scoreOf(scores, "action_oriented") >= scoreOf(scores, "decision_quality") ? "冲锋止血型" : "稳健复盘型";
  const crisis: CrisisModule = {
    callout: `遭遇项目失败或重大打击时，他属于「${crisisMode}」，心理回血速度${resilienceLabel}。`,
    resilienceIndex,
    resilienceLabel,
    mode: crisisMode,
    modeDesc: crisisMode === "冲锋止血型"
      ? "第一时间主动出击、止损控场，快速切换行动方案，用新的战斗冲淡挫败感。"
      : "先稳住阵脚、系统复盘，想清楚根因与对策后再稳健推进，不急于立即翻盘。",
  };

  // —— 模块 14：团队最佳搭档配置指南 ——
  const complementByCat: Record<string, string> = {
    战略与决策: "强执行 / 细节交付型搭档",
    协同与影响: "理性分析与决断型搭档",
    执行与交付: "战略视野与创新型搭档",
    创新与适应: "稳健风控与流程型搭档",
  };
  const team: TeamModule = {
    callout: `给他配一名「${complementByCat[topCat]}」，一攻一稳，战斗力能直接翻倍。`,
    position: battleByCat[topCat]?.[0] ? `${battleByCat[topCat][0]}型角色` : "攻坚型角色",
    positionDesc: `在团队中他最适合担当${battleByCat[topCat]?.[0] ?? "攻坚"}先锋，负责${topCat}方向的关键产出，把「${top1}」打满。`,
    complement: complementByCat[topCat],
    complementDesc: `建议配备擅长「${bottom1}」「${bottom2l}」的搭档，补齐其短板，形成「${top1} + 稳健执行」的黄金组合。`,
  };

  // —— 模块 15：新人入职 90 天落地与管理建议 ——
  const onboarding: OnboardingModule = {
    callout: `管理他的第一条法则：给目标、给空间、少盯细节；最大雷区是用「${bottom1}」反复否定他的价值。`,
    manageTips: [
      `给目标、给边界、少盯细节：其「${top1}」天赋需要决策自主权，管结果比管过程更有效。`,
      `用可量化结果牵引、高频反馈：对齐其对「${top2}」的追求，每周一次轻量 1:1 校准方向。`,
      `公开认可、私下纠偏：肯定其战功可放大动力，批评尽量一对一、就事论事。`,
    ],
    donts: [
      `过度微观管理、频繁插手细节，会迅速消耗其积极性并压制其长板。`,
      `用「${bottom1}」短板反复否定其整体价值，或公开贬损，极易引发挫败与对抗。`,
    ],
    milestones: [
      "前 30 天：完成业务全景扫描、建立关键干系人地图，交付 1 项可见早期成果。",
      "第 30-60 天：独立主导 1 个中等复杂度项目，沉淀可复用的方法论或流程。",
      "第 60-90 天：输出 1 份业务 / 技术改进提案，并建立跨团队信任网络。",
    ],
  };

  // —— 模块 16：面试官结构化提问指南（9 题 · 3 轨道） ——
  const makeQ = (
    s: (typeof sortedDesc)[number],
    intent: string,
    probes: string[],
    qIndex: number
  ): InterviewQuestionFull => {
    const q = d[s.key].interviewQuestions[qIndex % d[s.key].interviewQuestions.length];
    return {
      dimensionKey: s.key,
      dimensionLabel: labelOf(s.key),
      intent,
      prompt: q.prompt,
      probes,
      greenFlags: q.greenFlags,
      redFlags: q.redFlags,
    };
  };

  const bottom3 = sortedDesc.slice(-3).reverse();
  const t1Probes = ["当时的资源与时间约束是什么？", "如果重来一次，你会改变哪个关键决策？", "这件事中最难被他人复制的一步是什么？"];
  const t2Probes = ["你如何意识到这是自己的短板？", "你会借助哪些人或机制来补足？", "过去是否因此吃过亏？如何应对？"];
  const t3Probes = ["压力最大的那个时刻，你做了什么决策？", "如果队友/下属情绪崩溃，你会怎么稳住局面？", "你有没有在高压下「用力过猛」过？如何回调？"];

  const interview: InterviewModule = {
    callout: `面试时重点抓「${bottom1}」短板与「${top1}」过载这两个疑点深挖，就能快速辨真伪。`,
    tracks: [
      {
        track: "Track 1 · 核心长板真实性核验",
        trackDesc: "考察最高分胜任力在复杂项目中的实操深度，区分真本事与背稿式回答。",
        items: top3.map((s, i) => makeQ(s, `核验其在「${labelOf(s.key)}」上的真实深度与实操细节。`, t1Probes, i)),
      },
      {
        track: "Track 2 · 能力短板与代偿深度探查",
        trackDesc: "针对弱项考察其自我认知清晰度，以及是否会主动借力、机制化代偿。",
        items: bottom3.map((s, i) => makeQ(s, `考察其对「${labelOf(s.key)}」短板的自我认知与代偿成熟度。`, t2Probes, i)),
      },
      {
        track: "Track 3 · 高压冲突与危机推演",
        trackDesc: "模拟极度承压、资源匮乏与团队利益冲突时的真实反应与决策质量。",
        items: [sortedDesc[0], lowest, bottom2[1]].map((s, i) =>
          makeQ(s, `模拟极度承压场景，观察其在「${labelOf(s.key)}」被放大时的反应与补救能力。`, t3Probes, i)
        ),
      },
    ],
  };

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
    consistency,
    exec,
    role,
    stage,
    competency,
    talents,
    personality,
    thinking,
    motivation,
    values,
    preferences,
    conflict,
    risk,
    crisis,
    team,
    onboarding,
    interview,
  };
}

/** 生成可复制的 HR 摘要文本 */
export function buildSummaryText(report: ReportData): string {
  const L: string[] = [];
  L.push(`【职场胜任力测评 · 人才评估白皮书】`);
  L.push(`候选人：${report.candidateName}`);
  L.push(`邮箱：${report.email || "未填写"}`);
  L.push(`应聘岗位：${report.position || "未填写"}`);
  L.push(`测评套件：${report.trackName} (${report.trackEnName})`);
  L.push(`生成时间：${new Date(report.generatedAt).toLocaleString("zh-CN")}`);
  L.push(``);
  L.push(`— 高管 1 分钟速览 —`);
  L.push(`【结论】${report.exec.callout}`);
  L.push(`人才代号：${report.exec.code}（${report.exec.codeEn}）`);
  report.exec.takeaways.forEach((t) => L.push(`${t.title}：${t.content}`));
  L.push(``);
  L.push(`— 8 项能力打分（0–100）—`);
  sortByScoreDesc(report.scores).forEach((s, i) => L.push(`${i + 1}. ${s.label}：${s.normalized} 分`));
  L.push(``);
  L.push(`— 岗位与阶段匹配 —`);
  L.push(`最推荐：${report.role.topRoles.map((r) => r.role).join("、")}`);
  L.push(`慎选：${report.role.cautionRoles.map((r) => r.role).join("、")}`);
  L.push(`最佳阶段：${report.stage.stages[0].name}（${report.stage.stages[0].score}）`);
  L.push(``);
  L.push(`— 做事风格与动力 —`);
  L.push(`性格：${report.personality.style}（${report.personality.styleEn}）`);
  L.push(`驱动力：${[...report.motivation.drivers].sort((a, b) => b.score - a.score).map((x) => `${x.name} ${x.score}`).join("、")}`);
  L.push(``);
  L.push(`— 风险与危机 —`);
  L.push(`过载风险：${report.risk.overuse.map((o) => `${o.label}——${o.risk}`).join("；")}`);
  L.push(`危机应对：${report.crisis.mode} · 复原力 ${report.crisis.resilienceIndex}（${report.crisis.resilienceLabel}）`);
  L.push(``);
  L.push(`— 团队搭档与管理 —`);
  L.push(`黄金搭档：${report.team.complement}`);
  L.push(`管理法则：${report.onboarding.manageTips[0]}`);
  L.push(``);
  L.push(`— 面试官追问指南（9 题）—`);
  report.interview.tracks.forEach((t) => {
    L.push(`【${t.track}】`);
    t.items.forEach((q, i) => {
      L.push(`${i + 1}. ${q.prompt}`);
      L.push(`   目的：${q.intent}`);
      L.push(`   ✅ 加分：${q.greenFlags.join("；")}`);
      L.push(`   ⚠️ 减分：${q.redFlags.join("；")}`);
    });
  });
  return L.join("\n");
}






