#!/usr/bin/env python3
"""Sincroniza la base de ejercicios a la app (la web ES la app: R-131).

- Copia `data/exercises/all.json` → `app/src/data/exercises.json`.
- Copia `data/images/` → `app/assets/exercises/` (assets de Metro: la app los
  embebe vía `require()`, mapeados en `app/src/images.ts` por
  scripts/make_image_map.py).
- Copia `i18n/*.json` → `app/src/i18n-data/`.
"""
import json
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DATA = os.path.join(ROOT, "data", "exercises", "all.json")
SRC_IMG = os.path.join(ROOT, "data", "images")
I18N_SRC = os.path.join(ROOT, "i18n")
APP_DATA = os.path.join(ROOT, "app", "src", "data", "exercises.json")
APP_I18N = os.path.join(ROOT, "app", "src", "i18n-data")
APP_IMG = os.path.join(ROOT, "app", "assets", "exercises")


def main() -> int:
    with open(SRC_DATA, encoding="utf-8") as f:
        data = json.load(f)
    count = data.get("count", len(data.get("exercises", [])))
    source = data.get("source", "?")

    for dst in (APP_DATA,):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(dst, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print("sync", dst, f"({count} ejercicios, source={source})")

    # Imágenes de la app: assets de Metro (requieren id estable de require()).
    if os.path.isdir(APP_IMG):
        shutil.rmtree(APP_IMG)
    # photos/ (Fase 13) va aparte: scripts/make_photo_map.js → app/assets/photos/
    shutil.copytree(SRC_IMG, APP_IMG, ignore=shutil.ignore_patterns('photos'))
    print("sync", APP_IMG, f"({len(os.listdir(APP_IMG))} imágenes)")

    # i18n: la app importa desde src/i18n-data
    for dst in (APP_I18N,):
        os.makedirs(dst, exist_ok=True)
        for f in os.listdir(I18N_SRC):
            if f.endswith(".json"):
                shutil.copy2(os.path.join(I18N_SRC, f), os.path.join(dst, f))
        print("sync", dst, f"({len(os.listdir(dst))} bundles)")

    return 0


if __name__ == "__main__":
    sys.exit(main())
