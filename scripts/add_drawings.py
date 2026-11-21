#!/usr/bin/env python3
"""
R-137 — añade dibujos propios / generados con IA desde
data/images/photos/inbox/<id>-<n>.png a data/images/photos/ con el mismo
tratamiento que los de Everkinetic: fondo transparente (alfa = oscuridad),
recorte, PNG gris+alfa. En credits.json quedan como "generado con IA" para
que la app lo diga (regla de oro: nada inventado se presenta como real).
Después actualiza solo: mapa de la app, docs/fotos/STATUS.md (lista de
pendientes) y los prompts que quedan (PROMPTS-DIBUJOS.md / .json).
"""
import json, os, re, shutil, subprocess, sys
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INBOX = os.path.join(ROOT, 'data/images/photos/inbox')
DST = os.path.join(ROOT, 'data/images/photos')
CRED = os.path.join(DST, 'credits.json')
ids = {e['id'] for e in json.load(open(os.path.join(ROOT, 'data/exercises/all.json')))['exercises']}
credits = json.load(open(CRED)) if os.path.exists(CRED) else {}
def clean(src, out):
    im = Image.open(src).convert('RGBA')
    bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im)
    a = bg.convert('L').point(lambda v: 255 - v)
    bbox = a.point(lambda v: 255 if v > 24 else 0).getbbox()
    if bbox:
        pad = 12; w, h = im.size
        a = a.crop((max(0, bbox[0]-pad), max(0, bbox[1]-pad), min(w, bbox[2]+pad), min(h, bbox[3]+pad)))
    a.thumbnail((600, 600))
    a = a.point(lambda v: 0 if v < 16 else min(255, (v // 16) * 17))
    Image.merge('LA', (Image.new('L', a.size, 0), a)).save(out, optimize=True)
n = 0
for f in sorted(os.listdir(INBOX)) if os.path.isdir(INBOX) else []:
    m = re.match(r'^(.+)-([123])\.(png|jpe?g|webp)$', f, re.I)
    if not m or m.group(1) not in ids:
        if not f.startswith('.'): print('salto', f, '(nombre: <id>-1.png / -2.png / -3.png)')
        continue
    out = f'{m.group(1)}-{m.group(2)}.png'
    clean(os.path.join(INBOX, f), os.path.join(DST, out))
    # El original generado se guarda aparte (fuera de git) para poder rehacerlo.
    os.makedirs(os.path.join(INBOX, 'originales'), exist_ok=True)
    shutil.move(os.path.join(INBOX, f), os.path.join(INBOX, 'originales', f))
    credits[out] = {'file': out, 'author': 'IA (usuario)', 'license': 'propia', 'kind': 'drawing',
                    'note': 'dibujo generado con IA (docs/fotos/PROMPTS-DIBUJOS.md) con dibujos de Everkinetic (CC BY-SA 3.0) como ejemplo de estilo; fondo transparente y recortado; se comparte bajo CC BY-SA 3.0'}
    n += 1
json.dump(dict(sorted(credits.items())), open(CRED, 'w'), indent=1, ensure_ascii=False)
print(f'OK {n} dibujos añadidos')
# Todo al día de una vez: mapa de la app, créditos, estado y prompts pendientes.
for cmd in (['node', 'scripts/make_photo_map.js'], ['node', 'scripts/photo_status.js'], ['node', 'scripts/make_drawing_prompts.js']):
    subprocess.run(cmd, cwd=ROOT, check=True)
