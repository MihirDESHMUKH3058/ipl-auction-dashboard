/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0e27',
        primary: '#d4af37', // Gold
        secondary: '#1a1e3d',
        accent: '#f3cc4b',
        team: {
          csk: '#FDB913',
          mi: '#004BA0',
          rcb: '#EE1C25',
          kkr: '#3A225D',
          srh: '#F26522',
          dc: '#000080',
          pbks: '#ED1B24',
          rr: '#254AA5',
          lsg: '#0057E2',
          gt: '#1B2133',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
