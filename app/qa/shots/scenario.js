// Escenario de capturas (orden = numeración de docs/screenshots).
// Con --frames, el mismo recorrido sirve para el vídeo.
// 3 pestañas (Inicio · Entrenar · Perfil), solo iconos → se tocan por
// aria-label (tapLabel). Historial y Ejercicios se abren desde Inicio.
module.exports = async ({ load, shot, tap, tapLabel, drag, scrollBy, sleep, base, DATA, ACTIVE, iso }) => {
  const withCardio = {
    ...ACTIVE,
    draft: [
      ...ACTIVE.draft.slice(0, 2),
      { exercise_id: 'run_treadmill', sets: [{ reps: 0, weight_kg: 0, duration_min: 20, distance_km: 3, intensity: 'moderate' }], equipment_status: 'available' },
    ],
  };
  const profile = { ...DATA, profile: { ...DATA.profile, sex: 'male', birth_year: 1992, goal: 'build_muscle' } };

  // 01–03 Inicio: "Hoy toca" (+ Cambiar), mapa del cuerpo, marcas, calendario
  await load({ ...base, 'fittrack.data.v1': profile });
  await shot('01-home');
  await tap('Cambiar');
  await shot('02-home-change');
  await scrollBy(760);
  await shot('03-home-more');

  // 04–05 "Empezar sesión" → hoja (tiempo/intensidad/energía/objetivo) → entreno
  await scrollBy(-3000);
  await tap('Empezar sesión');
  await shot('04-quickstart-sheet');
  await tap('60 min');
  await tap('Continuar al entreno');
  await sleep(600);
  await shot('05-session-quickstart');

  // 06–11 Sesión activa con datos fijos (fuerza + cardio)
  await load({ ...base, 'fittrack.data.v1': DATA, 'fittrack.active.v1': withCardio });
  await tapLabel('Entrenar');
  await shot('06-session-active');
  await tap('Más opciones');
  await scrollBy(400);
  await shot('07-session-more');
  await tap('Más opciones');
  await scrollBy(-1000);
  await tap('¿Cómo se hace?');
  await shot('08-session-howto');
  await tap('Cerrar');
  await tapLabel('Serie 2:'); // completar una serie → empieza el descanso
  await sleep(1200);
  await shot('09-session-rest');
  await tap('Saltar');
  await tap('Siguiente ejercicio');
  await tap('Siguiente ejercicio');
  await shot('10-session-cardio');
  await tap('Moderada');
  await tap('Finalizar');
  await tap('5');
  await shot('11-session-checkin');
  await tap('Finalizar');
  await sleep(800);

  // 12–14 Desde Inicio: Historial, un día del calendario, Ejercicios
  await tapLabel('Inicio');
  await tap('Historial');
  await shot('12-history');
  await tapLabel('Inicio');
  await scrollBy(1000);
  await tapLabel('15 '); // día entrenado → solo ese día
  await shot('13-history-day');
  await tapLabel('Inicio');
  await tap('Ejercicios');
  await shot('14-library');

  // 15–16 Perfil (4 tarjetas): cuerpo + calorías; sobre ti + apariencia + ajustes
  await load({ ...base, 'fittrack.data.v1': profile });
  await tapLabel('Perfil');
  await shot('15-profile');
  await tap('¿Qué es esto?');
  await scrollBy(1500);
  await shot('16-profile-settings');

  // 17 Tema Día (único tema alternativo)
  await tapLabel('Día');
  await tapLabel('Inicio');
  await shot('17-theme-day');

  // 18–19 Cambio de idioma instantáneo (nombres de ejercicio incluidos)
  await tapLabel('Perfil');
  await scrollBy(2600);
  await tapLabel('Français');
  await tapLabel('Accueil');
  await tap('Exercices');
  await shot('18-library-fr');
  await tapLabel('Profil');
  await scrollBy(2600);
  await tapLabel('Nederlands');
  await tapLabel('Start');
  await tap('Oefeningen');
  await shot('19-library-nl');

  // 20 "¿Cómo se hace?" en neerlandés: pasos en el idioma elegido
  await load({ ...base, 'fittrack.lang': 'nl', 'fittrack.data.v1': DATA, 'fittrack.active.v1': withCardio });
  await tapLabel('Trainen');
  await tap('Hoe doe je het?');
  await shot('20-howto-nl');

  // 21 Primer arranque: sin datos, Inicio invita a establecer marcas
  await load({ ...base });
  await shot('21-first-launch');
  await tap('Establecer marcas');
  await sleep(500);
  await shot('22-benchmark-test');

  // 23 Rueda (como la alarma del iPhone) al elegir el peso de una serie
  await load({ ...base, 'fittrack.data.v1': DATA, 'fittrack.active.v1': withCardio });
  await tapLabel('Entrenar');
  await tap('50', { nth: 1 });
  await sleep(500);
  await shot('23-wheel-weight');

  // 24 Altura: rueda + unidad cm / m
  await load({ ...base, 'fittrack.data.v1': profile });
  await tapLabel('Perfil');
  await tap('+ Registrar', { nth: 1 });
  await sleep(400);
  await tap('m');
  await sleep(400);
  await shot('24-wheel-height-m');

  // 25 Progresión: la última vez 3×8 con 50 kg → hoy 52,5 kg ("Mantener 50 kg")
  const bench = [{ exercise_id: 'close_grip_bench_press', estimated_1rm: 68 }];
  const prog = {
    ...ACTIVE,
    benchmarks: bench,
    draft: [
      { ...ACTIVE.draft[0], sets: [0, 1, 2, 3].map(() => ({ reps: 8, weight_kg: 52.5 })), progress: { from: 50, to: 52.5, sets: 3, reps: 8 } },
      ...ACTIVE.draft.slice(1),
    ],
  };
  await load({ ...base, 'fittrack.data.v1': DATA, 'fittrack.active.v1': prog });
  await tapLabel('Entrenar');
  await shot('25-session-progress');

  // 26–27 Récord en directo (8 × 57,5 kg supera la marca de 68 kg) y resumen final
  const recA = {
    ...ACTIVE,
    benchmarks: bench,
    draft: [
      { ...ACTIVE.draft[0], sets: [{ reps: 8, weight_kg: 57.5, done: true }, { reps: 8, weight_kg: 57.5, done: true }, { reps: 8, weight_kg: 57.5 }] },
      ...ACTIVE.draft.slice(1),
    ],
  };
  await load({ ...base, 'fittrack.data.v1': DATA, 'fittrack.active.v1': recA });
  await tapLabel('Entrenar');
  await shot('26-session-record');
  await tap('Finalizar');
  await sleep(400);
  await shot('27-finish-summary');
};
