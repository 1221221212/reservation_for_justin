/** @type {import('tailwindcss').Config} */
export default {
    // Tailwind のクラスを探しにいくディレクトリを指定
    content: [
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {},  // 必要に応じてここにカスタムテーマを追加
    },
    plugins: [],   // 必要に応じてプラグインを追加
};
