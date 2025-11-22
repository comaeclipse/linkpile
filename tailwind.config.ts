import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        delicious: {
          blue: "#3774D0",
          lightblue: "#E8F0FF",
          darkblue: "#1F4BA5",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
