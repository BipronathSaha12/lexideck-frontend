/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: "#0f172a",
        bgSecondary: "#1e293b",
        bgTertiary: "#334155",
        textPrimary: "#f8fafc",
        textSecondary: "#94a3b8",
        accent: "#3b82f6",
        accentHover: "#2563eb",
        danger: "#ef4444",
        success: "#10b981",
        borderColor: "#334155",
        box1: "#ef4444",
        box2: "#f59e0b",
        box3: "#eab308",
        box4: "#84cc16",
        box5: "#10b981",
      },
      fontFamily: {
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
