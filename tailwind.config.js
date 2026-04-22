/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  presets: [require("nativewind/preset")],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: "#07111f",
          900: "#0d1b2d",
          850: "#12233a",
          800: "#18314d",
        },
        glow: {
          300: "#9dc4ff",
          400: "#78a9ff",
          500: "#4d88f5",
        },
        peach: {
          200: "#ffd8c2",
          300: "#ffc09a",
          400: "#ff9e6d",
        },
        pearl: {
          50: "#f8fafc",
          100: "#eef3f8",
          200: "#dbe5f0",
        },
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
        auth: "0 28px 80px rgba(7, 17, 31, 0.34)",
      },
    },
  },
  plugins: [],
};
