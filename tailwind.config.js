/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FDFDFB',
        charcoal: '#1A1A1A',
        'soft-gold': '#C0A067',
        'dark-gold': '#A78B58',
        'light-gray': '#F5F5F5',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};
