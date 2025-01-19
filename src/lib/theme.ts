import { useEffect } from 'react';

export function setTheme(theme: 'light-teal' | 'dark-teal' | 'light-blue' | 'dark-blue') {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

export function initTheme() {
  // Check if theme is stored in localStorage
  const storedTheme = localStorage.getItem('theme') as 'light-teal' | 'dark-teal' | 'light-blue' | 'dark-blue' | null;
  
  if (storedTheme) {
    setTheme(storedTheme);
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark-teal' : 'light-teal');
  }
}

export function useTheme(theme: 'light-teal' | 'dark-teal' | 'light-blue' | 'dark-blue') {
  useEffect(() => {
    setTheme(theme);
  }, [theme]);
}