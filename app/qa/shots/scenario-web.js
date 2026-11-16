// Web pública (R-136): una pantalla que crea un entreno. Se ejecuta a varios
// anchos (móvil 393, tableta 834, escritorio 1440) con --size y el build
// EXPO_PUBLIC_WEB_MODE=planner. Prefijo de archivo = ancho.
module.exports = async ({ load, shot, tap, sleep, evaluate }) => {
  await load({});
  const w = await evaluate('innerWidth');
  const n = (s) => `web-${w}-${s}`;
  await sleep(600);
  await shot(n('1-inicio'));
  await tap('Crear entreno', { prefix: false }).catch(async () => tap('Create workout'));
  await sleep(700);
  await shot(n('2-sesion'));
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
    await evaluate(`[...document.querySelectorAll('[role=button]')].pop()?.scrollIntoView()`);
    const btns = await evaluate(`[...document.querySelectorAll('[role=button]')].map(e=>e.innerText).filter(Boolean).slice(-1)[0]`);
    await tap(btns);
    await sleep(600);
    await evaluate('scrollTo(0,0)');
    await shot(n(`4-${l.toLowerCase()}`));
  }
};
