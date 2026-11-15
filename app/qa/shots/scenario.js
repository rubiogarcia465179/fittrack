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
  await tap('Terminar y guardar');
  await tap('4', { nth: 0 });
  await tap('5', { nth: 1 });
  await shot('11-session-checkin');
  await tap('Guardar sesión');
  await sleep(800);

  // 12–14 Desde Inicio: Historial, un día del calendario, Ejercicios
  await tapLabel('Inicio');
  await tap('Historial');
  await shot('12-history');
  await tapLabel('Inicio');
  await scrollBy(1000);
  await tapLabel('14 '); // día entrenado → solo ese día
  await shot('13-history-day');
  await tapLabel('Inicio');
  await tap('Ejercicios');
  await shot('14-library');

  // 15–17 Perfil: cuerpo + marcas, calorías, apariencia
  await load({ ...base, 'fittrack.data.v1': profile });
  await tapLabel('Perfil');
  await shot('15-profile');
  await tap('¿Qué es esto?');
  await scrollBy(300);
  await shot('16-profile-energy');
  await scrollBy(1700);
  await shot('17-profile-appearance');

  // 18–20 Temas: Día, Ámbar (en "Más") y bandera (nacionalidad + interruptor)
  await tapLabel('Día');
  await tapLabel('Inicio');
  await shot('18-theme-day');
  await tapLabel('Perfil');
  await scrollBy(2300);
  await tapLabel('Más');
  await tapLabel('Ámbar');
  await tapLabel('Inicio');
  await shot('19-theme-amber');
  await tapLabel('Perfil');
  await tap('Elige un país');
  await tap('España');
  await scrollBy(2300);
  await tapLabel('Usar los colores de mi país');
  await tapLabel('Inicio');
  await shot('20-theme-flag-es');

  // 21–22 Cambio de idioma instantáneo (nombres de ejercicio incluidos)
  await tapLabel('Perfil');
  await scrollBy(3200);
  await tapLabel('Français');
  await tapLabel('Accueil');
  await tap('Exercices');
  await shot('21-library-fr');
  await tapLabel('Profil');
  await scrollBy(3200);
  await tapLabel('Nederlands');
  await tapLabel('Start');
  await tap('Oefeningen');
  await shot('22-library-nl');

  // 23 "¿Cómo se hace?" en neerlandés: pasos en el idioma elegido
  await load({ ...base, 'fittrack.lang': 'nl', 'fittrack.data.v1': DATA, 'fittrack.active.v1': withCardio });
  await tapLabel('Trainen');
  await tap('Hoe doe je het?');
  await shot('23-howto-nl');

  // 24 Perfil → "Establecer marcas": test con los 5 clásicos
  await load({ ...base, 'fittrack.data.v1': profile });
  await tapLabel('Perfil');
  await tap('Establecer marcas');
  await sleep(500);
  await shot('24-benchmark-test');

  // 25 La silueta sigue al Perfil: mujer, 165 cm, 60 kg (IMC ≈ 22)
  const female = {
    ...DATA,
    profile: { ...DATA.profile, sex: 'female', birth_year: 1995, height_entries: [{ date: iso(-20), value: 165 }], weight_entries: [{ date: iso(0), value: 60 }] },
  };
  await load({ ...base, 'fittrack.data.v1': female });
  await scrollBy(330);
  await shot('25-body-female');

  // 26 Cuerpo 3D: arrastrar con el dedo lo gira (aquí, hasta verlo de espaldas)
  await load({ ...base, 'fittrack.data.v1': profile });
  await scrollBy(200);
  await sleep(800);
  await drag('Brazos', 230, 0);
  await sleep(2200);
  await shot('26-body-back');
};
