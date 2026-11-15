#!/usr/bin/env node
/**
 * Convierte los fotogramas del screencast (shoot.js --frames <dir>) en un
 * MP4 H.264 respetando el tiempo real entre fotogramas.
 *
 *   FFMPEG=/ruta/a/ffmpeg node app/qa/shots/make-video.js <framesDir> <out.mp4>
 *
 * ffmpeg no es dependencia del repo: en WSL se obtiene con
 *   python3 -m venv /tmp/ffvenv && /tmp/ffvenv/bin/pip install imageio-ffmpeg
 *   /tmp/ffvenv/bin/python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const [dir, out] = process.argv.slice(2);
const FF = process.env.FFMPEG || 'ffmpeg';
const frames = fs.readdirSync(dir).filter((f) => f.endsWith('.jpg')).sort();
if (frames.length < 2) throw new Error('sin fotogramas en ' + dir);

// Lista ffconcat con la duración real de cada fotograma (máx. 2 s para
// no congelar el vídeo en esperas largas).
const ts = frames.map((f) => Number(path.basename(f, '.jpg')));
const lines = ['ffconcat version 1.0'];
frames.forEach((f, i) => {
  const dur = i < frames.length - 1 ? Math.min(2, Math.max(0.02, (ts[i + 1] - ts[i]) / 1000)) : 1.5;
  lines.push(`file '${path.join(path.resolve(dir), f).replace(/'/g, "'\\''")}'`, `duration ${dur.toFixed(3)}`);
});
lines.push(`file '${path.join(path.resolve(dir), frames[frames.length - 1])}'`);
const list = path.join(path.resolve(dir), 'list.ffconcat');
fs.writeFileSync(list, lines.join('\n') + '\n');

execFileSync(FF, [
  '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list,
  '-vf', 'scale=786:-2:flags=lanczos,fps=30,format=yuv420p',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-movflags', '+faststart', out,
], { stdio: 'inherit' });
console.log('VIDEO_OK', out, (fs.statSync(out).size / 1e6).toFixed(2) + ' MB', frames.length + ' fotogramas');
