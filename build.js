const { build } = require('vite');
const path = require('path');

async function runBuilds() {
  console.log('Building UI (Popup & Options)...');
  await build({
    configFile: path.resolve(__dirname, 'vite.config.ts'),
  });

  console.log('Building Background Service Worker...');
  await build({
    configFile: false,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: false,
      minify: true,
      lib: {
        entry: path.resolve(__dirname, 'src/background/background.ts'),
        name: 'background',
        formats: ['iife'],
        fileName: () => 'background.js',
      },
      rollupOptions: {
        output: {
          extend: true,
        },
      },
    },
  });

  console.log('Building Content Script...');
  await build({
    configFile: false,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: false,
      minify: true,
      lib: {
        entry: path.resolve(__dirname, 'src/content/content.ts'),
        name: 'content',
        formats: ['iife'],
        fileName: () => 'content.js',
      },
      rollupOptions: {
        output: {
          extend: true,
        },
      },
    },
  });
  console.log('Build completed successfully!');
}

runBuilds().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
