import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sparkyOrange: {
          DEFAULT: '#FFC94D',
          100: '#FFF8DB', // Lighter shade
          200: '#FFF0B7',
          300: '#FFE594',
          400: '#FFDA79',
          500: '#FFC94D', // Main color
          600: '#DBA438', // Darker shade
          700: '#B78226',
          800: '#936218',
          900: '#7A4C0E',
        },
        sparkyGreen: {
          DEFAULT: '#00D7B2',
          100: '#CAFDE1', // Lighter shade
          200: '#96FBCD',
          300: '#61F3BE',
          400: '#39E7B8',
          500: '#00D7B2', // Main color
          600: '#00B8AA', // Darker shade
          700: '#00989A',
          800: '#006E7C',
          900: '#005267',
        },
        sparkyRed: {
          DEFAULT: '#FF6B5E',
          100: '#FFE3E0', // Lighter shade
          200: '#FFBBB5',
          300: '#FF958F',
          400: '#FF7D78',
          500: '#FF6B5E', // Main color
          600: '#DB564C', // Darker shade
          700: '#B7443B',
          800: '#93342D',
          900: '#7A2821',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
