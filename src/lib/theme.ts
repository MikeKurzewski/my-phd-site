import { useEffect } from 'react';

export function setTheme(theme:  'dark-teal' | 'dark-blue' | 'minimal') {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

export function initTheme() {
  // Check if theme is stored in localStorage
  const storedTheme = localStorage.getItem('theme') as 'dark-teal' | 'dark-blue' | 'minimal' | null;

  if (storedTheme) {
    setTheme(storedTheme);
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark-teal' : 'minimal');
  }
}

export function useTheme(theme: 'dark-teal' | 'dark-blue' | 'minimal') {
  useEffect(() => {
    setTheme(theme);
  }, [theme]);
}
