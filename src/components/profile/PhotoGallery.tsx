'use client';

import { motion } from 'framer-motion';
import { User } from '@/types';

interface PhotoGalleryProps {
  user: User;
}

export function PhotoGallery({ user }: PhotoGalleryProps) {
  const photos = user.photoGallery.length > 0 
    ? user.photoGallery 
    : ['demo-plant-based-1.jpg', 'demo-thrift-1.jpg', 'demo-repair-1.jpg'];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[17px] font-semibold text-[#1a2e1a]">Verified Photos</h3>
        <span className="text-[#2d8a4e] text-[12px] font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2d8a4e]" />
          {photos.length} Verified
        </span>
      </div>
      
      <div className="card-surface p-3">
        <div className="grid grid-cols-3 gap-2">
          {photos.slice(0, 6).map((photo, index) => (
            <motion.div
              key={photo}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="aspect-square rounded-[12px] bg-[#2d8a4e]/5 overflow-hidden relative group cursor-pointer"
            >
              <div className="w-full h-full flex items-center justify-center text-[28px]">
                {['🥗', '👕', '🔧', '🚌', '✨', '🌱'][index] || '📸'}
              </div>
              
              <div className="absolute top-1.5 right-1.5">
                <div className="w-4 h-4 rounded-full bg-[#2d8a4e] flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-[#2d8a4e]/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[12px] flex items-center justify-center">
                <span className="text-white text-[11px] font-medium">+15% Verified</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
