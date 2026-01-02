import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                features: resolve(__dirname, 'features.html'),
                pricing: resolve(__dirname, 'pricing.html'),
                blog: resolve(__dirname, 'blog.html'),
                community: resolve(__dirname, 'community.html'),
                'blog-ai-engineer': resolve(__dirname, 'blog/ai-engineer.html'),
                'blog-sre-tutorial': resolve(__dirname, 'blog/sre-tutorial.html'),
            },
        },
    },
})
