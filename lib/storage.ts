import type { ReportData, SessionData } from "./types";

const SESSION_KEY = "fyi_session";
const RESULT_KEY = "fyi_result";

const isBrowser = () => typeof window !== "undefined";

export function saveSession(data: SessionData): void {
  if (!isBrowser()) return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function loadSession(): SessionData | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function saveResult(data: ReportData): void {
  if (!isBrowser()) return;
  localStorage.setItem(RESULT_KEY, JSON.stringify(data));
}

export function loadResult(): ReportData | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(RESULT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReportData;
  } catch {
    return null;
  }
}

export function clearResult(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(RESULT_KEY);
}

const COMPLETIONS_KEY = "fyi_completions";

export interface CompletionRecord {
  email: string;
  candidateName: string;
  trackId: string;
  completedAt: string;
}

/** 以邮箱为唯一标识，判断该候选人是否已完成过测评 */
export function hasCompleted(email: string): boolean {
  if (!isBrowser()) return false;
  const all = loadCompletions();
  const key = email.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(all, key);
}

/** 记录一次完成测评（以邮箱为键，同邮箱重复测评会覆盖） */
export function recordCompletion(rec: CompletionRecord): void {
  if (!isBrowser()) return;
  const all = loadCompletions();
  all[rec.email.trim().toLowerCase()] = rec;
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(all));
}

export function getCompletion(
  email: string
): CompletionRecord | null {
  if (!isBrowser()) return null;
  const all = loadCompletions();
  return all[email.trim().toLowerCase()] ?? null;
}

function loadCompletions(): Record<string, CompletionRecord> {
  try {
    const raw = localStorage.getItem(COMPLETIONS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CompletionRecord>) : {};
  } catch {
    return {};
  }
}
