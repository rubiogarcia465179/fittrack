import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

/**
 * Escala tipográfica fluida: la base de diseño es 393px (iPhone 16).
 * En pantallas más anchas (iPhone 18, tablets) los tamaños suben
 * suavemente (hasta 1,12×); en las más estrejas (360px) se mantiene
 * la base — nunca se encoge la legibilidad.
 */
export function useScale() {
  const [scale, setScale] = useState(() =>
    Math.max(1, Math.min(1.12, Dimensions.get('window').width / 393)),
  );
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', (d: { window: { width: number; height: number } }) =>
      setScale(Math.max(1, Math.min(1.12, d.window.width / 393))),
    );
    return () => sub.remove();
  }, []);
  return scale;
}

/** Redondea a décima para evitar sub-pixel jitter. */
export function fs(scale: number, px: number) {
  return Math.round(px * scale * 10) / 10;
}
