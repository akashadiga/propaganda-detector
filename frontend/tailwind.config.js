/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#0EA5E9',
        'primary-dark': '#0284C7',
        propaganda: '#EF4444',
        'propaganda-light': '#FEF2F2',
        safe: '#22C55E',
        'safe-light': '#F0FDF4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
