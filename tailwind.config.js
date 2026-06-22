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
      },
      borderRadius: {
        '4xl': '24px',
      },
      boxShadow: {
        glass: 'var(--glass-shadow)',
        'glass-lg': 'var(--glass-shadow-lg)',
      },
    },
  },
  plugins: [],
};
