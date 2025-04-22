import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({

  plugins: [vue(), vueDevTools(), nodePolyfills()],
});
