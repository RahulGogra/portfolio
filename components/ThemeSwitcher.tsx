// components/ThemeSwitcher.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = themes.find(t => t.name === theme);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-secondary border-theme border rounded-lg text-secondary hover:text-primary transition-theme"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">{currentTheme?.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-48 bg-secondary border-theme border rounded-lg shadow-lg z-50"
          >
            {themes.map((themeOption) => (
              <motion.button
                key={themeOption.name}
                onClick={() => {
                  setTheme(themeOption.name);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-tertiary transition-theme first:rounded-t-lg last:rounded-b-lg flex items-center gap-3 ${
                  theme === themeOption.name ? 'text-primary' : 'text-secondary'
                }`}
                whileHover={{ x: 5 }}
              >
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${themeOption.colors}`} />
                <span>{themeOption.label}</span>
                {theme === themeOption.name && (
                  <motion.div
                    layoutId="selected-theme"
                    className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}