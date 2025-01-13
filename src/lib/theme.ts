import { useEffect } from 'react';

export function setTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

export function initTheme() {
  // Check if theme is stored in localStorage
  const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  
  if (storedTheme) {
    setTheme(storedTheme);
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }
}

export function useTheme(theme: 'light' | 'dark') {
  useEffect(() => {
    setTheme(theme);
  }, [theme]);
}