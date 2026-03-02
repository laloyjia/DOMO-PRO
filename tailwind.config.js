/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2563eb',
          success: '#10b981',
          danger: '#ef4444',
          dark: '#1e293b',
        }
      },
    },
  },
  plugins: [],
}