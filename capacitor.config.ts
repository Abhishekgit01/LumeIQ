import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lumeiq.app',
  appName: 'LumeIQ',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    allowNavigation: ['*'],
  },
  android: {
    backgroundColor: '#f0f7f0',
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    Camera: {
      permissions: ['camera', 'photos'],
    },
    Geolocation: {
      permissions: ['location'],
    },
  },
};

export default config;
