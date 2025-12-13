
export interface ThemeColors {
  '--color-brand-green': string;
  '--color-brand-mint': string;
  '--color-brand-dark': string;
  '--color-brand-text': string;
  '--color-brand-light': string;
  '--color-brand-accent': string;
}

const DEFAULT_THEME: ThemeColors = {
  '--color-brand-green': '#57a773',
  '--color-brand-mint': '#d4eadd',
  '--color-brand-dark': '#1a1a1a',
  '--color-brand-text': '#333333',
  '--color-brand-light': '#f9f9f9',
  '--color-brand-accent': '#fceeb5',
};

const STORAGE_KEY = 'ksebe-theme-settings';

export const applyTheme = (colors: ThemeColors) => {
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

export const saveTheme = (colors: ThemeColors) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
  applyTheme(colors);
};

export const loadTheme = (): ThemeColors => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Merge with default to ensure all keys exist
      return { ...DEFAULT_THEME, ...parsed };
    } catch (e) {
      return DEFAULT_THEME;
    }
  }
  return DEFAULT_THEME;
};

export const resetTheme = () => {
  localStorage.removeItem(STORAGE_KEY);
  applyTheme(DEFAULT_THEME);
  return DEFAULT_THEME;
};
