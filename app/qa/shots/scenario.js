// Escenario de capturas (orden = numeración de docs/screenshots).
// Con --frames, el mismo recorrido sirve para el vídeo.
// Pestañas: solo iconos → se tocan por aria-label (tapLabel).
module.exports = async ({ load, shot, tap, tapLabel, scrollBy, sleep, base, DATA, ACTIVE }) => {
  const withCardio = {
    ...ACTIVE,
    draft: [
      ...ACTIVE.draft.slice(0, 2),
      { exercise_id: 'run_treadmill', sets: [{ reps: 0, weight_kg: 0, duration_min: 20, distance_km: 3, intensity: 'moderate' }], equipment_status: 'available' },
    ],
  };
  const profile = { ...DATA, profile: { ...DATA.profile, sex: 'male', birth_year: 1992, goal: 'build_muscle' } };

  // 01–02 Inicio (portada)
  await load({ ...base, 'fittrack.data.v1': profile });
  await shot('01-home');
  await scrollBy(560);
  await shot('02-home-calendar');
  await scrollBy(900);
  await shot('03-home-activity');

  // 03–04 "Empezar sesión" → hoja (tiempo/intensidad/energía/objetivo) → entreno
  await scrollBy(-2000);
  await tap('Empezar sesión');
  await shot('04-quickstart-sheet');
  await tap('60 min');
  await tap('Continuar al entreno');
  await sleep(600);
  await shot('05-session-quickstart');

  // 04–07 Sesión activa con datos fijos (fuerza + cardio)
  await load({ ...base, 'fittrack.data.v1': DATA, 'fittrack.active.v1': withCardio });
  await tapLabel('Sesión');
  await shot('06-session-active');
  await tap('¿Cómo se hace?');
  await shot('07-session-howto');
  await tap('Cerrar');
  await tapLabel('Serie 2:'); // completar una serie → empieza el descanso
  await sleep(1200);
  await shot('08-session-rest');
  await tap('Saltar');
  await tap('Siguiente ejercicio');
  await tap('Siguiente ejercicio');
  await shot('09-session-cardio');
  await tap('Moderada');
  await tap('Terminar y guardar');
  await tap('4', { nth: 0 });
  await tap('5', { nth: 1 });
  await shot('10-session-checkin');
  await tap('Guardar sesión');
  await sleep(800);

  // 08 Historial (la sesión recién guardada, con cardio y valoración)
  await tapLabel('Historial');
  await shot('11-history');

  // 09 Biblioteca (mismo lenguaje de diseño)
  await tapLabel('Ejercicios');
  await shot('12-library');

  // 10–11 Perfil
  await load({ ...base, 'fittrack.data.v1': profile });
  await tapLabel('Perfil');
  await shot('13-profile');
  await scrollBy(900);
  await shot('14-profile-energy');
  await scrollBy(700);
  await shot('15-profile-theme');

  // 15–17 Temas: Día, Ámbar y bandera (España: nacionalidad + interruptor)
  await tapLabel('Día');
  await tapLabel('Inicio');
  await shot('16-theme-day');
  await tapLabel('Perfil');
  await scrollBy(1600);
  await tapLabel('Ámbar');
  await tapLabel('Inicio');
  await shot('17-theme-amber');
  await tapLabel('Perfil');
  await tap('Elige un país');
  await tap('España');
  await scrollBy(1600);
  await tapLabel('Usar los colores de mi país');
  await tapLabel('Inicio');
  await shot('18-theme-flag-es');

  // 18–19 Cambio de idioma instantáneo (nombres de ejercicio incluidos)
  await tapLabel('Perfil');
  await scrollBy(2400);
  await tapLabel('Français');
  await tapLabel('Exercices');
  await shot('19-library-fr');
  await tapLabel('Profil');
  await scrollBy(2400);
  await tapLabel('Nederlands');
  await tapLabel('Oefeningen');
  await shot('20-library-nl');

  // 21 "¿Cómo se hace?" en neerlandés: pasos en el idioma elegido
  await load({ ...base, 'fittrack.lang': 'nl', 'fittrack.data.v1': DATA, 'fittrack.active.v1': withCardio });
  await tapLabel('Sessie');
  await tap('Hoe doe je het?');
  await shot('21-howto-nl');
};
