import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * PageTransition Component
 * Animation System 3: Provides a subtle, fast 250ms fade-and-slide
 * transition between major application routes without layout shifting.
 * Gracefully disables in prefers-reduced-motion environments.
 */
export const PageTransition = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};
