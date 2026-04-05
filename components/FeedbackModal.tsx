import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Star, Send } from 'lucide-react';

interface FeedbackModalProps {
  type: 'review' | 'feedback';
  playerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FeedbackModal({ type, playerName, onClose, onSuccess }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[130] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md bg-white/10 border border-white/20 rounded-[40px] p-10 shadow-2xl relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="text-center space-y-6 mb-10">
          <div className="w-20 h-20 bg-pink-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-pink-500/20">
            <Star className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Rate Your Experience</h2>
          <p className="text-slate-400 text-sm">Help us improve the neon void with your feedback.</p>
        </div>

        <div className="flex justify-center gap-4 mb-10">
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star} 
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="p-2 transition-all hover:scale-110 active:scale-95"
            >
              <Star 
                className={`w-10 h-10 transition-colors ${
                  (hoveredRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'
                }`} 
              />
            </button>
          ))}
        </div>

        <button 
          onClick={() => {
            if (rating > 0) {
              onSuccess();
              onClose();
            }
          }}
          disabled={rating === 0}
          className={`w-full py-5 font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-2xl ${
            rating > 0 
              ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-pink-600/20' 
              : 'bg-white/5 text-slate-500 cursor-not-allowed'
          }`}
        >
          Submit Review
          <Send className="w-5 h-5" />
        </button>
      </motion.div>
    </motion.div>
  );
}
