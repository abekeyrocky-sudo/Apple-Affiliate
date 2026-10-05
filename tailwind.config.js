/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          charcoal: '#0F172A',
          surface: '#FFFFFF',
          surfaceHover: '#F8FAFC',
          border: '#E2E8F0',
          apple: '#E11D48',
          appleHover: '#BE123C',
          appleDark: '#9F1239',
          appleLight: '#FFE4E6',
          leaf: '#10B981',
          leafDark: '#059669',
          gold: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
