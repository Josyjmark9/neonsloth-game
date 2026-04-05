import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, RotateCw } from 'lucide-react';

export default function OrientationOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="relative mb-8">
        <motion.div
          animate={{ rotate: 90 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <Smartphone className="w-24 h-24 text-pink-500" />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute -top-4 -right-4"
        >
          <RotateCw className="w-12 h-12 text-cyan-400 opacity-50" />
        </motion.div>
      </div>

      <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Landscape Mode Recommended</h2>
      <p className="text-slate-400 max-w-xs mx-auto leading-relaxed font-mono text-sm uppercase tracking-widest">
        For the ultimate neonSLOTH experience, please rotate your device to landscape orientation.
      </p>

      <div className="mt-12 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" />
        <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.2s]" />
        <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]" />
      </div>
    </motion.div>
  );
}
