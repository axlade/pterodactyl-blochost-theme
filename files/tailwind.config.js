const colors = require('tailwindcss/colors');

const gray = {
    50:  '#f5f5f5',
    100: '#e8e8e8',
    200: '#d0d0d0',
    300: '#a8a8a8',
    400: '#777777',
    500: '#555555',
    600: '#3a3a3a',
    700: '#191919',
    800: '#141414',
    900: '#111111',
};

/* Palette orange BLOCHOST — remplace blue partout dans le thème */
const orange = {
    50:  '#fff5ee',
    100: '#ffe8d5',
    200: '#ffcfaa',
    300: '#ffac72',
    400: '#ff9447',
    500: '#FF7D20',
    600: '#e06300',
    700: '#b84e00',
    800: '#8f3c00',
    900: '#6b2c00',
};

module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                header: ['"IBM Plex Sans"', '"Roboto"', 'system-ui', 'sans-serif'],
            },
            colors: {
                black: '#131a20',
                primary: orange,
                blue: orange,
                gray: gray,
                neutral: gray,
                cyan: colors.cyan,
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};
