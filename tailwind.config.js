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
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        accent: {
          DEFAULT: "#3730a3",
          hover: "#2b2680",
          light: "#eef2ff",
          50: "#eff6ff",
          100: "#dbeafe",
        },
        warning: {
          DEFAULT: "#d97706",
          bg: "#fffbeb",
        },
        success: {
          DEFAULT: "#10b981",
          bg: "#ecfdf5",
        },
        danger: {
          DEFAULT: "#ef4444",
          bg: "#fef2f2",
        },
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

