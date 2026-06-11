/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          bg: 'var(--bg-glass)',
          hover: 'var(--bg-glass-hover)',
          border: 'var(--border-glass)',
        },
        accent: {
          DEFAULT: 'var(--accent-color)',
          glow: 'var(--accent-glow)',
        },
      },
      backdropBlur: {
        glass: 'var(--blur-amount)',
      },
    },
  },
  plugins: [],
};