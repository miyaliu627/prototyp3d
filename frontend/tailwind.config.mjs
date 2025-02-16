/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-out': {
          '0%, 50%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'fade-out': 'fade-out 2s ease-out',
      },
    },
  },
  plugins: [],
};
