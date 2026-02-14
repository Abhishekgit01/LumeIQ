'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface AnimatedRingProps {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
  delay?: number;
}

export function AnimatedRing({
  progress,
  color,
  size = 200,
  strokeWidth = 12,
  label,
  delay = 0
}: AnimatedRingProps) {
  const shouldReduceMotion = useReducedMotion();
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg
        width={size}
        height={size}
        className="absolute inset-0 rotate-[-90deg]"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
      </svg>
      
      {/* Animated progress ring */}
      <svg
        width={size}
        height={size}
        className="absolute inset-0 rotate-[-90deg]"
      >
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color}40)`
          }}
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: shouldReduceMotion ? strokeDashoffset : strokeDashoffset }}
          transition={{ 
            duration: shouldReduceMotion ? 0 : 1.5, 
            delay: shouldReduceMotion ? 0 : delay, 
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      </svg>
      
      {/* Label */}
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-[#8e8e93] uppercase tracking-wider">
            {label}
          </span>
        </div>
      )}
      
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`
        }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}
