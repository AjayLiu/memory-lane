/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
		gray: "#d1d5db",
	  blue: '#3490dc',
      green: "#30d26c",
      red: "#b01515",
	  white: "#ffffff",
	  cream: "#FFFDD0",
	  dark: "#2f333d",
	  pink: "#f472b6",
	  yellow: "#fbbf24",
	  background: "#2f333d",
      transparent: "transparent",
    },
  },
  plugins: [],
};
