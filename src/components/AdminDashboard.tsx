import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Trophy, Activity, ShieldCheck, LogIn, Loader2, ArrowLeft, MessageSquare, Star } from 'lucide-react';
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../firebase';
import { GlobalStats, PlayerData, DailyStats } from '../types';

interface FeedbackData {
  id: string;
  type: 'feedback' | 'review';
  playerName?: string;
  rating?: number;
  message: string;
  recommendations?: string;
  timestamp: string;
}

interface AdminDashboardProps {
  onClose: () => void;
}

const ADMIN_EMAIL = "josiahjohnmark9@gmail.com";

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [topPlayers, setTopPlayers] = useState<PlayerData[]>([]);
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [reviews, setReviews] = useState<FeedbackData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && u.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        fetchAdminData();
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch Global Stats
      const globalSnap = await getDoc(doc(db, 'globalStats', 'main'));
      if (globalSnap.exists()) setGlobalStats(globalSnap.data() as GlobalStats);

      // Fetch Daily Stats
      const dailySnap = await getDoc(doc(db, 'dailyStats', today));
      if (dailySnap.exists()) setDailyStats(dailySnap.data() as DailyStats);

      // Fetch Top Players
      const playersQuery = query(collection(db, 'players'), orderBy('highScore', 'desc'), limit(10));
      const playersSnap = await getDocs(playersQuery);
      setTopPlayers(playersSnap.docs.map(d => d.data() as PlayerData));

      // Fetch Feedback
      const feedbackQuery = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'), limit(20));
      const feedbackSnap = await getDocs(feedbackQuery);
      setFeedback(feedbackSnap.docs.map(d => ({ id: d.id, ...d.data() } as FeedbackData)));

      // Fetch Reviews
      const reviewsQuery = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'), limit(20));
      const reviewsSnap = await getDocs(reviewsQuery);
      setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() } as FeedbackData)));

    } catch (err: any) {
      console.error("Admin fetch error:", err);
      setError("Failed to fetch data. Check your permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
  };

  if (!isAdmin && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6"
      >
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[40px] p-10 text-center space-y-8">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl mx-auto flex items-center justify-center border border-white/10">
            <ShieldCheck className="w-10 h-10 text-cyan-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Admin Access</h2>
            <p className="text-slate-400 text-sm">This area is restricted to the developer.</p>
          </div>
          
          {user ? (
            <div className="space-y-4">
              <p className="text-red-400 text-xs font-mono">Logged in as {user.email}. You do not have admin rights.</p>
              <button onClick={handleLogout} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all">
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95"
            >
              <LogIn className="w-6 h-6" />
              Authenticate
            </button>
          )}
          
          <button onClick={onClose} className="text-slate-500 text-xs uppercase tracking-widest font-bold hover:text-white transition-colors">
            Return to Game
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="fixed inset-0 z-[150] bg-slate-950 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <header className="p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter">Admin <span className="text-cyan-400">Dashboard</span></h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">System Overview</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchAdminData}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <Loader2 className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={onClose}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-mono">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Total Players</p>
              <p className="text-5xl font-black text-white tracking-tighter">{globalStats?.totalPlayers || 0}</p>
            </div>
          </div>

          <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Daily Active Users</p>
              <p className="text-5xl font-black text-white tracking-tighter">{dailyStats?.count || 0}</p>
            </div>
          </div>

          <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Universal High Score</p>
              <p className="text-5xl font-black text-white tracking-tighter">{globalStats?.universalHighScore || 0}</p>
              <p className="text-xs text-yellow-500 font-mono uppercase mt-1">By: {globalStats?.highScorerName}</p>
            </div>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Top 10 <span className="text-pink-500">Legends</span></h3>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Live Database View</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-6 text-[10px] uppercase text-slate-500 font-bold tracking-widest">Rank</th>
                  <th className="p-6 text-[10px] uppercase text-slate-500 font-bold tracking-widest">Player</th>
                  <th className="p-6 text-[10px] uppercase text-slate-500 font-bold tracking-widest text-center">Games</th>
                  <th className="p-6 text-[10px] uppercase text-slate-500 font-bold tracking-widest text-center">Time (m)</th>
                  <th className="p-6 text-[10px] uppercase text-slate-500 font-bold tracking-widest">High Score</th>
                  <th className="p-6 text-[10px] uppercase text-slate-500 font-bold tracking-widest">Joined</th>
                </tr>
              </thead>
              <tbody>
                {topPlayers.map((player, index) => (
                  <tr key={player.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-6">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                        index === 0 ? 'bg-yellow-500 text-black' : 
                        index === 1 ? 'bg-slate-300 text-black' : 
                        index === 2 ? 'bg-amber-600 text-black' : 'bg-white/10 text-white'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-6 font-black uppercase text-white">{player.name}</td>
                    <td className="p-6 text-center font-mono text-slate-400">{player.totalGamesPlayed || 0}</td>
                    <td className="p-6 text-center font-mono text-slate-400">{Math.floor(player.totalMinutesPlayed || 0)}</td>
                    <td className="p-6 font-mono text-pink-500 font-bold">{player.highScore}</td>
                    <td className="p-6 text-slate-500 text-sm font-mono">
                      {new Date(player.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feedback & Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Anonymous Feedback */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Anonymous <span className="text-cyan-400">Feedback</span></h3>
              <MessageSquare className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {feedback.length === 0 ? (
                <div className="p-12 text-center bg-white/5 border border-white/10 rounded-[40px] text-slate-500 font-mono uppercase text-xs">
                  No feedback received yet
                </div>
              ) : (
                feedback.map((f) => (
                  <div key={f.id} className="p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-4 hover:bg-white/10 transition-colors">
                    <p className="text-white text-sm leading-relaxed font-medium">{f.message}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                        {new Date(f.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Game Reviews */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Game <span className="text-pink-500">Reviews</span></h3>
              <Star className="w-5 h-5 text-pink-500" />
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {reviews.length === 0 ? (
                <div className="p-12 text-center bg-white/5 border border-white/10 rounded-[40px] text-slate-500 font-mono uppercase text-xs">
                  No reviews submitted yet
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-6 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-black uppercase text-xs tracking-widest">{r.playerName}</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < (r.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-white text-sm leading-relaxed italic">"{r.message}"</p>
                      {r.recommendations && (
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2">Recommendations:</span>
                          <p className="text-slate-400 text-xs leading-relaxed">{r.recommendations}</p>
                        </div>
                      )}
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <span className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                        {new Date(r.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-white/10 bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin Session Active</span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit Admin Mode
        </button>
      </footer>
    </motion.div>
  );
}
