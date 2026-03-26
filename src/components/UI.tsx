import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, onClick }) => (
  <motion.div
    whileTap={onClick ? { scale: 0.98 } : undefined}
    onClick={onClick}
    className={cn("glass-card p-4", className)}
  >
    {children}
  </motion.div>
);

interface NeonButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({ children, className, onClick, variant = 'primary', disabled }) => {
  const variants = {
    primary: "bg-accent text-black font-bold neon-glow",
    secondary: "bg-white/20 text-white backdrop-blur-md",
    outline: "border-2 border-accent text-accent bg-transparent"
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={cn(
        "px-6 py-3 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2",
        variants[variant],
        disabled && "opacity-50 cursor-not-allowed grayscale",
        className
      )}
    >
      {children}
    </motion.button>
  );
};
