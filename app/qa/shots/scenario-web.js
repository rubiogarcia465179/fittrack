// Web pública (R-136): una pantalla que crea un entreno. Se ejecuta a varios
// anchos (móvil 393, tableta 834, escritorio 1440) con --size y el build
// EXPO_PUBLIC_WEB_MODE=planner. Prefijo de archivo = ancho.
const path = require('path');
const I18N = Object.fromEntries(['es', 'nl', 'fr'].map((l) => [l, require(path.join(__dirname, '../../src/i18n-data', l + '.json'))]));
const CREATE = Object.fromEntries(Object.entries(I18N).map(([l, j]) => [l, j.web_create]));
module.exports = async ({ load, shot, tap, tapLabel, sleep, evaluate }) => {
  const hasText = (t) => evaluate(`document.body.innerText.toLowerCase().includes(${JSON.stringify(t.toLowerCase())})`);
  await load({});
  const w = await evaluate('innerWidth');
  const n = (s) => `web-${w}-${s}`;
  await sleep(600);
  await shot(n('1-inicio'));
  await tap('Crear entreno', { prefix: false }).catch(async () => tap('Create workout'));
  await sleep(700);
  await shot(n('2-sesion'));
  // R-150: sin historial, el press de banca da nivel y pesos (60 kg × 8 → intermedio).
  await load({});
  await tap('60 kg');
  await tap('Create workout');
  await sleep(700);
  await shot(n('2b-banca'));
  // R-153: 2 horas → más ejercicios y series, sin pasarse.
  await load({});
  await tap('2 h');
  await tap('Create workout');
  await sleep(700);
  await shot(n('2c-2h'));
  // R-165 / R-166 / R-168: varios objetivos (+ abdominales) y "Cansadísimo".
  await load({});
  await tap('Abs');
  await tap('Exhausted');
  await tap('60 kg');
  await tap('Create workout');
  await sleep(700);
  await shot(n('2d-cansado-abs'));
  await load({});
  await tap('60 kg');
  await tap('Create workout');
  await sleep(700);
  // R-152: seguir la sesión — serie, descanso, salir y resumen.
  await tap('Start workout');
  await sleep(500);
  await shot(n('6-serie'));
  // Durante la serie: "¿Cómo se hace?" abre la misma hoja (dibujos, pasos, vídeo).
  await tap('How to do it');
  await sleep(800);
  await shot(n('6-como'));
  await tap('Close');
  await sleep(400);
  // R-176/R-177: "Change" → otro parecido, más tarde u otro orden.
  await tap('Change');
  await sleep(800);
  await shot(n('6-cambiar'));
  await tap('Close');
  await sleep(400);
  await tap('Set done');
  await sleep(1200);
  // Mismo ejercicio a continuación → consejo para el descanso (R-164).
  await shot(n('6-descanso'));
  await tapLabel('Skip rest');
  await sleep(300);
  // Hasta cambiar de ejercicio → vista previa del siguiente.
  for (let i = 0; i < 6; i++) {
    await tap('Set done');
    await sleep(900);
    if (await hasText('Up next')) break;
    await tapLabel('Skip rest');
    await sleep(300);
  }
  await shot(n('6-descanso-siguiente'));
  await tapLabel('Skip rest');
  await sleep(300);
  await tapLabel('End workout?');
  await sleep(300);
  await shot(n('6-terminar'));
  // Seguir hasta cumplir el plan (Extra mile solo se ofrece con el plan hecho).
  await tap('Keep going');
  await sleep(300);
  const finishAll = async () => {
    for (let i = 0; i < 40 && !(await hasText('Well done')); i++) {
      if (await hasText('Skip')) await tapLabel('Skip rest');
      else await tap('Set done');
      await sleep(250);
    }
  };
  await finishAll();
  await sleep(500);
  await shot(n('6-resumen'));
  // R-172: Extra mile — un ejercicio más y la racha.
  await tap('Extra mile: one more exercise');
  await sleep(600);
  await shot(n('6-extra'));
  await finishAll();
  await sleep(600);
  await shot(n('6-racha'));
  await evaluate(`[...document.querySelectorAll('[role=button]')].pop()?.scrollIntoView({ block: 'end' })`);
  await sleep(300);
  await shot(n('6-racha-fin'));
  // Textos largos (NL) en la sesión: serie, descanso con vista previa y resumen.
  await load({});
  await tap('NL');
  await sleep(300);
  await tap('60 kg');
  await tap(I18N.nl.web_create);
  await sleep(700);
  await tap(I18N.nl.web_start);
  await sleep(500);
  await shot(n('8-nl-serie'));
  for (let i = 0; i < 6; i++) {
    await tap(I18N.nl.ws_set_done);
    await sleep(900);
    if (await hasText(I18N.nl.ws_up_next)) break;
    await tapLabel(I18N.nl.rest_skip_a11y);
    await sleep(300);
  }
  await shot(n('8-nl-descanso'));
  // R-169: historial con WhatsApp — pegar la conversación.
  await load({});
  await tap('History · import from WhatsApp');
  await sleep(500);
  const chat = '[21/11/26, 10:03:12] Me: FitTrack · 2026-11-21 · 52 min\n- Bench press: 3 × 10 · 60 kg\n- Lateral raises: 3 × 12 · 6 kg\nExtra mile\n[22/11/26, 09:00] Me: FitTrack · 2026-11-22 · 40 min\n- Back squat: 4 × 8 · 80 kg';
  await evaluate(`(() => { const t = document.querySelector('textarea'); const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set; set.call(t, ${JSON.stringify(chat)}); t.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
  await sleep(300);
  await tap('Import');
  await sleep(500);
  await shot(n('7-historial'));
  await load({});
  await tap('Create workout');
  await sleep(700);
  const first = await evaluate(`(() => { const r=[...document.querySelectorAll('[role=button]')].find(e=>/^1\\./.test(e.getAttribute('aria-label')||'')); if(!r) return null; r.click(); return true; })()`);
  await sleep(900);
  if (first) await shot(n('3-ejercicio'));
  // Otras respuestas (solo en escritorio): tirón, piernas, cuerpo completo sin material.
  if (w > 900) {
    for (const [i, picks] of [['pull', ['Back and arms']], ['legs', ['Legs and core', 'Dumbbells']], ['full', ['Full body', 'No equipment', 'Lose fat']]]) {
      await load({});
      for (const p of picks) await tap(p);
      await tap('Create workout');
      await sleep(500);
      await shot(n(`5-${i}`));
    }
  }
  // Los 4 idiomas con la sesión a la vista (etiquetas largas en NL/FR).
  for (const l of ['ES', 'NL', 'FR']) {
    await load({});
    await tap(l);
    await sleep(300);
    await tap(CREATE[l.toLowerCase()]);
    await sleep(600);
    await evaluate('scrollTo(0,0)');
    await shot(n(`4-${l.toLowerCase()}`));
  }
};
