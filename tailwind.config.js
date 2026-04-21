/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  presets: [require("nativewind/preset")],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f3f7f6",
          100: "#e1ebe8",
          200: "#bed2cd",
          300: "#99b7af",
          400: "#6f978d",
          500: "#547a71",
          600: "#41615a",
          700: "#354f49",
          800: "#2d413c",
          900: "#283734",
        },
        coral: {
          300: "#f7b08a",
          400: "#f38f5a",
          500: "#eb6f32",
        },
        sand: "#f6efe6",
      },
      boxShadow: {
        panel: "0 20px 60px rgba(27, 39, 36, 0.18)",
      },
    },
  },
  plugins: [],
};
