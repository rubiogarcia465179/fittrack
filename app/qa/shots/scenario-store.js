// Capturas para las tiendas (R-142): 5 pantallas × 4 idiomas, sin datos falsos
// presentados como reales (son los datos de ejemplo del harness). Se ejecuta con
// --size 440x956 --dpr 3 (Apple 6,9") y --size 360x720 --dpr 3 (Google Play).
// Archivos: store-<ancho>-<idioma>-<n>.png
const path = require('path');
const B = (l) => require(path.join(__dirname, '../../../i18n', `${l}.json`));
const NAMES = require(path.join(__dirname, '../../../data/exercises/names-i18n.json'));
const DISPLAY = require(path.join(__dirname, '../../../data/exercises/names-display.json'));
const exName = (id, l) => {
  if (l === 'es') return NAMES[id][0];
  if (l === 'fr') return NAMES[id][1];
  return l === 'nl' ? DISPLAY[id][1] : DISPLAY[id][0];
};
module.exports = async ({ load, shot, tap, tapLabel, scrollBy, sleep, evaluate, base, DATA, ACTIVE }) => {
  let w = 0;
  // El comentario del diario, en el idioma de cada captura.
  const COMMENT = { en: 'First time at 45 kg on the incline press.', es: 'Primera vez con 45 kg en inclinado.', nl: 'Voor het eerst 45 kg op de schuine bank.', fr: 'Première fois à 45 kg au développé incliné.' };
  const profileFor = (l) => ({
    ...DATA,
    sessions: DATA.sessions.map((s) => (s.comments ? { ...s, comments: s.comments.map((c) => ({ ...c, text: COMMENT[l] })) } : s)),
    profile: { ...DATA.profile, sex: 'male', birth_year: 1992, goal: 'build_muscle' },
  });
  for (const l of ['en', 'es', 'nl', 'fr']) {
    const t = B(l);
    const seed = { ...base, 'fittrack.lang': l, 'fittrack.data.v1': profileFor(l) };
    const n = async (k) => shot(`store-${w}-${l}-${k}`);
    // 1 Inicio: "Hoy toca", marcas, calendario
    await load(seed);
    if (!w) w = await evaluate('innerWidth');
    await sleep(500);
    await n(1);
    // 2 Sesión en curso: solo el ejercicio actual, con su dibujo
    await load({ ...seed, 'fittrack.active.v1': ACTIVE });
    await tapLabel(t.nav_session);
    await sleep(500);
    await n(2);
    // 3 ¿Cómo se hace?: dibujo real + pasos + vídeo
    await load(seed);
    await tap(t.nav_exercises);
    await tap(t.group_chest);
    await tap(exName('incline_bench_press', l));
    await sleep(600);
    await n(3);
    // 4 Diario: sesiones con foto, series y comentarios
    await load(seed);
    await tap(t.hist_title);
    await sleep(500);
    await n(4);
    // 5 Perfil: tus datos, copia de seguridad (al final)
    await load(seed);
    await tapLabel(t.nav_profile);
    await scrollBy(3000);
    // Empieza limpio en la tarjeta de idioma + tus datos.
    await evaluate(`(() => { const el = [...document.querySelectorAll('div')].reverse().find((e) => (e.innerText || '').trim().toLowerCase() === ${JSON.stringify(t.profile_language.toLowerCase())}); if (el) { el.scrollIntoView({ block: 'start' }); const s = [...document.querySelectorAll('div')].find((d) => d.scrollHeight > d.clientHeight + 50 && getComputedStyle(d).overflowY !== 'visible'); if (s) s.scrollTop -= 40; } return !!el; })()`);
    await sleep(400);
    await n(5);
  }
};
