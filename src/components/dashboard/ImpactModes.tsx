'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { IMPACT_MODES, ImpactMode } from '@/types';
import { useStore } from '@/store/useStore';
import { Search } from 'lucide-react';

export function ImpactModes() {
  const { activateMode } = useStore();
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  
  const handleModeClick = (modeId: string) => {
    setActiveMode(modeId);
    setShowUpload(true);
  };
  
  const handleConfirm = (modeId: string, verified: boolean) => {
    activateMode(modeId, verified);
    setActiveMode(null);
    setShowUpload(false);
  };
  
  const handleCancel = () => {
    setActiveMode(null);
    setShowUpload(false);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="w-full"
    >
      {/* Activities header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#2d8a4e]/8 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#2d8a4e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </div>
          <div>
            <h3 className="text-[17px] font-semibold text-[#1a2e1a]">Activities</h3>
            <p className="text-[12px] text-[#5e7a5e]">Tab and tag highlight</p>
          </div>
        </div>
        <button className="w-8 h-8 rounded-full bg-[#2d8a4e]/8 flex items-center justify-center">
          <Search className="w-4 h-4 text-[#5e7a5e]" />
        </button>
      </div>
      
      {/* Pill tags */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {IMPACT_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeClick(mode.id)}
            className={`
              shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all border
              ${activeMode === mode.id 
                ? 'bg-[#2d8a4e] text-white border-[#2d8a4e]' 
                : 'bg-white text-[#1a2e1a] border-[#2d8a4e]/12 hover:bg-[#2d8a4e]/5'
              }
            `}
          >
            {mode.name}
          </button>
        ))}
      </div>
      
      {/* Mode cards */}
      <div className="grid grid-cols-1 gap-2 mt-3">
        {IMPACT_MODES.map((mode, index) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            index={index}
            onClick={() => handleModeClick(mode.id)}
            isActive={activeMode === mode.id}
          />
        ))}
      </div>
      
      {/* Upload Sheet */}
      {showUpload && activeMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
          onClick={handleCancel}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full sm:max-w-sm bg-white rounded-t-[24px] sm:rounded-[24px]"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 pt-4 pb-8">
              <div className="w-9 h-1 rounded-full bg-[#2d8a4e]/15 mx-auto mb-5" />
              
              <h3 className="text-[20px] font-semibold text-[#1a2e1a]">
                Verify Your Impact
              </h3>
              <p className="text-[#5e7a5e] text-[15px] mt-1 mb-6">
                Upload a photo for +15% verified boost
              </p>
              
              <div className="card-inset py-8 text-center mb-6">
                <div className="text-4xl mb-2">📸</div>
                <p className="text-[#5e7a5e] text-[13px]">Tap to upload photo</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleConfirm(activeMode, false)}
                  className="flex-1 py-3.5 rounded-[14px] bg-[#2d8a4e]/8 text-[#1a2e1a] text-[15px] font-medium hover:bg-[#2d8a4e]/12 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={() => handleConfirm(activeMode, true)}
                  className="flex-1 py-3.5 rounded-[14px] bg-[#2d8a4e] text-white text-[15px] font-semibold hover:bg-[#247a42] transition-colors"
                >
                  Verify +15%
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

function ModeCard({ 
  mode, 
  index, 
  onClick, 
  isActive 
}: { 
  mode: ImpactMode; 
  index: number;
  onClick: () => void;
  isActive: boolean;
}) {
  const ringColors: Record<string, string> = {
    circularity: '#2d8a4e',
    consumption: '#5cb85c',
    mobility: '#8fd18f'
  };
  
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.05 }}
      className={`
        w-full card-surface-sm px-4 py-3.5 text-left transition-all
        ${isActive ? 'ring-2' : ''}
      `}
      style={isActive ? { '--tw-ring-color': ringColors[mode.ring] } as React.CSSProperties : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[20px]">{mode.icon}</span>
          <div>
            <p className="text-[15px] font-medium text-[#1a2e1a]">{mode.name}</p>
            <p className="text-[12px] text-[#5e7a5e]">{mode.description}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div 
            className="text-[17px] font-semibold tabular-nums"
            style={{ color: ringColors[mode.ring] }}
          >
            +{mode.basePoints}
          </div>
          <div className="text-[11px] text-[#5e7a5e] tabular-nums">
            x{mode.multiplier}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
