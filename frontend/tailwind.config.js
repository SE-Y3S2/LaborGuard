/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#ffffff',
          secondary: '#f4f7fb'
        },
        text: {
          primary: '#0f172a',
          secondary: '#475569'
        },
        accent: {
          primary: '#2589f5',
          hover: '#1d4ed8',
          secondary: '#f05b5b',
          success: '#059669',
          danger: '#e11d48'
        }
      },
      boxShadow: {
        main: '0 8px 30px rgba(0, 0, 0, 0.04)',
        hover: '0 15px 40px rgba(0, 0, 0, 0.08)'
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
        'pill': '50px'
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif']
      }
    },
  },
  plugins: [],
}
