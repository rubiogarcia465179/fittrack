#!/usr/bin/env python3
"""
R-140 — genera con la API de imágenes de OpenAI los dibujos pendientes de
docs/fotos/prompts-dibujos.json (estilo Everkinetic, con imágenes de ejemplo
adjuntas) y los deja en data/images/photos/inbox/<id>-<n>.png.

Sin dependencias: Python estándar + curl. Necesita OPENAI_API_KEY.

  OPENAI_API_KEY=... python3 scripts/generate_drawings_openai.py --limit 4
  OPENAI_API_KEY=... python3 scripts/generate_drawings_openai.py --ids back_squat,plank
  OPENAI_API_KEY=... python3 scripts/generate_drawings_openai.py            # todos

Opciones: --model (por defecto $OPENAI_IMAGE_MODEL o gpt-image-2; comprueba el
nombre del modelo actual en la documentación de OpenAI), --quality (high),
--dry-run (muestra lo que haría). Salta lo que ya existe; reintenta 429/5xx.
Después: revisar cada imagen a mano y `python3 scripts/add_drawings.py`.
"""
import argparse, base64, json, os, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOBS = os.path.join(ROOT, 'docs/fotos/prompts-dibujos.json')
DONE_DIR = os.path.join(ROOT, 'data/images/photos')


def already(item):
    base = f"{item['id']}-{item['frame']}"
    return os.path.exists(os.path.join(ROOT, item['out'])) or os.path.exists(os.path.join(DONE_DIR, base + '.png'))


def call(item, model, quality, key):
    cmd = ['curl', '-sS', '-X', 'POST', 'https://api.openai.com/v1/images/edits',
           '-H', f'Authorization: Bearer {key}',
           '-F', f'model={model}', '-F', 'size=1024x1024', '-F', f'quality={quality}', '-F', 'n=1',
           '--form-string', f"prompt={item['prompt']}"]
    for ref in item['references']:
        cmd += ['-F', f'image[]=@{os.path.join(ROOT, ref)};type=image/png']
    out = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    try:
        return json.loads(out.stdout)
    except json.JSONDecodeError:
        return {'error': {'message': (out.stdout or out.stderr)[:300]}}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--ids', default='')
    ap.add_argument('--model', default=os.environ.get('OPENAI_IMAGE_MODEL', 'gpt-image-2'))
    ap.add_argument('--quality', default='high')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    key = os.environ.get('OPENAI_API_KEY', '')
    if not key and not a.dry_run:
        sys.exit('Falta OPENAI_API_KEY')
    jobs = json.load(open(JOBS))['items']
    want = set(filter(None, a.ids.split(',')))
    # imagen 1 antes que la 2 (la 2 usa la 1 como referencia)
    jobs = [j for j in jobs if (not want or j['id'] in want) and not already(j)]
    jobs.sort(key=lambda j: (j['id'], j['frame']))
    done_ids, made = set(), 0
    for j in jobs:
        if a.limit and len(done_ids | {j['id']}) > a.limit:
            break
        missing = [r for r in j['references'] if not os.path.exists(os.path.join(ROOT, r))]
        if missing:
            print('salto', j['id'], j['frame'], '— falta referencia', missing)
            continue
        print(('[dry] ' if a.dry_run else '') + f"{j['id']} {j['frame']} → {j['out']}", flush=True)
        if a.dry_run:
            done_ids.add(j['id']); continue
        for attempt in range(6):
            r = call(j, a.model, a.quality, key)
            if 'data' in r:
                os.makedirs(os.path.dirname(os.path.join(ROOT, j['out'])), exist_ok=True)
                open(os.path.join(ROOT, j['out']), 'wb').write(base64.b64decode(r['data'][0]['b64_json']))
                made += 1; done_ids.add(j['id']); break
            msg = r.get('error', {}).get('message', str(r))[:200]
            print('  error:', msg, flush=True)
            if 'rate' in msg.lower() or 'server' in msg.lower() or 'timeout' in msg.lower():
                time.sleep(min(60, 5 * 2 ** attempt)); continue
            break
        time.sleep(2)
    print(f'OK {made} imágenes nuevas en data/images/photos/inbox/. Revísalas y ejecuta: python3 scripts/add_drawings.py')


if __name__ == '__main__':
    main()
