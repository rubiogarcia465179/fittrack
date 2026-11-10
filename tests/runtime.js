/**
 * FitTrack — test de runtime de la web CREADA (dist/).
 *
 * No hay navegador disponible en el sandbox (ni jsdom installable), así que
 * este test emula el mínimo DOM que usan las páginas generadas por Astro y
 * ejecuta en Node, con datos reales, los flujos completos:
 *
 *   /exercises/  -> click en chips de filtro (chest, barbell...) + búsqueda
 *   /session/    -> buscar ejercicio, añadir, editar sets, GUARDAR SESIÓN
 *                   (verifica localStorage real)
 *   /history/    -> ver sesión guardada, BORRAR
 *   /dashboard/  -> re-render con la sesión guardada (stats + recientes)
 *   i18n         -> click en botones de idioma (el bug original)
 *
 * Sale 0 si todo pasa; 1 con el detalle del fallo.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIST = path.join(__dirname, '..', 'web', 'dist');
let failures = 0;
let checks = 0;
function ok(cond, msg) {
  checks++;
  if (cond) {
    console.log('  ok  ' + msg);
  } else {
    failures++;
    console.log('  FAIL ' + msg);
  }
}

// ---------------------------------------------------------------- DOM shim
function makeEl(tag) {
  const el = {
    tagName: String(tag).toUpperCase(),
    children: [],
    attrs: {},
    style: {},
    hidden: false,
    value: '',
    listeners: {},
    _text: '',
    dataset: {},
    classList: null,

    get id() {
      return this.attrs.id || '';
    },
    set id(v) {
      this.attrs.id = v;
    },
    get textContent() {
      if (this._text && !this.children.length) return this._text;
      return this.children.map((c) => c.textContent).join('');
    },
    set textContent(v) {
      this._text = String(v);
      this.children = [];
    },
    get innerHTML() {
      return this.children.map((c) => c.outerHTML).join('');
    },
    set innerHTML(v) {
      this.children = parseHTML(String(v));
    },
    get outerHTML() {
      const a = Object.entries(this.attrs)
        .map(([k, val]) => (k === 'class' ? '' : ` ${k}="${val}"`))
        .join('');
      const cls = this.attrs.class ? ` class="${this.attrs.class}"` : '';
      return `<${this.tagName.toLowerCase()}${cls}${a}>${this.innerHTML}</${this.tagName.toLowerCase()}>`;
    },

    setAttribute(k, v) {
      this.attrs[k] = String(v);
      if (k === 'class') syncClass(this, String(v));
      if (k.startsWith('data-')) {
        this.dataset[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(v);
      }
    },
    getAttribute(k) {
      return k in this.attrs ? this.attrs[k] : null;
    },
    hasAttribute(k) {
      return k in this.attrs;
    },
    removeAttribute(k) {
      delete this.attrs[k];
    },

    appendChild(c) {
      c.parentNode = this;
      this.children.push(c);
      return c;
    },
    append(...cs) {
      cs.forEach((c) => {
        if (typeof c === 'string') {
          const el = parseHTML(c)[0];
          el.parentNode = this;
          this.children.push(el);
        } else {
          c.parentNode = this;
          this.children.push(c);
        }
      });
    },
    addEventListener(ev, fn) {
      (this.listeners[ev] = this.listeners[ev] || []).push(fn);
    },
    removeEventListener() {},
    click() {
      (this.listeners.click || []).slice().forEach((fn) => fn.call(this, { type: 'click', target: this }));
    },
    querySelector(sel) {
      return qsel(this, sel);
    },
    querySelectorAll(sel) {
      return qselAll(this, sel);
    },
    focus() {},
    getBoundingClientRect() {
      return { top: 0, left: 0, width: 100, height: 100 };
    },
    get lastChild() {
      return this.children.length ? this.children[this.children.length - 1] : null;
    },
    get firstChild() {
      return this.children.length ? this.children[0] : null;
    },
    insertBefore(c, ref) {
      c.parentNode = this;
      const i = ref ? this.children.indexOf(ref) : -1;
      if (i < 0) this.children.push(c);
      else this.children.splice(i, 0, c);
      return c;
    },
    remove() {
      if (this.parentNode) {
        const i = this.parentNode.children.indexOf(this);
        if (i >= 0) this.parentNode.children.splice(i, 1);
      }
    },
    removeChild(c) {
      const i = this.children.indexOf(c);
      if (i >= 0) this.children.splice(i, 1);
      return c;
    },
  };
  el.classList = {
    add(...cs) {
      const cur = new Set(String(el.attrs.class || '').split(/\s+/).filter(Boolean));
      cs.forEach((c) => cur.add(c));
      el.attrs.class = [...cur].join(' ');
    },
    remove(...cs) {
      const cur = new Set(String(el.attrs.class || '').split(/\s+/).filter(Boolean));
      cs.forEach((c) => cur.delete(c));
      el.attrs.class = [...cur].join(' ');
    },
    toggle(c, force) {
      const has = String(el.attrs.class || '').split(/\s+/).filter(Boolean).includes(c);
      const want = force === undefined ? !has : force;
      if (want) this.add(c);
      else this.remove(c);
      return want;
    },
    contains(c) {
      return String(el.attrs.class || '').split(/\s+/).filter(Boolean).includes(c);
    },
  };
  // className setter: mantener attrs.class + classList sincronizados.
  Object.defineProperty(el, 'className', {
    get() {
      return el.attrs.class || '';
    },
    set(v) {
      el.attrs.class = String(v);
    },
  });
  // type property: las páginas lo asignan como prop (inp.type = 'search').
  Object.defineProperty(el, 'type', {
    get() {
      return el.attrs.type || '';
    },
    set(v) {
      el.attrs.type = String(v);
    },
  });
  return el;
}

function syncClass(el, cls) {
  el.attrs.class = cls;
}

// Selectores soportados: *, id, clase, [data-x], etiqueta, combinaciones simples
function matches(el, sel) {
  sel = sel.trim();
  if (sel === '*') return true;
  if (sel.startsWith('#')) return el.id === sel.slice(1);
  if (sel.startsWith('.')) return el.classList.contains(sel.slice(1));
  if (sel.startsWith('[')) {
    const m = sel.match(/^\[([^=]+)(?:=["']?([^"']+)["']?)?\]$/);
    if (!m) return false;
    const [_, k, v] = m;
    const attr = k.startsWith('data-') ? 'data-' + k.slice(5) : k;
    const val = el.getAttribute(attr);
    return v === undefined ? el.hasAttribute(attr) : val === v;
  }
  return el.tagName.toLowerCase() === sel;
}

function* walk(el) {
  for (const c of el.children) {
    yield c;
    yield* walk(c);
  }
}

function qselAll(root, sel) {
  return [...walk(root)].filter((e) => matches(e, sel));
}
function walkAll(el) {
  const out = [];
  for (const c of el.children) {
    out.push(c);
    out.push(...walkAll(c));
  }
  return out;
}
function qsel(root, sel) {
  return qselAll(root, sel)[0] || null;
}

// Mini parseador de HTML para innerHTML (el formato exacto que usan las páginas)
function parseHTML(html) {
  const root = makeEl('#root');
  const stack = [root];
  const VOID = new Set(['img', 'br', 'hr', 'input', 'meta', 'link']);
  const re = /<\/([a-zA-Z][a-zA-Z0-9]*)>|<([a-zA-Z][a-zA-Z0-9]*)((?:\s[^<>]*)?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    const top = stack[stack.length - 1];
    if (m[1]) {
      // etiqueta de cierre
      const name = m[1].toLowerCase();
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tagName.toLowerCase() === name) {
          stack.length = i;
          break;
        }
      }
    } else if (m[2]) {
      const name = m[2];
      const el = makeEl(name);
      // atributos
      const attrRe = /([a-zA-Z][a-zA-Z0-9_-]*)(?:=["']?([^"'>]*)["']?)?/g;
      let am;
      const attrStr = m[3] || '';
      while ((am = attrRe.exec(attrStr))) {
        if (am[1] === '') continue;
        el.setAttribute(am[1], am[2] !== undefined ? am[2] : '');
      }
      top.appendChild(el);
      if (!VOID.has(name)) stack.push(el);
    } else if (m[4]) {
      const txt = m[4].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
      if (txt.trim()) top._text += txt;
    }
  }
  return root.children;
}

// ---------------------------------------------------------------- página
function loadPage(route) {
  const file = path.join(DIST, route, 'index.html');
  const html = fs.readFileSync(file, 'utf-8');

  const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
  if (!bodyMatch) throw new Error('sin <body> en ' + route);
  const headScripts = [...html.matchAll(/<script src="([^"]+)"[^>]*>/g)].map((m) => m[1]);
  const body = bodyMatch[1];
  const inlineModules = [...body.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map((m) => m[1]);

  const bodyRoot = makeEl('body');
  bodyRoot.children = parseHTML(body);

  const byId = {};
  for (const el of walkAll(bodyRoot)) {
    if (el.id) byId[el.id] = el;
  }

  const storage = { _m: {} };
  const localStorage = {
    getItem: (k) => (k in storage._m ? storage._m[k] : null),
    setItem: (k, v) => {
      storage._m[k] = String(v);
    },
    removeItem: (k) => delete storage._m[k],
  };

  const events = { global: {} };
  const document = {
    documentElement: makeEl('html'),
    body: bodyRoot,
    readyState: 'complete',
    getElementById: (id) => byId[id] || null,
    querySelector: (sel) => qsel(bodyRoot, sel),
    querySelectorAll: (sel) => qselAll(bodyRoot, sel),
    createElement: (t) => makeEl(t),
    addEventListener(ev, fn) {
      (events.global[ev] = events.global[ev] || []).push(fn);
    },
    dispatchEvent() {},
  };
  // los scripts de Nav usan document.getElementById en el body completo
  const window = {
    document,
    localStorage,
    alert: (m) => {
      window.__alerted = m;
    },
    addEventListener(ev, fn) {
      (events.global[ev] = events.global[ev] || []).push(fn);
    },
    CustomEvent: class {
      constructor(type, opts) {
        this.type = type;
        this.detail = (opts && opts.detail) || {};
      }
    },
    dispatchEvent(e) {
      (events.global[e.type] || []).slice().forEach((fn) => fn(e));
    },
    setTimeout: (fn) => 0,
    clearTimeout: () => {},
    setInterval: (fn) => 1,
    clearInterval: () => {},
    requestAnimationFrame: (fn) => { fn(); return 0; },
    cancelAnimationFrame: () => {},
    Date,
    Math,
    JSON,
    console,
  };
  window.window = window;

  const sandbox = {
    window,
    document,
    localStorage,
    console,
    CustomEvent: window.CustomEvent,
    setTimeout: window.setTimeout,
    clearTimeout: window.clearTimeout,
    setInterval: window.setInterval,
    clearInterval: window.clearInterval,
    requestAnimationFrame: window.requestAnimationFrame,
    cancelAnimationFrame: window.cancelAnimationFrame,
    Date,
    Math,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    Number,
    String,
    Object,
    Array,
    Set,
    Map,
    Promise,
  };
  sandbox.globalThis = sandbox;

  const context = vm.createContext(sandbox);

  // 1) scripts del <head> (i18n.js, store.js, gym.js) — son globales clásicos
  for (const src of headScripts) {
    const code = fs.readFileSync(path.join(DIST, src), 'utf-8');
    vm.runInContext(code, context, { filename: src });
  }
  // 2) scripts del cuerpo (nav burger + módulos de página)
  for (const code of inlineModules) {
    vm.runInContext(code, context, { filename: route + '.module.js' });
  }

  return { window, document, byId, bodyRoot, storage, events };
}

// ------------------------------------------------------------------ tests
function main() {
  console.log('== runtime: /exercises/ — filtros y búsqueda ==');
  const ex = loadPage('exercises');
  const exCount = JSON.parse(ex.storage._m['fittrack.lang'] === undefined ? 'null' : 'null', 1) || null;

  const list = ex.byId['ex-list'];
  const totalRows = list.children.length;
  ok(totalRows === 226, 'SSR lista: 226 filas (hay ' + totalRows + ')');

  const countEl = ex.byId['results-count'];
  const chestChip = ex.bodyRoot.querySelector('[data-group="chest"]');
  ok(!!chestChip, 'chip "chest" existe en el DOM');
  if (chestChip) {
    chestChip.click();
    const rows = list.children.length;
    ok(rows > 0 && rows < 226, 'click en chip chest -> ' + rows + ' filas (filtrad<226)');
    ok(countEl.textContent.includes(String(rows)), 'contador actualizado: "' + countEl.textContent + '"');
    // verificación: todas las filas filtradas son chest
    const allChest = list.children.every((li) =>
      (li.querySelector('[data-g]') || { textContent: '' }).textContent === 'Pecho' ||
      (li.querySelector('[data-g]') || { textContent: '' }).textContent.toLowerCase() === 'chest'
    );
    ok(allChest, 'todas las filas filtradas son pecho');
  }

  const barbellChip = ex.bodyRoot.querySelector('[data-equipment="barbell"]');
  ok(!!barbellChip, 'chip "barbell" existe');
  if (barbellChip && chestChip) {
    barbellChip.click();
    const rows = list.children.length;
    ok(rows > 0 && rows < 226, 'double filter chest+barbell -> ' + rows + ' filas');
    const allBoth = list.children.every((li) => {
      const g = (li.querySelector('[data-g]') || { textContent: '' }).textContent.toLowerCase();
      const eq = (li.querySelector('[data-e]') || { textContent: '' }).textContent.toLowerCase();
      return (g === 'chest' || g === 'pecho') && (eq === 'barbell');
    });
    ok(allBoth, 'todas las filas son chest+barbell');
  }

  const searchInput = ex.byId['ex-search'];
  if (searchInput) {
    searchInput.value = 'bench';
    searchInput.listeners.input[0]({ target: searchInput });
    const rows = list.children.length;
    ok(rows > 0 && rows < 226, 'búsqueda "bench" -> ' + rows + ' filas');
    ok(
      list.children.some((li) => (li.querySelector('.font-semibold') || { textContent: '' }).textContent.toLowerCase().includes('bench')),
      'hay fila con "bench" en el nombre'
    );
  }

  console.log('== runtime: /session/ — crear y guardar sesión (flujo wizard) ==');
  const ses = loadPage('session');
  const view = ses.byId['view'];
  const body = ses.bodyRoot;

  // helpers: buscar botones por texto en el DOM actual
  const btns = () => walkAll(body).filter((e) => e.tagName === 'BUTTON');
  const clickByText = (re) => {
    const b = btns().find((x) => re.test(x.textContent));
    if (!b) throw new Error('botón no encontrado: ' + re);
    b.click();
    return b;
  };

  ok(view.textContent.includes('¿Qué quieres hacer?') || ses.byId['page-title'].textContent.includes('¿Qué quieres hacer?'),
    'arranque: título "¿Qué quieres hacer?" renderizado');
  ok(btns().some((b) => b.textContent.includes('Recomiéndame un entreno')), 'arranque: card "Recomiéndame un entreno"');
  ok(btns().some((b) => b.textContent.includes('Añado mis datos yo')), 'arranque: card "Añado mis datos yo"');

  // wizard: entrenamiento
  clickByText(/Recomiéndame un entreno/);
  ok(walkAll(body).some((e) => e.textContent === 'Paso 1 de 6'), 'wizard: paso 1 de 6 (tipo)');
  clickByText(/Entrenamiento/);
  clickByText(/^Siguiente$/);
  ok(walkAll(body).some((e) => e.textContent === 'Paso 2 de 6'), 'wizard: paso 2 (objetivo)');
  clickByText(/Crear músculo/);
  clickByText(/^Siguiente$/);
  ok(walkAll(body).some((e) => e.textContent === 'Paso 3 de 6'), 'wizard: paso 3 (grupos)');
  clickByText(/Pecho/);
  clickByText(/Espalda/);
  clickByText(/^Siguiente$/);
  ok(walkAll(body).some((e) => e.textContent === 'Paso 4 de 6'), 'wizard: paso 4 (duración)');
  clickByText(/30 min/);
  clickByText(/^Siguiente$/);
  ok(walkAll(body).some((e) => e.textContent === 'Paso 5 de 6'), 'wizard: paso 5 (material)');
  clickByText(/Gym completo/);
  clickByText(/^Siguiente$/);
  ok(walkAll(body).some((e) => e.textContent === 'Paso 6 de 6'), 'wizard: paso 6 (revisión)');

  // empezar (review -> confirm)
  clickByText(/Empezar entrenamiento/);
  ok(btns().some((b) => b.textContent === 'Guardar'), 'confirmación: diálogo con botón Guardar');
  clickByText(/^Guardar$/);
  ok(body.classList.contains('workout-active'), 'sesión activa: body.workout-active');
  ok(!!ses.storage._m['fittrack.active.v1'], 'sesión activa: persistida en fittrack.active.v1');
  const cards = walkAll(view).filter((e) => e.tagName === 'ARTICLE');
  ok(cards.length >= 1, 'sesión activa: tarjetas de ejercicio (' + cards.length + ')');

  // "Hecha" en la primera serie
  const doneBtn = btns().find((b) => b.textContent.includes('pendiente'));
  ok(!!doneBtn, 'serie: botón "Hecha" (pendiente)');
  doneBtn.click();
  ok(btns().some((b) => b.textContent.includes('hecha')), 'serie: marcada "Hecha"');

  // añadir serie
  const setsBefore = walkAll(view).filter((e) => e.classList && e.classList.contains('ValueBox')).length;
  clickByText(/Añadir serie/);
  const setsAfter = walkAll(view).filter((e) => e.classList && e.classList.contains('ValueBox')).length;
  ok(setsAfter >= setsBefore + 2, 'añadir serie: más ValueBox (' + setsBefore + '->' + setsAfter + ')');

  // hoja de valor: abrir y elegir 12 reps
  const repsBox = btns().find((b) => b.textContent.replace(/\D/g, '') === '' && b.getAttribute('aria-label') === 'Reps') ||
    btns().find((b) => b.getAttribute('aria-label') === 'Reps');
  ok(!!repsBox, 'serie: ValueBox Reps');
  repsBox.click();
  ok(walkAll(body).some((e) => e.textContent === 'Elegir repeticiones'), 'hoja de valor: "Elegir repeticiones"');
  const chip12 = btns().find((b) => b.textContent === '12');
  chip12.click();
  ok(!walkAll(body).some((e) => e.textContent === 'Elegir repeticiones'), 'hoja de valor: cerrada tras elegir');

  // búsqueda (hoja)
  clickByText(/Añadir ejercicio/);
  const sheetSearch = walkAll(body).find((e) => e.tagName === 'INPUT' && e.getAttribute('type') === 'search');
  ok(!!sheetSearch, 'búsqueda: hoja con input');
  sheetSearch.value = 'push';
  (sheetSearch.listeners.input || [() => {}])[0]({ target: sheetSearch });
  const results = walkAll(ses.byId['sheet-root']).filter((e) => e.classList && e.classList.contains('ExRow'));
  ok(results.length >= 1, 'búsqueda: "push" -> ' + results.length + ' resultados');
  results[0].click();
  ok(btns().some((b) => b.textContent.includes('Añadir ejercicio')), 'búsqueda: hoja cerrada tras añadir');

  // guardar
  const notes = ses.byId['active-notes'];
  if (notes) notes.value = 'runtime test';
  const bw = ses.byId['active-bw'];
  if (bw) bw.value = '78';
  clickByText(/Guardar sesión/);
  const raw = ses.storage._m['fittrack.data.v1'];
  ok(!!raw, 'localStorage fittrack.data.v1 escrito tras guardar');
  let saved = null;
  try { saved = JSON.parse(raw); } catch (e) { /* noop */ }
  ok(saved && Array.isArray(saved.sessions) && saved.sessions.length === 1, '1 sesión guardada');
  if (saved && saved.sessions.length) {
    const s = saved.sessions[0];
    ok(/\d{4}-\d{2}-\d{2}$/.test(s.date), 'fecha de la sesión guardada: ' + s.date);
    ok(Array.isArray(s.exercises) && s.exercises.length >= 1, 'ejercicios guardados: ' + s.exercises.length);
    const totalSets = s.exercises.reduce((a, e) => a + e.sets.length, 0);
    ok(totalSets >= 1, 'sets guardados: ' + totalSets);
    ok(s.type === 'training', 'type=training');
  }
  ok(!ses.storage._m['fittrack.active.v1'], 'guardar: sesión activa borrada (volver a crema)');
  ok(!body.classList.contains('workout-active'), 'guardar: body sin workout-active');
  ok(walkAll(body).some((e) => e.textContent.includes('Sesión guardada')), 'resumen: "Sesión guardada"');

  console.log('== runtime: /history/ — ver y borrar ==');
  const hist = loadPage('history');
  hist.storage._m = ses.storage._m; // comparte el localStorage (misma clave)
  // La página ya hizo render() al cargar (vacío). Inyectamos una sesión y
  // despachamos ft-data-changed (lo que haría la página de sesión al guardar).
  const testSess = {
    id: 'rt-test-1',
    date: '2026-10-31',
    exercises: [
      { exercise_id: 'bench_press', sets: [{ reps: 10, weight_kg: 80 }, { reps: 10, weight_kg: 82.5 }] },
    ],
    notes: 'rt-test',
    duration_min: 45,
    body_weight_kg: 82,
    created_at: Date.now(),
  };
  hist.storage._m['fittrack.data.v1'] = JSON.stringify({ sessions: [testSess] });
  (hist.events.global['ft-data-changed'] || []).forEach((fn) => fn({ type: 'ft-data-changed' }));
  const histList = hist.byId['hist-list'];
  ok(histList.children.length === 1, 'historial muestra la sesión (' + histList.children.length + ')');
  if (histList.children.length === 1) {
    const delBtn = qselAll(histList, 'button').find((b) =>
      b.textContent.includes('Eliminar') || b.textContent.includes('delete') || (b.getAttribute('aria-label') || '').toLowerCase().includes('eliminar')
    );
    ok(!!delBtn, 'botón eliminar sesión visible');
    if (delBtn) {
      delBtn.click();
      const cards = qselAll(histList, 'article');
      ok(cards.length === 0, 'tras borrar: 0 tarjetas de sesión en el historial');
      ok(!hist.storage._m['fittrack.data.v1'] || JSON.parse(hist.storage._m['fittrack.data.v1']).sessions.length === 0,
        'localStorage actualizado tras borrar');
    }
  }

  console.log('== runtime: /dashboard/ — con datos ==');
  const dash = loadPage('dashboard');
  dash.storage._m = ses.storage._m; // (antes del borrado del test anterior? no: ya borrado)
  // re-inyecta una sesión para comprobar el render con datos
  dash.storage._m['fittrack.data.v1'] = JSON.stringify({
    sessions: [
      {
        id: 'x1',
        date: new Date().toISOString().slice(0, 10),
        exercises: [{ exercise_id: 'bench_press', sets: [{ reps: 10, weight_kg: 80 }, { reps: 10, weight_kg: 80 }] }],
        notes: '',
        duration_min: null,
        body_weight_kg: null,
        created_at: Date.now(),
      },
    ],
  });
  // re-render forzando ft-data-changed
  (dash.events.global['ft-data-changed'] || []).forEach((fn) => fn({ type: 'ft-data-changed' }));
  const statVolume = dash.byId['stat-volume'];
  ok(statVolume && statVolume.textContent === '1600 kg', 'volumen semanal: ' + (statVolume && statVolume.textContent) + ' (esperado 1600 kg)');
  const recent = dash.byId['recent'];
  ok(recent && recent.children.length === 1, 'recientes: 1 tarjeta (' + (recent ? recent.children.length : 0) + ')');

  console.log('== runtime: i18n — botones de idioma (bug original) ==');
  const nav = loadPage('exercises');
  const esBtn = nav.bodyRoot.querySelector('[data-lang="nl"]');
  ok(!!esBtn, 'botón NL presente en nav');
  if (esBtn) {
    esBtn.click();
    ok(nav.document.documentElement.getAttribute('lang') === 'nl', 'lang=cambiado a nl tras click');
    const navLink = nav.bodyRoot.querySelector('[data-i18n="nav_exercises"]');
    ok(navLink && navLink.textContent === 'Oefeningen', 'enlace nav traducido a NL: "' + (navLink && navLink.textContent) + '"');
  }

  console.log('');
  console.log(failures === 0 ? 'RESULTADO: ' + checks + '/' + checks + ' OK — 0 FALLOS' : 'RESULTADO: ' + failures + ' FALLOS de ' + checks);
  process.exit(failures === 0 ? 0 : 1);
}

main();
