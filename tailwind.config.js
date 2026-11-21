module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F6F3EC",
          100: "#24302A",
          200: "#37463E",
          300: "#56645D",
          400: "#6B756F",
          500: "#5A786B",
          600: "#3A6754",
          700: "#1F4D3A",
          800: "#DED9CE",
          900: "#FFFFFF",
          950: "#F6F3EC",
        },
        accent: {
          50: "#FBF7EF",
          100: "#16382B",
          200: "#2B5B47",
          300: "#2F6B50",
          400: "#1F4D3A",
          500: "#C99A4A",
          600: "#D8AE67",
          700: "#A77731",
          800: "#7B5625",
          900: "#543A19",
          950: "#36240F",
        },
      },
    },
  },
  plugins: [],
};
