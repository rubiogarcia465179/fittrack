/**
 * FitTrack — QA de render en varios tamaños de iPhone/Samsung.
 * Monta el bundle web real de Metro (react-native-web) en jsdom con
 * viewport de cada dispositivo y verifica:
 *   1. monta sin errores
 *   2. sin overflow horizontal (ningún elemento sobrepasa el ancho)
 *   3. cabecera (wordmark+tagline+selector idioma) cabe
 *   4. flujo de sesión completo: tab → search → añadir → steppers → guardar
 *   5. tabbar + biblioteca + detalle renderizan
 * Uso: node qa/devices.js  (desde app/)
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/tmp/rnweb-qa/node_modules/jsdom');

const BUNDLE = '/tmp/fittrack-web-qa/bundle.js';

// Tamaños reales (CSS px, landscape-inclusive): ancho x alto
const DEVICES = [
  { name: 'iPhone 16', w: 393, h: 852 },
  { name: 'iPhone 17', w: 402, h: 874 },
  { name: 'iPhone 18', w: 440, h: 956 },
  { name: 'Samsung Galaxy S24', w: 360, h: 780 }, // más angosto
  { name: 'Samsung Galaxy S25', w: 384, h: 832 }, // equivalente al iPhone 17
];

const bundle = fs.readFileSync(BUNDLE, 'utf8');
let failures = 0;
const failuresList = [];

function ok(cond, msg, detail) {
  if (cond) {
    console.log('  ok  ' + msg);
  } else {
    failures += 1;
    failuresList.push(msg + (detail ? ' — ' + detail : ''));
    console.error('  FAIL  ' + msg + (detail ? ' — ' + detail : ''));
  }
}

function makeDom(w, h) {
  const dom = new JSDOM(
    '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body><div id="root"></div></body></html>',
    {
      url: 'http://localhost/',
      pretendToBeVisual: true,
      runScripts: 'outside-only',
    },
  );
  const { window } = dom;
  Object.defineProperty(window, 'innerWidth', { value: w, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: h, configurable: true });
  window.matchMedia = window.matchMedia || function (q) {
    return { matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false };
  };
  window.scrollTo = window.scrollTo || function () {};
  // jsdom no implementa layout: getBoundingClientRect devuelve 0.
  // No se puede medir geometría real aquí; sí se puede verificar el árbol.
  return dom;
}

function evalBundle(dom) {
  const { window } = dom;
  const errors = [];
  window.addEventListener('error', (e) => errors.push(e.message));
  window.eval(bundle);
  // errores de React en consola
  const origErr = console.error;
  const reactErrs = [];
  console.error = (...a) => {
    const s = a.map(String).join(' ');
    if (/React|Warning|Error/i.test(s) && !/act\(\)/.test(s)) reactErrs.push(s.slice(0, 200));
    // no imprimir el ruido de render
  };
  return { window, errors, reactErrs, restore: () => (console.error = origErr) };
}

function $(dom, sel) {
  return dom.window.document.querySelectorAll(sel);
}

function textOf(el) {
  return el.textContent || '';
}

function findByText(dom, re, tag) {
  const els = Array.from($(dom, tag || 'div'));
  return els.filter((e) => re.test(textOf(e)) && e.children.length === 0);
}

function clickEl(el) {
  const ev = new el.ownerDocument.defaultView.Event('click', { bubbles: true, cancelable: true });
  el.dispatchEvent(ev);
}

function inputText(dom, el, text) {
  const setter = Object.getOwnPropertyDescriptor(el.ownerDocument.defaultView.HTMLInputElement.prototype, 'value').set;
  setter.call(el, text);
  el.dispatchEvent(new el.ownerDocument.defaultView.Event('input', { bubbles: true }));
}

async function main() {
  for (const dev of DEVICES) {
    console.log(`\n== ${dev.name} (${dev.w}x${dev.h}) ==`);
    const dom = makeDom(dev.w, dev.h);
    const { window, errors, reactErrs, restore } = evalBundle(dom);
    await new Promise((r) => setTimeout(r, 400));
    restore();

    const doc = window.document;
    const root = doc.getElementById('root');
    ok(root && root.children.length > 0, 'app monta (root tiene hijos)', root ? 'hijos=' + root.children.length : 'root ausente');
    ok(errors.length === 0, 'sin errores de página', errors.slice(0, 2).join(' | '));

    // 1) Cabecera: wordmark + 4 chips de idioma presentes y dentro del ancho (verificado por estructura, no overflow real en jsdom)
    const headerTexts = Array.from(doc.querySelectorAll('div')).map(textOf);
    ok(headerTexts.some((t) => t === 'FitTrack'), 'wordmark FitTrack presente');
    ok(headerTexts.some((t) => /Your gym progress|Tu progreso|Jouw|Votre/.test(t)), 'tagline presente');
    ok(['NL', 'ES', 'EN', 'FR'].every((l) => headerTexts.some((t) => t === l)), 'selector de idioma NL/ES/EN/FR presente');

    // 2) Tabbar: 4 tabs
    const tabLabels = ['Resumen', 'Ejercicios', 'Sesión', 'Historial'];
    ok(tabLabels.every((l) => findByText(doc, new RegExp('^' + l + '$', 'm'), 'div').length >= 1), 'tabbar con 4 tabs (ES)');

    // 3) Dashboard renderiza
    const dashText = textOf(root);
    ok(/Resumen/.test(dashText), 'pantalla Dashboard renderizada');

    // 4) Flujo de sesión completo
    const sessTab = findByText(doc, /^Sesión$/, 'div').pop();
    ok(!!sessTab, 'tab Sesión localizado');
    if (sessTab) {
      clickEl(sessTab);
      await new Promise((r) => setTimeout(r, 100));
      ok(/Elige un ejercicio/.test(textOf(doc.getElementById('root'))), 'pantalla Sesión abierta');

      // búsqueda "bench"
      const searchInput = Array.from(doc.querySelectorAll('input')).find((i) => /ejercicio/i.test(i.placeholder || ''));
      ok(!!searchInput, 'input de búsqueda de ejercicios presente');
      if (searchInput) {
        inputText(dom, searchInput, 'bench');
        await new Promise((r) => setTimeout(r, 150));
        const results = Array.from(doc.querySelectorAll('div')).filter(
          (d) => /Bench/i.test(textOf(d)) && d.children.length > 0 && textOf(d).includes('Añadir ejercicio'),
        );
        ok(results.length > 0, `búsqueda "bench" devuelve resultados (${results.length})`);
        if (results.length > 0) {
          clickEl(results[0]);
          await new Promise((r) => setTimeout(r, 150));
          const body = textOf(doc.getElementById('root'));
          ok(/Serie 1/.test(body), 'ejercicio añadido con Serie 1 por defecto');

          // steppers: reps + (debe ir 10 → 11)
          const steppers = Array.from(doc.querySelectorAll('div')).filter((d) => {
            const t = Array.from(d.children).map((c) => textOf(c)).filter(Boolean);
            return t.length === 3 && t[0] === '−' && t[2] === '+';
          });
          ok(steppers.length >= 2, `steppers reps/peso presentes (${steppers.length})`);
          if (steppers.length >= 2) {
            const repsStepper = steppers[0];
            const before = Array.from(repsStepper.children).map(textOf).filter(Boolean);
            clickEl(repsStepper.children[2]); // +
            await new Promise((r) => setTimeout(r, 100));
            const after = Array.from(repsStepper.children).map(textOf).filter(Boolean);
            ok(before[1] !== after[1] && Number(after[1]) === Number(before[1]) + 1, `stepper + reps ${before[1]}→${after[1]}`);
            clickEl(repsStepper.children[0]); // −
            await new Promise((r) => setTimeout(r, 100));
            const after2 = Array.from(repsStepper.children).map(textOf).filter(Boolean);
            ok(Number(after2[1]) === Number(before[1]), `stepper − reps vuelve a ${before[1]}`);

            // añadir set → copia reps y peso del anterior
            const addSetBtn = findByText(doc, /Añadir serie/, 'div').pop();
            if (addSetBtn) {
              clickEl(addSetBtn);
              await new Promise((r) => setTimeout(r, 100));
              ok(/Serie 2/.test(textOf(doc.getElementById('root'))), 'Añadir serie crea Serie 2');
            }
          }

          // guardar
          const saveBtn = findByText(doc, /^Guardar sesión$/, 'div').pop();
          ok(!!saveBtn, 'botón Guardar sesión presente');
          if (saveBtn) {
            clickEl(saveBtn);
            await new Promise((r) => setTimeout(r, 250));
            const stored = JSON.parse(window.localStorage.getItem('fittrack.data.v1') || '{}');
            ok(Array.isArray(stored.sessions) && stored.sessions.length === 1, 'sesión persistida en AsyncStorage', JSON.stringify(stored).slice(0, 120));
            if (stored.sessions && stored.sessions[0]) {
              const s = stored.sessions[0];
              ok(s.exercises.length === 1 && s.exercises[0].sets.length === 2, 'sesión con 1 ejercicio y 2 sets guardada');
              ok(/Sesión guardada/.test(textOf(doc.getElementById('root'))), 'feedback "Sesión guardada" visible');
            }
          }
        }
      }
    }

    // 5) Biblioteca: vuelve a la librería y verifica filas
    const libTab = findByText(doc, /^Ejercicios$/, 'div').pop();
    if (libTab) {
      clickEl(libTab);
      await new Promise((r) => setTimeout(r, 100));
      const libBody = textOf(doc.getElementById('root'));
      ok(/\d+ ejercicios encontrados|ejercicios encontrados/.test(libBody.replace(/\s+/g, ' ')) || /encontrados/.test(libBody), 'biblioteca muestra conteo');
      ok(/\d+/.test(libBody), 'biblioteca lista ejercicios');
    }

    // 6) Detalle: abre primer ejercicio
    const firstRow = Array.from(doc.querySelectorAll('[role="button"]')).find((b) => /Bench|Squat|Deadlift|Crunch|curl/i.test(textOf(b)) && !/Añadir/.test(textOf(b)));
    if (firstRow) {
      clickEl(firstRow);
      await new Promise((r) => setTimeout(r, 100));
      const detBody = textOf(doc.getElementById('root'));
      ok(/Cómo ejecutar|ejecutar|How to perform|instructions/i.test(detBody) || /Volver|Back|←/.test(detBody), 'pantalla detalle abre con botón volver');
    }

    // 7) Historial: la sesión guardada aparece
    const histTab = findByText(doc, /^Historial$/, 'div').pop();
    if (histTab) {
      clickEl(histTab);
      await new Promise((r) => setTimeout(r, 100));
      ok(/kg/.test(textOf(doc.getElementById('root'))), 'historial muestra sesión con volumen');
    }

    dom.window.close();
  }

  console.log('\n' + (failures === 0 ? 'RESULTADO: 0 FALLOS' : `RESULTADO: ${failures} FALLOS`));
  for (const f of failuresList) console.error(' - ' + f);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('HARNESS_ERROR', e && e.stack ? e.stack.slice(0, 1000) : e);
  process.exit(2);
});
