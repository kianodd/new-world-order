/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { vazir: ['Vazirmatn', 'system-ui', 'sans-serif'] },
      colors: {
        ink: '#0b1220', panel: '#131c2e', panel2: '#1a2740', line: '#2a3a58',
        gold: '#c9a227', gold2: '#e8c766', cream: '#f3ead3', mute: '#9fb0cc',
      },
    },
  },
  plugins: [],
}
