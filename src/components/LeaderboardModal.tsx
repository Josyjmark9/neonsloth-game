import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Star, Shield, Loader2, Search, ChevronRight } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { PlayerData } from '../types';
import { getRankInfo, cn } from '../lib/utils';
import ProfileCard from './ProfileCard';

interface LeaderboardModalProps {
  onClose: () => void;
}

export default function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<{ player: PlayerData; rank: number } | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'players'), orderBy('highScore', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);
        const fetchedPlayers = querySnapshot.docs.map(doc => doc.data() as PlayerData);
        setPlayers(fetchedPlayers);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[180] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-2xl h-[80vh] bg-white/5 border border-white/10 rounded-[40px] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <header className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/20">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Top 100 <span className="text-pink-500">Legends</span></h2>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Global Rankings // Live</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </header>

        {/* Search Bar */}
        <div className="p-6 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search for a legend..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
            />
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <p className="text-xs uppercase font-bold tracking-widest">Syncing with the void...</p>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-500">
              <Shield className="w-12 h-12 opacity-20" />
              <p className="text-xs uppercase font-bold tracking-widest">No legends found</p>
            </div>
          ) : (
            filteredPlayers.map((player, index) => {
              const rankInfo = getRankInfo(player.highScore);
              const globalRank = players.findIndex(p => p.name === player.name) + 1;
              
              return (
                <motion.button
                  key={player.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => setSelectedPlayer({ player, rank: globalRank })}
                  className="w-full group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                      globalRank === 1 ? 'bg-yellow-500 text-black' : 
                      globalRank === 2 ? 'bg-slate-300 text-black' : 
                      globalRank === 3 ? 'bg-amber-600 text-black' : 'bg-white/10 text-white'
                    )}>
                      {globalRank}
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-bold uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                        {player.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[8px] font-black uppercase tracking-widest", rankInfo.color)}>
                          {rankInfo.name}
                        </span>
                        <span className="text-[8px] text-slate-600 font-mono uppercase">Lvl.{rankInfo.level}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Star className="w-3 h-3 text-pink-500" />
                        <span className="text-sm font-black text-white font-mono">{player.highScore.toLocaleString()}</span>
                      </div>
                      <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">High Score</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
                  </div>
                </motion.button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <footer className="p-6 bg-white/5 border-t border-white/10 text-center">
          <p className="text-[8px] text-slate-600 uppercase font-bold tracking-[0.3em]">
            NeonSloth // Global Leaderboard // Josiah Johnmark
          </p>
        </footer>
      </motion.div>

      {/* Player Profile Card Overlay */}
      <AnimatePresence>
        {selectedPlayer && (
          <ProfileCard 
            player={selectedPlayer.player}
            rank={selectedPlayer.rank}
            onClose={() => setSelectedPlayer(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
