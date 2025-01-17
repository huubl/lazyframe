// View your website at your own local server
// for example http://vite-php-setup.test

// http://localhost:3000 is serving Vite on development
// but accessing it directly will be empty

// IMPORTANT image urls in CSS works fine
// BUT you need to create a symlink on dev server to map this folder during dev:
// ln -s {path_to_vite}/src/assets {path_to_public_html}/assets
// on production everything will work just fine
// import liveReload from 'vite-plugin-live-reload';
import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'

const path = require('path');

// const { resolve } = require('path');
console.log(process.env.NODE_ENV);
export default {
  // resolve: {
  //   alias: {
  //     // alias a path to a fs directory
  //     // the key must start and end with a slash
  //     '/@/': path.resolve(__dirname, 'src')
  //   }
  // },
  // root: 'src/',
  base: process.env.NODE_ENV === 'development' ? '/' : '/lazyframeAdvanced/',

  // plugins: [
  //   liveReload(__dirname+'/dist/site/templates/**/*.(php|tpl|html)'),
  //   // vue()
  //   // edit according to your source code
  // ],
  server: {
    // port: 3000,
    cors: true,
    // we need a strict port to match on PHP side
    // change freely, but update on PHP to match the same port
    // strictPort: true,
    https: true,
  },
  build: {
    // input: {
    //   'entry-point-a': path.resolve(__dirname, 'src/lazyframe.js'),
    //   'entry-point-b': path.resolve(__dirname, 'src/scss/lazyframe.scss'),
    // },
    lib: {
      entry: path.resolve(__dirname, 'src/lazyframe.js'),

      name: 'lazyframe'
    },
    // outDir: '/dist/',
    // emptyOutDir: true,
    assetsDir: './',
    // generate manifest.json in outDir
    manifest: false,
    rollupOptions: {
      // overwrite default .html entry
      input: './src/lazyframe.js',
      output: {
        exports: "default",
        format: "es",
        // entryFileNames: 'entry-[name].js'
      }
    }
  }
};
