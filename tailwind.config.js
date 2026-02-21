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
          DEFAULT: '#1E3A5F',
          light: '#2E5984',
          dark: '#0D1B2A',
        },
        accent: '#FF6B35',
        success: '#28A745',
        warning: '#FFC107',
        danger: '#DC3545',
        background: {
          dark: '#0D1B2A',
          card: '#1B2838',
        },
        text: {
          primary: '#E8F1F8',
          secondary: '#8BA3B9',
        },
        border: '#2C3E50',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"Microsoft YaHei"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
