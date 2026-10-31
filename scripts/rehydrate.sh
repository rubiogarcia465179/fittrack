#!/usr/bin/env bash
# Pipeline FitTrack: fetch → clasificar → sync → build → test
#
# fetch: si hay red y wger responde, regenera data/exercises/all.json
#        (source: real). Si no, mantiene la base seed existente.
# clasificar: normaliza/valida el JSON (scripts/classify_exercises.py — por
#             ahora validado en tests/run.js).
# sync: scripts/sync_data.py (base → app/ y web/).
# build: web (Astro) + app (tsc + bundle Metro).
# test: node tests/run.js.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> [1/4] fetch (si hay red)"
if python3 - <<'EOF'
import sys, urllib.request
try:
    urllib.request.urlopen("https://wger.de", timeout=6)
    sys.exit(0)
except Exception:
    sys.exit(1)
EOF
then
    python3 scripts/fetch_exercises.py --out data/exercises/all.json \
      || echo "⚠ fetch falló: se mantiene la base actual"
else
    echo "⚠ sin red hacia wger: se mantiene la base seed"
fi

echo "==> [2/4] sync"
python3 scripts/sync_data.py

echo "==> [3/4] build (web)"
(cd web && npm run build)

echo "==> [3/4] build (app: tsc + bundle metro)"
(cd app && npx tsc --noEmit && node bundle-check.js)

echo "==> [4/4] tests"
node tests/run.js

echo "PIPELINE OK"
