/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dulcinea: {
          crema: '#F7E7D7',       // Tono almendrado suave del fondo del logo
          chocolate: '#3D2517',   // Marrón profundo del texto y la torta
          cereza: '#D91A3D',      // El rojo de la guinda para botones y alertas críticas
        }
      }
    },
  },
  plugins: [],
}