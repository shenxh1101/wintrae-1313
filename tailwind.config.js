/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        forest: {
          50: '#f0f7ed',
          100: '#d9ead3',
          200: '#b5d4a8',
          300: '#85b86f',
          400: '#5c9b44',
          500: '#417c2c',
          600: '#336323',
          700: '#2a501e',
          800: '#24401b',
          900: '#1f3519',
          950: '#0e1c09',
        },
        earth: {
          50: '#f9f7f2',
          100: '#f0ebe0',
          200: '#e0d5bf',
          300: '#cdb995',
          400: '#b89a6e',
          500: '#a88555',
          600: '#956e46',
          700: '#7d563a',
          800: '#674634',
          900: '#553a2d',
          950: '#2f1f17',
        },
        cream: {
          50: '#fdfcfa',
          100: '#f9f6ef',
          200: '#f3ede0',
          300: '#e9e0c9',
          400: '#dccfb0',
          500: '#cdbc92',
          600: '#b9a371',
          700: '#9d8658',
          800: '#806d4a',
          900: '#6a5a3f',
          950: '#382f20',
        },
        camp: {
          orange: '#E67E22',
          red: '#C0392B',
          blue: '#2980B9',
          yellow: '#F1C40F',
        }
      },
      fontFamily: {
        display: ['"Segoe UI"', 'system-ui', 'sans-serif'],
        body: ['"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
