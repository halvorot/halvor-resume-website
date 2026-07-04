const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    colors: {
      primary: {
        DEFAULT: "#f97316", // orange-500
        accent: "#ea580c", // orange-600
      },
      secondary: {
        DEFAULT: "#fdba74", // orange-300
        accent: "#fb923c", // orange-400
      },
      dark: {
        DEFAULT: "#0a0a0a", // neutral-950
        accent: "#171717", // neutral-900
        blue: "#111724",
      },
      light: {
        DEFAULT: "#e2e8f0", // slate-200
        accent: "#cbd5e1", // slate-300
      },
      transparent: "transparent",
      current: "currentColor",
    },
    screens: {
      xs: "475px",
      ...defaultTheme.screens,
    },
  },
  plugins: [],
};
