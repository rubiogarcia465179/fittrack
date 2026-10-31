#!/usr/bin/env python3
"""Genera `src/images.ts` con el mapa id → require('assets/exercises/<id>.png').

Metro no sirve archivos por ruta: cada PNG debe importarse como asset.
El mapa se regenera con cada sync (61 imágenes en `data/images/`).
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "data", "images")
OUT = os.path.join(ROOT, "app", "src", "images.ts")


def slug_ok(name: str) -> bool:
    return bool(re.fullmatch(r"[a-z0-9_]+\.png", name))


def main() -> int:
    names = sorted(f for f in os.listdir(IMG) if slug_ok(f))
    if not names:
        print("ERROR: no hay PNGs en", IMG)
        return 1
    lines = [
        "// Generado por scripts/make_image_map.py — NO editar a mano.",
        "// id → asset de Metro de data/images/<id>.png (61 ejercicios).",
        "const IMAGES: Record<string, number> = {",
    ]
    for f in names:
        aid = f[:-4]
        lines.append(f"  {aid!r}: require('../assets/exercises/{f}'),")
    lines.append("};")
    lines.append("")
    lines.append("export function exerciseImage(id: string): number {")
    lines.append("  const asset = IMAGES[id];")
    lines.append("  if (asset === undefined) throw new Error('imagen inexistente: ' + id);")
    lines.append("  return asset;")
    lines.append("}")
    lines.append("")
    lines.append("export const EXERCISE_IMAGE_IDS = Object.keys(IMAGES) as string[];")
    lines.append("")
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))
    print(f"sync {OUT} ({len(names)} imágenes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
