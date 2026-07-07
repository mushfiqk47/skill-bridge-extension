/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./popup.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: {
            dark: "#ffffff", // Cal.com White Canvas floor
            light: "#ffffff"
          },
          surface: {
            dark: "#f5f5f5", // Cal.com Light-Gray Surface Card
            light: "#f8f9fa"
          },
          border: {
            dark: "#e5e7eb", // Cal.com Hairline border grey
            light: "#e5e7eb"
          },
          text: {
            primary: {
              dark: "#111111", // Cal.com Ink/Primary typography
              light: "#111111"
            },
            muted: {
              dark: "#6b7280", // Cal.com Muted grey secondary text
              light: "#6b7280"
            }
          },
          blue: "#111111", // Primary monochrome black actions
          valid: "#10b981", // Success green (status indicators)
          warning: "#f59e0b",
          error: "#ef4444",
          dark: "#101010", // Cal.com Surface Dark footer
          darkElevated: "#1a1a1a", // Cal.com Surface Dark Elevated
          onDarkSoft: "#a1a1aa", // Cal.com On-Dark-Soft footer text
          brandAccent: "#3b82f6", // Cal.com brand accent blue
          badgeOrange: "#fb923c",
          badgePink: "#ec4899",
          badgeViolet: "#8b5cf6",
          badgeEmerald: "#34d399"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "Fira Code", "monospace"],
      },
      borderRadius: {
        'none': '0',
        'sm': '6px',
        'md': '8px', // Cal.com button + input radius
        'lg': '12px', // Cal.com card radius
        'xl': '16px', // Cal.com mockup radius
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.03)',
        'DEFAULT': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        'md': '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
        'lg': '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.03)',
        'xl': '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.03)',
      }
    },
  },
  plugins: [],
}
