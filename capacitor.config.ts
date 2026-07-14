import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.heyely.app',
  appName: 'Hey Ely',
  webDir: '.output/public', // Para TanStack Start la carpeta de salida suele ser esta o 'dist'
  server: {
    url: 'https://hey-ely.vercel.app/',
    cleartext: true
  }
};

export default config;