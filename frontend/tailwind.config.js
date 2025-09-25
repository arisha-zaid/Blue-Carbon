/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base dark theme
        background: "#0B0F17", // deep black/blue background
        surface: "#161C27",    // slightly lighter dark for cards & panels
        border: "#2D3643",     // subtle border dividers

        // Brand accents
        primary: {
          DEFAULT: "#14B8A6", // teal accent (main brand color)
          light: "#2DD4BF",   // hover/active glow
          dark: "#0E9188",    // deeper teal for contrast
        },
        secondary: {
          DEFAULT: "#FACC15", // golden yellow (for headings/key highlights)
          light: "#FDE047",
        },

        // Text hierarchy
        text: {
          primary: "#E6EDF3",     // main text (off-white)
          secondary: "#8A93A0",   // muted gray-blue
          muted: "#6B7280",       // disabled/inactive
          accent: "#14B8A6",      // teal accent text
        },
      },
      boxShadow: {
        "primary-glow": "0 0 15px 2px rgba(20, 184, 166, 0.4)", // teal glow
        "yellow-glow": "0 0 12px 2px rgba(250, 204, 21, 0.35)", // gold glow
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // clean modern font
      },
      animation: {
        scroll: 'scroll 20s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
