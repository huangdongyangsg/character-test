"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ListOrdered,
  Loader2,
} from "lucide-react";
import RankingBoard from "@/components/RankingBoard";
import { buildAssessment } from "@/lib/questionBank";
import { getTrack } from "@/lib/tracks";
import { loadSession, recordCompletion, saveResult } from "@/lib/storage";
import { generateReport } from "@/lib/reportGenerator";
import type { AnswersMap, Question, Ranking } from "@/lib/types";

export default function AssessmentPage() {
  const params = useParams<{ trackId: string }>();
  const router = useRouter();
  const track = getTrack(params?.trackId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [initialOrders, setInitialOrders] = useState<Record<string, string[]>>({});
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [index, setIndex] = useState(0);
  const [candidateName, setCandidateName] = useState("候选人");

  useEffect(() => {
    if (!track) return;
    const session = loadSession();
    if (session) setCandidateName(session.candidateName || "候选人");
    const qs = buildAssessment(track.id);
    setQuestions(qs);
    const init: Record<string, string[]> = {};
    qs.forEach((q) => {
      init[q.id] = q.options.map((o) => o.id);
    });
    setInitialOrders(init);
  }, [track]);

  const total = questions.length;
  const current = questions[index];

  const currentOrder = useMemo(() => {
    if (!current) return [];
    return (
      answers[current.id] ??
      initialOrders[current.id] ??
      current.options.map((o) => o.id)
    );
  }, [current, answers, initialOrders]);

  const isTouched = current ? !!touched[current.id] : false;
  const isLast = index === total - 1;
  const progress = total ? Math.round(((index + 1) / total) * 100) : 0;

  if (!track) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold text-slate-900">未找到该测评套件</p>
        <a href="/" className="mt-4 text-sm font-medium text-indigo-600">
          ← 返回选轨页
        </a>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  const handleReorder = (newOrder: Ranking) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: newOrder }));
    setTouched((prev) => ({ ...prev, [current.id]: true }));
  };

  const handleReset = () => {
    if (!current) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[current.id];
      return next;
    });
    setTouched((prev) => ({ ...prev, [current.id]: false }));
  };

  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const handleNext = () => {
    if (!isTouched) return;
    if (!isLast) {
      setIndex(index + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const session = loadSession();
    const report = generateReport({
      candidateName,
      email: session?.email ?? "",
      position: session?.position ?? "",
      track,
      questions,
      answers,
    });
    saveResult(report);
    recordCompletion({
      email: session?.email ?? "",
      candidateName,
      trackId: track.id,
      completedAt: new Date().toISOString(),
    });
    router.push("/report");
  };

  return (
    <div className="min-h-screen">
      {/* 顶部 */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-indigo-600">
                {track.name}
              </p>
              <p className="text-lg font-bold text-slate-900">
                {candidateName} · 行为倾向迫选排序
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                Question {index + 1}/{total}
              </p>
              <p className="text-xs text-slate-400">剩余 {total - index - 1} 题</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div key={current.id} className="animate-fade-in-up">
          {/* 情境卡片 */}
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-500">
              <ListOrdered className="h-4 w-4" />
              职场情境 · 请思考你会如何处理
            </div>
            <p className="text-base leading-relaxed text-slate-800 sm:text-lg">
              {current.scenario}
            </p>
          </div>

          {/* 拖拽排序区 */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5 shadow-card sm:p-6">
            <p className="mb-4 text-sm font-medium text-slate-600">
              将以下 6 个行动选项，从「最符合你的做法」拖拽排序到「最不符合」：
            </p>
            <RankingBoard
              options={current.options}
              order={currentOrder}
              onReorder={handleReorder}
              onReset={handleReset}
              touched={isTouched}
            />
          </div>

          {!isTouched && (
            <p className="mt-3 text-center text-xs text-slate-400">
              完成一次拖拽排序后即可继续
            </p>
          )}

          {/* 底部按钮 */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={handlePrev}
              disabled={index === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              上一题
            </button>
            <button
              onClick={handleNext}
              disabled={!isTouched}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40 ${track.theme.button}`}
            >
              {isLast ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  生成报告
                </>
              ) : (
                <>
                  下一题
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

