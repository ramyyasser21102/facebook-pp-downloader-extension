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
    description:
      'Save Facebook profile pictures in the highest resolution available.',
    // Least privilege: no host or API permissions until a feature needs them.
    permissions: ['storage'],
    // Firefox MV3 requires an add-on ID and a data-collection declaration.
    // Self-chosen ID; it is claimed on first upload to AMO and must never change
    // afterwards, or Firefox treats it as a different add-on.
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: {
          id: 'fb-pp-downloader@ramyyasser21102.github.io',
          data_collection_permissions: { required: ['none'] },
        },
      },
    }),
  }),
});
