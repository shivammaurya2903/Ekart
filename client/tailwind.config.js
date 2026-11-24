/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        flipkart: {
          blue: '#2874F0',
          darkBlue: '#172337',
          orange: '#FB641B',
          yellow: '#FF9F00',
          plus: '#FFE500',
          green: '#388E3C',
          lightGray: '#F1F3F6',
          border: '#E0E0E0'
        }
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.08)',
        cardHover: '0 8px 24px rgba(0,0,0,0.16)',
        nav: '0 2px 8px rgba(0,0,0,0.18)'
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
};
