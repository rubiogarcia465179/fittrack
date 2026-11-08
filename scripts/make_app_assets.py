#!/usr/bin/env python3
"""Genera icon.png (1024) y splash.png (2048x2732) de FitTrack.
Estilo: tile azul redondeado sobre fondo blanco + haltera blanca (glyph
dibujado, sin fuentes: rectángulos redondeados). Salida: app/assets/.
"""
from PIL import Image, ImageDraw
import os

ROOT = os.path.join(os.path.dirname(__file__), "..", "app", "assets")


def draw_dumbbell(d, cx, cy, s, color):
    """Haltera centrada en (cx, cy); s = tamaño de 'escena' (px)."""
    r = s  # escala base
    # barra central
    bar_x0, bar_x1 = cx - 0.42 * r, cx + 0.42 * r
    bar_y0, bar_y1 = cy - 0.05 * r, cy + 0.05 * r
    d.rounded_rectangle([bar_x0, bar_y0, bar_x1, bar_y1], radius=0.05 * r, fill=color)
    for side in (-1, 1):
        h = 0.56 * r
        inner_x = cx + side * 0.315 * r
        d.rounded_rectangle(
            [inner_x - 0.0625 * r, cy - h / 2, inner_x + 0.0625 * r, cy + h / 2],
            radius=0.06 * r, fill=color)
        outer_x = cx + side * 0.42 * r
        oh = 0.40 * r
        d.rounded_rectangle(
            [outer_x - 0.045 * r, cy - oh / 2, outer_x + 0.045 * r, cy + oh / 2],
            radius=0.045 * r, fill=color)


def v_gradient(size, top, bottom):
    w, h = size
    strip = Image.new("RGB", (1, h))
    d = ImageDraw.Draw(strip)
    for y in range(h):
        t = y / (h - 1)
        row = tuple(int(a + (b - a) * t) for a, b in zip(top, bottom))
        d.line([(0, y), (0, y)], fill=row)
    return strip.resize((w, h))


def make_icon(path):
    S = 1024
    img = Image.new("RGB", (S, S), "#ffffff")
    # tile azul (degradado sutil vertical)
    TS = 640
    tile = v_gradient((TS, TS), (10, 132, 255), (0, 85, 212))
    off = (S - TS) // 2
    mask = Image.new("L", (TS, TS), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, TS, TS], radius=148, fill=255)
    img.paste(tile, (off, off), mask)
    d = ImageDraw.Draw(img)
    draw_dumbbell(d, S // 2, S // 2, 560, "#ffffff")
    img.save(path, "PNG")


def make_splash(path):
    W, H = 2048, 2732
    img = Image.new("RGB", (W, H), "#ffffff")
    S = 760
    tile = v_gradient((S, S), (10, 132, 255), (0, 85, 212))
    x0, y0 = (W - S) // 2, int(H * 0.42) - S // 2
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, S, S], radius=172, fill=255)
    img.paste(tile, (x0, y0), mask)
    d = ImageDraw.Draw(img)
    draw_dumbbell(d, W // 2, y0 + S // 2, 430, "#ffffff")
    img.save(path, "PNG")


if __name__ == "__main__":
    os.makedirs(ROOT, exist_ok=True)
    make_icon(os.path.join(ROOT, "icon.png"))
    make_splash(os.path.join(ROOT, "splash.png"))
    print("OK icon.png splash.png en", os.path.abspath(ROOT))
