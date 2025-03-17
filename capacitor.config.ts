import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'proyecto-camara',
  webDir: 'dist/myapp/browser', // <-- Asegúrate de que sea correcto
  server: {
    androidScheme: 'https'
  }
};


export default config;
