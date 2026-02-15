'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Camera, Upload, CheckCircle, X, Leaf, Shield,
  AlertTriangle, Sparkles, Receipt, Image as ImageIcon
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useExtensionStore } from '@/store/useExtensionStore';
import { ScannedProduct } from '@/types/extensions';
import { MOCK_COMPANIES } from '@/data/mockCompanies';

/**
 * Purchase Confirmation Flow
 * Overlays on ScanView after a product is scanned.
 *
 * Flow:
 * 1. Product scanned → "Did you purchase this?"
 * 2. User confirms → Trust Score calculated, IQ updated
 * 3. Optional: Upload receipt photo → Trust boost
 */

interface PurchasePromptProps {
  product: ScannedProduct;
  onDismiss: () => void;
  onPurchaseConfirmed: (iqDelta: number) => void;
}

export function PurchasePrompt({ product, onDismiss, onPurchaseConfirmed }: PurchasePromptProps) {
  const { user } = useStore();
  const { activateMode, updateUser } = useStore();
  const {
    confirmPurchase,
    uploadReceipt,
    dismissPurchasePrompt,
    currentTrustScore,
    showReceiptUpload,
    dismissReceiptUpload,
  } = useExtensionStore();

  const [step, setStep] = useState<'confirm' | 'receipt' | 'done'>('confirm');
  const [uploading, setUploading] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [iqGained, setIqGained] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const company = product.sustainableCompanyId
    ? MOCK_COMPANIES.find(c => c.id === product.sustainableCompanyId)
    : null;

  const handleConfirmPurchase = () => {
    if (!user) return;

    const confirmation = confirmPurchase(user.id, user.IQ, user.rings);
    if (confirmation) {
      setIqGained(confirmation.impactIncrement);

      // Update IQ via main store (event-based — no direct IQ modification)
      // Apply as consumption ring change
      const ringDelta = confirmation.impactIncrement;
      const newRings = {
        ...user.rings,
        consumption: Math.min(100, user.rings.consumption + ringDelta),
      };
      const newIQ = Math.min(100, user.IQ + (ringDelta * 0.15)); // Scaled for IQ

      updateUser({
        IQ: Math.round(newIQ * 10) / 10,
        rings: newRings,
      });

      onPurchaseConfirmed(ringDelta * 0.15);
      setStep('receipt');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    const photo = await uploadReceipt(user.id, file, product.id);
    setUploading(false);

    if (photo) {
      // Trust boost from receipt
      const trustBoost = 0.15;
      const bonusIQ = Math.round(trustBoost * 2 * 10) / 10; // Additional IQ from receipt
      setIqGained(prev => prev + bonusIQ);

      updateUser({
        IQ: Math.min(100, user.IQ + bonusIQ),
      });

      setStep('done');
    }
  };

  const handleSkipReceipt = () => {
    setStep('done');
  };

  const handleDone = () => {
    dismissPurchasePrompt();
    dismissReceiptUpload();
    onDismiss();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end justify-center"
        onClick={handleDone}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-[430px] bg-[var(--ios-card)] rounded-t-[20px] p-5 pb-[calc(20px+env(safe-area-inset-bottom))]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="w-10 h-1 bg-[var(--ios-separator)] rounded-full mx-auto mb-4" />

          {/* ─── Step: Confirm Purchase ─── */}
          {step === 'confirm' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              {/* Product Info */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-[22px] ${
                  product.isSustainable
                    ? 'bg-[#30d158]/10'
                    : 'bg-[var(--ios-separator)]'
                }`}>
                  {company?.logoPlaceholder || (product.isSustainable ? '🌿' : '📦')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-semibold text-[var(--ios-label)] truncate">{product.name}</p>
                  <p className="text-[13px] text-[var(--ios-secondary-label)]">{product.brand}</p>
                  {company && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Leaf className="w-3 h-3 text-[#30d158]" />
                      <span className="text-[11px] text-[#30d158] font-medium">
                        Sustainable Partner ({company.sustainabilityWeight}x weight)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Question */}
              <div className="p-4 rounded-[14px] bg-[var(--ios-bg)]">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="w-5 h-5 text-[var(--ios-blue)]" />
                  <p className="text-[15px] font-semibold text-[var(--ios-label)]">Did you purchase this?</p>
                </div>
                <p className="text-[13px] text-[var(--ios-secondary-label)]">
                  Confirming a purchase will update your Impact Quotient based on the product&apos;s sustainability score.
                </p>
              </div>

              {/* Trust Info */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[var(--ios-bg)]">
                <Shield className="w-4 h-4 text-[var(--ios-blue)]" />
                <span className="text-[12px] text-[var(--ios-secondary-label)]">
                  Trust Score: <strong className="text-[var(--ios-label)]">{(currentTrustScore * 100).toFixed(0)}%</strong>
                  {' · '}Uploading a receipt will boost your trust score.
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDone}
                  className="flex-1 py-3 rounded-[12px] bg-[var(--ios-bg)] text-[var(--ios-secondary-label)] text-[15px] font-semibold ios-press"
                >
                  No
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  className="flex-1 py-3 rounded-[12px] bg-[#30d158] text-white text-[15px] font-semibold ios-press active:scale-[0.98]"
                >
                  Yes, I purchased
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── Step: Receipt Upload ─── */}
          {step === 'receipt' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <div className="text-center">
                <CheckCircle className="w-10 h-10 text-[#30d158] mx-auto mb-2" />
                <p className="text-[16px] font-bold text-[var(--ios-label)]">Purchase Confirmed!</p>
                <p className="text-[14px] text-[#30d158] font-semibold">+{iqGained.toFixed(1)} Impact Points</p>
              </div>

              <div className="p-4 rounded-[14px] bg-[var(--ios-bg)]">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-5 h-5 text-[var(--ios-orange)]" />
                  <p className="text-[15px] font-semibold text-[var(--ios-label)]">Upload Receipt (Optional)</p>
                </div>
                <p className="text-[13px] text-[var(--ios-secondary-label)]">
                  Upload a photo of your receipt for a +15% trust score boost and bonus IQ points.
                </p>
              </div>

              {/* Preview */}
              {receiptPreview && (
                <div className="relative rounded-[12px] overflow-hidden">
                  <img src={receiptPreview} alt="Receipt" className="w-full h-40 object-cover" />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSkipReceipt}
                  className="flex-1 py-3 rounded-[12px] bg-[var(--ios-bg)] text-[var(--ios-secondary-label)] text-[15px] font-semibold ios-press"
                >
                  Skip
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 py-3 rounded-[12px] bg-[var(--ios-blue)] text-white text-[15px] font-semibold ios-press active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Take Photo'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── Step: Done ─── */}
          {step === 'done' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 8, delay: 0.1 }}
              >
                <Sparkles className="w-12 h-12 text-[#ff9f0a] mx-auto mb-2" />
              </motion.div>
              <p className="text-[18px] font-bold text-[var(--ios-label)]">Impact Updated!</p>
              <p className="text-[14px] text-[var(--ios-secondary-label)]">
                You earned <strong className="text-[#30d158]">+{iqGained.toFixed(1)}</strong> impact points
                {receiptPreview ? ' (including receipt boost)' : ''}.
              </p>

              {product.isSustainable && (
                <div className="p-3 rounded-[12px] bg-[#30d158]/10">
                  <div className="flex items-center justify-center gap-2">
                    <Leaf className="w-4 h-4 text-[#30d158]" />
                    <span className="text-[13px] text-[#30d158] font-medium">
                      Sustainable purchase bonus applied! Check Eco Rewards for new coupons.
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleDone}
                className="w-full py-3 rounded-[12px] bg-[var(--ios-blue)] text-white text-[15px] font-semibold ios-press active:scale-[0.98]"
              >
                Done
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
