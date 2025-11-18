/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'theme-primary': 'var(--color-primary)',
        'theme-accent': 'var(--color-accent)',
        'theme-dominant': 'var(--color-dominant)',
        'theme-text': 'var(--color-text-primary)',
        'theme-bg': 'var(--color-background-primary)',
      },
    },
  },
  plugins: [],
};
