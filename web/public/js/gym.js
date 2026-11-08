/* FitTrack — lógica pura de gym (build de navegador).
 * Generado AUTOMÁTICAMENTE desde web/src/lib/gym.js por
 * scripts/generate_gym_browser.py — NO editar a mano.
 * Expone window.FTGym con todas las funciones de gym.js.
 */
window.FTGym = (function () {
/**
 * FitTrack — lógica pura de gym (sin dependencias).
 * Se comparte entre: SSR de Astro (import), cliente (script de módulo) y
 * tests (node). Mantener sin efectos de lado.
 */

const GROUPS = [
  'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'full_body',
];

const EQUIPMENT = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'other'];

/** 1RM estimado (fórmula de Epley). reps<=0 → 0. */
function oneRm(weightKg, reps) {
  if (!weightKg || !reps || reps <= 0) return 0;
  return weightKg * (1 + reps / 30);
}

/** Volumen de un set = peso × reps. */
function setVolume(set) {
  return (Number(set?.weight_kg) || 0) * (Number(set?.reps) || 0);
}

/** Volumen total de una sesión (suma de sus sets). */
function sessionVolume(session) {
  let v = 0;
  for (const ex of session?.exercises || []) {
    for (const s of ex.sets || []) v += setVolume(s);
  }
  return v;
}

/** Nº total de sets de una sesión. */
function sessionSets(session) {
  let n = 0;
  for (const ex of session?.exercises || []) n += (ex.sets || []).length;
  return n;
}

/** Lunes (ISO yyyy-mm-dd) de la semana de una fecha ISO. */
function weekStart(isoDate) {
  const d = new Date(isoDate + (isoDate.length === 10 ? 'T00:00:00Z' : ''));
  const day = d.getUTCDay(); // 0=domingo
  const diff = (day + 6) % 7; // días desde el lunes
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

/** Volumen semanal para las últimas `n` semanas (incluida la actual). */
function weeklyVolume(sessions, n = 4) {
  const weeks = new Map();
  const today = new Date();
  const monday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const w = new Date(monday);
    w.setUTCDate(w.getUTCDate() - i * 7);
    const key = w.toISOString().slice(0, 10);
    weeks.set(key, { week_start: key, volume: 0, sessions: 0 });
  }
  for (const s of sessions || []) {
    if (!s?.date) continue;
    const key = weekStart(s.date);
    const w = weeks.get(key);
    if (w) {
      w.volume += sessionVolume(s);
      w.sessions += 1;
    }
  }
  out.push(...weeks.values());
  return out;
}

/** Racha de días consecutivos con sesión (hacia atrás desde hoy/ayes). */
function streakDays(sessions) {
  const days = new Set((sessions || []).map((s) => s.date).filter(Boolean));
  if (!days.size) return 0;
  const d = new Date();
  if (!days.has(d.toISOString().slice(0, 10))) d.setUTCDate(d.getUTCDate() - 1);
  let streak = 0;
  while (days.has(d.toISOString().slice(0, 10))) {
    streak += 1;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return streak;
}

/**
 * PRs de una sesión contra el resto del historial:
 * el mejor oneRm por ejercicio de esta sesión que supere el máximo
 * anterior registrado. Devuelve [{ exercise_id, one_rm, reps, weight_kg }].
 */
function newPrs(session, sessions) {
  const others = (sessions || []).filter((s) => s.id !== session.id);
  const best = new Map();
  for (const s of others) {
    for (const ex of s.exercises || []) {
      for (const set of ex.sets || []) {
        const or = oneRm(set.weight_kg, set.reps);
        if (or > (best.get(ex.exercise_id) || 0)) best.set(ex.exercise_id, or);
      }
    }
  }
  const prs = [];
  for (const ex of session.exercises || []) {
    let top = 0;
    let topSet = null;
    for (const set of ex.sets || []) {
      const or = oneRm(set.weight_kg, set.reps);
      if (or > top) { top = or; topSet = set; }
    }
    if (topSet && top > (best.get(ex.exercise_id) || 0)) {
      prs.push({
        exercise_id: ex.exercise_id,
        one_rm: Math.round(top * 10) / 10,
        reps: topSet.reps,
        weight_kg: topSet.weight_kg,
      });
    }
  }
  return prs;
}

/** Volumen por grupo muscular en los últimos `days` días. */
function groupTotals(sessions, exercises, days = 7) {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const cutoffIso = cutoff.toISOString().slice(0, 10);
  const byId = new Map((exercises || []).map((e) => [e.id, e]));
  const totals = {};
  for (const s of sessions || []) {
    if (!s.date || s.date < cutoffIso) continue;
    for (const ex of s.exercises || []) {
      const group = byId.get(ex.exercise_id)?.muscle_group || 'other';
      totals[group] = (totals[group] || 0) + ex.sets.reduce((a, st) => a + setVolume(st), 0);
    }
  }
  return Object.fromEntries(Object.entries(totals).sort((a, b) => b[1] - a[1]));
}

/** Último peso corporal registrado (o null). */
function latestWeight(sessions) {
  let w = null;
  for (const s of sessions || []) {
    if (s.body_weight_kg != null && s.body_weight_kg > 0) w = s.body_weight_kg;
  }
  return w;
}

/** Series de peso corporal (para la mini-gráfica). */
function weightTrend(sessions) {
  return (sessions || [])
    .filter((s) => s.body_weight_kg != null && s.body_weight_kg > 0)
    .map((s) => ({ date: s.date, kg: s.body_weight_kg }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10);
}

/**
 * Búsqueda + filtros sobre la base de ejercicios.
 * q: texto (nombre EN/NL, alias, grupo); group/equipment: 'all' o valor.
 */
function searchExercises(exercises, q, group = 'all', equipment = 'all') {
  const needle = (q || '').toLowerCase().trim();
  return (exercises || []).filter((e) => {
    if (group !== 'all' && e.muscle_group !== group) return false;
    if (equipment !== 'all' && e.equipment !== equipment) return false;
    if (!needle) return true;
    const hay = [
      e.name_en, e.name_nl, e.muscle_group, e.equipment,
      ...(e.aliases || []),
    ].join(' ').toLowerCase();
    return hay.includes(needle);
  });
}

/** Normaliza/valida una sesión antes de guardarla. */
function normalizeSession(s) {
  if (!s || !s.date) throw new Error('sesión sin fecha');
  const exercises = (s.exercises || [])
    .map((ex) => ({
      exercise_id: String(ex.exercise_id),
      sets: (ex.sets || [])
        .map((st) => ({
          reps: Math.max(0, Math.round(Number(st.reps) || 0)),
          weight_kg: Math.max(0, Math.round((Number(st.weight_kg) || 0) * 100) / 100),
          rpe: st.rpe ? Math.round(Number(st.rpe) * 10) / 10 : null,
        }))
        .filter((st) => st.reps > 0 || st.weight_kg > 0),
    }))
    .filter((ex) => ex.sets.length > 0);
  if (!exercises.length) throw new Error('sesión sin ejercicios con sets');
  const out = {
    id: s.id || uid(),
    date: s.date,
    exercises,
    notes: s.notes ? String(s.notes).slice(0, 500) : '',
    duration_min: s.duration_min ? Math.max(1, Math.round(Number(s.duration_min))) : null,
    body_weight_kg: s.body_weight_kg ? Math.round(Number(s.body_weight_kg) * 100) / 100 : null,
    created_at: s.created_at || new Date().toISOString(),
  };
  return out;
}

function uid() {
  try {
    return crypto.randomUUID();
  } catch {
    return 's-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }
}

/** Ordena sesiones de más reciente a más antigua. */
function sortByDate(sessions) {
  return [...(sessions || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

/** Fechas de ejemplo para tests/demo. */
function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

  return {
    GROUPS,    EQUIPMENT,    oneRm,    setVolume,    sessionVolume,    sessionSets,    weekStart,    weeklyVolume,    streakDays,    newPrs,    groupTotals,    latestWeight,    weightTrend,    searchExercises,    normalizeSession,    uid,    sortByDate,    todayISO,
  };
})();
