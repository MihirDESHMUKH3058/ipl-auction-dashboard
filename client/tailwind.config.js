/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-primary-fixed": "#291800",
        "inverse-surface": "#dde1ff",
        "outline-variant": "#444653",
        "tertiary-fixed-dim": "#00daf3",
        "secondary-fixed": "#dce1ff",
        "outline": "#8e909e",
        "primary-container": "#583800",
        "on-secondary": "#00277f",
        "on-secondary-fixed-variant": "#133ca8",
        "on-tertiary-fixed": "#001f24",
        "inverse-primary": "#835500",
        "on-surface": "#dde1ff",
        "surface-container-lowest": "#000935",
        "surface-tint": "#ffb955",
        "on-tertiary-container": "#00bbd1",
        "on-error": "#690005",
        "background": "#000d41",
        "error": "#ffb4ab",
        "on-secondary-container": "#9eb2ff",
        "surface-variant": "#182d7b",
        "primary-fixed": "#ffddb4",
        "tertiary-container": "#00464f",
        "surface-container-high": "#082170",
        "on-tertiary": "#00363d",
        "surface": "#000d41",
        "on-tertiary-fixed-variant": "#004f58",
        "primary": "#ffb955",
        "on-surface-variant": "#c4c5d5",
        "surface-dim": "#000d41",
        "on-error-container": "#ffdad6",
        "secondary-fixed-dim": "#b6c4ff",
        "on-primary": "#452b00",
        "surface-container-highest": "#182d7b",
        "inverse-on-surface": "#122876",
        "secondary-container": "#133ca8",
        "error-container": "#93000a",
        "surface-bright": "#1e327f",
        "primary-fixed-dim": "#ffb955",
        "tertiary-fixed": "#9cf0ff",
        "surface-container-low": "#001354",
        "surface-container": "#00175e",
        "on-primary-container": "#e79a12",
        "on-secondary-fixed": "#001550",
        "secondary": "#b6c4ff",
        "on-background": "#dde1ff",
        "tertiary": "#00daf3",
        "on-primary-fixed-variant": "#633f00"
      },
      fontFamily: {
        "headline": ["Epilogue", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"],
        "data": ["Bebas Neue", "cursive"],
        "scoreboard": ["Bebas Neue", "cursive"],
        "display": ["Barlow Condensed", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
