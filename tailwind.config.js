/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6467F2",
          hover: "#4F52D9",
          light: "#E8E8FD",
        },
        secondary: {
          DEFAULT: "#64748B",
          light: "#CBD5E1",
        },
        background: "#F8FAFC",
        foreground: "#1E293B",
        success: {
          DEFAULT: "#22C55E",
          light: "#DCFCE7",
        },
        error: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
        },
        white: "#FFFFFF",
        border: "#E2E8F0",
      },
    },
  },
  plugins: [],
};
