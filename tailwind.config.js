/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "neon-red": "var(--color-neon-red)",
        "neon-red-dark": "var(--color-neon-red-dark)",
        "neon-red-matte": "var(--color-neon-red-matte)",
        "neon-yellow": "var(--color-neon-yellow)",
        "neon-yellow-dark": "var(--color-neon-yellow-dark)",
        "neon-yellow-matte": "var(--color-neon-yellow-matte)",
        "neon-orange": "var(--color-neon-orange)",
        "void-black": "var(--color-void-black)",
        "void-gray": "var(--color-void-gray)",
        "void-lighter": "var(--color-void-lighter)",
        "light-cream": "var(--color-light-cream)",
      },
    },
  },
  plugins: [],
};
