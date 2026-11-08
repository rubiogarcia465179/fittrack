/* FitTrack — persistencia local (localStorage), sin red.
 * Modelo:
 *   { sessions: [ { id, date, exercises: [{exercise_id, sets:[{reps, weight_kg, rpe}]}],
 *                   notes, duration_min, body_weight_kg, created_at } ] }
 */
window.FTStore = (function () {
  const KEY = 'fittrack.data.v1';

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { sessions: [] };
      const d = JSON.parse(raw);
      if (!Array.isArray(d.sessions)) d.sessions = [];
      return d;
    } catch (e) {
      return { sessions: [] };
    }
  }

  function write(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  return {
    all: read,
    sessions: () => read().sessions,
    addSession(s) {
      const d = read();
      d.sessions.push(s);
      write(d);
    },
    deleteSession(id) {
      const d = read();
      d.sessions = d.sessions.filter((x) => x.id !== id);
      write(d);
    },
  };
})();
