import { motion } from 'framer-motion';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

const DarkModeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
className="relative p-2 rounded-lg bg-neutral-100 dark:bg-dark-bg-secondary text-neutral-600 dark:text-dark-text-secondary hover:bg-neutral-200 dark:hover:bg-dark-bg-tertiary transition-colors duration-300"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
      </motion.div>
    </motion.button>
  );
};

export default DarkModeToggle;
