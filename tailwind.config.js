/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        jaPrimary: '#1E90FF',
        jaSecondary: '#333'
      }
    }
  },
  plugins: []
};