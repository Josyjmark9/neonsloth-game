import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ShieldCheck, Settings, Users, Database, Activity, Zap, Save } from 'lucide-react';
import { GlobalStats } from '../types';
import { soundManager } from '../lib/sound';

interface AdminDashboardProps {
  onClose: () => void;
  globalStats: GlobalStats | null;
  onUpdateStats: (updates: Partial<GlobalStats>) => Promise<void>;
}

export default function AdminDashboard({ onClose, globalStats, onUpdateStats }: AdminDashboardProps) {
  const [multiplier, setMultiplier] = useState(globalStats?.difficultyMultiplier || 1);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    soundManager.playSFX('click');
    setIsSaving(true);
    await onUpdateStats({ difficultyMultiplier: multiplier });
    setIsSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-4xl h-[90vh] md:h-[80vh] bg-white/5 border border-white/10 rounded-3xl md:rounded-[48px] p-6 md:p-12 shadow-2xl relative overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl shadow-yellow-500/20">
              <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">Admin Control</h2>
              <p className="text-slate-500 text-[10px] md:text-sm font-mono uppercase tracking-widest">System Status: <span className="text-green-400">OPERATIONAL</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 md:p-4 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-colors">
            <X className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 flex-1 overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
          {/* Difficulty Configuration */}
          <div className="p-6 md:p-8 rounded-2xl md:rounded-[32px] bg-white/5 border border-white/10 space-y-4 md:space-y-6 col-span-1 md:col-span-2">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight">Game Difficulty Engine</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] md:text-sm text-slate-400 uppercase font-bold tracking-widest mb-1">Speed Multiplier</p>
                  <p className="text-[10px] text-slate-500 italic">Acceleration rate per 5 points.</p>
                </div>
                <span className="text-2xl md:text-3xl font-black text-yellow-400">{multiplier.toFixed(1)}x</span>
              </div>
              
              <input 
                type="range" 
                min="0.5" 
                max="5" 
                step="0.1" 
                value={multiplier}
                onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              
              <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                <span>RELAXED (0.5x)</span>
                <span>NORMAL (1.0x)</span>
                <span>INSANE (5.0x)</span>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving || multiplier === globalStats?.difficultyMultiplier}
              className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:bg-white/5 disabled:text-slate-600 text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {isSaving ? 'Updating System...' : 'Save Configuration'}
              <Save className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="p-6 md:p-8 rounded-2xl md:rounded-[32px] bg-white/5 border border-white/10 space-y-4">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
              <h3 className="text-lg md:text-xl font-bold">User Base</h3>
              <p className="text-2xl md:text-3xl font-black text-white">{globalStats?.totalPlayers || 0}</p>
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-[8px] md:text-[10px] uppercase font-mono text-slate-500">
                  <span>Total Games</span>
                  <span className="text-blue-400">{globalStats?.totalGamesPlayed || 0}</span>
                </div>
                <div className="flex justify-between text-[8px] md:text-[10px] uppercase font-mono text-slate-500">
                  <span>Total Playtime</span>
                  <span className="text-blue-400">{Math.floor(globalStats?.totalMinutesPlayed || 0)} min</span>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8 rounded-2xl md:rounded-[32px] bg-white/5 border border-white/10 space-y-4">
              <Database className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
              <h3 className="text-lg md:text-xl font-bold">Record Holder</h3>
              <p className="text-xs md:text-sm font-bold text-slate-400 truncate">{globalStats?.highScorerName || 'None'}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
