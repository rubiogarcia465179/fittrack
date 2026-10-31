#!/usr/bin/env python3
"""Sincroniza la base de ejercicios a app y web.

- Copia `data/exercises/all.json` → `app/src/data/exercises.json` y
  `web/src/data/exercises.json`.
- Copia `data/images/` → `web/public/images/` (estáticos para la web).
- La app usa las imágenes desde `data/images` vía path relativo (bundle
  Metro) cuando se sirva el contenido; para el MVP la web consume
  `web/public/images`.
"""
import json
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DATA = os.path.join(ROOT, "data", "exercises", "all.json")
SRC_IMG = os.path.join(ROOT, "data", "images")
I18N_SRC = os.path.join(ROOT, "i18n")
WEB_DATA = os.path.join(ROOT, "web", "src", "data", "exercises.json")
WEB_IMG = os.path.join(ROOT, "web", "public", "images")
WEB_I18N = os.path.join(ROOT, "web", "src", "i18n")
APP_DATA = os.path.join(ROOT, "app", "src", "data", "exercises.json")
APP_I18N = os.path.join(ROOT, "app", "src", "i18n-data")


def main() -> int:
    with open(SRC_DATA, encoding="utf-8") as f:
        data = json.load(f)
    count = data.get("count", len(data.get("exercises", [])))
    source = data.get("source", "?")

    for dst in (WEB_DATA, APP_DATA):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(dst, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print("sync", dst, f"({count} ejercicios, source={source})")

    # Imágenes: la web las sirve desde public/
    if os.path.isdir(WEB_IMG):
        shutil.rmtree(WEB_IMG)
    shutil.copytree(SRC_IMG, WEB_IMG)
    n = len(os.listdir(WEB_IMG))
    print("sync", WEB_IMG, f"({n} imágenes)")

    # i18n: la web importa desde src/i18n; la app desde src/i18n-data
    for dst in (WEB_I18N, APP_I18N):
        os.makedirs(dst, exist_ok=True)
        for f in os.listdir(I18N_SRC):
            if f.endswith(".json"):
                shutil.copy2(os.path.join(I18N_SRC, f), os.path.join(dst, f))
        print("sync", dst, f"({len(os.listdir(dst))} bundles)")

    return 0


if __name__ == "__main__":
    sys.exit(main())
