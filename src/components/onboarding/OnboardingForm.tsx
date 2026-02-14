'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { COMMUTE_TYPES, DIET_TYPES, CLOTHING_FREQUENCIES, CITIES, Baseline } from '@/types';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';

type Step = 'commuteType' | 'clothingFrequency' | 'dietType' | 'city';

const steps: { key: Step; title: string; subtitle: string }[] = [
  { key: 'commuteType', title: 'How do you commute?', subtitle: 'Your primary mode of transportation' },
  { key: 'clothingFrequency', title: 'Shopping habits?', subtitle: 'How often do you buy new clothes' },
  { key: 'dietType', title: 'Your diet type?', subtitle: 'What best describes your eating habits' },
  { key: 'city', title: 'Your city?', subtitle: 'For local leaderboard comparison' }
];

export function OnboardingForm() {
  const { completeOnboarding } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Baseline>>({});
  
  const step = steps[currentStep];
  
  const handleSelect = (value: string) => {
    setFormData(prev => ({ ...prev, [step.key]: value }));
    
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }, 300);
  };
  
  const handleComplete = () => {
    if (formData.commuteType && formData.clothingFrequency && formData.dietType && formData.city) {
      completeOnboarding(formData as Baseline);
    }
  };
  
  const isComplete = formData.commuteType && formData.clothingFrequency && formData.dietType && formData.city;
  
  const getOptions = () => {
    switch (step.key) {
      case 'commuteType':
        return COMMUTE_TYPES;
      case 'clothingFrequency':
        return CLOTHING_FREQUENCIES;
      case 'dietType':
        return DIET_TYPES;
      case 'city':
        return CITIES.map(c => ({ value: c, label: c, impact: 0 }));
      default:
        return [];
    }
  };
  
  const options = getOptions();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5 py-10">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <div className="mx-auto mb-4 w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#2d8a4e] to-[#5cb85c] flex items-center justify-center">
          <Leaf className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-[28px] sm:text-[34px] font-bold text-[#1a2e1a] tracking-[-0.02em]">
          Set up your profile
        </h1>
        <p className="mt-1.5 text-[15px] text-[#5e7a5e] max-w-md mx-auto">
          Four quick questions to calculate your starting IQ.
        </p>
      </motion.div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-10">
        {steps.map((_, index) => (
          <motion.div
            key={index}
            className="h-1 rounded-full"
            animate={{
              backgroundColor: index <= currentStep ? '#2d8a4e' : 'rgba(45,138,78,0.12)',
              width: index === currentStep ? 24 : 8
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      
      {/* Step content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md w-full"
      >
        <h2 className="text-[22px] font-bold text-[#1a2e1a] mb-1 tracking-[-0.01em]">
          {step.title}
        </h2>
        <p className="text-[#5e7a5e] text-[15px] mb-8">
          {step.subtitle}
        </p>
        
        {/* Options */}
        <div className="space-y-2">
          {options.map((option, index) => {
            const isSelected = formData[step.key] === option.value;
            return (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-4 py-3.5 text-left flex items-center justify-between rounded-[14px] transition-all border
                  ${isSelected 
                    ? 'bg-[#2d8a4e]/8 border-[#2d8a4e]/25' 
                    : 'bg-white border-[#2d8a4e]/8 hover:bg-[#2d8a4e]/5'
                  }
                `}
              >
                <span className="text-[15px] font-medium text-[#1a2e1a]">{option.label}</span>
                <div className="flex items-center gap-2">
                  {option.impact !== 0 && (
                    <span className={`text-[13px] font-medium ${option.impact > 0 ? 'text-[#2d8a4e]' : 'text-[#d94f4f]'}`}>
                      {option.impact > 0 ? '+' : ''}{option.impact}
                    </span>
                  )}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-[#2d8a4e] flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
      
      {/* Complete button */}
      {currentStep === steps.length - 1 && isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10"
        >
          <Button
            onClick={handleComplete}
            className="bg-[#2d8a4e] hover:bg-[#247a42] text-white font-semibold px-10 py-6 text-[17px] rounded-full"
          >
            Calculate My IQ
          </Button>
        </motion.div>
      )}
      
      {/* Back button */}
      {currentStep > 0 && (
        <button
          onClick={() => setCurrentStep(prev => prev - 1)}
          className="mt-8 text-[#5e7a5e] hover:text-[#1a2e1a] transition-colors text-[15px]"
        >
          Back
        </button>
      )}
    </div>
  );
}
