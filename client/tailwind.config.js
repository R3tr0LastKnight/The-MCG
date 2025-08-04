/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      mentra: ["mentra", "sans-serif"],
      poppins: ["Poppins", "sans-serif"],
      concent: ["Manufacturing Consent", "sans-serif"],
      bitcount: ['"Bitcount Prop Single"', "system-ui"],
      libertinus: ["Libertinus Serif", "system-ui"],
    },
    extend: {
      animation: {
        meteor: "meteor 5s linear infinite",
        grid: "grid 15s linear infinite",
        marquee: "marquee 20s linear infinite",
      },
      keyframes: {
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: 1 },
          "70%": { opacity: 1 },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: 0,
          },
        },
        grid: {
          "0%": { transform: "translateY(-50%)" },
          "100%": { transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
