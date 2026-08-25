"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Brain,
  Briefcase,
  Building2,
  Check,
  ClipboardCopy,
  Flag,
  Gauge,
  Mail,
  MessageSquare,
  Printer,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Users,
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

const BAND_STYLES: Record<
  Band,
  { label: string; bar: string; text: string; chip: string }
> = {
  high: {
    label: "优势领域",
    bar: "bg-indigo-500",
    text: "text-indigo-600",
    chip: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  mid: {
    label: "稳健领域",
    bar: "bg-sky-500",
    text: "text-sky-600",
    chip: "bg-sky-50 text-sky-700 border-sky-100",
  },
  low: {
    label: "潜在发展区",
    bar: "bg-rose-500",
    text: "text-rose-600",
    chip: "bg-rose-50 text-rose-700 border-rose-100",
  },
};

const RING_COLORS = ["#6366f1", "#8b5cf6", "#0ea5e9", "#f43f5e"];

function RingStat({ value, color }: { value: number; color: string }) {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <span className="absolute text-lg font-bold text-slate-900">{value}</span>
    </div>
  );
}
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
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* 工具栏 */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            返回选轨页
          </a>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleEmail}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700"
            >
              <Mail className="h-4 w-4" />
              发送报告到邮箱
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" />
              导出 / 打印
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
              {copied ? "已复制" : "复制 HR 摘要"}
            </button>
          </div>
        </div>
        {/* 模块 1：高管画像卡 */}
        <section className="print-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 shadow-card">
          <div className="px-6 py-8 sm:px-10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-widest text-indigo-200">
              <Sparkles className="h-4 w-4" />
              高管人才画像总览 · Executive Archetype
            </div>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {report.candidateName}
                </h1>
                <p className="mt-2 text-sm text-indigo-200/90">
                  {report.email || "未填写邮箱"} · {report.position || "未填写岗位"} · {report.trackName}（{report.trackEnName}）
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {report.archetype.tags.map((t, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white backdrop-blur"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-5 max-w-3xl rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-indigo-100">
              {report.archetype.summary}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-white/10 bg-black/10 px-6 py-5 lg:grid-cols-4 sm:px-10">
            {report.topStats.map((s, i) => (
              <div key={s.key} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                <RingStat value={s.normalized} color={RING_COLORS[i % RING_COLORS.length]} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{s.label}</p>
                  <p className="truncate text-xs text-indigo-200/70">{s.fyiname}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* 模块 2：全维度行为指数 */}
        <section className="print-full mt-6">
          <div className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            全维度行为指数
            <span className="text-sm font-normal text-slate-400">（0–100 · 按得分降序）</span>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
              <div className="mb-5 flex flex-wrap gap-2">
                {(Object.keys(BAND_STYLES) as Band[]).map((b) => (
                  <span key={b} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${BAND_STYLES[b].chip}`}>
                    {BAND_STYLES[b].label}
                  </span>
                ))}
              </div>
              <div className="space-y-3">
                {sorted.map((s) => {
                  const b = bandOf(s.normalized);
                  return (
                    <div key={s.key}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">
                          {s.label}
                          <span className="ml-1.5 text-xs font-normal text-slate-400">{s.fyiname}</span>
                        </span>
                        <span className={`font-bold ${BAND_STYLES[b].text}`}>{s.normalized}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${BAND_STYLES[b].bar} transition-all duration-1000`}
                          style={{ width: `${s.normalized}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
              <h3 className="mb-2 text-base font-semibold text-slate-900">雷达图视角</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="72%">
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: "#475569", fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <Radar name="胜任力指数" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
        {/* 模块 3：四大职场元动力 */}
        <section className="print-full mt-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <Gauge className="h-5 w-5 text-indigo-500" />
            四大深度职场工作元动力
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: Brain, d: report.dynamics.decisionLogic },
              { icon: Users, d: report.dynamics.leadership },
              { icon: MessageSquare, d: report.dynamics.communication },
            ].map(({ icon: Icon, d }) => (
              <div key={d.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
                <div className="flex items-center gap-2 text-indigo-500">
                  <Icon className="h-5 w-5" />
                  <p className="text-sm font-semibold text-slate-500">{d.title}</p>
                </div>
                <p className="mt-3 text-base font-bold text-slate-900">{d.lean}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{d.description}</p>
              </div>
            ))}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:col-span-2 xl:col-span-1">
              <div className="flex items-center gap-2 text-indigo-500">
                <Rocket className="h-5 w-5" />
                <p className="text-sm font-semibold text-slate-500">{report.dynamics.drivers.title}</p>
              </div>
              <p className="mt-3 text-base font-bold text-slate-900">
                核心：{report.dynamics.drivers.primary} · 次级：{report.dynamics.drivers.secondary}
              </p>
              <p className="mt-1 text-xs text-slate-400">较弱驱动：{report.dynamics.drivers.weaker}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{report.dynamics.drivers.description}</p>
            </div>
          </div>
        </section>
        {/* 模块 4：核心优势与过载风险 */}
        <section className="print-full mt-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <Award className="h-5 w-5 text-emerald-500" />
            核心优势与过载风险
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              {report.strengths.map((s, i) => (
                <div key={s.key} className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        <span className="mr-1.5 text-emerald-500">#{i + 1}</span>
                        {s.label}
                      </p>
                      <p className="text-xs text-slate-400">{s.fyiname}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-600">
                      {s.normalized}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.strength}</p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-amber-100 bg-amber-50/50 p-5 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <p className="text-base font-semibold text-slate-900">过载风险（Overuse Risks）</p>
              </div>
              <p className="mb-4 text-xs text-amber-700/70">
                优势过度使用可能带来的负面衍生效应，面试时需重点观察。
              </p>
              <div className="space-y-3">
                {report.overuseRisks.map((r) => (
                  <div key={r.key} className="rounded-2xl border border-amber-100 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {r.label} <span className="ml-1 text-xs font-normal text-slate-400">{r.fyiname}</span>
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-amber-800">{r.overuseRisk}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 模块 5：潜在短板与代偿盲点 */}
        <section className="print-full mt-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <Target className="h-5 w-5 text-rose-500" />
            潜在短板与代偿盲点
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {report.blindSpots.map((b) => (
              <div key={b.key} className="rounded-3xl border border-rose-100 bg-white p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{b.label}</p>
                    <p className="text-xs text-slate-400">{b.fyiname}</p>
                  </div>
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-600">
                    {b.normalized}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{b.blindSpot}</p>
                <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">应对与代偿策略</p>
                  <p className="mt-1 text-sm leading-relaxed text-sky-800">{b.developmentTip}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* 模块 6：角色与环境匹配度 */}
        <section className="print-full mt-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <Briefcase className="h-5 w-5 text-indigo-500" />
            角色与环境匹配度
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-600">✓</span>
                高匹配角色
              </p>
              <div className="flex flex-wrap gap-2">
                {report.roleFit.highFit.map((r) => (
                  <span key={r} className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                    {r}
                  </span>
                ))}
              </div>
              <p className="mb-3 mt-5 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-xs text-rose-600">✕</span>
                较低匹配角色
              </p>
              <div className="flex flex-wrap gap-2">
                {report.roleFit.lowFit.map((r) => (
                  <span key={r} className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700">
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Building2 className="h-4 w-4 text-emerald-500" />
                  最佳工作环境
                </p>
                <p className="text-sm leading-relaxed text-slate-600">{report.roleFit.bestEnv}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Building2 className="h-4 w-4 text-rose-500" />
                  摩擦工作环境
                </p>
                <p className="text-sm leading-relaxed text-slate-600">{report.roleFit.frictionEnv}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 模块 7：答题一致性指数 */}
        <section className="print-full mt-6">
          <div
            className={`rounded-3xl border p-6 shadow-card ${
              report.consistency.flagType === "danger"
                ? "border-rose-200 bg-rose-50/50"
                : report.consistency.flagType === "warn"
                ? "border-amber-200 bg-amber-50/50"
                : "border-emerald-200 bg-emerald-50/40"
            }`}
          >
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-3">
                <Gauge className="h-6 w-6 text-indigo-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">答题真实性与一致性指数</p>
                  <p className="text-xs text-slate-400">Response Consistency & Anti-fraud</p>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{report.consistency.score}%</span>
                <span className="text-sm font-semibold text-indigo-600">· {report.consistency.label}</span>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600">{report.consistency.flag}</p>
            </div>
          </div>
        </section>
        {/* 模块 8：HR & 面试官追问工具箱 */}
        <section className="print-full mt-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <Flag className="h-5 w-5 text-indigo-500" />
            HR & 面试官专属追问工具箱（Interview Kit）
          </h2>
          <div className="space-y-4">
            {report.interviewKit.map((item, i) => (
              <div key={item.key} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {item.focusReason}
                  </span>
                  <span className="font-semibold text-slate-900">{item.label}</span>
                  <span className="text-xs text-slate-400">{item.fyiname}</span>
                  <span className="ml-auto rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-600">
                    {item.normalized}
                  </span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-800">
                  {item.question.prompt}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3.5">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      ✅ Green Flag · 正面信号
                    </p>
                    <ul className="space-y-1">
                      {item.question.greenFlags.map((g, j) => (
                        <li key={j} className="flex gap-1.5 text-sm text-emerald-800">
                          <span className="text-emerald-500">•</span>
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3.5">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-rose-700">
                      ⚠️ Red Flag · 危险信号
                    </p>
                    <ul className="space-y-1">
                      {item.question.redFlags.map((r, j) => (
                        <li key={j} className="flex gap-1.5 text-sm text-rose-800">
                          <span className="text-rose-500">•</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="print-full mt-8 border-t border-slate-200 pt-6 text-center text-xs leading-relaxed text-slate-400">
          <p>
            本报告基于权威胜任力行为模型生成，采用 Borda 迫选计分与一致性校验，旨在为招聘与人才发展提供结构化参考。
          </p>
          <p className="mt-1">测评结果仅作为辅助参考，不构成唯一决策依据。</p>
        </footer>
      </div>
    </div>
  );
}

