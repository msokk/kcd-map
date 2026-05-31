/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        champ: ["'1529 Champ Fleury W01 Regular'", 'serif'],
        medieval: ["'MedievalSharpBook'", 'serif'],
      },
    },
  },
  plugins: [],
  // The ported legacy stylesheet owns the visual identity; Tailwind is
  // available for new UI without clashing with those hand-tuned classes.
  corePlugins: {
    preflight: false,
  },
};
