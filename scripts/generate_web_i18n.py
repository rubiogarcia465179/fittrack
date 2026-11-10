#!/usr/bin/env python3
"""Regenera web/public/js/i18n.js A PARTIR de i18n/*.json (234 claves, fuente
única que ya está en paridad con app/src/i18n-data). Así la web usa el mismo
conjunto de claves que la app, sin desincronizarse.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "i18n")
OUT = os.path.join(ROOT, "web", "public", "js", "i18n.js")
LANGS = ["nl", "es", "en", "fr"]

I18N_JS_LOGIC = r"""
  const DEFAULT = 'es';
  let current = DEFAULT;

  function readStored() {
    try {
      const v = localStorage.getItem('fittrack.lang');
      return BUNDLES[v] ? v : DEFAULT;
    } catch (e) { return DEFAULT; }
  }

  function t(key, vars) {
    let s = (BUNDLES[current] && BUNDLES[current][key]) || (BUNDLES[DEFAULT][key] || key);
    if (vars) for (const k in vars) {
      const val = String(vars[k]);
      s = s.split('{{' + k + '}}').join(val).split('{' + k + '}').join(val);
    }
    return s;
  }

  function apply() {
    current = readStored();
    document.documentElement.setAttribute('lang', current);
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    document.querySelectorAll('.lang-btn').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-lang') === current);
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === current);
    });
    // tema activo: si hay una sesión en curso, la web entera pasa a navy
    // (paridad con la app: ThemeProvider).
    if (window.FTSession) window.FTSession.applyActiveTheme();
  }

  function setLang(lang) {
    if (!BUNDLES[lang]) return;
    try { localStorage.setItem('fittrack.lang', lang); } catch (e) {}
    apply();
    document.querySelectorAll('.lang-btn').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
    window.dispatchEvent(new CustomEvent('ft-lang-change', { detail: { lang } }));
  }

  function bind() {
    document.querySelectorAll('.lang-btn').forEach((b) => {
      if (b.__ftBound) return;
      b.__ftBound = true;
      b.addEventListener('click', () => setLang(b.getAttribute('data-lang')));
    });
    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }

  return { t, setLang, getLang: () => current, DEFAULT, BUNDLES, apply };
"""

def main():
    bundles = {}
    for lang in LANGS:
        with open(os.path.join(SRC, f"{lang}.json"), encoding="utf-8") as f:
            bundles[lang] = json.load(f)
    base = set(bundles["en"].keys())
    for lang in LANGS:
        assert set(bundles[lang].keys()) == base, f"paridad fallida en {lang}"
    for lang in LANGS:
        for k, v in bundles[lang].items():
            assert v and v.strip(), f"{lang}:{k} vacío"

    body = (
        "/* FitTrack i18n — 4 bundles (nl/es/en/fr) embebidos, generados desde\n"
        " * i18n/*.json (fuente única). Cambio de idioma sin red. */\n"
        "window.FT_I18N = (function () {\n"
        "  const BUNDLES = "
        + json.dumps(bundles, ensure_ascii=False, indent=2)
        + ";\n"
        + I18N_JS_LOGIC
        + "})();\n"
    )
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(body)
    print(f"wrote {OUT} ({len(base)} claves)")

if __name__ == "__main__":
    main()
