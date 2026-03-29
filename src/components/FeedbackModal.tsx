import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, MessageSquare, Star, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface FeedbackModalProps {
  onClose: () => void;
  type: 'feedback' | 'review';
  playerName?: string;
  initialRating?: number;
  onSuccess?: () => void;
}

export default function FeedbackModal({ onClose, type, playerName, initialRating = 0, onSuccess }: FeedbackModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [text, setText] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClose = async () => {
    // If it's a review, mark as rated so it doesn't show again
    if (type === 'review' && playerName) {
      try {
        await updateDoc(doc(db, 'players', playerName), {
          hasRated: true
        });
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("Error updating hasRated status:", err);
      }
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && type === 'feedback') return;
    
    setIsSubmitting(true);
    try {
      const collectionName = type === 'feedback' ? 'developerFeedback' : 'gameReviews';
      await addDoc(collection(db, collectionName), {
        playerName: playerName || 'Anonymous',
        text,
        rating: type === 'review' ? rating : null,
        recommendations: type === 'review' ? recommendations : null,
        timestamp: serverTimestamp(),
        type
      });

      if (type === 'review' && playerName) {
        await updateDoc(doc(db, 'players', playerName), {
          hasRated: true
        });
        if (onSuccess) onSuccess();
      }

      setIsSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error("Error submitting feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${type === 'feedback' ? 'bg-cyan-500/20' : 'bg-pink-500/20'}`}>
              {type === 'feedback' ? <MessageSquare className="w-6 h-6 text-cyan-400" /> : <Star className="w-6 h-6 text-pink-400" />}
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                {type === 'feedback' ? 'Message' : 'Rate'} <span className={type === 'feedback' ? 'text-cyan-400' : 'text-pink-400'}>{type === 'feedback' ? 'Developer' : 'NeonSloth'}</span>
              </h2>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                {type === 'feedback' ? 'Anonymous Feedback' : 'Player Review'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {isSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Send className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-black uppercase italic">Transmission Sent!</h3>
              <p className="text-slate-400 font-mono text-xs">Thank you for your valuable input.</p>
            </div>
          ) : (
            <>
              {type === 'review' && (
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="transition-transform active:scale-90"
                      >
                        <Star className={`w-8 h-8 ${s <= rating ? 'fill-pink-500 text-pink-500' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  {type === 'feedback' ? 'Your Message' : 'Review & Thoughts'}
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={type === 'feedback' ? "Share your thoughts anonymously..." : "What did you think of the game?"}
                  className="w-full h-32 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                  required={type === 'feedback'}
                />
              </div>

              {type === 'review' && (
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Recommendations</label>
                  <textarea
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    placeholder="Any features you'd like to see?"
                    className="w-full h-24 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500 transition-colors resize-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 ${
                  type === 'feedback' ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-pink-600 hover:bg-pink-500'
                } text-white disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit {type === 'feedback' ? 'Feedback' : 'Review'}
                  </>
                )}
              </button>
            </>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
}
