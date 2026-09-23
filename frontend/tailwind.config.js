/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
        tamil: ['"Noto Sans Tamil"', 'sans-serif'],
        kannada: ['"Noto Sans Kannada"', 'sans-serif'],
        arabic: ['"Noto Sans Arabic"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};