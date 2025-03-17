/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        inconsolata: ['Inconsolata', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      colors: {
        astro: {
          primary: {
            dark: '#181040',   // Morado oscuro (fondo principal)
            light: '#B4A5FF',   // Morado claro (acentos)
            orange: '#FF5D01',  // Naranja (botones y acentos)
          },
          secondary: {
            dark: '#5218A1',    // Gris oscuro (texto y fondos secundarios)
            light: '#D9D9D6',   // Gris claro (fondos y separadores)
          },
          accent: {
            pink: '#FF69B4',    // Rosa (detalles y hover)
            blue: '#00B7EB',    // Azul (detalles secundarios)
          },
          white: '#FFFFFF',       // Blanco (texto y fondos claros)
        },
      },
      screens: {
        xs: '431px', // Nuevo breakpoint
      },
    },
  },
  plugins: [
    require('@iconify/tailwind').addDynamicIconSelectors(),
  ],
};