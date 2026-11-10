/* FitTrack — persistencia local (localStorage), sin red.
 * Modelo (igual que la app, fittrack.data.v1 + fittrack.active.v1):
 *   data:    { sessions: [ { id, date, exercises:[{exercise_id, sets:[{reps,
 *             weight_kg, done}]}], notes, body_weight_kg, created_at,
 *             type:'training'|'benchmark' } ] }
 *   profile: { benchmarks: [ { exercise_id, estimated_1rm } ] }
 *   active:  { started_at, paused, draft }  (sesión en curso, sobrevive refresh)
 */
window.FTStore = (function () {
  const DATA_KEY = 'fittrack.data.v1';
  const PROFILE_KEY = 'fittrack.profile.v1';
  const ACTIVE_KEY = 'fittrack.active.v1';

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const base = (fallback && typeof fallback === 'object') ? fallback : {};
      return Object.assign(base, JSON.parse(raw));
    } catch (e) {
      return fallback;
    }
  }

  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  return {
    DATA_KEY, PROFILE_KEY, ACTIVE_KEY,
    all: () => read(DATA_KEY, { sessions: [] }),
    sessions: () => read(DATA_KEY, { sessions: [] }).sessions,
    profile: () => read(PROFILE_KEY, { benchmarks: [] }),
    active: () => read(ACTIVE_KEY, null),

    addSession(s) {
      const d = read(DATA_KEY, { sessions: [] });
      d.sessions.push(s);
      write(DATA_KEY, d);
    },
    deleteSession(id) {
      const d = read(DATA_KEY, { sessions: [] });
      d.sessions = d.sessions.filter((x) => x.id !== id);
      write(DATA_KEY, d);
    },
    setBenchmarks(list) {
      write(PROFILE_KEY, { benchmarks: list });
    },
    setActive(state) {
      if (state == null) {
        try { localStorage.removeItem(ACTIVE_KEY); } catch (e) {}
      } else {
        write(ACTIVE_KEY, state);
      }
    },

    exportData() {
      const payload = {
        fittrack: 1,
        exported_at: new Date().toISOString(),
        sessions: this.sessions(),
        profile: this.profile(),
      };
      return JSON.stringify(payload, null, 2);
    },
    clearAll() {
      try {
        localStorage.removeItem(DATA_KEY);
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem(ACTIVE_KEY);
      } catch (e) {}
    },
  };
})();

/* Estado de sesión activa + tema navy (paridad app: fittrack.active.v1).
 * Una sesión activa recolorea TODA la web con body.workout-active. */
window.FTSession = (function () {
  function applyActiveTheme() {
    const active = window.FTStore.active();
    const on = !!(active && active.draft && active.draft.length);
    document.body.classList.toggle('workout-active', on);
  }
  function started() {
    const a = window.FTStore.active();
    return a && a.started_at ? new Date(a.started_at) : null;
  }
  function elapsedSec() {
    const s = started();
    return s ? Math.max(0, Math.round((Date.now() - s.getTime()) / 1000)) : 0;
  }
  function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? m + 'm ' + s + 's' : s + 's';
  }
  return { applyActiveTheme, started, elapsedSec, fmtTime };
})();
