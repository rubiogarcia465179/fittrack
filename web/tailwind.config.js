/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Tokens de estilo Apple.
      colors: {
        AppBlue: '#0071e3',
        AppLink: '#0066cc',
        AppGreen: '#248a3d',
        AppBg: '#ffffff',
        AppGray: '#f5f5f7',
        AppSection: '#f5f5f7',
        AppNearWhite: '#fbfbfd',
        AppText: '#1d1d1f',
        AppSecondary: '#6e6e73',
        AppSubtext: '#6e6e73',
        AppDim: '#86868b',
        AppBorder: '#d2d2d7',
        AppCard: '#ffffff',
      },
      fontFamily: {
        app: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'system-ui',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        tile: '1.125rem',
        field: '0.75rem',
        pill: '980px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0, 0, 0, 0.08)',
        lift: '0 12px 32px rgba(0, 0, 0, 0.14)',
        seg: '0 1px 3px rgba(0, 0, 0, 0.12)',
      },
      maxWidth: {
        wrap: '70rem',
        hero: '44rem',
        narrow: '38rem',
      },
      letterSpacing: {
        apple: '-0.015em',
        tighter2: '-0.02em',
      },
      height: {
        nav: '48px',
      },
    },
  },
  plugins: [],
};
