/**
 * Gasto energético diario estimado (Fase 12). Lógica pura, sin plataforma.
 *
 * 1) Metabolismo basal (BMR) — ecuación de Mifflin-St Jeor (1990), la más
 *    precisa en adultos sanos según la revisión sistemática de la American
 *    Dietetic Association (Frankenfield et al., 2005):
 *       hombre: 10·kg + 6,25·cm − 5·edad + 5
 *       mujer:  10·kg + 6,25·cm − 5·edad − 161
 *    Para "otro"/sin indicar se usa el punto medio (−78) y se avisa en la UI.
 *
 * 2) Gasto total (TDEE) = BMR × factor de actividad (PAL). El factor no se
 *    pregunta: se deduce de las sesiones REALES de las últimas 4 semanas
 *    (sesiones/semana + minutos de cardio), con los multiplicadores
 *    estándar (1,2 sedentario … 1,725 muy activo).
 *
 * Es una estimación poblacional (±10 % típico); no sustituye a una
 * calorimetría ni a un profesional.
 */

export type Sex = 'male' | 'female' | 'other';

export interface EnergyInput {
  weight_kg?: number | null;
  height_cm?: number | null;
  birth_year?: number | null;
  sex?: Sex | null;
  /** Sesiones registradas en los últimos 28 días. */
  sessions_28d: number;
  /** Minutos de cardio en los últimos 28 días. */
  cardio_min_28d: number;
  /** Año actual (inyectable para tests). */
  year?: number;
}

export interface ActivityLevel {
  key: 'sedentary' | 'light' | 'moderate' | 'active';
  factor: number;
}

export interface EnergyResult {
  age: number;
  bmr: number; // kcal/día
  tdee: number; // kcal/día
  activity: ActivityLevel;
  /** true si el sexo no está indicado (se usó el punto medio). */
  sexApprox: boolean;
}

/** Campos que faltan para poder calcular (vacío = se puede). */
export function missingForEnergy(i: EnergyInput): ('weight' | 'height' | 'birth_year')[] {
  const out: ('weight' | 'height' | 'birth_year')[] = [];
  if (!(Number(i.weight_kg) > 0)) out.push('weight');
  if (!(Number(i.height_cm) > 0)) out.push('height');
  if (!(Number(i.birth_year) > 1900)) out.push('birth_year');
  return out;
}

/** Nivel de actividad a partir del entrenamiento real (por semana). */
export function activityFromTraining(sessions28d: number, cardioMin28d: number): ActivityLevel {
  const perWeek = sessions28d / 4;
  const cardioPerWeek = cardioMin28d / 4;
  // ~150 min/semana de cardio moderado (recomendación OMS) cuenta como una
  // sesión semanal extra a efectos de nivel.
  const score = perWeek + cardioPerWeek / 150;
  if (score < 1) return { key: 'sedentary', factor: 1.2 };
  if (score < 3) return { key: 'light', factor: 1.375 };
  if (score < 5) return { key: 'moderate', factor: 1.55 };
  return { key: 'active', factor: 1.725 };
}

export function mifflinStJeor(weightKg: number, heightCm: number, age: number, sex: Sex | null | undefined): number {
  const s = sex === 'male' ? 5 : sex === 'female' ? -161 : -78;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + s;
}

export function estimateEnergy(i: EnergyInput): EnergyResult | null {
  if (missingForEnergy(i).length) return null;
  const year = i.year ?? new Date().getFullYear();
  const age = Math.max(14, Math.min(100, year - Number(i.birth_year)));
  const bmr = mifflinStJeor(Number(i.weight_kg), Number(i.height_cm), age, i.sex);
  const activity = activityFromTraining(i.sessions_28d, i.cardio_min_28d);
  return {
    age,
    bmr: Math.round(bmr),
    tdee: Math.round(bmr * activity.factor),
    activity,
    sexApprox: i.sex !== 'male' && i.sex !== 'female',
  };
}

/**
 * kcal de un bloque de cardio con METs del Compendium of Physical
 * Activities (Ainsworth et al., 2011): suave 4,0 · moderado 7,0 · fuerte
 * 10,0. kcal = MET × kg × horas.
 */
export function cardioKcal(minutes: number, weightKg: number, intensity: 'easy' | 'moderate' | 'hard' = 'moderate'): number {
  const met = intensity === 'easy' ? 4 : intensity === 'hard' ? 10 : 7;
  if (!(minutes > 0) || !(weightKg > 0)) return 0;
  return Math.round(met * weightKg * (minutes / 60));
}
