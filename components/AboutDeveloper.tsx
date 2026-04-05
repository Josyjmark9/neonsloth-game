import React from 'react';
import { motion } from 'motion/react';
import { X, Info, Github, Twitter, Mail, ExternalLink, ShieldCheck, Instagram } from 'lucide-react';

interface AboutDeveloperProps {
  onClose: () => void;
  globalStats: any;
  onOpenAdmin: () => void;
}

export default function AboutDeveloper({ onClose, globalStats, onOpenAdmin }: AboutDeveloperProps) {
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
        className="w-full max-w-2xl bg-white/10 border border-white/20 rounded-3xl md:rounded-[40px] p-6 md:p-10 shadow-2xl relative overflow-hidden overflow-y-auto max-h-[90vh]"
      >
        <button onClick={onClose} className="absolute top-4 right-4 md:top-8 md:right-8 p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-colors">
          <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white/5 border border-white/10 rounded-3xl md:rounded-[40px] flex items-center justify-center shadow-2xl overflow-hidden p-2">
            <img 
              src="https://raw.githubusercontent.com/JosiahJohnmark/Assets/main/JayJayLogo.png" 
              alt="DEVELOPER LOGO" 
              className="w-full h-auto object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "https://img.icons8.com/fluency/96/sloth.png";
              }}
            />
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">Josiah Johnmark</h2>
            <p className="text-slate-400 text-sm md:text-lg leading-relaxed">
              Lead Architect & Visionary behind neonSLOTH. 
              Crafting digital experiences that push the boundaries of the neon void.
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4 justify-center md:justify-start">
              <a 
                href="mailto:josiahjohnmark9@gmail.com"
                className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-slate-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact Developer
              </a>
              <a 
                href="https://x.com/JosiahJohnmark"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-slate-400 transition-colors"
              >
                <Twitter className="w-4 h-4" />
                X (Twitter)
              </a>
              <a 
                href="https://instagram.com/JosiahJohnmark"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-slate-400 transition-colors"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
              <div className="p-2 md:p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-slate-400">
                <ExternalLink className="w-4 h-4" />
                v1.0.0 Stable
              </div>
              <button onClick={onOpenAdmin} className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"><ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" /></button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
