//** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-base': '#0a0a0c',
        'dark-surface': '#16161e',
        'neon-blue': '#00d4ff',
        'neon-purple': '#9d4edd',
        'dark-reply': '#111114'
      },
      fontFamily: {
        "display": ["Public Sans"],
        "heading": ["Inter", "sans-serif"],
        "rajdhani": ['Rajdhani'],
      }
    },
  },
  plugins: [],
}