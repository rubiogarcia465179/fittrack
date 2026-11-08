/**
 * Fuente de la app (R-19): Montserrat (variable, 100–900), embebida en el
 * bundle y servida en offline. `expo-font` la carga en nativo (expo-font) y
 * en web genera el `@font-face` automáticamente.
 *
 * `MONT` es la familia a referenciar en los estilos de texto.
 */
import * as Font from 'expo-font';

export const MONT = 'montserrat';

const FONT_SETS: Record<string, any> = {
  // Montserrat variable (regular + cursiva). Un archivo por trazo.
  // El NOMBRE de la familia que registra expo-font es la CLAVE del objeto,
  // así que debe coincidir exactamente (case-sensitive) con `MONT`.
  montserrat: require('../../assets/fonts/Montserrat.ttf'),
  'montserrat-italic': require('../../assets/fonts/Montserrat-Italic.ttf'),
};

let loaded = false;
let loadPromise: Promise<void> | null = null;

// react-native-web aplica su propia pila de fuentes del sistema (inline) a
// CADA <Text>, lo que anula el font-family heredado del ancestro. En web
// inyectamos una regla global para que TODO el texto use Montserrat.
function injectWebFontCss() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (document.getElementById('fittrack-fonts')) return;
  const el = document.createElement('style');
  el.id = 'fittrack-fonts';
  el.textContent =
    `*, *::before, *::after { font-family: ${MONT}, -apple-system, BlinkMacSystemFont, sans-serif !important; }`;
  document.head.appendChild(el);
}

/**
 * Carga Montserrat una sola vez (idempotente). Nunca rechaza por culpa de la
 * fuente: si fallara, la app seguiría con la fuente del sistema.
 */
export function loadFonts(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = Font.loadAsync(FONT_SETS)
    .then(() => {
      loaded = true;
      injectWebFontCss(); // en web, forzar Montserrat en todo el texto
    })
    .catch((e) => {
      // No bloquear el arranque por una fuente.
      console.warn('[fonts] Montserrat no cargó, uso fuente del sistema.', e);
    });
  return loadPromise;
}

/** true si la fuente ya está disponible (o falló y usamos la del sistema). */
export function fontsReady(): boolean {
  return loaded;
}
