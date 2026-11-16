// Generado por scripts/dedupe_catalog.js — NO editar a mano.
// Ejercicios duplicados fusionados (R-119): id viejo → id que se queda.
// El store migra con esto el historial, las marcas y el entreno en curso.
export const MERGED_IDS: Record<string, string> = {
  "bench_press_narrow_grip": "close_grip_bench_press",
  "dips_1": "triceps_dips",
  "military_press_2": "military_press_1",
  "leg_extension_2": "leg_extension_1",
  "leg_extension_3": "leg_extension_1",
  "pushups": "push_ups",
  "squats": "back_squat",
  "side_raise": "lateral_raises",
  "chin_up": "chin_ups",
  "bent_over_rowing": "bent_over_barbell_row",
  "row": "bent_over_barbell_row",
  "reverse_bar_curl": "reverse_curl",
  "shoulder_shrug": "shrugs_barbells",
  "leg_curl": "leg_curls_laying",
  "standing_bicep_curl": "biceps_curls_with_dumbbell",
  "leg_raise": "leg_raises_lying",
  "weighted_step": "weighted_step_ups",
  "jogging": "run",
  "high_knee_jumps": "high_knees",
  "calf_raises": "standing_calf_raises",
  "hip_raise_lying": "glute_bridge"
};

/** Id vigente de un ejercicio (sigue la fusión si el id ya no existe). */
export const currentExerciseId = (id: string): string => MERGED_IDS[id] ?? id;
