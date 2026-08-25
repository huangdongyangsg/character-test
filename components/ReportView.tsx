"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BarChart3,
  Brain,
  Briefcase,
  Check,
  ClipboardCopy,
  Compass,
  Flag,
  HeartHandshake,
  Layers,
  Mail,
  Map,
  MessagesSquare,
  Printer,
  ShieldAlert,
  Sparkles,
  User,
  Users,
  Workflow,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ReportData } from "@/lib/types";
import { sortByScoreDesc } from "@/lib/scoring";
import { buildSummaryText } from "@/lib/reportGenerator";

type Band = "high" | "mid" | "low";
function bandOf(score: number): Band {
  if (score >= 75) return "high";
  if (score >= 50) return "mid";
  return "low";
}
const BAND: Record<Band, { label: string; bar: string; text: string; chip: string }> = {
  high: { label: "强项优势", bar: "bg-indigo-500", text: "text-indigo-600", chip: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  mid: { label: "稳健达标", bar: "bg-sky-500", text: "text-sky-600", chip: "bg-sky-50 text-sky-700 border-sky-100" },
  low: { label: "待提升区", bar: "bg-rose-500", text: "text-rose-600", chip: "bg-rose-50 text-rose-700 border-rose-100" },
};

function Ring({ value, color, size = 64 }: { value: number; color: string; size?: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }} />
      </svg>
      <span className="absolute text-lg font-bold text-slate-900">{value}</span>
    </div>
  );
}

function HBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${value}%` }} />
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">💡 结论速览</p>
      <p className="mt-1 text-sm font-medium leading-relaxed text-indigo-900">{children}</p>
    </div>
  );
}

function SectionHead({ kicker, title, icon: Icon }: { kicker: string; title: string; icon: typeof Sparkles }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-float">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">{kicker}</p>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>
    </div>
  );
}

const NAV = [
  { id: "exec", label: "1分钟决策速览", icon: Sparkles },
  { id: "role", label: "岗位角色推荐", icon: Briefcase },
  { id: "stage", label: "业务阶段匹配", icon: Layers },
  { id: "competency", label: "8项能力打分", icon: BarChart3 },
  { id: "talents", label: "天生优势才干", icon: Award },
  { id: "personality", label: "做事风格画像", icon: User },
  { id: "thinking", label: "思考解决问题", icon: Brain },
  { id: "motivation", label: "动力与氛围", icon: HeartHandshake },
  { id: "values", label: "底层价值观", icon: Compass },
  { id: "preferences", label: "四大日常偏好", icon: Workflow },
  { id: "conflict", label: "跨部门冲突", icon: MessagesSquare },
  { id: "risk", label: "压力风险盲点", icon: AlertTriangle },
  { id: "crisis", label: "危机复原力", icon: ShieldAlert },
  { id: "team", label: "最佳搭档配置", icon: Users },
  { id: "onboarding", label: "入职90天", icon: Map },
  { id: "interview", label: "面试提问指南", icon: Flag },
];
export default function ReportView({ report }: { report: ReportData }) {
  const [copied, setCopied] = useState(false);
  const sorted = sortByScoreDesc(report.scores);
  const radarData = sorted.map((s) => ({ dimension: s.label, score: s.normalized }));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildSummaryText(report));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };
  const handleEmail = () => {
    const subject = encodeURIComponent(`您的职场胜任力测评报告 - ${report.candidateName}`);
    const body = encodeURIComponent(buildSummaryText(report));
    window.location.href = `mailto:${report.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="no-print sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600">
            <ArrowLeft className="h-4 w-4" /> 返回选轨页
          </a>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleEmail} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700">
              <Mail className="h-4 w-4" /> 发送报告
            </button>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
              <Printer className="h-4 w-4" /> 导出 / 打印
            </button>
            <button onClick={handleCopy} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700">
              {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
              {copied ? "已复制" : "复制 HR 摘要"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] gap-6 px-4 py-6 sm:px-6">
        <aside className="no-print hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">报告目录</p>
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-700">
                <n.icon className="h-4 w-4 shrink-0 text-slate-400" />
                {n.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          {/* 1. 高管 1 分钟决策速览 */}
          <section id="exec" className="scroll-mt-24 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 shadow-card">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <p className="text-xs font-medium uppercase tracking-widest text-indigo-200">Executive Summary · 高管 1 分钟决策速览</p>
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-200">💡 结论速览</p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-white">{report.exec.callout}</p>
                </div>
                <h1 className="mt-4 text-3xl font-bold text-white">{report.candidateName}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-base font-bold text-white">{report.exec.code}</span>
                  <span className="text-sm font-medium text-indigo-200/80">{report.exec.codeEn}</span>
                </div>
                <p className="mt-3 text-sm text-indigo-200/80">
                  {report.email || "未填写邮箱"} · {report.position || "未填写岗位"} · {report.trackName}（{report.trackEnName}）
                </p>
                <div className="mt-4 space-y-2.5">
                  {report.exec.takeaways.map((t, i) => (
                    <div key={t.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">{i + 1} · {t.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-indigo-50">{t.content}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-center lg:col-span-2">
                <p className="mb-2 text-sm font-semibold text-white">8 项能力雷达图</p>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="72%">
                      <PolarGrid stroke="rgba(255,255,255,0.15)" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fill: "#c7d2fe", fontSize: 11 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#818cf8", fontSize: 9 }} />
                      <Radar name="指数" dataKey="score" stroke="#a5b4fc" fill="#818cf8" fillOpacity={0.4} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          {/* 2. 岗位胜任与最适配角色推荐 */}
          <section id="role" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <SectionHead kicker="Role Alignment" title="岗位胜任与最适配角色推荐" icon={Briefcase} />
            <Callout>{report.role.callout}</Callout>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-emerald-600">✓ 最推荐的 3 个职位方向</p>
                <div className="mt-3 space-y-3">
                  {report.role.topRoles.map((r) => (
                    <div key={r.role} className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                      <p className="font-semibold text-slate-900">{r.role}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{r.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-rose-600">✕ 慎选的 2 个内耗型职位</p>
                <div className="mt-3 space-y-3">
                  {report.role.cautionRoles.map((r) => (
                    <div key={r.role} className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
                      <p className="font-semibold text-slate-900">{r.role}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{r.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 3. 业务不同发展阶段的作战匹配度 */}
          <section id="stage" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <SectionHead kicker="Business Stage Fit" title="业务不同发展阶段的作战匹配度" icon={Layers} />
            <Callout>{report.stage.callout}</Callout>
            <div className="grid gap-4 sm:grid-cols-2">
              {report.stage.stages.map((s) => (
                <div key={s.name} className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">{s.name}</span>
                    <span className="font-bold text-indigo-600">{s.score}</span>
                  </div>
                  <HBar value={s.score} color={s.score >= 75 ? "bg-indigo-500" : s.score >= 50 ? "bg-sky-500" : "bg-rose-500"} />
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>
          {/* 4. 8 项核心职场能力打分 */}
          <section id="competency" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <SectionHead kicker="Competency Scores" title="8 项核心职场能力打分" icon={BarChart3} />
            <Callout>{report.competency.callout}</Callout>
            <div className="mb-4 flex flex-wrap gap-2">
              {(Object.keys(BAND) as Band[]).map((b) => (
                <span key={b} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${BAND[b].chip}`}>
                  {BAND[b].label} {b === "high" ? "≥75" : b === "mid" ? "50-74" : "<50"}
                </span>
              ))}
            </div>
            <div className="space-y-4">
              {report.competency.items.map((i) => {
                const b = bandOf(i.score);
                return (
                  <div key={i.key} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {i.label} <span className="ml-1 text-xs font-normal text-slate-400">{i.fyiname}</span>
                        </p>
                        <p className="text-xs text-slate-400">{i.category} · 百分位 P{i.percentile}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-sm font-bold ${BAND[b].chip}`}>{i.score}</span>
                    </div>
                    <div className="mt-2"><HBar value={i.score} color={BAND[b].bar} /></div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{i.anchor}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 5. 天生优势与才干特征 */}
          <section id="talents" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <SectionHead kicker="Natural Talents" title="天生优势与才干特征" icon={Award} />
            <Callout>{report.talents.callout}</Callout>
            <div className="grid gap-4 md:grid-cols-3">
              {report.talents.talents.map((t, i) => (
                <div key={t.label} className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
                  <p className="text-xs font-bold text-emerald-500">Top {i + 1} 天赋</p>
                  <p className="mt-1 font-semibold text-slate-900">{t.label} <span className="text-xs font-normal text-slate-400">{t.en}</span></p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
              <p className="text-sm font-semibold text-violet-700">最适合攻坚的业务硬仗</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {report.talents.battleTypes.map((b) => (
                  <span key={b} className="rounded-full border border-violet-100 bg-white px-3 py-1 text-xs font-medium text-violet-700">{b}</span>
                ))}
              </div>
            </div>
          </section>

          {/* 6. 职场性格与做事风格画像 */}
          <section id="personality" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <SectionHead kicker="Personality Style" title="职场性格与做事风格画像" icon={User} />
            <Callout>{report.personality.callout}</Callout>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
                <p className="text-xs font-semibold uppercase text-indigo-500">主导做事风格</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{report.personality.style}</p>
                <p className="text-sm font-medium text-indigo-600">{report.personality.styleEn}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{report.personality.styleDesc}</p>
              </div>
              <div className="space-y-4">
                {report.personality.dims.map((dd) => (
                  <div key={dd.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{dd.name}</span>
                      <span className="font-bold text-slate-900">{dd.score}</span>
                    </div>
                    <HBar value={dd.score} color="bg-violet-500" />
                  </div>
                ))}
              </div>
            </div>
          </section>
          {/* 7. 业务思考与问题解决习惯 */}
          <section id="thinking" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <SectionHead kicker="Thinking Style" title="业务思考与问题解决习惯" icon={Brain} />
            <Callout>{report.thinking.callout}</Callout>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-sm font-semibold text-slate-500">宏观 vs 细节倾向</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{report.thinking.macroLean}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{report.thinking.macroDesc}</p>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
                <p className="text-sm font-semibold text-slate-700">资源匮乏时的取舍逻辑</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{report.thinking.resourceLogic}</p>
              </div>
            </div>
          </section>

          {/* 8. 工作动力与最喜欢的团队氛围 */}
          <section id="motivation" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <SectionHead kicker="Motivation & Environment" title="工作动力与最喜欢的团队氛围" icon={HeartHandshake} />
            <Callout>{report.motivation.callout}</Callout>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-slate-700">5 大内在动力评分</p>
                <div className="mt-4 space-y-4">
                  {[...report.motivation.drivers].sort((a, b) => b.score - a.score).map((dd) => (
                    <div key={dd.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{dd.name}</span>
                        <span className="font-bold text-slate-900">{dd.score}</span>
                      </div>
                      <HBar value={dd.score} color="bg-violet-500" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
                  <p className="text-sm font-semibold text-emerald-700">✓ 最喜欢的团队氛围</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{report.motivation.fitEnv}</p>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-5">
                  <p className="text-sm font-semibold text-rose-700">✕ 最排斥的窒息环境</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{report.motivation.chokeEnv}</p>
                </div>
              </div>
            </div>
          </section>

          {/* 9. 职场底层价值观与安全感来源 */}
          <section id="values" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <SectionHead kicker="Core Values" title="职场底层价值观与安全感来源" icon={Compass} />
            <Callout>{report.values.callout}</Callout>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
                <p className="text-sm font-semibold text-indigo-700">底层核心追求</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{report.values.corePursuit}</p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-5">
                <p className="text-sm font-semibold text-rose-700">触发强烈抵触的情境</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{report.values.triggers}</p>
              </div>
            </div>
          </section>
          {/* 10. 日常工作四大偏好 */}
          <section id="preferences" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <SectionHead kicker="Daily Preferences" title="日常工作四大偏好" icon={Workflow} />
            <Callout>{report.preferences.callout}</Callout>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {report.preferences.items.map((it) => (
                <div key={it.title} className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm font-semibold text-slate-500">{it.title}</p>
                  <p className="mt-2 text-base font-bold text-slate-900">{it.lean}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{it.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 11. 跨部门沟通与冲突化解习惯 */}
          <section id="conflict" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <SectionHead kicker="Cross-team Conflict" title="跨部门沟通与冲突化解习惯" icon={MessagesSquare} />
            <Callout>{report.conflict.callout}</Callout>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
                <p className="text-sm font-semibold text-indigo-700">冲突应对风格</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{report.conflict.style}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{report.conflict.styleDesc}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-sm font-semibold text-slate-700">说服他人的方式</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{report.conflict.persuadeMode}</p>
              </div>
            </div>
          </section>

          {/* 12. 压力过大时的潜在风险与盲点 */}
          <section id="risk" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <SectionHead kicker="Stress & Blindspots" title="压力过大时的潜在风险与盲点" icon={AlertTriangle} />
            <Callout>{report.risk.callout}</Callout>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5">
                <p className="text-sm font-semibold text-amber-700">强项过载的破坏性行为</p>
                <div className="mt-3 space-y-3">
                  {report.risk.overuse.map((o) => (
                    <div key={o.label} className="rounded-xl border border-amber-100 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-900">{o.label} <span className="ml-1 text-xs font-normal text-slate-400">{o.fyiname}</span></p>
                      <p className="mt-1 text-sm leading-relaxed text-amber-800">{o.risk}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-5">
                <p className="text-sm font-semibold text-rose-700">脱轨触发点与纠偏建议</p>
                <div className="mt-3 space-y-3">
                  {report.risk.derailment.map((dd, idx) => (
                    <div key={idx} className="rounded-xl border border-rose-100 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-900">触发情境</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{dd.trigger}</p>
                      <p className="mt-2 text-xs font-semibold text-emerald-600">纠偏建议</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{dd.advice}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          {/* 13. 面对重大挫折与危机的复原力 */}
          <section id="crisis" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <SectionHead kicker="Crisis & Resilience" title="面对重大挫折与危机的复原力" icon={ShieldAlert} />
            <Callout>{report.crisis.callout}</Callout>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center gap-5 rounded-2xl border border-slate-200 p-5">
                <Ring value={report.crisis.resilienceIndex} color="#8b5cf6" size={88} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">逆境复原力评分</p>
                  <p className="text-2xl font-extrabold text-slate-900">{report.crisis.resilienceIndex}</p>
                  <p className="text-sm font-semibold text-indigo-600">回血速度 · {report.crisis.resilienceLabel}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">危机应对模式</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{report.crisis.mode}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{report.crisis.modeDesc}</p>
              </div>
            </div>
          </section>

          {/* 14. 团队最佳搭档配置指南 */}
          <section id="team" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <SectionHead kicker="Team Synergy" title="团队最佳搭档配置指南" icon={Users} />
            <Callout>{report.team.callout}</Callout>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
                <p className="text-sm font-semibold text-indigo-700">团队生态位角色</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{report.team.position}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{report.team.positionDesc}</p>
              </div>
              <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-5">
                <p className="text-sm font-semibold text-violet-700">黄金互补副手</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{report.team.complement}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{report.team.complementDesc}</p>
              </div>
            </div>
          </section>

          {/* 15. 新人入职 90 天落地与管理建议 */}
          <section id="onboarding" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <SectionHead kicker="Onboarding 90 Days" title="新人入职 90 天落地与管理建议" icon={Map} />
            <Callout>{report.onboarding.callout}</Callout>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
                <p className="mb-3 text-sm font-semibold text-emerald-700">直接主管 3 条管理抓手</p>
                <ul className="space-y-2.5">
                  {report.onboarding.manageTips.map((t, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-600"><span className="font-bold text-emerald-500">{i + 1}.</span>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-5">
                <p className="mb-3 text-sm font-semibold text-rose-700">2 个沟通雷区</p>
                <ul className="space-y-2.5">
                  {report.onboarding.donts.map((t, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-600"><span className="font-bold text-rose-500">✕</span>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
                <p className="mb-3 text-sm font-semibold text-indigo-700">前 90 天关键产出建议</p>
                <ul className="space-y-2.5">
                  {report.onboarding.milestones.map((t, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-600"><span className="font-bold text-indigo-500">{i + 1}.</span>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
          {/* 16. 面试官结构化提问指南 */}
          <section id="interview" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <SectionHead kicker="Interview Kit" title="面试官结构化提问指南" icon={Flag} />
            <Callout>{report.interview.callout}</Callout>
            <div className="space-y-6">
              {report.interview.tracks.map((t) => (
                <div key={t.track} className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-1 flex items-center gap-2">
                    <Flag className="h-4 w-4 text-indigo-500" />
                    <p className="text-base font-bold text-slate-900">{t.track}</p>
                  </div>
                  <p className="mb-4 text-xs text-slate-400">{t.trackDesc}</p>
                  <div className="space-y-4">
                    {t.items.map((q, i) => (
                      <div key={q.dimensionKey + i} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white">{i + 1}</span>
                          <span className="text-xs font-semibold text-indigo-600">{q.dimensionLabel}</span>
                          <span className="text-xs text-slate-400">提问目的：{q.intent}</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-800">{q.prompt}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {q.probes.map((p, j) => (
                            <span key={j} className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700">追问切入点：{p}</span>
                          ))}
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                            <p className="mb-1 text-xs font-semibold uppercase text-emerald-700">✅ 加分表现</p>
                            <ul className="space-y-1">
                              {q.greenFlags.map((g, j) => (
                                <li key={j} className="flex gap-1.5 text-xs leading-relaxed text-emerald-800"><span className="text-emerald-500">•</span>{g}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                            <p className="mb-1 text-xs font-semibold uppercase text-rose-700">⚠️ 减分信号</p>
                            <ul className="space-y-1">
                              {q.redFlags.map((r, j) => (
                                <li key={j} className="flex gap-1.5 text-xs leading-relaxed text-rose-800"><span className="text-rose-500">•</span>{r}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="print-full border-t border-slate-200 pt-6 text-center text-xs leading-relaxed text-slate-400">
            <p>本白皮书基于现代人才管理与组织行为学理论生成，采用 Borda 迫选计分与一致性校验。</p>
            <p className="mt-1">测评结果仅作为招聘与人才发展的辅助参考，不构成唯一决策依据。</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

