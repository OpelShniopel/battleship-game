/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for the game
        'ocean': '#1e40af', // Deep blue for water
        'ship': '#475569',  // Ship color
        'hit': '#dc2626',   // Red for hits
        'miss': '#94a3b8',  // Gray for misses
      },
      gridTemplateColumns: {
        // For the game board (10x10)
        'board': 'repeat(10, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
}
