/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        acorn: {
          50: '#fff8ee',
          100: '#fbe8cb',
          200: '#f7d59f',
          300: '#f2bb6f',
          400: '#e59c46',
          500: '#cf7f2f',
          600: '#a96224',
          700: '#80471d',
          800: '#5e3315',
          900: '#41230f'
        },
        leaf: {
          100: '#eaf7d9',
          300: '#b4dc7f',
          500: '#6ea93d',
          700: '#406625'
        }
      }
    },
  },
  plugins: [],
};
