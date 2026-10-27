import type { ReviewInput } from './practice-data';
export type PracticeState = { id: string; remaining: string[]; current: string | null; lastReviewId?: string; pending?: ReviewInput };
const key = 'careery-practice-session-v1';
export function readSession(): PracticeState | null {
  try {
    const raw = sessionStorage.getItem(key); if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const session = value as PracticeState;
    if (typeof session.id !== 'string' || !Array.isArray(session.remaining) || session.remaining.some((id) => typeof id !== 'string') || session.current !== null && typeof session.current !== 'string') return null;
    return session;
  } catch { return null; }
}
export function writeSession(session: PracticeState | null) {
  try { if (session) sessionStorage.setItem(key, JSON.stringify(session)); else sessionStorage.removeItem(key); }
  catch { /* Reviews are saved on the server even when session storage is unavailable. */ }
}
