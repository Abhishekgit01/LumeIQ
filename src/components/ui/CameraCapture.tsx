'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RotateCcw, Zap, SwitchCamera, ImageIcon } from 'lucide-react';

interface CameraCaptureProps {
  open: boolean;
  onClose: () => void;
  onCapture: (base64: string) => void;
  title?: string;
  subtitle?: string;
}

export function CameraCapture({ open, onClose, onCapture, title = 'Take Photo', subtitle = 'Point camera at the item' }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    // Stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device. Use the gallery button to upload a photo instead.');
      } else if (err.name === 'NotReadableError') {
        setCameraError('Camera is in use by another app. Close other apps using the camera and try again.');
      } else {
        setCameraError(`Camera error: ${err.message || 'Unknown error'}. Try uploading a photo instead.`);
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  useEffect(() => {
    if (open) {
      setCaptured(null);
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCaptured(dataUrl);
    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
  }, []);

  const handleConfirm = useCallback(() => {
    if (captured) {
      const base64 = captured.split(',')[1];
      onCapture(base64);
      setCaptured(null);
      stopCamera();
      onClose();
    }
  }, [captured, onCapture, onClose, stopCamera]);

  const handleRetake = useCallback(() => {
    setCaptured(null);
    startCamera(facingMode);
  }, [facingMode, startCamera]);

  const handleFlipCamera = useCallback(() => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacing);
    startCamera(newFacing);
  }, [facingMode, startCamera]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCaptured(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm z-10">
          <button onClick={() => { stopCamera(); onClose(); }} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-white">{title}</p>
            <p className="text-[11px] text-white/60">{subtitle}</p>
          </div>
          <button onClick={handleFlipCamera} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <SwitchCamera className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="flex-1 relative overflow-hidden bg-black">
          {!captured ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Scanning overlay */}
              {cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[280px] h-[280px] relative">
                    {/* Corner brackets */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-3 border-l-3 border-[#34c759] rounded-tl-xl" style={{ borderWidth: '3px' }} />
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-3 border-r-3 border-[#34c759] rounded-tr-xl" style={{ borderWidth: '3px' }} />
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-3 border-l-3 border-[#34c759] rounded-bl-xl" style={{ borderWidth: '3px' }} />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-3 border-r-3 border-[#34c759] rounded-br-xl" style={{ borderWidth: '3px' }} />
                    {/* Scanning line animation */}
                    <motion.div
                      className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#34c759] to-transparent"
                      animate={{ top: ['10%', '90%', '10%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
              )}
              {/* Flash overlay */}
              <AnimatePresence>
                {flash && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 bg-white z-20"
                  />
                )}
              </AnimatePresence>
              {/* Loading/Error states */}
              {!cameraReady && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    className="w-12 h-12 border-3 border-white/20 border-t-[#34c759] rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ borderWidth: '3px' }}
                  />
                  <p className="text-[14px] text-white/70 mt-4">Starting camera...</p>
                </div>
              )}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
                  <Camera className="w-16 h-16 text-white/20 mb-4" />
                  <p className="text-[14px] text-white/80 text-center mb-6 leading-relaxed">{cameraError}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => startCamera(facingMode)}
                      className="px-5 py-2.5 rounded-full bg-[#34c759] text-white text-[14px] font-semibold flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retry
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2.5 rounded-full bg-white/15 text-white text-[14px] font-semibold flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Gallery
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Preview captured photo */
            <img src={captured} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </div>

        {/* Controls */}
        <div className="bg-black/80 backdrop-blur-sm px-6 py-5 pb-8">
          {!captured ? (
            <div className="flex items-center justify-between">
              {/* Gallery button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
              >
                <ImageIcon className="w-5 h-5 text-white" />
              </button>
              {/* Capture button */}
              <button
                onClick={handleCapture}
                disabled={!cameraReady}
                className="w-[72px] h-[72px] rounded-full border-4 border-white flex items-center justify-center disabled:opacity-30"
              >
                <div className="w-[58px] h-[58px] rounded-full bg-white" />
              </button>
              {/* Placeholder for balance */}
              <div className="w-12 h-12" />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={handleRetake}
                className="px-6 py-3 rounded-full bg-white/15 text-white text-[15px] font-semibold flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </button>
              <button
                onClick={handleConfirm}
                className="px-8 py-3 rounded-full bg-[#34c759] text-white text-[15px] font-semibold flex items-center gap-2 shadow-lg"
              >
                <Zap className="w-4 h-4" />
                Verify Photo
              </button>
            </div>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
        {/* Hidden file input for gallery */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </motion.div>
    </AnimatePresence>
  );
}
