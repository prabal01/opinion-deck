import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'src/popup/index.html'),
                background: resolve(__dirname, 'src/background.ts'),
                reddit: resolve(__dirname, 'src/content/reddit.ts'),
                g2: resolve(__dirname, 'src/content/g2.ts'),
                twitter: resolve(__dirname, 'src/content/twitter.ts'),
                hn: resolve(__dirname, 'src/content/hn.ts'),
                dashboard: resolve(__dirname, 'src/content/dashboard.ts'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: 'assets/[name].[ext]',
            },
        },
    },
});
