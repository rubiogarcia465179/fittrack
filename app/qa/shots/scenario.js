// Escenario de capturas (orden = numeración de docs/screenshots).
// Con --frames, el mismo recorrido sirve para el vídeo.
// 3 pestañas (Inicio · Entrenar · Perfil), solo iconos → se tocan por
// aria-label (tapLabel). Historial y Ejercicios se abren desde Inicio.
module.exports = async ({ load, shot, tap, tapLabel, scrollBy, sleep, base, DATA, ACTIVE }) => {
  const withCardio = {
    ...ACTIVE,
    draft: [
      ...ACTIVE.draft.slice(0, 2),
      { exercise_id: 'run_treadmill', sets: [{ reps: 0, weight_kg: 0, duration_min: 20, distance_km: 3, intensity: 'moderate' }], equipment_status: 'available' },
    ],
  };
  const profile = { ...DATA, profile: { ...DATA.profile, sex: 'male', birth_year: 1992, goal: 'build_muscle' } };

  // 01–02 Inicio: "Hoy toca", Empezar sesión, marcas, calendario, filas, actividad
  await load({ ...base, 'fittrack.data.v1': profile });
  await shot('01-home');
  await scrollBy(900);
  await shot('02-home-more');

  // 03–04 "Empezar sesión" → hoja (tiempo/intensidad/energía/objetivo) → entreno
  await scrollBy(-2000);
  await tap('Empezar sesión');
  await shot('03-quickstart-sheet');
  await tap('60 min');
  await tap('Continuar al entreno');
  await sleep(600);
  await shot('04-session-quickstart');

  // 05–10 Sesión activa con datos fijos (fuerza + cardio)
  await load({ ...base, 'fittrack.data.v1': DATA, 'fittrack.active.v1': withCardio });
  await tapLabel('Entrenar');
  await shot('05-session-active');
  await tap('Más opciones');
  await scrollBy(400);
  await shot('06-session-more');
  await tap('Más opciones');
  await scrollBy(-1000);
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

  // 11–13 Desde Inicio: Historial, un día del calendario, Ejercicios
  await tapLabel('Inicio');
  await tap('Historial');
  await shot('11-history');
  await tapLabel('Inicio');
  await tapLabel('14 '); // día entrenado → solo ese día
  await shot('12-history-day');
  await tapLabel('Inicio');
  await tap('Ejercicios');
  await shot('13-library');

  // 14–16 Perfil: cuerpo + calorías, sobre ti, apariencia
  await load({ ...base, 'fittrack.data.v1': profile });
  await tapLabel('Perfil');
  await shot('14-profile');
  await tap('¿Qué es esto?');
  await scrollBy(500);
  await shot('15-profile-energy');
  await scrollBy(1400);
  await shot('16-profile-appearance');

  // 17–19 Temas: Día, Ámbar (en "Más") y bandera (nacionalidad + interruptor)
  await tapLabel('Día');
  await tapLabel('Inicio');
  await shot('17-theme-day');
  await tapLabel('Perfil');
  await scrollBy(1800);
  await tapLabel('Más');
  await tapLabel('Ámbar');
  await tapLabel('Inicio');
  await shot('18-theme-amber');
  await tapLabel('Perfil');
  await tap('Elige un país');
  await tap('España');
  await scrollBy(1800);
  await tapLabel('Usar los colores de mi país');
  await tapLabel('Inicio');
  await shot('19-theme-flag-es');

  // 20–21 Cambio de idioma instantáneo (nombres de ejercicio incluidos)
  await tapLabel('Perfil');
  await scrollBy(2600);
  await tapLabel('Français');
  await tapLabel('Accueil');
  await tap('Exercices');
  await shot('20-library-fr');
  await tapLabel('Profil');
  await scrollBy(2600);
  await tapLabel('Nederlands');
  await tapLabel('Start');
  await tap('Oefeningen');
  await shot('21-library-nl');

  // 22 "¿Cómo se hace?" en neerlandés: pasos en el idioma elegido
  await load({ ...base, 'fittrack.lang': 'nl', 'fittrack.data.v1': DATA, 'fittrack.active.v1': withCardio });
  await tapLabel('Trainen');
  await tap('Hoe doe je het?');
  await shot('22-howto-nl');
};
