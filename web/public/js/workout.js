/* FitTrack — generación inteligente de entrenamientos (puerto 1:1 de
 * app/src/lib/workout.ts a JS de navegador). Expone window.FTWorkout.
 * Lógica determinista; sin azar. Ver de paridad: tests/workout-web-parity.js.
 */
(function (global) {
  'use strict';

  var BODY_WEIGHT_HINTS = [
    'push up', 'push-up', 'pushup', 'sit up', 'sit-up', 'situp', 'crunch',
    'plank', 'hollow', 'deadbug', 'flutter', 'leg raise', 'leg-raise',
    'mountain climber', 'jack', 'jumping jack', 'body', 'pull up', 'pull-up',
    'pullup', 'chin up', 'chin-up', 'dip', 'l hold', 'l-hold', 'full sit',
    'superman', 'bridge', 'sissy', 'pike push', 'wall pushup', 'wall push',
    'wall sit', 'crawling', 'inchworm', 'high knee', 'burpee',
  ];
  var MACHINE_HINTS = ['machine', 'cable', 'pulley', 'lat pulldown', 'pulldown', 'rope', 'bar attachment'];

  function isBodyweightExercise(e) {
    if (e.equipment === 'bodyweight') return true;
    if (e.equipment === 'barbell' || e.equipment === 'dumbbell') return false;
    var hay = [e.name_en, e.name_nl].concat((e.instructions || []).slice(0, 2)).join(' ').toLowerCase();
    if (MACHINE_HINTS.some(function (m) { return hay.indexOf(m) >= 0; })) return false;
    return BODY_WEIGHT_HINTS.some(function (h) { return hay.indexOf(h) >= 0; });
  }

  function fitsMode(e, mode) {
    if (mode === 'full_gym') return true;
    var bw = isBodyweightExercise(e);
    if (mode === 'bodyweight') return bw;
    return e.equipment === 'dumbbell' || bw;
  }

  function weightFromOneRm(one_rm, reps, intensity) {
    intensity = intensity || 'moderate';
    if (!one_rm || one_rm <= 0 || !reps) return 0;
    var pct = 0.9 - Math.min(reps, 20) / 20 * 0.5;
    var adj = intensity === 'high' ? 1.05 : intensity === 'low' ? 0.92 : 1;
    return Math.max(2.5, Math.round(one_rm * pct * adj * 10) / 10);
  }

  function conservativeOneRm(equipment) {
    switch (equipment) {
      case 'barbell': return 20;
      case 'machine': return 20;
      case 'cable': return 15;
      case 'dumbbell': return 10;
      default: return 0;
    }
  }

  var GOAL_SCHEME = {
    strength: { sets: 4, reps: [4, 6], rest: 150 },
    build_muscle: { sets: 3, reps: [8, 12], rest: 90 },
    definition: { sets: 3, reps: [10, 12], rest: 60 },
    lose_fat: { sets: 3, reps: [15, 20], rest: 45 },
    lose_weight: { sets: 3, reps: [12, 20], rest: 45 },
    endurance: { sets: 3, reps: [20, 25], rest: 30 },
  };

  function repsForGoal(goal, intensity) {
    intensity = intensity || 'moderate';
    var r = GOAL_SCHEME[goal].reps;
    var base = Math.round((r[0] + r[1]) / 2);
    var shift = intensity === 'low' ? 2 : intensity === 'high' ? -2 : 0;
    return Math.min(30, Math.max(3, base + shift));
  }

  var REST_BY_EQUIP = { bodyweight: 45, dumbbell: 60, barbell: 90, machine: 75, cable: 75, other: 60 };

  function roundW(v) {
    if (v <= 0) return 0;
    var step = v >= 50 ? 5 : 2.5;
    return Math.round(v / step) * step;
  }

  function recentRows(sessions) {
    var out = new Map();
    for (var s of sessions || []) {
      for (var ex of s.exercises || []) {
        if (out.has(ex.exercise_id)) continue;
        var bestW = 0, bestR = 0;
        for (var st of ex.sets || []) {
          if (st.weight_kg > 0 && st.weight_kg > bestW) { bestW = st.weight_kg; bestR = st.reps; }
        }
        if (bestW > 0) out.set(ex.exercise_id, { exercise_id: ex.exercise_id, last_weight: bestW, last_reps: bestR || 1 });
      }
    }
    return Array.from(out.values());
  }

  function generateWorkout(opts) {
    var goal = opts.goal || 'build_muscle';
    var scheme = GOAL_SCHEME[goal];
    var bench = new Map((opts.benchmarks || []).map(function (b) { return [b.exercise_id, b.estimated_1rm]; }));
    var recent = new Map((opts.recent || []).map(function (r) { return [r.exercise_id, r]; }));
    var excluded = new Set(opts.exclude_ids || []);

    var pool = opts.exercises.filter(function (e) {
      return opts.groups.includes(e.muscle_group) && fitsMode(e, opts.equipment_mode) && !excluded.has(e.id);
    });

    var byGroup = new Map();
    for (var e of pool) {
      var arr = byGroup.get(e.muscle_group) || [];
      arr.push(e);
      byGroup.set(e.muscle_group, arr);
    }
    var rank = function (e) {
      return (bench.has(e.id) ? 2 : 0) +
        (recent.has(e.id) ? 1 : 0) +
        (opts.equipment_mode === 'dumbbells' && e.equipment === 'dumbbell' ? 1 : 0) +
        (e.level === opts.experience ? 0.5 : 0);
    };
    var picked = [];
    for (var g of opts.groups) {
      var sel = (byGroup.get(g) || [])
        .slice()
        .sort(function (a, b) { return rank(b) - rank(a) || a.name_en.localeCompare(b.name_en); })
        .slice(0, 2);
      picked.push.apply(picked, sel);
    }

    var reps = repsForGoal(goal, opts.intensity);
    var weightPer = function (e) {
      if (isBodyweightExercise(e)) return { w: 0, src: 'bodyweight' };
      if (bench.has(e.id)) return { w: weightFromOneRm(bench.get(e.id), reps, opts.intensity), src: 'benchmark' };
      var r = recent.get(e.id);
      if (r && r.last_weight > 0) {
        var scaled = weightFromOneRm(r.last_weight * (1 + r.last_reps / 30), reps, opts.intensity);
        return { w: roundW(scaled) || r.last_weight, src: 'history' };
      }
      return { w: roundW(conservativeOneRm(e.equipment) * (1 + reps / 30) * 0.8), src: 'conservative' };
    };

    var out = picked.map(function (e) {
      var wp = weightPer(e);
      return {
        exercise_id: e.id,
        sets: scheme.sets,
        reps: reps,
        rest_sec: Math.max(scheme.rest, REST_BY_EQUIP[e.equipment] != null ? REST_BY_EQUIP[e.equipment] : 60),
        recommended_weight_kg: wp.w,
        weight_source: wp.src,
      };
    });

    var estMin = function (ws) {
      return Math.ceil(ws.reduce(function (a, x) { return a + (x.sets * (60 + x.rest_sec)) / 60; }, 0));
    };
    if (opts.duration_min && out.length > 1) {
      var minutes = estMin(out);
      if (minutes > opts.duration_min + 5) {
        out = out.slice(0, Math.max(1, out.length - 1));
        minutes = estMin(out);
      }
      if (minutes < opts.duration_min - 10) {
        out = out.map(function (x) { return Object.assign({}, x, { sets: x.sets + 1 }); });
        minutes = estMin(out);
      }
    }

    return {
      id: 'w-' + Date.now().toString(36),
      muscle_groups: opts.groups,
      equipment_mode: opts.equipment_mode,
      exercises: out,
      estimated_duration_min: estMin(out),
      experience: opts.experience,
      intensity: opts.intensity,
      goal: goal,
    };
  }

  function suggestAlternatives(original, exercises, opts) {
    if (!original) return [];
    var excluded = new Set((opts.exclude || []).concat([original.id]));
    var bench = new Set((opts.benchmarks || []).map(function (b) { return b.exercise_id; }));
    var recent = new Set((opts.recent || []).map(function (r) { return r.exercise_id; }));
    var scored = exercises
      .filter(function (e) {
        return !excluded.has(e.id) && e.muscle_group === original.muscle_group && fitsMode(e, opts.mode);
      })
      .map(function (e) {
        var score = 0;
        if (e.equipment === original.equipment) score += 3;
        else if (isBodyweightExercise(e) === isBodyweightExercise(original)) score += 2;
        var shared = (e.secondary_muscles || []).filter(function (m) { return (original.secondary_muscles || []).includes(m); }).length;
        score += shared;
        if (e.level === original.level) score += 1;
        if (bench.has(e.id)) score += 1;
        if (recent.has(e.id)) score += 0.5;
        var a = original.name_en.split(/[\s,]+/);
        var b = e.name_en.split(/[\s,]+/);
        score += a.filter(function (w) { return w.length > 3 && b.includes(w); }).length * 0.5;
        return { e: e, score: score };
      })
      .sort(function (x, y) { return y.score - x.score || x.e.name_en.localeCompare(y.e.name_en); });
    return scored.slice(0, opts.limit != null ? opts.limit : 3).map(function (s) { return s.e; });
  }

  function suggestNextExercise(exercises, opts) {
    var excluded = new Set(opts.exclude || []);
    var bench = new Set((opts.benchmarks || []).map(function (b) { return b.exercise_id; }));
    var recent = new Set((opts.recent || []).map(function (r) { return r.exercise_id; }));
    var pool = exercises.filter(function (e) {
      return !excluded.has(e.id) &&
        fitsMode(e, opts.mode) &&
        (!opts.groups || opts.groups.length === 0 || opts.groups.includes(e.muscle_group));
    });
    if (pool.length === 0) return null;
    var ranked = pool
      .map(function (e) {
        var score = 0;
        if (bench.has(e.id)) score += 3;
        if (recent.has(e.id)) score += 1.5;
        score += e.level === 'intermediate' ? 0.2 : 0;
        return { e: e, score: score };
      })
      .sort(function (x, y) { return y.score - x.score || x.e.name_en.localeCompare(y.e.name_en); });
    return ranked[0].e;
  }

  function weightForExercise(ex, opts) {
    var reps = opts.reps != null ? opts.reps : 10;
    var intensity = opts.intensity != null ? opts.intensity : 'moderate';
    if (isBodyweightExercise(ex)) return { weight_kg: 0, source: 'bodyweight' };
    var b = (opts.benchmarks || []).find(function (x) { return x.exercise_id === ex.id; });
    if (b && b.estimated_1rm > 0) return { weight_kg: weightFromOneRm(b.estimated_1rm, reps, intensity), source: 'benchmark' };
    var r = (opts.recent || []).find(function (x) { return x.exercise_id === ex.id; });
    if (r && r.last_weight > 0) {
      return {
        weight_kg: roundW(weightFromOneRm(r.last_weight * (1 + r.last_reps / 30), reps, intensity)) || r.last_weight,
        source: 'history',
      };
    }
    var w = roundW(conservativeOneRm(ex.equipment) * (1 + reps / 30) * 0.8);
    return w > 0 ? { weight_kg: w, source: 'conservative' } : null;
  }

  function suggestedBenchmarks(groups, exercises, perGroup) {
    perGroup = perGroup != null ? perGroup : 3;
    var order = { machine: 0, barbell: 1, dumbbell: 2, cable: 3, other: 4, bodyweight: 5 };
    var out = [];
    for (var g of groups) {
      var arr = exercises
        .filter(function (e) { return e.muscle_group === g; })
        .slice()
        .sort(function (a, b) { return ((order[a.equipment] != null ? order[a.equipment] : 9) - (order[b.equipment] != null ? order[b.equipment] : 9)) || a.name_en.localeCompare(b.name_en); })
        .slice(0, perGroup);
      out.push.apply(out, arr.map(function (e) { return e.id; }));
    }
    return out;
  }

  var api = {
    isBodyweightExercise, fitsMode, weightFromOneRm, conservativeOneRm,
    GOAL_SCHEME, repsForGoal, roundW, recentRows, generateWorkout,
    suggestAlternatives, suggestNextExercise, weightForExercise, suggestedBenchmarks,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api; // para tests (node)
  if (global) global.FTWorkout = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
