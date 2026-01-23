/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mu-green': '#006227', 
        'mu-yellow': '#FCE300', 
      },
    },
  },
  plugins: [],
}