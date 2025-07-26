import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Moon, Sun, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Theme = 'dark' | 'light' | 'auto';

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (newTheme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // Auto theme - use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    
    // Dispatch custom event for components to listen to theme changes
    window.dispatchEvent(new CustomEvent('themeChange', { detail: newTheme }));
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-1 rounded-full bg-gray-100 dark:bg-gray-800">
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleThemeChange('light')}
        className={`rounded-full p-2 ${
          theme === 'light' 
            ? 'bg-white shadow-md text-gray-900' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
        title={t('theme.light', 'Light Theme')}
      >
        <Sun className="w-4 h-4" />
      </Button>
      
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleThemeChange('dark')}
        className={`rounded-full p-2 ${
          theme === 'dark' 
            ? 'bg-gray-900 shadow-md text-white' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
        title={t('theme.dark', 'Dark Theme')}
      >
        <Moon className="w-4 h-4" />
      </Button>
      
      <Button
        variant={theme === 'auto' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleThemeChange('auto')}
        className={`rounded-full p-2 ${
          theme === 'auto' 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-md text-white' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
        title={t('theme.auto', 'Auto Theme')}
      >
        <Palette className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Hook to get current theme
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme || 'dark';
    setTheme(savedTheme);

    const handleThemeChange = (event: CustomEvent<Theme>) => {
      setTheme(event.detail);
    };

    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, []);

  const isLight = theme === 'light' || (theme === 'auto' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return {
    theme,
    isLight,
    isDark,
    mounted
  };
}