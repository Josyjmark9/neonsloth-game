import React from 'react';
import { motion } from 'motion/react';
import { X, Trophy, Clock, Gamepad2, Shield, Star, Zap, Calendar } from 'lucide-react';
import { PlayerData } from '../types';
import { getRankInfo, cn } from '../lib/utils';

interface ProfileCardProps {
  player: PlayerData;
  onClose: () => void;
  rank?: number;
}

export default function ProfileCard({ player, onClose, rank }: ProfileCardProps) {
  const rankInfo = getRankInfo(player.highScore);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, rotateY: -10 }}
        animate={{ scale: 1, y: 0, rotateY: 0 }}
        exit={{ scale: 0.9, y: 20, rotateY: 10 }}
        className="relative w-full max-w-[400px] aspect-[2/3] bg-slate-900 border-2 border-white/10 rounded-[40px] overflow-hidden shadow-2xl shadow-cyan-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-pink-500/10" />
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent" />
        
        {/* Holographic Shine Effect */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none" />

        {/* Header */}
        <div className="relative p-8 flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/80">Gamer ID // Verified</span>
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
              {player.name}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Rank Badge */}
        <div className="relative px-8 mb-8">
          <div className={cn(
            "inline-flex items-center gap-3 px-4 py-2 rounded-2xl border backdrop-blur-md",
            rankInfo.bg,
            rankInfo.border
          )}>
            <Trophy className={cn("w-5 h-5", rankInfo.color)} />
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-bold tracking-widest text-slate-500">Current Rank</span>
              <span className={cn("text-sm font-black uppercase tracking-wider", rankInfo.color)}>
                {rankInfo.name} <span className="opacity-50">Lvl.{rankInfo.level}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="relative px-8 grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-white/5 border border-white/5 rounded-3xl space-y-1">
            <div className="flex items-center gap-2 text-slate-500">
              <Star className="w-3 h-3" />
              <span className="text-[8px] uppercase font-bold tracking-widest">High Score</span>
            </div>
            <p className="text-2xl font-black text-white tracking-tighter">
              {player.highScore.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-white/5 border border-white/5 rounded-3xl space-y-1">
            <div className="flex items-center gap-2 text-slate-500">
              <Trophy className="w-3 h-3" />
              <span className="text-[8px] uppercase font-bold tracking-widest">Global Rank</span>
            </div>
            <p className="text-2xl font-black text-cyan-400 tracking-tighter">
              #{rank || '---'}
            </p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="relative px-8 space-y-3">
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-4 h-4 text-pink-500" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Games Played</span>
            </div>
            <span className="text-sm font-mono font-bold text-white">{player.totalGamesPlayed || 0}</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time Played</span>
            </div>
            <span className="text-sm font-mono font-bold text-white">
              {Math.floor(player.totalMinutesPlayed || 0)}m
            </span>
          </div>

          <div className="flex items-center gap-3 p-4">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Joined {new Date(player.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Bottom Branding */}
        <div className="absolute bottom-0 left-0 w-full p-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">NeonSloth // OS</span>
          </div>
          <div className="text-[10px] font-black italic text-white/10 uppercase">
            Josiah Johnmark
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
