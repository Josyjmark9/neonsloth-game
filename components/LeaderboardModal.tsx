import React from 'react';
import { motion } from 'motion/react';
import { X, Trophy, Star, Zap, User, ChevronRight, BarChart3, Users } from 'lucide-react';

interface LeaderboardModalProps {
  onClose: () => void;
}

export default function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[140] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-4xl h-[85vh] bg-white/5 border border-white/10 rounded-[48px] p-12 shadow-2xl relative overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-yellow-500/20">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Global Legends</h2>
              <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">Top 100 Players Worldwide</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
            <X className="w-8 h-8 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 space-y-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank) => (
            <div key={rank} className="p-8 rounded-[32px] bg-white/5 border border-white/10 flex items-center gap-8 group hover:bg-white/10 transition-all cursor-pointer">
              <div className="w-12 h-12 flex items-center justify-center text-2xl font-black italic text-slate-500 group-hover:text-yellow-500 transition-colors">
                #{rank}
              </div>
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-yellow-500/50 transition-colors">
                <User className="w-8 h-8 text-slate-500 group-hover:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-300 group-hover:text-white transition-colors">LegendPlayer_{rank}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Joined 2 months ago</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black italic text-white tracking-tighter">{1000 - rank * 50}</p>
                <p className="text-xs text-yellow-500 uppercase tracking-widest font-bold">High Score</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
