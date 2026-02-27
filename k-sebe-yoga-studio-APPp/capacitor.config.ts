const config = {
  appId: 'ru.ksebe.studio',
  appName: 'К себе',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#FDFBF7',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#57a773',
    },
  },
};

export default config;
