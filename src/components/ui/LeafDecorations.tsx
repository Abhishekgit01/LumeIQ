'use client';

import { Leaf } from 'lucide-react';

export function LeafSVG({ className = '', rotate = 0, opacity = 0.07 }: { className?: string; rotate?: number; opacity?: number }) {
  return (
    <svg className={className} style={{ transform: `rotate(${rotate}deg)` }} viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 0C50 0 90 30 90 70C90 110 50 140 50 140C50 140 10 110 10 70C10 30 50 0 50 0Z" fill="currentColor" opacity={opacity} />
      <path d="M50 20C50 20 50 140 50 140" stroke="currentColor" strokeWidth="1.5" opacity={opacity * 1.3} />
      <path d="M50 50C35 45 20 55 20 55" stroke="currentColor" strokeWidth="1" opacity={opacity} />
      <path d="M50 70C65 65 80 75 80 75" stroke="currentColor" strokeWidth="1" opacity={opacity} />
      <path d="M50 90C35 85 25 95 25 95" stroke="currentColor" strokeWidth="1" opacity={opacity} />
    </svg>
  );
}

export function SmallLeaf({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" opacity="0.12">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 8.5-3.5 9-8.5.5-5-1-6.5-1-6.5s-1 1-4 3" />
    </svg>
  );
}

export function TinyLeaf({ className = '' }: { className?: string }) {
  return <Leaf className={`w-3 h-3 text-[#2d8a4e] opacity-[0.1] ${className}`} />;
}

export function LeafBranch({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 20 C40 20 80 20 120 20" stroke="#2d8a4e" strokeWidth="0.8" opacity="0.06" />
      <path d="M20 20 C15 12 8 14 8 14 C8 14 14 18 20 20" fill="#2d8a4e" opacity="0.06" />
      <path d="M40 20 C45 12 52 14 52 14 C52 14 46 18 40 20" fill="#2d8a4e" opacity="0.05" />
      <path d="M60 20 C55 28 48 26 48 26 C48 26 54 22 60 20" fill="#5cb85c" opacity="0.05" />
      <path d="M80 20 C85 12 92 14 92 14 C92 14 86 18 80 20" fill="#2d8a4e" opacity="0.04" />
      <path d="M100 20 C95 28 88 26 88 26 C88 26 94 22 100 20" fill="#8fd18f" opacity="0.05" />
    </svg>
  );
}

export function CardLeaves({ variant = 'a' }: { variant?: 'a' | 'b' | 'c' | 'd' }) {
  if (variant === 'a') return (
    <>
      <SmallLeaf className="absolute top-2 right-3 text-[#2d8a4e] rotate-[-20deg]" />
      <TinyLeaf className="absolute bottom-3 left-4 rotate-[40deg]" />
    </>
  );
  if (variant === 'b') return (
    <>
      <LeafSVG className="absolute top-[-15px] right-[-8px] w-12 h-16 text-[#2d8a4e]" rotate={-25} opacity={0.05} />
      <SmallLeaf className="absolute bottom-2 right-4 text-[#5cb85c] rotate-[30deg]" size={12} />
    </>
  );
  if (variant === 'c') return (
    <>
      <SmallLeaf className="absolute top-2 left-3 text-[#8fd18f] rotate-[15deg]" size={14} />
      <SmallLeaf className="absolute bottom-2 right-3 text-[#2d8a4e] rotate-[-25deg]" size={12} />
      <TinyLeaf className="absolute top-3 right-5 rotate-[60deg]" />
    </>
  );
  return (
    <>
      <LeafSVG className="absolute bottom-[-12px] left-[-6px] w-10 h-14 text-[#5cb85c]" rotate={140} opacity={0.04} />
      <SmallLeaf className="absolute top-2 right-3 text-[#2d8a4e] rotate-[-10deg]" />
    </>
  );
}

export function FloatingLeaves() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <LeafSVG className="absolute top-[3%] right-[2%] w-28 h-36 text-[#2d8a4e]" rotate={-20} opacity={0.04} />
      <LeafSVG className="absolute top-[35%] left-[1%] w-24 h-32 text-[#2d8a4e]" rotate={30} opacity={0.035} />
      <LeafSVG className="absolute bottom-[8%] right-[4%] w-20 h-28 text-[#5cb85c]" rotate={15} opacity={0.04} />
      <LeafSVG className="absolute bottom-[35%] left-[6%] w-14 h-20 text-[#8fd18f]" rotate={-10} opacity={0.03} />
      <LeafSVG className="absolute top-[12%] left-[45%] w-12 h-16 text-[#2d8a4e]" rotate={45} opacity={0.025} />
      <LeafSVG className="absolute top-[60%] right-[12%] w-16 h-22 text-[#5cb85c]" rotate={-35} opacity={0.03} />
      <LeafSVG className="absolute top-[80%] left-[30%] w-10 h-14 text-[#2d8a4e]" rotate={55} opacity={0.025} />
      <LeafBranch className="absolute top-[20%] right-0 w-[200px] h-[40px] hidden lg:block" />
      <LeafBranch className="absolute top-[50%] left-0 w-[180px] h-[40px] hidden lg:block" />
      <LeafBranch className="absolute top-[75%] right-[5%] w-[160px] h-[40px] hidden lg:block" />
      <SmallLeaf className="absolute top-[25%] right-[20%] text-[#2d8a4e] rotate-[45deg]" size={20} />
      <SmallLeaf className="absolute top-[45%] left-[15%] text-[#5cb85c] rotate-[-30deg]" size={18} />
      <SmallLeaf className="absolute bottom-[20%] left-[40%] text-[#8fd18f] rotate-[20deg]" size={16} />
      <SmallLeaf className="absolute top-[70%] right-[30%] text-[#2d8a4e] rotate-[-50deg]" size={14} />
    </div>
  );
}

export function SectionHeader({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h3 className="text-[20px] font-semibold text-[#1a2e1a]">{children}</h3>
      {icon || <Leaf className="w-4 h-4 text-[#2d8a4e]/20" />}
      <SmallLeaf className="text-[#2d8a4e] rotate-[-15deg]" size={10} />
    </div>
  );
}

export function LeafDivider() {
  return (
    <div className="leaf-divider">
      <Leaf className="w-4 h-4 text-[#2d8a4e]/15 shrink-0" />
    </div>
  );
}
