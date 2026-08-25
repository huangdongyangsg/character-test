"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, ShieldCheck, Sparkles, User } from "lucide-react";
import AssessmentCard from "@/components/AssessmentCard";
import { getTrack, TRACK_LIST } from "@/lib/tracks";
import { getCompletion, saveSession } from "@/lib/storage";
import type { Track } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [candidateName, setCandidateName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [showError, setShowError] = useState(false);

  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const existing = isValidEmail(email) ? getCompletion(email) : null;

  const handleStart = (track: Track) => {
    const name = candidateName.trim();
    if (!name || !isValidEmail(email)) {
      setShowError(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    saveSession({
      candidateName: name,
      email: email.trim(),
      position: position.trim(),
      trackId: track.id,
    });
    router.push(`/assessment/${track.id}`);
  };

  return (
    <div className="min-h-screen">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-float">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">职场胜任力测评</p>
              <p className="text-[11px] text-slate-400">胜任力评估平台</p>
            </div>
          </div>
          <span className="hidden rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 sm:inline-block">
            基于权威胜任力行为模型
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid-slate [background-size:40px_40px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-50/60 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-1.5 text-xs font-medium text-indigo-600 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            端到端职场性格与胜任力测评 SaaS
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            用科学的方法，识人于未然
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
            基于权威胜任力行为模型，通过高保真职场情境的迫选排序，
            深度刻画候选人的行为倾向、核心优势与发展盲点，并为面试官自动生成结构化追问指南。
          </p>

          <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
            {["Borda 迫选计分", "6 大胜任力维度", "雷达图 × 柱状图", "STAR 追问指南"].map(
              (f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm"
                >
                  <BarChart3 className="h-3.5 w-3.5 text-indigo-500" />
                  {f}
                </span>
              )
            )}
          </div>
        </div>
      </section>
      {/* 候选人信息 + 选轨 */}
      <main className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        {/* 信息表单 */}
        <div
          className={`mx-auto mb-10 max-w-3xl rounded-3xl border bg-white p-6 shadow-card sm:p-8 ${
            showError ? "border-rose-200 ring-2 ring-rose-100" : "border-slate-200"
          }`}
        >
          <div className="mb-5 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-slate-900">候选人信息</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                候选人姓名 <span className="text-rose-500">*</span>
              </label>
              <input
                value={candidateName}
                onChange={(e) => {
                  setCandidateName(e.target.value);
                  if (e.target.value.trim()) setShowError(false);
                }}
                placeholder="请输入候选人姓名"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                候选人邮箱 <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isValidEmail(e.target.value)) setShowError(false);
                }}
                placeholder="用于接收报告，如 name@company.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                应聘岗位
              </label>
              <input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="如：高级产品经理"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
          {existing && (
            <p className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-700">
              该邮箱已有测评记录（{existing.candidateName} ·{" "}
              {getTrack(existing.trackId)?.name ?? "未知套件"}），再次测评将覆盖原报告。
            </p>
          )}
          {showError && (
            <p className="mt-3 text-sm text-rose-600">
              请填写候选人姓名和有效的邮箱地址，再选择测评套件开始。
            </p>
          )}
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">选择测评套件</h2>
          <p className="mt-2 text-sm text-slate-500">
            4 套独立测评，聚焦不同人群与岗位的核心胜任力维度
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {TRACK_LIST.map((track) => (
            <AssessmentCard key={track.id} track={track} onStart={handleStart} />
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs leading-relaxed text-slate-400 sm:px-6">
          <p>
            本系统底层理论、题库设计、计分模型与报告分析均深度基于权威胜任力行为模型。
          </p>
          <p className="mt-1">
            测评结果仅作为招聘与人才发展的辅助参考，不构成唯一决策依据。
          </p>
        </div>
      </footer>
    </div>
  );
}

