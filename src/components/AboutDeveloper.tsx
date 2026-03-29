import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Instagram, Twitter, Github, Terminal, Activity, ShieldAlert, Lock, ArrowRight, MessageSquare } from 'lucide-react';
import { GlobalStats } from '../types';
import FeedbackModal from './FeedbackModal';

interface AboutDeveloperProps {
  onClose: () => void;
  globalStats: GlobalStats | null;
  onOpenAdmin: () => void;
}

const AboutDeveloper: React.FC<AboutDeveloperProps> = ({ onClose, globalStats, onOpenAdmin }) => {
  const [clickCount, setClickCount] = useState(0);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [randomAchievement, setRandomAchievement] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const achievements = [
    "Neon Runner: 1000m without hitting an obstacle",
    "Speed Demon: Reached 200% speed",
    "Void Walker: 5 minutes in a single run",
    "Legendary Soul: Achieved Universal High Score",
    "Social Butterfly: Added 10 friends",
    "Chat Master: Sent 50 messages"
  ];

  useEffect(() => {
    setRandomAchievement(achievements[Math.floor(Math.random() * achievements.length)]);
  }, []);

  const handleStatusClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount === 5) {
      setShowPasswordPrompt(true);
      setClickCount(0);
    }
    // Reset click count after 2 seconds of inactivity
    setTimeout(() => setClickCount(0), 2000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '08030804821Jo$') { 
      onOpenAdmin();
      onClose();
    } else {
      setError('Invalid Access Key');
      setTimeout(() => setError(''), 2000);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
    >
      <div className="w-full max-w-lg bg-slate-900/40 border border-white/10 rounded-[40px] p-8 shadow-2xl backdrop-blur-2xl text-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-8">
          {/* Header with Hexagon Logo */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-cyan-500/50 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-20 h-20 bg-slate-950 border border-cyan-500/30 flex items-center justify-center overflow-hidden" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                <div className="flex flex-col items-center justify-center leading-none">
                  <span className="text-2xl font-black text-cyan-400 -mb-1">J</span>
                  <span className="text-2xl font-black text-cyan-400 rotate-180 -mt-1">J</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight uppercase italic">Josiah <span className="text-cyan-400">Johnmark</span></h2>
              <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em]">Precision & Logic</p>
            </div>
          </div>

          {/* Bio Text */}
          <div className="space-y-4 text-slate-400 leading-relaxed text-sm font-medium">
            <p>
              My journey started with a pencil and a blank sheet of paper, mastering the physics of light and the precision of hyper-realism. 
              Today, I’ve traded the graphite for C# and Unity, bringing that same obsession with detail into the digital world.
            </p>
            <p>
              As a Developer, I’m driven by the "Logic of Play." As a Gamer, I’m my own toughest critic, constantly refining mechanics until they hit that perfect flow state. 
              Whether it's a 2D endless runner or a complex multiplayer environment, my goal is simple: Code. Create. Play.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-8 py-2 border-y border-white/5">
            <a 
              href="https://www.instagram.com/josiah_johnmark/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-pink-500 transition-all hover:scale-110"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href="https://x.com/josiahjohnmark" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-cyan-400 transition-all hover:scale-110"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <button 
              onClick={() => setShowFeedback(true)}
              className="text-slate-500 hover:text-cyan-400 transition-all hover:scale-110 flex items-center gap-2"
              title="Message Developer Anonymously"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <Github className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer transition-all hover:scale-110" />
          </div>

          {/* System Status Box (Dev Terminal) */}
          <div 
            onClick={handleStatusClick}
            className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 cursor-pointer hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Status</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono text-green-500 uppercase">Online</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2 font-mono text-[10px]">
              <div className="flex justify-between items-center text-slate-400">
                <span>LATEST_ACHIEVEMENT:</span>
                <span className="text-cyan-400 truncate ml-4">"{randomAchievement}"</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>LAST_UPDATE:</span>
                <span className="text-white">{today}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-white text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-cyan-400 transition-all active:scale-95"
          >
            Return to Void
          </button>
        </div>

        {/* Hidden Admin Password Prompt */}
        <AnimatePresence>
          {showFeedback && (
            <FeedbackModal 
              type="feedback" 
              onClose={() => setShowFeedback(false)} 
            />
          )}
          {showPasswordPrompt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-8"
            >
              <div className="w-full space-y-6 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl mx-auto flex items-center justify-center border border-red-500/30">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase tracking-tighter">Restricted Access</h3>
                  <p className="text-xs text-slate-500 font-mono uppercase">Enter Developer Key to Proceed</p>
                </div>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoFocus
                      className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-700 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  {error && <p className="text-red-500 text-[10px] font-mono uppercase">{error}</p>}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPasswordPrompt(false)}
                      className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-red-600 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-red-500 transition-all flex items-center justify-center gap-2"
                    >
                      Verify <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AboutDeveloper;
