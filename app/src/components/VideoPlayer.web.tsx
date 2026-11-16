/** Reproductor de YouTube — WEB: un <iframe> del reproductor oficial en modo de
 *  privacidad mejorada. Misma API que `VideoPlayer.tsx`. */
import { createElement } from 'react';
import { View } from 'react-native';

export const youtubeId = (url: string) => /[?&]v=([\w-]{11})/.exec(url)?.[1] ?? null;

export function VideoPlayer({ url, width, title }: { url: string; width: number; title: string }) {
  const id = youtubeId(url);
  if (!id) return null;
  const height = Math.round((width * 9) / 16);
  return (
    <View style={{ width, height, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden' }}>
      {createElement('iframe', {
        src: `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&autoplay=1`,
        title,
        allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
        allowFullScreen: true,
        style: { border: 0, width: '100%', height: '100%' },
      })}
    </View>
  );
}
