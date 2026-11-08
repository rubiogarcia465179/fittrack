#!/usr/bin/env python3
"""Fetch de ejercicios desde la API pública de wger (cuando HAYA red).

⛔ En el sandbox actual: el proxy devuelve 403 para wger.de (medido el
2026-10-31). Este script está listo para ejecutarse en una máquina con
internet o con el allowlist ampliado.

Uso:
    python3 scripts/fetch_exercises.py --out data/exercises/all.json

Reglas de cortesía: User-Agent propio, ≤ 2 req/s, backoff exponencial ante
429/503, 8 reintentos máximos.
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request

API = "https://wger.de/api/v2/exercise/"
USER_AGENT = "FitTrack-DataBot/1.0 (research; fittrack@local; contact: local)"
PAGE_SIZE = 20
MAX_RETRIES = 8
MIN_INTERVAL = 0.6  # ≈ 2 req/s


def fetch(url: str, params: str) -> dict:
    req = urllib.request.Request(url + params, headers={"User-Agent": USER_AGENT})
    delay = 2.0
    for attempt in range(MAX_RETRIES):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and attempt < MAX_RETRIES - 1:
                time.sleep(delay)
                delay = min(delay * 2, 60)
                continue
            raise
        except (urllib.error.URLError, TimeoutError):
            if attempt < MAX_RETRIES - 1:
                time.sleep(delay)
                delay = min(delay * 2, 60)
                continue
            raise
    raise RuntimeError("reintentos agotados")


def slugify(name: str) -> str:
    s = name.lower().replace(" ", "_").replace("/", "_")
    return "".join(c for c in s if c.isalnum() or c == "_")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "data", "exercises", "all.json"))
    args = ap.parse_args()

    exercises = []
    page = 1
    while True:
        data = fetch(API, f"?page={page}&limit={PAGE_SIZE}")
        results = data.get("results", [])
        if not results:
            break
        for r in results:
            common = r.get("common_name", "")
            exercise = {
                "id": slugify(common),
                "name_en": common,
                "name_nl": common,  # wger no tiene nombre local NL; se traduce después
                "muscle_group": (r.get("primary_muscle") or [None])[0] or "full_body",
                "secondary_muscles": r.get("secondary_muscle", []),
                "equipment": (r.get("equipment") or [None])[0] or "other",
                "level": r.get("level") or "intermediate",
                "aliases": [r["name"].lower()] if r.get("name") != common else [],
                "instructions": [
                    s.strip() for s in (r.get("instructions") or "").split("\n") if s.strip()
                ],
                "image": f"/images/exercises/{slugify(common)}.png",
                "source": "real",
                "source_id": r.get("id"),
                "source_url": r.get("url"),
            }
            exercises.append(exercise)
        if not data.get("next"):
            break
        page += 1
        time.sleep(MIN_INTERVAL)

    data = {
        "dataset": "fittrack.exercises",
        "version": 2,
        "source": "real",
        "source_note": "API wger (CC-BY-SA 3.0): wger.de — créditos: https://wger.de/about",
        "generated_at": time.strftime("%Y-%m-%d"),
        "count": len(exercises),
        "exercises": exercises,
    }
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"OK ejercicios={len(exercises)} (source=real) → {args.out}")
    print("Siguiente paso: scripts/sync_data.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
