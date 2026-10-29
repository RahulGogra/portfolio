'use client';

import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-primary/80 backdrop-blur-md border-theme border rounded-full">
      {themes.map((themeOption) => (
        <motion.button
          key={themeOption.name}
          onClick={() => setTheme(themeOption.name)}
          className={`relative w-6 h-6 rounded-full bg-gradient-to-br ${themeOption.colors} shadow-inner cursor-pointer`}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          title={themeOption.label}
          aria-label={`${themeOption.label} theme`}
          aria-pressed={theme === themeOption.name}
        >
          {theme === themeOption.name && (
            <motion.div
              layoutId="active-theme-ring"
              className="absolute -inset-1 rounded-full border-2 border-primary border-opacity-50 ring-2 ring-white/20"
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}