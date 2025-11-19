/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,vue,html}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f5f8fb',
          100: '#e9eff6',
          200: '#cdd9ea',
          300: '#a9bdd8',
          400: '#7b97c4',
          500: '#577ab0',
          600: '#3f5f9a',
          700: '#334d7e',
          800: '#2b4068',
          900: '#243557'
        }
      }
    }
  },
  plugins: []
}
