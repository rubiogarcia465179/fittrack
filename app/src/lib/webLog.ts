/**
 * Web (R-169): el historial vive en WhatsApp. Al terminar, la sesión se
 * envía como texto a tu propio chat (o se copia como JSON); para recuperar
 * el historial, se pega la conversación entera y se leen los entrenos.
 * Además se guarda una copia SOLO en este navegador (localStorage) para la
 * racha "Extra mile" y los pesos de la próxima sesión.
 *
 * Formato de texto (una sesión por mensaje):
 *   FitTrack · 2026-11-21 · 52 min
 *   - Press de banca inclinado: 3 × 10 · 42.5 kg
 *   - Cinta de correr: 15 min
 *   Extra mile
 * El nombre puede estar en cualquiera de los 4 idiomas; en mancuernas el
 * peso es por mano (como en la sesión).
 */
import type { WsState } from './webSession';

export interface LogExercise {
  id: string;
  sets: number;
  reps: number;
  kg: number;
  /** Cardio: minutos. */
  min?: number;
}
export interface LogEntry {
  date: string; // yyyy-mm-dd
  min: number;
  extra?: boolean;
  ex: LogExercise[];
}

/** Sesión terminada → entrada (solo lo hecho; null si no se hizo nada). */
export function entryFromSession(s: WsState, date: string, extra = false): LogEntry | null {
  const ex: LogExercise[] = [];
  for (const e of s.ex) {
    const done = e.sets.filter((x) => x.done_at);
    if (!done.length) continue;
    const last = done[done.length - 1];
    ex.push(e.cardio ? { id: e.id, sets: 1, reps: 0, kg: 0, min: last.min || 0 } : { id: e.id, sets: done.length, reps: last.reps, kg: e.bodyweight ? 0 : last.kg });
  }
  if (!ex.length) return null;
  const min = Math.max(1, Math.round(((s.finished ?? s.started) - s.started) / 60000));
  return { date, min, ...(extra ? { extra: true } : {}), ex };
}

export function toText(e: LogEntry, nameOf: (id: string) => string): string {
  const lines = [`FitTrack · ${e.date} · ${e.min} min`];
  for (const x of e.ex) {
    const what = x.min ? `${x.min} min` : `${x.sets} × ${x.reps}${x.kg ? ` · ${x.kg} kg` : ''}`;
    lines.push(`- ${nameOf(x.id)}: ${what}`);
  }
  if (e.extra) lines.push('Extra mile');
  return lines.join('\n');
}

export const toJson = (e: LogEntry) => JSON.stringify({ fittrack: 1, ...e });

/** Prefijo de WhatsApp al exportar un chat: "[21/11/26, 10:03:12] Ana: " o "21/11/2026 10:03 - Ana: ". */
const WA_PREFIX = /^‎?\[?\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp]\.?\s?[Mm]\.?)?\]?\s*(?:-\s*)?[^:]{1,60}:\s?/;
const HEADER = /FitTrack\s*·\s*(\d{4}-\d{2}-\d{2})(?:\s*·\s*(\d+)\s*min)?/i;
const ITEM = /^[-•*]\s*(.+?):\s*(.+)$/;
const SETS = /(\d+)\s*[×xX]\s*(\d+)(?:\s*·\s*([\d.,]+)\s*kg)?/;
const MINS = /^([\d.,]+)\s*min/i;

const num = (s: string) => Number(s.replace(',', '.')) || 0;

/**
 * Lee entrenos de una conversación pegada (texto y/o JSON).
 * `idOf(nombre)` → id del ejercicio o null. Devuelve también los nombres que
 * no se reconocieron (se dicen al usuario, no se inventan).
 */
export function parseLog(text: string, idOf: (name: string) => string | null): { entries: LogEntry[]; unknown: string[] } {
  const entries: LogEntry[] = [];
  const unknown = new Set<string>();
  let cur: LogEntry | null = null;
  const close = () => {
    if (cur && cur.ex.length) entries.push(cur);
    cur = null;
  };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(WA_PREFIX, '').trim();
    if (!line) continue;
    // JSON (una sesión por línea/mensaje).
    if (line.startsWith('{') && line.includes('"fittrack"')) {
      close();
      try {
        const o = JSON.parse(line) as Partial<LogEntry> & { fittrack?: number };
        if (o.date && Array.isArray(o.ex)) {
          const ex = o.ex.filter((x) => x && typeof x.id === 'string' && (x.sets > 0 || (x.min ?? 0) > 0));
          if (ex.length) entries.push({ date: String(o.date).slice(0, 10), min: Number(o.min) || 0, ...(o.extra ? { extra: true } : {}), ex });
        }
      } catch {
        /* JSON roto: se ignora */
      }
      continue;
    }
    const h = HEADER.exec(line);
    if (h) {
      close();
      cur = { date: h[1], min: h[2] ? Number(h[2]) : 0, ex: [] };
      continue;
    }
    if (!cur) continue;
    const c: LogEntry = cur;
    if (/^extra\s*mile/i.test(line)) {
      c.extra = true;
      continue;
    }
    const it = ITEM.exec(line);
    if (!it) {
      close(); // otro mensaje: termina la sesión
      continue;
    }
    const id = idOf(it[1].trim());
    if (!id) {
      unknown.add(it[1].trim());
      continue;
    }
    const s = SETS.exec(it[2]);
    const m = MINS.exec(it[2].trim());
    if (s) c.ex.push({ id, sets: Number(s[1]), reps: Number(s[2]), kg: s[3] ? num(s[3]) : 0 });
    else if (m) c.ex.push({ id, sets: 1, reps: 0, kg: 0, min: num(m[1]) });
  }
  close();
  return { entries, unknown: [...unknown] };
}

const keyOf = (e: LogEntry) => `${e.date}|${e.min}|${e.ex.map((x) => `${x.id}:${x.sets}x${x.reps}@${x.kg}`).join(',')}`;

/** Une y ordena (recientes primero), sin duplicados. */
export function mergeLog(a: LogEntry[], b: LogEntry[]): LogEntry[] {
  const m = new Map<string, LogEntry>();
  for (const e of [...a, ...b]) m.set(keyOf(e), e);
  return [...m.values()].sort((x, y) => (x.date < y.date ? 1 : x.date > y.date ? -1 : 0));
}

/** Racha Extra mile: sesiones seguidas (desde la más reciente) con extra. */
export function extraStreak(flags: boolean[]): number {
  let n = 0;
  for (const f of flags) {
    if (!f) break;
    n++;
  }
  return n;
}

/** Entradas → forma de sesión (para `recentRows`: pesos de la próxima sesión). */
export function asSessions(entries: LogEntry[]) {
  return entries.map((e) => ({
    date: e.date,
    exercises: e.ex.map((x) => ({ exercise_id: x.id, sets: Array.from({ length: Math.max(1, x.sets) }, () => ({ reps: x.reps, weight_kg: x.kg })) })),
  }));
}

// ---- almacenamiento (solo este navegador) ----
const KEY = 'fittrack.web.log.v1';
export function loadLog(): LogEntry[] {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as LogEntry[]) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
export function saveLog(list: LogEntry[]): void {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(list.slice(0, 500)));
  } catch {
    /* sin almacenamiento (modo privado): sigue funcionando sin historial */
  }
}
