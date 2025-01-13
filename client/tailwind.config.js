/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        // For the game board (10x10)
        board: 'repeat(10, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};
