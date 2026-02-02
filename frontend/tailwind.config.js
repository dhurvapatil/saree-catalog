/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50:  "#fdf2f4",
          100: "#fce4e8",
          200: "#f9c5cd",
          300: "#f29baa",
          400: "#e86080",
          500: "#8B1A2E",
          600: "#741627",
          700: "#5e1320",
          800: "#4a0f19",
          900: "#3b0c14",
        },
        gold: {
          50:  "#fffbeb",
          100: "#fff3c4",
          200: "#ffe08a",
          300: "#ffcc4e",
          400: "#ffb81c",
          500: "#C9A227",
          600: "#a8851f",
          700: "#876a18",
          800: "#665010",
          900: "#4d3c0c",
        },
        cream: {
          50:  "#fffffe",
          100: "#fef9f0",
          200: "#fdf0dc",
          300: "#fbe3c1",
          400: "#f7d49a",
        },
        plum: {
          500: "#4A1942",
          600: "#3d1537",
          700: "#31112c",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body:    ["'DM Sans'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
