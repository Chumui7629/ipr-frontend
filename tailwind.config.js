/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          primary: '#1E4E8C', // Deep navy blue
          secondary: '#0ea5e9', // Sky blue accent
          accent: '#ea580c', // Saffron gold/orange
          accentMuted: '#ffedd5', // Orange highlight
          success: '#10b981', // Green
          danger: '#ef4444', // Red
          warning: '#f59e0b', // Yellow
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
