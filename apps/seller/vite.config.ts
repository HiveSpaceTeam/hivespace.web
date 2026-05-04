import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { workspaceAliases } from '@hivespace/vite-config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      ...workspaceAliases(),
    ],
    dedupe: ['vue', 'vue-router', 'pinia'],
  },
  server: {
    port: Number(process.env.VITE_DEV_PORT ?? process.env.PORT ?? 5174),
  },
  preview: {
    port: Number(process.env.VITE_PREVIEW_PORT ?? process.env.PREVIEW_PORT ?? 5174),
  },
})
