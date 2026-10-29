/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        civora: {
          midnight: "#001237",
          steel: "#18243D",
          teal: "#4FAAA7",
          blue: "#3B68DE",
        },
      },
      fontFamily: {
        // Match these names to the actual font loaded in the app via expo-font.
        heading: ["EncodeSansCondensed"],
      },
    },
  },
  plugins: [],
};
