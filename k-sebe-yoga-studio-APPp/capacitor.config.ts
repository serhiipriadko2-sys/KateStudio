import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.ksebe.studio',
  appName: 'К себе',
  webDir: 'dist',

  server: {
    androidScheme: 'https',
    cleartext: false,
  },

  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },

  ios: {
    contentInset: 'automatic',
    scrollEnabled: false,
    limitsNavigationsToAppBoundDomains: true,
    preferredContentMode: 'mobile',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: false,
      backgroundColor: '#FDFBF7',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },

    StatusBar: {
      style: 'DARK',
      backgroundColor: '#57a773',
      overlaysWebView: false,
    },
  },
};

export default config;
