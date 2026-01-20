import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@context': path.resolve(__dirname, './src/context'),
      '@services': path.resolve(__dirname, './src/services'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@utils': path.resolve(__dirname, './src/utils'),
      // Renamed from @types to @definitions to avoid conflict
      '@definitions': path.resolve(__dirname, './src/types'),
      // Direct aliases for type files (Vite needs .ts extension)
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
})
