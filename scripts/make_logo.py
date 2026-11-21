#!/usr/bin/env python3
"""Logo de FitTrack (R-162): un hombre fuerte levantando peso, reutilizando un
dibujo de la app (Everkinetic, CC BY-SA 3.0, ya acreditado en la app y en la
web). Mismo estilo que el logo anterior: fondo negro, disco blanco y, dentro,
la figura en NEGRO con las líneas interiores en BLANCO (el contorno exterior
queda negro para que la barra y los brazos no se pierdan sobre el blanco).

Salida: app/assets/{icon,adaptive-icon,splash}.png y app/public/{favicon-32,
favicon,icon-512,apple-touch-icon}.png.  Uso: python3 scripts/make_logo.py
[dibujo] (por defecto biceps_curls_with_dumbbell-2).
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1] if len(sys.argv) > 1 else "back_squat-1"
# Recorte (fracción del alto de la figura): cabeza → cintura, el gesto de fuerza.
CROP = float(sys.argv[2]) if len(sys.argv) > 2 else 0.6
OUT = sys.argv[3] if len(sys.argv) > 3 else None


def figure(size):
    """Figura RGBA (negra con líneas interiores blancas), recortada y cuadrada."""
    im = Image.open(os.path.join(ROOT, "app/assets/photos", SRC + ".png")).convert("RGBA")
    a = np.array(im.getchannel("A"))
    y0, y1 = np.where(a.max(1) > 40)[0][[0, -1]]
    x0, x1 = np.where(a.max(0) > 40)[0][[0, -1]]
    a = a[y0 : y0 + int((y1 - y0) * CROP), x0 : x1 + 1]
    line = a > 90
    # Fuera = lo que se alcanza desde el borde sin cruzar una línea (cerrada un poco).
    closed = ndimage.binary_closing(np.pad(line, 8), iterations=7)[8:-8, 8:-8]
    free = ~closed
    lab, _ = ndimage.label(free)
    edge = set(np.unique(np.concatenate([lab[0], lab[:, 0], lab[:, -1]]))) - {0}
    outside = np.isin(lab, list(edge))
    # El corte inferior abre la figura: la fila de abajo no cuenta como "fuera".
    body = ~outside
    # Líneas que tocan el exterior → contorno negro; las demás → blancas.
    near_out = ndimage.binary_dilation(outside, iterations=4)
    white = line & ~near_out & body
    h, w = a.shape
    rgba = np.zeros((h, w, 4), np.uint8)
    rgba[body] = (0, 0, 0, 255)
    rgba[white] = (255, 255, 255, 255)
    fig = Image.fromarray(rgba, "RGBA")
    # Ajustada al ANCHO (la barra de lado a lado); apoyada abajo.
    nh = int(size * h / w)
    return fig.resize((size, nh), Image.LANCZOS)


def badge(S, bg=True, disc_frac=0.66):
    """Icono cuadrado S×S: negro + disco blanco + figura recortada por el disco."""
    img = Image.new("RGBA", (S, S), (0, 0, 0, 255 if bg else 0))
    if bg:  # degradado sutil como el logo anterior
        g = Image.linear_gradient("L").resize((S, S)).point(lambda v: 4 + v * 14 // 255)
        img = Image.merge("RGBA", (g, g, g, Image.new("L", (S, S), 255)))
    D = int(S * disc_frac)
    off = (S - D) // 2
    disc = Image.new("L", (D, D), 0)
    ImageDraw.Draw(disc).ellipse([0, 0, D - 1, D - 1], fill=255)
    white = Image.new("RGBA", (D, D), (248, 248, 250, 255))
    layer = Image.new("RGBA", (D, D), (0, 0, 0, 0))
    layer.paste(white, (0, 0), disc)
    f = figure(int(D * 0.94))
    fl = Image.new("RGBA", (D, D), (0, 0, 0, 0))
    fl.paste(f, ((D - f.width) // 2, D + int(D * 0.02) - f.height), f)
    layer.alpha_composite(fl)
    # Todo dentro del disco (la cintura queda cortada por el círculo).
    mask = Image.new("L", (D, D), 0)
    mask.paste(disc.filter(ImageFilter.GaussianBlur(0.6)), (0, 0))
    layer.putalpha(Image.fromarray(np.minimum(np.array(layer.getchannel("A")), np.array(mask))))
    img.alpha_composite(layer, (off, off))
    return img


def main():
    if OUT:
        badge(1024).convert("RGB").save(OUT)
        return
    A = os.path.join(ROOT, "app/assets")
    P = os.path.join(ROOT, "app/public")
    icon = badge(1024)
    icon.convert("RGB").save(os.path.join(A, "icon.png"))
    # Android: primer plano transparente dentro de la zona segura (fondo #000 en app.json).
    fg = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    fg.alpha_composite(badge(500, bg=False, disc_frac=1.0), (262, 262))
    fg.save(os.path.join(A, "adaptive-icon.png"))
    splash = Image.new("RGB", (2048, 2732), (0, 0, 0))
    splash.paste(badge(520, bg=False, disc_frac=1.0), (764, 1106), badge(520, bg=False, disc_frac=1.0))
    splash.save(os.path.join(A, "splash.png"))
    # Tamaños pequeños (cabecera web, favicon): el disco llena el cuadro, si no
    # la figura se queda en una mancha de 10 px.
    mark = badge(1024, disc_frac=0.94)
    mark.convert("RGB").save(os.path.join(A, "logo-mark.png"))
    for name, s, mode in [("favicon-32.png", 32, "RGBA"), ("favicon.png", 192, "RGBA"), ("icon-512.png", 512, "RGB"), ("apple-touch-icon.png", 180, "RGB")]:
        im = (mark if s <= 192 else icon).resize((s, s), Image.LANCZOS)
        im.convert(mode).save(os.path.join(P, name))
    print("OK logo desde", SRC)


if __name__ == "__main__":
    main()
