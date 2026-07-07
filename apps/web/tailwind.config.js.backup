/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nethra: {
          teal: '#00d4aa',
          'teal-soft': 'rgba(0, 212, 170, 0.15)',
          blue: '#1e88e5',
          'blue-soft': 'rgba(30, 136, 229, 0.15)',
          amber: '#ff9800',
          red: '#ff5555',
          green: '#00c864',
        },
        surface: {
          DEFAULT: '#0b1221',
          elevated: '#0d1628',
          card: 'rgba(255, 255, 255, 0.04)',
          'card-hover': 'rgba(255, 255, 255, 0.07)',
        },
        content: {
          DEFAULT: '#f0f4ff',
          secondary: '#8899bb',
          tertiary: 'rgba(136, 153, 187, 0.6)',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          strong: 'rgba(255, 255, 255, 0.14)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'nethra': '16px',
        'nethra-sm': '10px',
      },
      boxShadow: {
        'nethra': '0 10px 30px rgba(0, 0, 0, 0.35)',
        'glow-teal': '0 0 30px rgba(0, 212, 170, 0.25)',
        'glow-blue': '0 0 30px rgba(30, 136, 229, 0.25)',
      },
      animation: {
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.35s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
