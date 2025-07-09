// postcss.config.js
export default {
    plugins: {
        '@tailwindcss/postcss': {},  // ← ここを tailwindcss から @tailwindcss/postcss へ
        autoprefixer: {},
    },
};
