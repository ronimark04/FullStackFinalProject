import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), svgr()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/areas': {
                target: 'http://localhost:8181',
                changeOrigin: true,
            },
            '/artists': {
                target: 'http://localhost:8181',
                changeOrigin: true,
            },
            '/artist-votes': {
                target: 'http://localhost:8181',
                changeOrigin: true,
            },
            '/comments': {
                target: 'http://localhost:8181',
                changeOrigin: true,
            },
            '/comment-votes': {
                target: 'http://localhost:8181',
                changeOrigin: true,
            },
            '/users': {
                target: 'http://localhost:8181',
                changeOrigin: true,
            }
        },
    },
}) 