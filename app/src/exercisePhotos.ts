/**
 * GENERADO por scripts/make_photo_map.js — no editar a mano.
 * Fotos explicativas por ejercicio (hasta 3). Para añadir fotos: déjalas en
 * data/images/photos/<id>-1.jpg … -3.jpg y vuelve a ejecutar el script.
 */
const HERO = require('../assets/session-hero.jpg');

/** kind: 'drawing' = dibujo de línea real (Everkinetic, CC BY-SA 3.0; fondo
 *  transparente, se tiñe con el color del tema); 'photo' = foto propia. */
const PHOTOS: Record<string, { kind: 'drawing' | 'photo'; credit: 'everkinetic' | 'ai'; images: number[] }> = {
  "arnold_shoulder_press": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/arnold_shoulder_press-1.png'), require('../assets/photos/arnold_shoulder_press-2.png')] },
  "back_squat": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/back_squat-1.png'), require('../assets/photos/back_squat-2.png')] },
  "barbell_ab_rollout": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/barbell_ab_rollout-1.png'), require('../assets/photos/barbell_ab_rollout-2.png')] },
  "barbell_hack_squats": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/barbell_hack_squats-1.png'), require('../assets/photos/barbell_hack_squats-2.png')] },
  "barbell_lunges": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/barbell_lunges-1.png'), require('../assets/photos/barbell_lunges-2.png')] },
  "barbell_triceps_extension": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/barbell_triceps_extension-1.png'), require('../assets/photos/barbell_triceps_extension-2.png')] },
  "bent_over_rowing_reverse": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/bent_over_rowing_reverse-1.png'), require('../assets/photos/bent_over_rowing_reverse-2.png')] },
  "biceps_curl_with_cable": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/biceps_curl_with_cable-1.png'), require('../assets/photos/biceps_curl_with_cable-2.png')] },
  "biceps_curls_with_barbell": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/biceps_curls_with_barbell-1.png'), require('../assets/photos/biceps_curls_with_barbell-2.png')] },
  "biceps_curls_with_dumbbell": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/biceps_curls_with_dumbbell-1.png'), require('../assets/photos/biceps_curls_with_dumbbell-2.png')] },
  "butterfly": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/butterfly-1.png'), require('../assets/photos/butterfly-2.png')] },
  "cable_cross_over": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/cable_cross_over-1.png'), require('../assets/photos/cable_cross_over-2.png')] },
  "calf_press_using_leg_press_machine": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/calf_press_using_leg_press_machine-1.png'), require('../assets/photos/calf_press_using_leg_press_machine-2.png')] },
  "chin_ups": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/chin_ups-1.png'), require('../assets/photos/chin_ups-2.png')] },
  "close_grip_bench_press": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/close_grip_bench_press-1.png'), require('../assets/photos/close_grip_bench_press-2.png')] },
  "close_grip_lat_pull_down": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/close_grip_lat_pull_down-1.png'), require('../assets/photos/close_grip_lat_pull_down-2.png')] },
  "cross_bench_dumbbell_pullovers": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/cross_bench_dumbbell_pullovers-1.png'), require('../assets/photos/cross_bench_dumbbell_pullovers-2.png')] },
  "crunches": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/crunches-1.png'), require('../assets/photos/crunches-2.png')] },
  "decline_bench_press_barbell": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/decline_bench_press_barbell-1.png'), require('../assets/photos/decline_bench_press_barbell-2.png')] },
  "decline_bench_press_dumbbell": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/decline_bench_press_dumbbell-1.png'), require('../assets/photos/decline_bench_press_dumbbell-2.png')] },
  "dips_2": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/dips_2-1.png'), require('../assets/photos/dips_2-2.png')] },
  "dips_between_two_benches": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/dips_between_two_benches-1.png'), require('../assets/photos/dips_between_two_benches-2.png')] },
  "dumbbell_concentration_curl": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/dumbbell_concentration_curl-1.png'), require('../assets/photos/dumbbell_concentration_curl-2.png')] },
  "dumbbell_incline_curl": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/dumbbell_incline_curl-1.png'), require('../assets/photos/dumbbell_incline_curl-2.png')] },
  "dumbbell_lunges_walking": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/dumbbell_lunges_walking-1.png'), require('../assets/photos/dumbbell_lunges_walking-2.png')] },
  "fly_with_dumbbells": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/fly_with_dumbbells-1.png'), require('../assets/photos/fly_with_dumbbells-2.png')] },
  "fly_with_dumbbells_decline_bench": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/fly_with_dumbbells_decline_bench-1.png'), require('../assets/photos/fly_with_dumbbells_decline_bench-2.png')] },
  "french_press_skullcrusher_dumbbells": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/french_press_skullcrusher_dumbbells-1.png'), require('../assets/photos/french_press_skullcrusher_dumbbells-2.png')] },
  "front_squats": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/front_squats-1.png'), require('../assets/photos/front_squats-2.png')] },
  "glute_bridge": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/glute_bridge-1.png'), require('../assets/photos/glute_bridge-2.png')] },
  "good_mornings": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/good_mornings-1.png'), require('../assets/photos/good_mornings-2.png')] },
  "hammercurls": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/hammercurls-1.png'), require('../assets/photos/hammercurls-2.png')] },
  "hyperextensions": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/hyperextensions-1.png'), require('../assets/photos/hyperextensions-2.png')] },
  "incline_bench_press": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/incline_bench_press-1.png'), require('../assets/photos/incline_bench_press-2.png')] },
  "incline_dumbbell_flye": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/incline_dumbbell_flye-1.png'), require('../assets/photos/incline_dumbbell_flye-2.png')] },
  "incline_dumbbell_press": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/incline_dumbbell_press-1.png'), require('../assets/photos/incline_dumbbell_press-2.png')] },
  "lateral_raises": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/lateral_raises-1.png'), require('../assets/photos/lateral_raises-2.png')] },
  "leg_curls_laying": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/leg_curls_laying-1.png'), require('../assets/photos/leg_curls_laying-2.png')] },
  "leg_curls_sitting": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/leg_curls_sitting-1.png'), require('../assets/photos/leg_curls_sitting-2.png')] },
  "leg_curls_standing": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/leg_curls_standing-1.png'), require('../assets/photos/leg_curls_standing-2.png')] },
  "leg_extension_1": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/leg_extension_1-1.png'), require('../assets/photos/leg_extension_1-2.png')] },
  "leg_press": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/leg_press-1.png'), require('../assets/photos/leg_press-2.png')] },
  "leg_presses_narrow": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/leg_presses_narrow-1.png'), require('../assets/photos/leg_presses_narrow-2.png')] },
  "leg_raises_lying": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/leg_raises_lying-1.png'), require('../assets/photos/leg_raises_lying-2.png')] },
  "leverage_machine_chest_press": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/leverage_machine_chest_press-1.png'), require('../assets/photos/leverage_machine_chest_press-2.png')] },
  "negative_crunches": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/negative_crunches-1.png'), require('../assets/photos/negative_crunches-2.png')] },
  "overhead_squat": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/overhead_squat-1.png'), require('../assets/photos/overhead_squat-2.png')] },
  "preacher_curls": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/preacher_curls-1.png'), require('../assets/photos/preacher_curls-2.png')] },
  "pull_ups": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/pull_ups-1.png'), require('../assets/photos/pull_ups-2.png')] },
  "push_ups": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/push_ups-1.png'), require('../assets/photos/push_ups-2.png')] },
  "rear_delt_raises": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/rear_delt_raises-1.png'), require('../assets/photos/rear_delt_raises-2.png')] },
  "romanian_deadlift": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/romanian_deadlift-1.png'), require('../assets/photos/romanian_deadlift-2.png')] },
  "rowing_seated": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/rowing_seated-1.png'), require('../assets/photos/rowing_seated-2.png')] },
  "rowing_t_bar": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/rowing_t_bar-1.png'), require('../assets/photos/rowing_t_bar-2.png')] },
  "seated_triceps_press": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/seated_triceps_press-1.png'), require('../assets/photos/seated_triceps_press-2.png')] },
  "shoulder_press_barbell": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/shoulder_press_barbell-1.png'), require('../assets/photos/shoulder_press_barbell-2.png')] },
  "shoulder_press_dumbbells": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/shoulder_press_dumbbells-1.png'), require('../assets/photos/shoulder_press_dumbbells-2.png')] },
  "shoulder_press_on_machine": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/shoulder_press_on_machine-1.png'), require('../assets/photos/shoulder_press_on_machine-2.png')] },
  "shrugs_dumbbells": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/shrugs_dumbbells-1.png'), require('../assets/photos/shrugs_dumbbells-2.png')] },
  "side_dumbbell_trunk_flexion": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/side_dumbbell_trunk_flexion-1.png'), require('../assets/photos/side_dumbbell_trunk_flexion-2.png')] },
  "side_plank": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/side_plank-1.png'), require('../assets/photos/side_plank-2.png')] },
  "single_arm_preacher_curl": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/single_arm_preacher_curl-1.png'), require('../assets/photos/single_arm_preacher_curl-2.png')] },
  "sitting_calf_raises": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/sitting_calf_raises-1.png'), require('../assets/photos/sitting_calf_raises-2.png')] },
  "smith_machine_close_grip_bench_press": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/smith_machine_close_grip_bench_press-1.png'), require('../assets/photos/smith_machine_close_grip_bench_press-2.png')] },
  "standing_calf_raises": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/standing_calf_raises-1.png'), require('../assets/photos/standing_calf_raises-2.png')] },
  "sumo_squats": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/sumo_squats-1.png'), require('../assets/photos/sumo_squats-2.png')] },
  "superman": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/superman-1.png'), require('../assets/photos/superman-2.png')] },
  "tricep_dumbbell_kickback": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/tricep_dumbbell_kickback-1.png'), require('../assets/photos/tricep_dumbbell_kickback-2.png')] },
  "triceps_extensions_on_cable": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/triceps_extensions_on_cable-1.png'), require('../assets/photos/triceps_extensions_on_cable-2.png')] },
  "triceps_extensions_on_cable_with_bar": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/triceps_extensions_on_cable_with_bar-1.png'), require('../assets/photos/triceps_extensions_on_cable_with_bar-2.png')] },
  "triceps_machine": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/triceps_machine-1.png'), require('../assets/photos/triceps_machine-2.png')] },
  "underhand_lat_pull_down": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/underhand_lat_pull_down-1.png'), require('../assets/photos/underhand_lat_pull_down-2.png')] },
  "upright_row_on_multi_press": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/upright_row_on_multi_press-1.png'), require('../assets/photos/upright_row_on_multi_press-2.png')] },
  "upright_row_sz_bar": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/upright_row_sz_bar-1.png'), require('../assets/photos/upright_row_sz_bar-2.png')] },
  "upright_row_w_dumbbells": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/upright_row_w_dumbbells-1.png'), require('../assets/photos/upright_row_w_dumbbells-2.png')] },
  "v_bar_pulldown": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/v_bar_pulldown-1.png'), require('../assets/photos/v_bar_pulldown-2.png')] },
  "weighted_step_ups": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/weighted_step_ups-1.png'), require('../assets/photos/weighted_step_ups-2.png')] },
  "wide_grip_pulldown": { kind: 'drawing', credit: 'everkinetic', images: [require('../assets/photos/wide_grip_pulldown-1.png'), require('../assets/photos/wide_grip_pulldown-2.png')] },
};

export type PhotoKind = 'drawing' | 'photo' | 'sample';

/** Imágenes de un ejercicio; si aún no tiene, la imagen de ejemplo (kind 'sample', marcada). */
/** credit: 'everkinetic' (dibujo real, CC BY-SA 3.0) o 'ai' (generado con IA por el usuario). */
export function photosFor(id: string): { images: number[]; kind: PhotoKind; placeholder: boolean; credit: 'everkinetic' | 'ai' | null } {
  const own = PHOTOS[id];
  return own && own.images.length
    ? { images: own.images, kind: own.kind, placeholder: false, credit: own.credit }
    : { images: [HERO, HERO, HERO], kind: 'sample', placeholder: true, credit: null };
}

export const PHOTO_COUNT = 78;
