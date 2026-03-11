/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0984e3',
                background: '#f5f7fb',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Professional, modern font
            }
        },
    },
    plugins: [],
}
