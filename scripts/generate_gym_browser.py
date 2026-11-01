#!/usr/bin/env python3
"""Genera web/public/js/gym.js: la lógica pura de gym (src/lib/gym.js)
empaquetada como un script clásico de navegador que expone window.FTGym.

Motivo: las páginas de Astro usan estos helpers desde un <script> clásico
con define:vars. Un script clásico NO puede usar `import`, y el hoisting de
Astro no empaquetaba el módulo. Expresar los helpers como global (igual que
i18n.js -> FT_I18N y store.js -> FTStore) elimina la ambigüedad de imports.

Se regenera con:  python3 scripts/generate_gym_browser.py
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "web", "src", "lib", "gym.js")
OUT = os.path.join(ROOT, "web", "public", "js", "gym.js")


def main() -> int:
    src = open(SRC, encoding="utf-8").read()

    # 1) Recoger los nombres exportados (const X / function X).
    names = []
    for m in re.finditer(r"^export\s+(?:const|function)\s+([A-Za-z0-9_]+)", src, re.M):
        names.append(m.group(1))
    if not names:
        raise SystemExit("sin exports detectados en gym.js")

    # 2) Quitar la palabra `export` para que sea un cuerpo de función válido.
    body = re.sub(r"^export\s+", "", src, flags=re.M)

    # 3) Empaquetar como global.
    banner = (
        "/* FitTrack — lógica pura de gym (build de navegador).\n"
        " * Generado AUTOMÁTICAMENTE desde web/src/lib/gym.js por\n"
        " * scripts/generate_gym_browser.py — NO editar a mano.\n"
        " * Expone window.FTGym con todas las funciones de gym.js.\n"
        " */\n"
    )
    out = banner
    out += "window.FTGym = (function () {\n"
    out += body.rstrip() + "\n\n"
    out += "  return {\n"
    for n in names:
        out += f"    {n},"
    out += "\n  };\n"
    out += "})();\n"

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(out)
    print(f"wrote {OUT} ({len(names)} helpers: {', '.join(names)})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
