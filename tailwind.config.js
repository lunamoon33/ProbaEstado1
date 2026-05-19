/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        civic: {
          bg: "#0A0F1E",
          surface: "#111827",
          card: "#151E30",
          border: "#1E2D45",
          accent: "#00D4FF",
          green: "#00FF88",
          yellow: "#FFB800",
          red: "#FF3B5C",
          text: "#E2E8F0",
          muted: "#64748B",
        }
      }
    },
  },
  plugins: [],
}
