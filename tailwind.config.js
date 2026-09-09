/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tesra Cosmetics brand palette
        blush: {
          50: "#FFF9FA",
          100: "#FFF0F3", // soft baby pink — base background
          200: "#FFE5EC", // cream peach — gradient partner
          300: "#FFD1DC",
        },
        rose: {
          400: "#FFB3C6",
          500: "#FF8FAB", // elegant rose — primary accent
          600: "#F4678A",
        },
        gold: {
          400: "#D9B36C",
          500: "#C79A45", // warm gold — secondary accent
          600: "#A87F33",
        },
        berry: {
          700: "#7A1230",
          800: "#590D22", // deep luxury berry — high-contrast type
          900: "#3D0817",
        },
        cream: "#FFFBF8",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Helvetica", "Arial", "sans-serif"],
      },
      backgroundImage: {
        "tesra-gradient": "linear-gradient(160deg, #FFF0F3 0%, #FFE5EC 55%, #FFD1DC 100%)",
        "berry-gradient": "linear-gradient(135deg, #7A1230 0%, #590D22 100%)",
      },
      borderRadius: {
        pill: "999px",
        soft: "1.25rem",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(89, 13, 34, 0.08)",
        "glass-hover": "0 16px 48px rgba(89, 13, 34, 0.14)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
