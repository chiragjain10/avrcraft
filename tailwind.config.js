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
          navy: '#1a2b3c',
          cream: '#f8f5f2',
          gray: '#e8e4e1',
          gold: '#2c3e50',
        },
        secondary: {
          green: '#2d5a4d',
          brown: '#a68a64',
          charcoal: '#3c3c3c',
        }
      },
      fontFamily: {
        'merriweather': ['Merriweather', 'serif'],
        'baskerville': ['Baskerville', 'serif'],
        'lora': ['Lora', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      }
    },
  },
  plugins: [],
}