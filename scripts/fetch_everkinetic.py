#!/usr/bin/env python3
"""
Fase 13 — dibujos reales de ejercicios de Everkinetic (CC BY-SA 3.0) desde
Wikimedia Commons. Sin dependencias (urllib).

  python3 scripts/fetch_everkinetic.py candidates <outdir>   # baja TODAS las variantes del mapa para revisarlas
  python3 scripts/fetch_everkinetic.py install                # baja las elegidas a data/images/photos/

El mapa id → nombre del archivo en Commons (sin "-1.png") vive en
data/images/photos/everkinetic-map.json, revisado A MANO mirando cada dibujo
(el nombre de Commons no basta: "Bench-press" es un press INCLINADO).
Cada imagen guarda autor, licencia y enlace en data/images/photos/credits.json.

Cortesía con la API: User-Agent propio, 1 petición cada 1,5 s, backoff
exponencial ante 429/503 (máx. 8 reintentos).
"""
import json, os, sys, time, urllib.parse, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {'User-Agent': 'FitTrackDev/0.1 (offline gym app; Everkinetic CC BY-SA)'}
API = 'https://commons.wikimedia.org/w/api.php?'
MAP = os.path.join(ROOT, 'data/images/photos/everkinetic-map.json')
CREDITS = os.path.join(ROOT, 'data/images/photos/credits.json')
_last = [0.0]

def get(url, binary=False):
    for attempt in range(9):
        wait = 1.5 - (time.time() - _last[0])
        if wait > 0: time.sleep(wait)
        _last[0] = time.time()
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
            return r if binary else json.loads(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and attempt < 8:
                time.sleep(min(60, 2 ** (attempt + 1)))
                continue
            raise

def info(title):
    q = {'action': 'query', 'prop': 'imageinfo', 'iiprop': 'url|size|mime|extmetadata',
         'iiurlwidth': 800, 'titles': title, 'format': 'json'}
    p = list(get(API + urllib.parse.urlencode(q))['query']['pages'].values())[0]
    if 'imageinfo' not in p: return None
    return p['imageinfo'][0]

def titles_for(base):
    """Variantes de nombre en Commons para el fotograma n (1/2)."""
    out = []
    for n in (1, 2):
        out.append([f'File:{base}-{n}.png', f'File:{base} {n}.png', f'File:{base} {n}.svg', f'File:{base}-{n}.svg'])
    return out

def fetch(base, n, dest):
    for t in titles_for(base)[n - 1]:
        ii = info(t)
        if not ii: continue
        m = ii.get('extmetadata', {})
        artist = m.get('Artist', {}).get('value', '')
        lic = m.get('LicenseShortName', {}).get('value', '')
        if 'everkinetic' not in artist.lower():
            raise SystemExit(f'{t}: autor inesperado {artist!r} (solo Everkinetic)')
        data = get(ii.get('thumburl') or ii['url'], binary=True)
        with open(dest, 'wb') as f: f.write(data)
        return {'file': os.path.basename(dest), 'commons': t, 'page': ii.get('descriptionurl', ''),
                'author': 'Everkinetic', 'license': lic or 'CC BY-SA 3.0'}
    return None

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'install'
    mp = json.load(open(MAP))
    if mode == 'candidates':
        out = sys.argv[2]; os.makedirs(out, exist_ok=True)
        for i, bases in mp['candidates'].items():
            for k, base in enumerate(bases):
                for n in (1, 2):
                    dest = os.path.join(out, f'{i}~{k}-{n}.png')
                    if os.path.exists(dest): continue
                    try:
                        r = fetch(base, n, dest)
                        print(i, base, n, 'ok' if r else 'no existe')
                    except Exception as e:
                        print(i, base, n, 'ERROR', e)
        return
    dst = os.path.join(ROOT, 'data/images/photos'); os.makedirs(dst, exist_ok=True)
    credits = json.load(open(CREDITS)) if os.path.exists(CREDITS) else {}
    for i, base in mp['chosen'].items():
        for n in (1, 2):
            dest = os.path.join(dst, f'{i}-{n}.png')
            if os.path.exists(dest) and dest.split('/')[-1] in credits: continue
            r = fetch(base, n, dest)
            if r: credits[r['file']] = r; print('ok', r['file'])
            else: print('FALTA', i, base, n)
    with open(CREDITS, 'w') as f: json.dump(dict(sorted(credits.items())), f, indent=1, ensure_ascii=False); f.write('\n')

if __name__ == '__main__':
    main()
