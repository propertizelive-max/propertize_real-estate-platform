/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a5f',
          dark: '#2b3b52',
          light: '#3b82f6',
        },
        // Luxe Estate landing page
        'accent-gold': '#c5a059',
        'value-green': '#E8F5E9',
        'value-green-dark': '#2E7D32',
        'background-light': '#f6f7f8',
        'background-dark': '#14181e',
        sidebar: '#1e293b',
        sidebarActive: '#334155',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
