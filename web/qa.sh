#!/usr/bin/env bash
# Capturas de la web pública (planner) a 3 anchos → docs/screenshots/web/.
set -e
cd "$(dirname "$0")/.."
OUT=/tmp/ft-web-dist
rm -rf "$OUT" && (cd app && EXPO_PUBLIC_WEB_MODE=planner npx expo export --platform web --output-dir "$OUT" >/dev/null)
mkdir -p docs/screenshots/web
for s in 393x852 834x1112 1440x900; do
  node.exe app/qa/shots/shoot.js '\\wsl.localhost\Ubuntu-24.04\tmp\ft-web-dist' docs/screenshots/web --size "$s" --scenario app/qa/shots/scenario-web.js | tail -1
done
