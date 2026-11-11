/** @type {import('tailwindcss').Config} */
// FitTrack — tokens de diseño PREMIUM (igual que la app, theme.ts DEFAULT):
// crema cálido + acento naranja + texto azul marino. Montserrat.
export default {
  content: ['./src/**/*.{astro,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        AppBg: '#F3EEE3',       // crema
        AppSection: '#ECE5D8',  // crema sección
        AppNearWhite: '#FFFCF6',
        AppCard: '#FFFCF6',     // tarjeta
        AppGray: '#ECE5D8',
        AppText: '#182440',     // azul marino
        AppSecondary: '#5C6A85',
        AppSubtext: '#5C6A85',
        AppDim: '#646C82',      // atenuado (contraste AA)
        AppBorder: '#D8CFBE',
        AppCardBorder: '#E3DACA',
        AppBlue: '#D9541E',     // acento naranja
        AppAccentDark: '#B8430F',
        AppLink: '#B8430F',
        AppGreen: '#2E7D44',
        AppRed: '#C43C2A',
        AppFieldBg: '#EFE8DA',
        AppNavy: '#070D1D',     // tema activo (sesión en curso; fondo base del degradado)
        AppNavyCard: '#182342',
        AppNavyText: '#F3EEE3',
        AppNavyDim: '#8896B5',
        AppNavyBorder: '#2A3A63',
      },
      fontFamily: {
        app: [
          'Montserrat',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '20px',
        tile: '18px',
        field: '12px',
        pill: '980px',
      },
      boxShadow: {
        card: '0 4px 14px rgba(24, 36, 64, 0.06)',
        lift: '0 12px 32px rgba(24, 36, 64, 0.14)',
        cta: '0 6px 16px rgba(217, 84, 30, 0.35)',
      },
      maxWidth: {
        wrap: '70rem',
        hero: '44rem',
        narrow: '38rem',
        app: '640px', // ancho máximo de contenido (como la app en tablet)
      },
      letterSpacing: {
        apple: '-0.015em',
        tighter2: '-0.02em',
      },
      height: {
        nav: '52px',
      },
    },
  },
  plugins: [],
};
