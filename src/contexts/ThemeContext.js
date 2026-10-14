import { createContext, useContext, useEffect, useState } from 'react';

const THEME_KEY = 'mddti-portal-theme';
const ThemeContext = createContext(null);

function readSavedTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return savedTheme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readSavedTheme);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // The theme still works for the current render when storage is unavailable.
    }
  }, [theme]);

  const toggleTheme = () => setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <label className="theme-toggle">
      <span>Dark mode</span>
      <input
        type="checkbox"
        role="switch"
        aria-label="Dark theme"
        checked={theme === 'dark'}
        onChange={toggleTheme}
      />
    </label>
  );
}