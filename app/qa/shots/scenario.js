// Escenario de capturas (orden = numeración de docs/screenshots).
// Con --frames, el mismo recorrido sirve para el vídeo.
module.exports = async ({ load, shot, tap, scrollBy, sleep, base, DATA, ACTIVE }) => {
  const withCardio = {
    ...ACTIVE,
    draft: [
      ...ACTIVE.draft.slice(0, 2),
      { exercise_id: 'run_treadmill', sets: [{ reps: 0, weight_kg: 0, duration_min: 20, distance_km: 3, intensity: 'moderate' }], equipment_status: 'available' },
    ],
  };
  const profile = { ...DATA, profile: { ...DATA.profile, sex: 'male', birth_year: 1992, goal: 'build_muscle' } };

  // 01–02 Resumen
  await load({ ...base, 'fittrack.data.v1': DATA });
  await shot('01-dashboard');
  await tap('Más estadísticas');
  await scrollBy(500);
  await shot('02-dashboard-more');

  // 03 Arranque
  await tap('Sesión');
  await shot('03-start');

  // 04–08 Sesión activa (tema negro)
  await load({ ...base, 'fittrack.data.v1': DATA, 'fittrack.active.v1': withCardio });
  await tap('Sesión');
  await shot('04-session-active');
  await tap('¿Máquina ocupada?');
  await shot('05-session-equipment');
  await tap('¿Máquina ocupada?');
  await tap('Siguiente ejercicio');
  await tap('Siguiente ejercicio');
  await shot('06-session-cardio');
  await tap('Moderada');
  await tap('Terminar y guardar');
  await tap('4', { nth: 0 });
  await tap('5', { nth: 1 });
  await shot('07-session-checkin');
  await tap('Guardar sesión');
  await sleep(800);

  // 08 Historial (la sesión recién guardada, con cardio y valoración)
  await tap('Historial');
  await shot('08-history');

  // 09–10 Perfil
  await load({ ...base, 'fittrack.data.v1': profile });
  await tap('Perfil');
  await shot('09-profile');
  await scrollBy(900);
  await shot('10-profile-energy');
};
