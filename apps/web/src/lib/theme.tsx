import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem('nethra-theme') as Theme) || 'system'
  })
  const [resolved, setResolved] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const root = window.document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const system = media.matches ? 'dark' : 'light'
      const resolvedNow = theme === 'system' ? system : theme
      setResolved(resolvedNow)
      root.classList.remove('light', 'dark')
      root.classList.add(resolvedNow)
      localStorage.setItem('nethra-theme', theme)
    }

    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)
  const toggle = () =>
    setThemeState((prev) => (prev === 'dark' || prev === 'system' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
