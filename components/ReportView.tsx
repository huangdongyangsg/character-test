"use client";

import { useState } from "react";
import {
  Award,
  Check,
  ClipboardCopy,
  Flag,
  Mail,
  Printer,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReportData } from "@/lib/types";
import { sortByScoreDesc } from "@/lib/scoring";
import { buildSummaryText } from "@/lib/reportGenerator";

const BAR_COLORS = ["#4f46e5", "#6366f1", "#8b5cf6", "#94a3b8", "#64748b", "#475569"];

export default function ReportView({ report }: { report: ReportData }) {
  const [copied, setCopied] = useState(false);
  const sorted = sortByScoreDesc(report.scores);
  const radarData = sorted.map((s) => ({
    dimension: s.label,
    score: s.normalized,
  }));
  const barData = sorted.map((s, i) => ({
    ...s,
    fill: BAR_COLORS[i % BAR_COLORS.length],
  }));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildSummaryText(report));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard 不可用时忽略 */
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(
      `您的职场胜任力测评报告 - ${report.candidateName}`
    );
    const body = encodeURIComponent(buildSummaryText(report));
    window.location.href = `mailto:${report.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* 工具栏 */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <a
          href="/"
          className="text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
        >
          ← 返回选轨页
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
            导出 / 打印报告
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <ClipboardCopy className="h-4 w-4" />
            )}
            {copied ? "已复制" : "复制面试摘要"}
          </button>
        </div>
      </div>

      {/* 头部信息卡 */}
      <div className="print-full mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-6 text-white sm:px-8">
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-100">
            面试官洞察报告 · 胜任力评估
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            {report.candidateName}
          </h1>
          <p className="mt-1 text-sm text-indigo-100">
            {report.email || "未填写邮箱"} · 应聘岗位：{report.position || "未填写"}
          </p>
          <p className="mt-0.5 text-sm text-indigo-100/80">
            {report.trackName}（{report.trackEnName}）
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 px-6 py-5 text-sm sm:grid-cols-4 sm:px-8">
          <div>
            <p className="text-slate-400">测评题数</p>
            <p className="mt-1 font-semibold text-slate-900">
              {report.questionCount} 道迫选题
            </p>
          </div>
          <div>
            <p className="text-slate-400">胜任力维度</p>
            <p className="mt-1 font-semibold text-slate-900">6 大胜任力维度</p>
          </div>
          <div>
            <p className="text-slate-400">计分模型</p>
            <p className="mt-1 font-semibold text-slate-900">Borda 迫选计分</p>
          </div>
          <div>
            <p className="text-slate-400">生成时间</p>
            <p className="mt-1 font-semibold text-slate-900">
              {new Date(report.generatedAt).toLocaleDateString("zh-CN")}
            </p>
          </div>
        </div>
      </div>
      {/* 图表区 */}
      <div className="print-full mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            胜任力分布雷达图
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: "#475569", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                />
                <Radar
                  name="胜任力指数"
                  dataKey="score"
                  stroke="#4f46e5"
                  fill="#6366f1"
                  fillOpacity={0.35}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            维度得分柱状图
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={90}
                  tick={{ fill: "#475569", fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="normalized" radius={[0, 6, 6, 0]} barSize={22}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* 核心优势 */}
      <section className="print-full mb-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          <Award className="h-5 w-5 text-emerald-500" />
          核心优势（Top 2 维度）
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {report.strengths.map((s) => (
            <div
              key={s.key}
              className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-card"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{s.label}</p>
                  <p className="text-xs text-slate-400">{s.fyiname}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-600">
                  {s.normalized}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {s.strength}
              </p>
              <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  ⚠️ 过载风险（Overuse Risk）
                </p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {s.overuseRisk}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 潜在盲点 */}
      <section className="print-full mb-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          <Target className="h-5 w-5 text-rose-500" />
          潜在盲点 / 发展区（Bottom 2 维度）
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {report.blindSpots.map((b) => (
            <div
              key={b.key}
              className="rounded-3xl border border-rose-100 bg-white p-6 shadow-card"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{b.label}</p>
                  <p className="text-xs text-slate-400">{b.fyiname}</p>
                </div>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-600">
                  {b.normalized}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {b.blindSpot}
              </p>
              <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                  发展建议
                </p>
                <p className="mt-1 text-sm leading-relaxed text-sky-800">
                  {b.developmentTip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* 面试官 STAR 追问指南 */}
      <section className="print-full mb-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          <Flag className="h-5 w-5 text-indigo-500" />
          面试官 STAR 追问指南（Interview Kit）
        </h2>
        <div className="space-y-4">
          {report.interviewKit.map((item, i) => (
            <div
              key={item.key}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {item.focusReason}
                </span>
                <span className="font-semibold text-slate-900">
                  {item.label}
                </span>
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
                    ✅ Green Flag · 良好信号
                  </p>
                  <ul className="space-y-1">
                    {item.question.greenFlags.map((g, j) => (
                      <li
                        key={j}
                        className="flex gap-1.5 text-sm text-emerald-800"
                      >
                        <span className="text-emerald-500">•</span>
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3.5">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-rose-700">
                    ⚠️ Red Flag · 预警信号
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
          本报告基于权威胜任力行为模型生成，采用 Borda 迫选计分，旨在为面试官提供结构化的行为追问线索。
        </p>
        <p className="mt-1">
          测评结果仅作为招聘与人才发展的辅助参考，不构成唯一决策依据。
        </p>
      </footer>
    </div>
  );
}



