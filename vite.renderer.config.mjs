import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [vue(),
      AutoImport({
        import: ['vue'],

        resolvers: [
          ElementPlusResolver(),
          IconsResolver({
            prefix: false,
            enableCollections: ['ep'],
          }),
        ],
      }),
      Components({
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({
            prefix: false,
            enableCollections: ['ep'],
          }),
        ],
      }),
      Icons({
        autoInstall: true,
      }),
    ],
});