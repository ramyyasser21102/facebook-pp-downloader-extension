import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/reference/wxt/interfaces/inlineconfig.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: ({ browser }) => ({
    name: 'Facebook PP Downloader',
    description: 'Download Facebook profile pictures',
    // Least privilege: no host or API permissions until a feature needs them.
    permissions: ['storage'],
    // Firefox MV3 requires an add-on ID and a data-collection declaration.
    // TODO: replace the placeholder ID with one you control before publishing.
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: {
          id: 'pp-downloader@example.invalid',
          data_collection_permissions: { required: ['none'] },
        },
      },
    }),
  }),
});
