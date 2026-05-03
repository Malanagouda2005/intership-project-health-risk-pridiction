import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.healthai.app',
  appName: 'Health AI',
  webDir: 'build',
  bundledWebRuntime: false,
  // Remove server config - use local build files instead
  // server: {
  //   url: 'http://10.0.2.2:3001',
  //   cleartext: true
  // },
  plugins: {
    // Add any Capacitor plugins here if needed
  },
  
};

export default config;