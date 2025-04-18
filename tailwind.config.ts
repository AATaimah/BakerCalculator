/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
      "./pages/**/*.{ts,tsx}",
      "./components/**/*.{ts,tsx}",
      "./app/**/*.{ts,tsx}",
      "./src/**/*.{ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          baker: {
            50: "oklch(var(--baker-50))",
            100: "oklch(var(--baker-100))",
            200: "oklch(var(--baker-200))",
            300: "oklch(var(--baker-300))",
            400: "oklch(var(--baker-400))",
            500: "oklch(var(--baker-500))",
            600: "oklch(var(--baker-600))",
            700: "oklch(var(--baker-700))",
            800: "oklch(var(--baker-800))",
            900: "oklch(var(--baker-900))",
            950: "oklch(var(--baker-950))",
          },
          // The rest of your theme colors should already be set up correctly
        },
        // Rest of your theme extensions...
      },
    },
    plugins: [require("tailwindcss-animate")],
  }