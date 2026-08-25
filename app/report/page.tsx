"use client";

import { useEffect, useState } from "react";
import { FileSearch, Loader2 } from "lucide-react";
import ReportView from "@/components/ReportView";
import ReportErrorBoundary from "@/components/ReportErrorBoundary";
import { clearResult, loadResult } from "@/lib/storage";
import type { ReportData } from "@/lib/types";

export default function ReportPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const r = loadResult();
    // 校验报告结构：旧版本缓存缺少 exec / interview 等字段，直接清理避免渲染崩溃
    if (r && (r as ReportData).exec && (r as ReportData).interview && (r as ReportData).competency) {
      setReport(r);
    } else {
      if (r) clearResult();
      setReport(null);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <FileSearch className="h-12 w-12 text-slate-300" />
        <p className="mt-4 text-lg font-semibold text-slate-900">
          尚未生成测评报告
        </p>
        <p className="mt-2 text-sm text-slate-500">
          请先在选轨页完成一次测评，再查看报告。
        </p>
        <a
          href="/"
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          前往选轨页
        </a>
      </div>
    );
  }

  return (
    <ReportErrorBoundary>
      <ReportView report={report} />
    </ReportErrorBoundary>
  );
}

