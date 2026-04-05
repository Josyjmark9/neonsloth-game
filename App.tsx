import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Trophy, Zap, Info, User, ChevronRight, BarChart3, X, MessageSquare } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, increment, runTransaction, collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import GameCanvas from './components/GameCanvas';
import AboutDeveloper from './components/AboutDeveloper';
import AboutGame from './components/AboutGame';
import AdminDashboard from './components/AdminDashboard';
import FeedbackModal from './components/FeedbackModal';
import LeaderboardModal from './components/LeaderboardModal';
import { GameState, GlobalStats, PlayerData } from './types';
import { Star, Trophy as TrophyIcon, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from './lib/sound';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showGameInfo, setShowGameInfo] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [showReview, setShowReview] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    highScore: 0,
    previousScore: 0,
    isGameOver: false,
    isStarted: false,
    playerName: localStorage.getItem('playerName') || '',
    hasRated: false,
    totalGamesPlayed: 0,
  });

  // Track Play Time
  useEffect(() => {
    if (gameState.playerName && gameState.isStarted) {
      const startTime = Date.now();
      return () => {
        const endTime = Date.now();
        const minutesPlayed = (endTime - startTime) / 60000;
        if (minutesPlayed > 0.01) { // Only track if played for more than 0.6 seconds
          updateDoc(doc(db, 'players', gameState.playerName), {
            totalMinutesPlayed: increment(minutesPlayed)
          }).catch(err => console.error("Error updating player play time:", err));

          updateDoc(doc(db, 'globalStats', 'main'), {
            totalMinutesPlayed: increment(minutesPlayed)
          }).catch(err => console.error("Error updating global play time:", err));
        }
      };
    }
  }, [gameState.playerName, gameState.isStarted]);

  // Fetch Global Stats
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'globalStats', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        setGlobalStats(docSnap.data() as GlobalStats);
      } else {
        // Initialize global stats if they don't exist
        setDoc(doc(db, 'globalStats', 'main'), {
          totalPlayers: 0,
          universalHighScore: 0,
          highScorerName: 'None'
        });
      }
    });

    // Simulate initial loading for the cool zoom effect
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  // Track Daily Active User
  useEffect(() => {
    if (gameState.playerName) {
      const trackDAU = async () => {
        const today = new Date().toISOString().split('T')[0];
        const playerDailyRef = doc(db, 'dailyStats', today, 'activePlayers', gameState.playerName);
        const dailyStatsRef = doc(db, 'dailyStats', today);

        try {
          const playerDailySnap = await getDoc(playerDailyRef);
          if (!playerDailySnap.exists()) {
            await runTransaction(db, async (transaction) => {
              const dailySnap = await transaction.get(dailyStatsRef);
              if (!dailySnap.exists()) {
                transaction.set(dailyStatsRef, { count: 1 });
              } else {
                transaction.update(dailyStatsRef, { count: increment(1) });
              }
              transaction.set(playerDailyRef, { timestamp: new Date().toISOString() });
            });
          }
        } catch (err) {
          console.error("DAU tracking error:", err);
        }
      };
      trackDAU();
    }
  }, [gameState.playerName]);

  // Fetch Player Data if name exists
  useEffect(() => {
    if (gameState.playerName) {
      const fetchPlayer = async () => {
        const playerDoc = await getDoc(doc(db, 'players', gameState.playerName));
        if (playerDoc.exists()) {
          const data = playerDoc.data();
          setGameState(prev => ({ 
            ...prev, 
            highScore: data.highScore || 0,
            hasRated: data.hasRated || false,
            totalGamesPlayed: data.totalGamesPlayed || 0
          }));
        }
      };
      fetchPlayer();
    }
  }, [gameState.playerName]);

  const handleRegisterName = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = playerNameInput.trim();
    if (name.length < 3) {
      setNameError('Name must be at least 3 characters');
      return;
    }

    try {
      const playerDoc = await getDoc(doc(db, 'players', name));
      if (playerDoc.exists()) {
        setNameError('This name is already taken. Choose another!');
        return;
      }

      // Create new player
      const newPlayer: PlayerData = {
        name,
        highScore: 0,
        totalGamesPlayed: 0,
        totalMinutesPlayed: 0,
        hasRated: false,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'players', name), newPlayer);
      
      // Increment global player count
      await updateDoc(doc(db, 'globalStats', 'main'), {
        totalPlayers: increment(1)
      });

      localStorage.setItem('playerName', name);
      setGameState(prev => ({ 
        ...prev, 
        playerName: name,
        hasRated: false,
        totalGamesPlayed: 0
      }));
      setShowNameInput(false);
      setNameError('');
    } catch (err) {
      console.error('Registration error:', err);
      setNameError('Something went wrong. Try again.');
    }
  };

  const handleSkipRegistration = async () => {
    const guestId = Math.floor(1000 + Math.random() * 9000);
    const guestName = `Guest_${guestId}`;
    
    try {
      const newPlayer: PlayerData = {
        name: guestName,
        highScore: 0,
        totalGamesPlayed: 0,
        totalMinutesPlayed: 0,
        hasRated: false,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'players', guestName), newPlayer);
      
      await updateDoc(doc(db, 'globalStats', 'main'), {
        totalPlayers: increment(1)
      });

      localStorage.setItem('playerName', guestName);
      setGameState(prev => ({ 
        ...prev, 
        playerName: guestName,
        hasRated: false,
        totalGamesPlayed: 0
      }));
      setShowNameInput(false);
      setNameError('');
    } catch (err) {
      console.error('Skip registration error:', err);
      // Fallback to local only if firebase fails
      setGameState(prev => ({ ...prev, playerName: guestName }));
      setShowNameInput(false);
    }
  };

  const startGame = () => {
    if (!gameState.playerName) {
      setShowNameInput(true);
      return;
    }
    soundManager.playSFX('click');
    soundManager.playBGM();
    setGameState((prev) => ({
      ...prev,
      isStarted: true,
      isGameOver: false,
      score: 0,
    }));
  };

  const handleGameOver = React.useCallback(async (finalScore: number) => {
    soundManager.playSFX('gameOver');
    soundManager.stopBGM();
    const isNewUniversalBest = globalStats && finalScore > globalStats.universalHighScore;

    // Update Player High Score and Games Played in Firestore
    if (gameState.playerName) {
      const newTotalGames = gameState.totalGamesPlayed + 1;
      updateDoc(doc(db, 'players', gameState.playerName), {
        highScore: Math.max(gameState.highScore, finalScore),
        totalGamesPlayed: increment(1)
      }).catch(err => console.error("Error updating player stats:", err));

      updateDoc(doc(db, 'globalStats', 'main'), {
        totalGamesPlayed: increment(1)
      }).catch(err => console.error("Error updating global games played:", err));

      // Show review modal after a short delay on game over
      // ONLY if it's their first game and they haven't rated yet
      if (newTotalGames === 1 && !gameState.hasRated) {
        setTimeout(() => setShowReview(true), 1500);
      }
      
      setGameState((prev) => ({
        ...prev,
        isStarted: false,
        isGameOver: true,
        score: finalScore,
        previousScore: finalScore,
        highScore: Math.max(finalScore, prev.highScore),
        totalGamesPlayed: newTotalGames
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        isStarted: false,
        isGameOver: true,
        score: finalScore,
        previousScore: finalScore,
        highScore: Math.max(finalScore, prev.highScore),
      }));
    }

    if (isNewUniversalBest) {
      updateDoc(doc(db, 'globalStats', 'main'), {
        universalHighScore: finalScore,
        highScorerName: gameState.playerName
      }).catch(err => console.error("Error updating universal high score:", err));
    }
  }, [gameState.playerName, gameState.highScore, gameState.totalGamesPlayed, gameState.hasRated, globalStats]);

  const handleUpdateGlobalStats = async (updates: Partial<GlobalStats>) => {
    try {
      await updateDoc(doc(db, 'globalStats', 'main'), updates);
    } catch (err) {
      console.error("Failed to update global stats:", err);
    }
  };

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setShowAdmin(true);
        return 0;
      }
      return next;
    });
    // Reset click count after 2 seconds of inactivity
    setTimeout(() => setLogoClickCount(0), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-pink-500/30 overflow-x-hidden">
      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: [0.2, 1.5, 1], opacity: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="relative w-64 h-64 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-white rounded-full blur-3xl opacity-20 animate-pulse" />
              <img 
                alt="NEONSLOTH LOGO" 
                className="w-full h-auto relative z-10"
                onError={(e) => {
                  e.currentTarget.src = "https://img.icons8.com/fluency/96/sloth.png";
                }}
              />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-12 text-center"
            >
              <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">neon<span className="text-pink-500">SLOTH</span></h2>
              <p className="text-slate-500 font-mono text-xs mt-2 tracking-widest">UNIVERSAL EDITION</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Game Canvas */}
      {gameState.isStarted && (
        <div className="fixed inset-0 z-[200] bg-black">
          <GameCanvas 
            isStarted={gameState.isStarted} 
            onGameOver={handleGameOver} 
            difficultyMultiplier={globalStats?.difficultyMultiplier || 1}
          />
        </div>
      )}

      {/* Main App Container */}
      {!gameState.isStarted && (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        {/* Background Parallax Effect */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)]" />
          <div className="absolute -top-48 -left-48 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 w-full max-w-5xl flex flex-col gap-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div 
                onClick={handleLogoClick}
                className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl backdrop-blur-md overflow-hidden p-1 cursor-pointer active:scale-95 transition-transform"
              >
                <img 
                  src="https://raw.githubusercontent.com/JosiahJohnmark/Assets/main/JayJayLogo.png" 
                  alt="NEONSLOTH LOGO" 
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "https://img.icons8.com/fluency/96/sloth.png";
                  }}
                />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                  neon<span className="text-pink-500">SLOTH</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-mono tracking-[0.3em] uppercase">Universal Edition</p>
              </div>
            </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const muted = soundManager.toggleMute();
                    setIsMuted(muted);
                  }}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 transition-all active:scale-95"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                {gameState.playerName && (
                  <>
                    <button 
                      onClick={() => {
                        soundManager.playSFX('click');
                        setShowLeaderboard(true);
                      }}
                      className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 transition-all active:scale-95 flex items-center gap-2"
                      title="Leaderboard"
                    >
                      <TrophyIcon className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs font-bold uppercase tracking-widest hidden md:inline text-yellow-500/80">Leaderboard</span>
                    </button>
                  </>
                )}
                <button 
                  onClick={() => {
                    soundManager.playSFX('click');
                    setShowAbout(true);
                  }}
                  className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md flex items-center gap-2 transition-all active:scale-95"
                >
                  <User className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Developer Info</span>
                </button>
              </div>
          </header>

          {/* Main Content Area */}
          <main className="grid lg:grid-cols-[1fr_350px] gap-8 items-start">
            {/* Game Viewport */}
            <div className="relative aspect-[16/9] w-full rounded-[40px] overflow-hidden border border-white/10 shadow-2xl bg-slate-900/50 backdrop-blur-sm">
              <GameCanvas 
                isStarted={gameState.isStarted} 
                onGameOver={handleGameOver} 
                difficultyMultiplier={globalStats?.difficultyMultiplier || 1}
              />

              {/* Glassmorphic Menu Overlay */}
              <AnimatePresence>
                {!gameState.isStarted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-xl p-8 text-center"
                  >
                    {!gameState.isGameOver ? (
                      <div className="w-full max-w-md space-y-8">
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="space-y-4"
                        >
                          <h2 className="text-5xl font-black italic uppercase tracking-tighter">
                            Ready to <span className="text-pink-500">Dash?</span>
                          </h2>
                          <p className="text-slate-400">Master the neon void.</p>
                        </motion.div>
                        
                          <div className="flex flex-col gap-4">
                            <button
                              onClick={startGame}
                              className="group relative w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-white/10 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                              <Play className="w-6 h-6 fill-current" />
                              Play
                            </button>
                            
                            <button
                              onClick={() => {
                                soundManager.playSFX('click');
                                setShowGameInfo(true);
                              }}
                              className="w-full py-5 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                            >
                              <Info className="w-6 h-6" />
                              About the Game
                            </button>
                          </div>

                        {gameState.playerName && (
                          <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-4 items-center">
                            <div className="text-left">
                              <p className="text-[10px] uppercase text-slate-500">Player</p>
                              <p className="text-lg font-black text-white uppercase truncate">{gameState.playerName}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] uppercase text-slate-500">Previous</p>
                              <p className="text-xl font-black text-cyan-400">{gameState.previousScore}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase text-slate-500">Best</p>
                              <p className="text-xl font-black text-pink-500">{gameState.highScore}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full max-w-md space-y-8">
                        <div className="space-y-2">
                          <h2 className="text-6xl font-black text-red-500 italic uppercase tracking-tighter">Game Over</h2>
                          <p className="text-slate-300">The thorns claimed another soul.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <p className="text-[10px] uppercase text-slate-500 mb-1">Final Score</p>
                            <p className="text-3xl font-black text-pink-500">{gameState.score}</p>
                          </div>
                          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <p className="text-[10px] uppercase text-slate-500 mb-1">Your Best</p>
                            <p className="text-3xl font-black text-cyan-400">{gameState.highScore}</p>
                          </div>
                        </div>

                        <button
                          onClick={startGame}
                          className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95"
                        >
                          <RotateCcw className="w-6 h-6" />
                          Replay
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar Stats */}
            <aside className="space-y-6">
              {/* Universal High Score Card */}
              <div className="p-6 rounded-[32px] bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Universal Legend</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-black text-white tracking-tighter">
                    {globalStats?.universalHighScore || 0}
                  </p>
                  <p className="text-xs text-pink-400 font-mono uppercase tracking-widest">
                    Held by: <span className="text-white">{globalStats?.highScorerName || 'None'}</span>
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-1">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] uppercase text-slate-500">Global Avg</span>
                  <span className="text-sm font-bold">42.5</span>
                </div>
                <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-[10px] uppercase text-slate-500">Server</span>
                  <span className="text-sm font-bold text-green-400">STABLE</span>
                </div>
              </div>

              {/* Feedback Button */}
              <button
                onClick={() => setShowReview(true)}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-95 text-slate-400 hover:text-white group"
              >
                <MessageSquare className="w-4 h-4 group-hover:text-pink-500 transition-colors" />
                <span className="text-xs font-bold uppercase tracking-widest">Send Feedback</span>
              </button>
            </aside>
          </main>
        </div>
      </div>
    )}

    {/* Name Registration Modal */}
      <AnimatePresence>
        {showNameInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-white/10 border border-white/20 rounded-[40px] p-10 shadow-2xl"
            >
              <div className="text-center space-y-4 mb-8">
                <div className="w-20 h-20 bg-pink-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-pink-500/20">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Identify Yourself</h2>
                <p className="text-slate-400 text-sm">Choose a unique name to track your progress in the neon void.</p>
              </div>

              <form onSubmit={handleRegisterName} className="space-y-6">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={playerNameInput}
                    onChange={(e) => setPlayerNameInput(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500 transition-colors"
                    autoFocus
                  />
                  {nameError && <p className="text-red-500 text-xs font-mono px-2">{nameError}</p>}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    className="w-full py-5 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    Enter the Void
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipRegistration}
                    className="w-full py-4 bg-white/5 border border-white/10 text-slate-400 font-bold uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                  >
                    Skip & Play as Guest
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About Game Modal */}
      <AnimatePresence>
        {showGameInfo && (
          <AboutGame onClose={() => setShowGameInfo(false)} />
        )}
      </AnimatePresence>

      {/* About Developer Modal */}
      <AnimatePresence>
        {showAbout && (
          <AboutDeveloper 
            onClose={() => setShowAbout(false)} 
            globalStats={globalStats}
            onOpenAdmin={() => setShowAdmin(true)}
          />
        )}
      </AnimatePresence>

      {/* Admin Dashboard Modal */}
      <AnimatePresence>
        {showAdmin && (
          <AdminDashboard 
            onClose={() => setShowAdmin(false)} 
            globalStats={globalStats}
            onUpdateStats={handleUpdateGlobalStats}
          />
        )}
      </AnimatePresence>

      {/* Post-Game Review Modal */}
      <AnimatePresence>
        {showReview && (
          <FeedbackModal
            type="review"
            playerName={gameState.playerName}
            onClose={() => setShowReview(false)}
            onSuccess={() => setGameState(prev => ({ ...prev, hasRated: true }))}
          />
        )}
      </AnimatePresence>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
