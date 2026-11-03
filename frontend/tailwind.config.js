/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        canvas: '#FAF9F6',
        surface: '#FFFFFF',
        subtle: '#F4F2EC',
        border: {
          DEFAULT: '#E5E2DA',
          strong: '#CEC9BD',
        },
        ink: {
          DEFAULT: '#141816',
          muted: '#4A5450',
          dim: '#737D77',
        },
        accent: {
          DEFAULT: '#0F5B56',
          hover: '#0B4642',
          dark: '#072F2C',
          light: '#E8F2F0',
          subtle: '#F1F7F6',
        },
        risk: {
          low: '#1E6B47',
          'low-bg': '#F2F9F5',
          'low-border': '#CCE8D8',
          mid: '#8A5C14',
          'mid-bg': '#FDF9F0',
          'mid-border': '#F5DFB8',
          high: '#9C2A2A',
          'high-bg': '#FDF3F3',
          'high-border': '#F2C6C6',
        },
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.04)',
        sm: '0 1px 2px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}
