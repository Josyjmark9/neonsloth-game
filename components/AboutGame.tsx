import React from 'react';
import { motion } from 'motion/react';
import { X, Gamepad2, Zap, Trophy, MousePointer2, Keyboard } from 'lucide-react';

interface AboutGameProps {
  onClose: () => void;
}

export default function AboutGame({ onClose }: AboutGameProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/10 border border-white/20 rounded-[40px] p-10 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors z-10"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="space-y-10">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-pink-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-pink-500/20">
              <Gamepad2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">How to Play</h2>
            <p className="text-slate-400 text-lg">Master the neon void and claim your place among legends.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center gap-3 text-pink-500">
                <Zap className="w-6 h-6" />
                <h3 className="font-black uppercase tracking-widest text-sm">The Goal</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                You are the Neon Sloth. Your mission is to survive as long as possible in the digital void. 
                Dodge the deadly red thorns and cyber-birds while navigating the neon city.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center gap-3 text-cyan-400">
                <Keyboard className="w-6 h-6" />
                <h3 className="font-black uppercase tracking-widest text-sm">Controls</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 uppercase">Jump / Flap</span>
                  <span className="px-2 py-1 bg-white/10 rounded border border-white/10 text-white">SPACE / CLICK</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 uppercase">Pause</span>
                  <span className="px-2 py-1 bg-white/10 rounded border border-white/10 text-white">ESC / P</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Pro Tips
            </h3>
            <ul className="space-y-4">
              {[
                "The game gets faster as your score increases. Stay focused!",
                "Red thorns are lethal. One touch and it's game over.",
                "Your score is tracked globally. Can you beat the Universal Legend?",
                "Use short, precise taps for better control in tight spaces."
              ].map((tip, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-white/10">
                    {i + 1}
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{tip}</p>
                </li>
              ))}
            </ul>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
          >
            Got it, Let's Go!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
