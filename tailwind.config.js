/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './templates/**/*.html',
    './content/**/*.md',
    './static/**/*.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#EDFBFF',
          100: '#C7F3FD',
          200: '#ACEDFD',
          300: '#86E5FC',
          400: '#6FE0FB',
          500: '#4BD8FA',
          600: '#44C5E4',
          700: '#3599B2',
          800: '#29778A',
          900: '#205B69',
        },
        gray: {
          50: '#E8E8E9',
          100: '#C7C8CB',
          200: '#9497A1',
          300: '#696E7A',
          400: '#3A3F4A',
          500: '#242833',
          600: '#171B26',
          700: '#10131C',
          800: '#0D0F16',
          900: '#0A0C12',
        },
      },
      fontFamily: {
        sans: ['Public Sans', 'sans-serif'],
        mono: ['Martian Mono', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
