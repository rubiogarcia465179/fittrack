#!/usr/bin/env python3
"""
R-133/R-134 — comprueba cada vídeo de data/exercises/videos.json con el oEmbed
oficial de YouTube (sin clave):
  200 → existe y se puede INCRUSTAR: guarda título y canal reales.
  401/403 → el autor no permite incrustarlo → se quita (la app no saldría de sí misma).
  404 → ya no existe → se quita.
Uso: python3 scripts/check_videos.py   (después: node scripts/make_video_map.js)
"""
import json, os, time, urllib.parse, urllib.request, urllib.error, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'data/exercises/videos.json')
UA = {'User-Agent': 'FitTrackDev/0.1 (offline gym app)'}
vids = json.load(open(P))
today = datetime.date.today().isoformat()
dropped = []
for i, v in list(vids.items()):
    url = 'https://www.youtube.com/oembed?' + urllib.parse.urlencode({'url': v['url'], 'format': 'json'})
    try:
        d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20))
        v.update(title=d['title'], channel=d['author_name'], lang='en', checked=today)
    except urllib.error.HTTPError as e:
        dropped.append((i, e.code)); del vids[i]
    time.sleep(0.4)
with open(P, 'w') as f:
    json.dump(dict(sorted(vids.items())), f, indent=1, ensure_ascii=False); f.write('\n')
print(f'OK {len(vids)} vídeos comprobados; quitados {len(dropped)}: {dropped}')
