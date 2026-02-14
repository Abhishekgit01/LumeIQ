'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { IQChart } from '@/components/profile/IQChart';
import { PhotoGallery } from '@/components/profile/PhotoGallery';
import { Download, ChevronRight } from 'lucide-react';
import { CardLeaves, TinyLeaf, SmallLeaf } from '@/components/ui/LeafDecorations';

export function ProfileView() {
  const { user, resetUser } = useStore();
  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
      {/* Profile Card */}
      <div className="card-surface p-5">
        <CardLeaves variant="b" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-[56px] h-[56px] rounded-[16px] bg-gradient-to-br from-[#2d8a4e] to-[#5cb85c] flex items-center justify-center">
            <span className="text-[22px] font-bold text-white tabular-nums">{Math.round(user.IQ)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-semibold text-[#1a2e1a]">Impact Profile</h2>
              <SmallLeaf className="text-[#2d8a4e] rotate-[-15deg]" size={12} />
            </div>
            <p className="text-[13px] text-[#5e7a5e]">{user.baseline.city} - Since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[12px] font-medium text-[#2d8a4e] bg-[#2d8a4e]/10 px-2 py-0.5 rounded-full">{user.tier}</span>
              <span className="text-[12px] text-[#5e7a5e]">{user.dailyLogs.length} days logged</span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-4 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Days Active', value: user.dailyLogs.length.toString(), color: '#1a2e1a' },
            { label: 'Circularity', value: `${Math.round(user.rings.circularity)}%`, color: '#2d8a4e' },
            { label: 'Mobility', value: `${Math.round(user.rings.mobility)}%`, color: '#5cb85c' },
          ].map((stat) => (
            <div key={stat.label} className="card-surface-sm p-3 text-center relative">
              <TinyLeaf className="absolute top-1.5 right-2 rotate-[20deg]" />
              <div className="text-[22px] font-bold tabular-nums relative z-10" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[11px] text-[#5e7a5e] mt-0.5 relative z-10">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="card-surface p-5">
          <CardLeaves variant="c" />
          <h3 className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#5e7a5e] mb-4 relative z-10">Baseline</h3>
          <div className="space-y-3.5 relative z-10">
            {[
              { label: 'Commute', value: user.baseline.commuteType },
              { label: 'Diet', value: user.baseline.dietType },
              { label: 'Shopping', value: user.baseline.clothingFrequency },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-[15px] text-[#5e7a5e]">{item.label}</span>
                <span className="text-[15px] font-medium capitalize text-[#1a2e1a]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <IQChart user={user} days={30} />
      <PhotoGallery user={user} />

      <div>
        <h3 className="text-[20px] font-semibold mb-3 text-[#1a2e1a]">Activities reports</h3>
        <div className="card-surface-sm flex items-center gap-3 px-4 py-3.5 relative">
          <CardLeaves variant="d" />
          <div className="w-10 h-10 rounded-[10px] bg-[#2d8a4e]/8 flex items-center justify-center relative z-10">
            <Download className="w-5 h-5 text-[#5e7a5e]" />
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-[15px] font-medium text-[#1a2e1a]">Download full report</p>
            <p className="text-[12px] text-[#5e7a5e]">Updated {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#c8dfc8] relative z-10" />
        </div>
      </div>

      <button onClick={resetUser} className="w-full py-3.5 text-center text-[#d94f4f] hover:text-[#b83b3b] transition-colors text-[15px] font-medium rounded-[14px] bg-[#d94f4f]/5 border border-[#d94f4f]/10">
        Reset Profile
      </button>
    </motion.div>
  );
}
