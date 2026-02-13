import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import cssInjectedByJs from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [react(), cssInjectedByJs()],
  css: {
    modules: {
      generateScopedName: 'sl-[name]__[local]___[hash:base64:5]',
    }
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@context': path.resolve(__dirname, './src/context'),
      '@cache': path.resolve(__dirname, './src/cache'),
      '@services': path.resolve(__dirname, './src/services'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@definitions': path.resolve(__dirname, './src/types'),
      'player': path.resolve(__dirname, './src/types/player.ts'),
      'track': path.resolve(__dirname, './src/types/track.ts'),
      'album': path.resolve(__dirname, './src/types/album.ts'),
      'playlist': path.resolve(__dirname, './src/types/playlist.ts'),
      'artist': path.resolve(__dirname, './src/types/artist.ts'),
      'genre': path.resolve(__dirname, './src/types/genre.ts'),
      'label': path.resolve(__dirname, './src/types/label.ts'),
      'rights': path.resolve(__dirname, './src/types/rights.ts'),
    },
  },
  define: {
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/widget.tsx'),
      name: 'StreamLayer',
      formats: ['umd', 'es'],
      fileName: (format) => `stream-layer.${format}.js`
    },
    assetsInlineLimit: 100000000, // Force inline of all assets
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'stream-layer.css';
          return assetInfo.name || 'asset';
        }
      }
    }
  }
})
