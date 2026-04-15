import { createContext, useContext, useEffect, useState } from 'react';
import { MantineProvider, ColorScheme, createTheme } from '@mantine/core';
import { useAuth } from '../lib/auth';

interface ThemeContextType {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
  primaryColor: string;
  secondaryColor: string;
  setPartyColors: (primary: string, secondary: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { activePolitician } = useAuth();
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const [primaryColor, setPrimaryColor] = useState('#00d4aa');
  const [secondaryColor, setSecondaryColor] = useState('#1e88e5');

  useEffect(() => {
    // Set party colors from active politician
    if (activePolitician?.color_primary) {
      setPrimaryColor(activePolitician.color_primary);
      document.documentElement.style.setProperty('--color-primary', activePolitician.color_primary);
    }
    if (activePolitician?.color_secondary) {
      setSecondaryColor(activePolitician.color_secondary);
      document.documentElement.style.setProperty('--color-secondary', activePolitician.color_secondary);
    }
  }, [activePolitician]);

  useEffect(() => {
    // Apply dark mode class
    if (colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [colorScheme]);

  const toggleColorScheme = () => {
    setColorScheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setPartyColors = (primary: string, secondary: string) => {
    setPrimaryColor(primary);
    setSecondaryColor(secondary);
    document.documentElement.style.setProperty('--color-primary', primary);
    document.documentElement.style.setProperty('--color-secondary', secondary);
  };

  const theme = createTheme({
    colors: {
      primary: [
        `${primaryColor}15`,
        `${primaryColor}30`,
        `${primaryColor}45`,
        `${primaryColor}60`,
        `${primaryColor}75`,
        primaryColor,
        `${primaryColor}cc`,
        `${primaryColor}dd`,
        `${primaryColor}ee`,
        `${primaryColor}ff`,
      ],
    },
    primaryColor: 'primary',
    defaultRadius: 'md',
    cursorType: 'pointer',
    fontFamily: 'Inter, sans-serif',
    headings: {
      fontFamily: 'Space Grotesk, sans-serif',
      fontWeight: '700',
    },
  });

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleColorScheme, primaryColor, secondaryColor, setPartyColors }}>
      <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
