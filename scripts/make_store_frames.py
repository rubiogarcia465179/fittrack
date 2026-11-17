#!/usr/bin/env python3
"""R-142 — capturas de tienda con titular (4 idiomas) y gráfico destacado de Google.
Entrada: docs/store/raw/store-<440|360>-<idioma>-<1..5>.png (scenario-store.js).
Salida: docs/store/apple/<idioma>-<n>.png (1320×2868), docs/store/google/<idioma>-<n>.png
(1080×2160) y docs/store/google/feature-graphic-<idioma>.png (1024×500)."""
import os
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
CAP = {
 1: {'en': "Today's workout, decided.", 'es': 'El entreno de hoy, decidido.', 'nl': 'Je training van vandaag, al beslist.', 'fr': 'Ta séance du jour, déjà décidée.'},
 2: {'en': 'Every set in two taps.', 'es': 'Cada serie en dos toques.', 'nl': 'Elke set in twee tikken.', 'fr': 'Chaque série en deux touches.'},
 3: {'en': "See exactly how it's done.", 'es': 'Mira exactamente cómo se hace.', 'nl': 'Zie precies hoe het moet.', 'fr': 'Vois exactement comment faire.'},
 4: {'en': 'Your training diary.', 'es': 'Tu diario de entreno.', 'nl': 'Je trainingsdagboek.', 'fr': "Ton carnet d'entraînement."},
 5: {'en': 'No account. No cloud. Yours.', 'es': 'Sin cuenta. Sin nube. Tuyo.', 'nl': 'Geen account. Geen cloud. Van jou.', 'fr': 'Sans compte. Sans cloud. À toi.'},
}
TAG = {'en': 'Your gym workout, simple.', 'es': 'Tu entreno de gym, simple.', 'nl': 'Je gymtraining, simpel.', 'fr': 'Ta séance de muscu, simple.'}
SUB = {'en': 'No account. No cloud.', 'es': 'Sin cuenta. Sin nube.', 'nl': 'Geen account. Geen cloud.', 'fr': 'Sans compte. Sans cloud.'}
FONT = 'app/assets/fonts/Montserrat.ttf'
LANGS = ['en', 'es', 'nl', 'fr']

def font(size, w):
    f = ImageFont.truetype(FONT, size)
    try: f.set_variation_by_axes([w])
    except Exception: pass
    return f

def wrap(d, text, f, maxw):
    lines, cur = [], ''
    for w in text.split():
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    return lines + [cur]

for w, dst in [(440, 'docs/store/apple'), (360, 'docs/store/google')]:
    os.makedirs(dst, exist_ok=True)
    for l in LANGS:
        for k in range(1, 6):
            raw = Image.open(f'docs/store/raw/store-{w}-{l}-{k}.png').convert('RGB'); W, H = raw.size
            can = Image.new('RGB', (W, H), (0, 0, 0)); d = ImageDraw.Draw(can)
            f = font(int(W * 0.068), 800); y = int(H * 0.055)
            for ln in wrap(d, CAP[k][l], f, W * 0.84):
                d.text((W / 2, y), ln, font=f, fill=(245, 245, 247), anchor='ma'); y += int(W * 0.085)
            top = y + int(H * 0.025); sw = int(W * 0.80); full = int(raw.height * sw / raw.width); sh = min(full, H - top)
            shot = raw.resize((sw, full), Image.LANCZOS).crop((0, 0, sw, sh))
            r = int(sw * 0.07); m = Image.new('L', (sw, sh + r), 0)
            ImageDraw.Draw(m).rounded_rectangle((0, 0, sw - 1, sh + r - 1), radius=r, fill=255); m = m.crop((0, 0, sw, sh))
            x = (W - sw) // 2
            d.rounded_rectangle((x - 3, top - 3, x + sw + 2, H + r), radius=r + 3, outline=(47, 51, 54), width=3)
            can.paste(shot, (x, top), m); can.save(f'{dst}/{l}-{k}.png', optimize=True)

icon = Image.open('app/assets/icon.png').resize((260, 260), Image.LANCZOS)
m = Image.new('L', (1040, 1040), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, 1039, 1039), radius=233, fill=255); m = m.resize((260, 260), Image.LANCZOS)
for l in LANGS:
    g = Image.new('RGB', (1024, 500), (0, 0, 0)); d = ImageDraw.Draw(g); g.paste(icon, (90, 120), m)
    d.text((400, 150), 'FitTrack', font=font(84, 800), fill=(245, 245, 247))
    d.text((402, 260), TAG[l], font=font(38, 600), fill=(200, 203, 207))
    d.text((402, 315), SUB[l], font=font(30, 500), fill=(120, 124, 129))
    g.save(f'docs/store/google/feature-graphic-{l}.png', optimize=True)
print('OK capturas con titular y gráficos destacados → docs/store/apple, docs/store/google')
