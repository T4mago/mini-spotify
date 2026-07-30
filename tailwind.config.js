/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        glass: {
          DEFAULT: 'var(--glass-bg)',
          strong: 'var(--glass-bg-strong)',
          hover: 'var(--glass-bg-hover)',
          border: 'var(--glass-border)',
          'border-hover': 'var(--glass-border-hover)',
        },
        oled: '#050505',
        accent: {
          DEFAULT: 'var(--accent)',
          soft: 'var(--accent-soft)',
        },
      },
      borderRadius: {
        '4xl': '24px',
        '5xl': '32px',
        '6xl': '48px',
        'squircle': 'calc(2rem - 0.25rem)',
        'squircle-lg': 'calc(3rem - 0.375rem)',
      },
      boxShadow: {
        glass: 'var(--glass-shadow)',
        'glass-lg': 'var(--glass-shadow-lg)',
        'accent': '0 0 20px rgba(29, 185, 84, 0.25)',
        'accent-sm': '0 0 12px rgba(29, 185, 84, 0.15)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
        'spring-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      scale: {
        '98': '.98',
        '102': '1.02',
        '103': '1.03',
      },
      blur: {
        '4xl': '64px',
      },
    },
  },
  plugins: [],
};
