/**
 * Reproductor de YouTube DENTRO de la app (R-134) — iOS/Android con
 * `react-native-webview` (aprobado 2026-11-16). Reproductor oficial de
 * YouTube en modo de privacidad mejorada (youtube-nocookie.com), en línea
 * (sin pantalla completa forzada). Solo se monta al tocar "Ver vídeo": nada
 * se descarga antes. La web usa `VideoPlayer.web.tsx` (un <iframe>).
 *
 * El iframe va dentro de un HTML con `baseUrl` https: YouTube rechaza los
 * reproductores incrustados sin origen/Referer (error 153 en WebViews).
 */
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

export const youtubeId = (url: string) => /[?&]v=([\w-]{11})/.exec(url)?.[1] ?? null;

export function VideoPlayer({ url, width, title }: { url: string; width: number; title: string }) {
  const id = youtubeId(url);
  if (!id) return null;
  const height = Math.round((width * 9) / 16);
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;padding:0;background:#000;height:100%}iframe{border:0;width:100%;height:100%}</style></head>
<body><iframe src="https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&autoplay=1&origin=https://fittrack.app"
allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="${title.replace(/"/g, '&quot;')}"></iframe></body></html>`;
  return (
    <View style={{ width, height, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden' }} accessibilityLabel={title}>
      <WebView
        source={{ html, baseUrl: 'https://fittrack.app' }}
        style={{ flex: 1, backgroundColor: '#000' }}
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        // Solo el reproductor: cualquier otro enlace (logo, "ver en YouTube") se abre fuera.
        setSupportMultipleWindows={false}
        originWhitelist={['https://*']}
      />
    </View>
  );
}
