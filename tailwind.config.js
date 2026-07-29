/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#2563eb",
          50: "#eff6ff",
          100: "#dbeafe",
        },
        warning: {
          DEFAULT: "#a15c00",
          bg: "#fff4e5",
        },
        success: {
          DEFAULT: "#1e7e34",
          bg: "#e6f4ea",
        },
        danger: {
          DEFAULT: "#b02a2a",
          bg: "#fdeaea",
        },
      },
      borderRadius: {
        xl: "12px",
      },
    },
  },
  plugins: [],
};
