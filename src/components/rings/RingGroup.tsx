'use client';

import { motion } from 'framer-motion';
import { RingValues } from '@/types';

interface RingGroupProps {
  rings: RingValues;
  isAnimating?: boolean;
}

type RingKey = keyof RingValues;

interface RingConfig {
  key: RingKey;
  label: string;
  color: string;
  radius: number;
  thickness: number;
  delay: number;
}

const SIZE = 280;
const CENTER = SIZE / 2;

const RING_CONFIGS: RingConfig[] = [
  {
    key: 'circularity',
    label: 'Circularity',
    color: '#2d8a4e',
    radius: 105,
    thickness: 20,
    delay: 0.1,
  },
  {
    key: 'consumption',
    label: 'Consumption',
    color: '#5cb85c',
    radius: 78,
    thickness: 20,
    delay: 0.2,
  },
  {
    key: 'mobility',
    label: 'Mobility',
    color: '#8fd18f',
    radius: 53,
    thickness: 20,
    delay: 0.3,
  },
];

const containerVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export function RingGroup({ rings, isAnimating = false }: RingGroupProps) {
  return (
    <motion.div
      className="relative w-[240px] h-[240px] sm:w-[280px] sm:h-[280px]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 m-auto"
      >
        {RING_CONFIGS.map((ring) => {
          const raw = rings[ring.key] ?? 0;
          const progress = Math.max(0, Math.min(1, raw / 100));
          const circumference = 2 * Math.PI * ring.radius;

          return (
            <g key={ring.key}>
              {/* Background track */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={ring.radius}
                stroke="rgba(45,138,78,0.08)"
                strokeWidth={ring.thickness}
                strokeLinecap="round"
                fill="none"
              />

              {/* Progress arc */}
              <motion.circle
                cx={CENTER}
                cy={CENTER}
                r={ring.radius}
                stroke={ring.color}
                strokeWidth={ring.thickness}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                transform={`rotate(-90 ${CENTER} ${CENTER})`}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference * (1 - progress) }}
                transition={{
                  duration: 1.2,
                  delay: ring.delay,
                  ease: [0.4, 0.0, 0.2, 1],
                }}
              />
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
}
