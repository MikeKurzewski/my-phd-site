export const themes = {
  teal: {
    primary: {
      50: '240 253 250',   // teal-50
      100: '204 251 241',  // teal-100
      200: '153 246 228',  // teal-200
      300: '94 234 212',   // teal-300
      400: '45 212 191',   // teal-400
      500: '20 184 166',   // teal-500
      600: '13 148 136',   // teal-600
      700: '15 118 110',   // teal-700
      800: '17 94 89',     // teal-800
      900: '19 78 74',     // teal-900
      950: '4 47 46',      // teal-950
    },
    gradient: {
      start: '45 212 191',   // teal-400
      middle: '20 184 166',  // teal-500
      end: '13 148 136',     // teal-600
    },
    accent: {
      light: '94 234 212',   // teal-300
      main: '20 184 166',    // teal-500
      dark: '15 118 110',    // teal-700
    }
  }
} as const;

export type ThemeName = keyof typeof themes;

export function setTheme(themeName: ThemeName) {
  const theme = themes[themeName];
  const root = document.documentElement;

  // Set primary colors
  Object.entries(theme.primary).forEach(([key, value]) => {
    root.style.setProperty(`--color-primary-${key}`, value);
  });

  // Set gradient colors
  root.style.setProperty('--color-gradient-start', theme.gradient.start);
  root.style.setProperty('--color-gradient-middle', theme.gradient.middle);
  root.style.setProperty('--color-gradient-end', theme.gradient.end);

  // Set accent colors
  Object.entries(theme.accent).forEach(([key, value]) => {
    root.style.setProperty(`--color-accent-${key}`, value);
  });
}