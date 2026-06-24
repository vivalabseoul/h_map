import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.artflowmap.app',
  appName: 'ArtFlow Map',
  webDir: 'public',
  server: {
    url: 'https://www.artflowmap.com/',
    cleartext: true
  }
};

export default config;
