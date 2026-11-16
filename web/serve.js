#!/usr/bin/env node
/** Previsualiza web/dist en http://localhost:8080 (sin dependencias). */
const http = require('http');
const fs = require('fs');
const path = require('path');
const DIST = path.join(__dirname, 'dist');
const PORT = Number(process.env.PORT || 8080);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('Falta web/dist: ejecuta antes `npm run build`.');
  process.exit(1);
}
http
  .createServer((req, res) => {
    let f = path.join(DIST, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(DIST, 'index.html');
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  })
  .listen(PORT, () => console.log(`FitTrack web en http://localhost:${PORT}`));
