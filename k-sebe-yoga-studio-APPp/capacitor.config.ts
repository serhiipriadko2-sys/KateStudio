import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.ksebe.studio',
  appName: 'К себе',
  webDir: 'dist',

  server: {
    androidScheme: 'https',
    // Allow localhost for development live reload
    // url: 'http://192.168.1.x:3000', // Uncomment for dev live-reload
    cleartext: false,
  },

  android: {
    // Kotlin version — must match android/variables.gradle
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    },
    // Handle back button natively
    handleApplicationNotifications: false,
    // Enable mixed content for local assets only
    allowMixedContent: false,
    // WebView settings
    captureInput: false,
    webContentsDebuggingEnabled: false, // true only for dev builds
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
      launchAutoHide: false, // We hide it manually after app is ready
      backgroundColor: '#FDFBF7',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      // iOS
      iosSpinnerStyle: 'small',
      spinnerColor: '#57a773',
    },

    StatusBar: {
      style: 'DARK',
      backgroundColor: '#57a773',
      overlaysWebView: false,
      animation: 'FADE',
    },

    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },

    App: {
      // Handles deep links / universal links
    },

    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#57a773',
      sound: 'beep.wav',
    },
  },
};

export default config;
