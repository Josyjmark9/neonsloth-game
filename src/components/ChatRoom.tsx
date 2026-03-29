import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, MessageSquare, X, Users } from 'lucide-react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { ChatMessage } from '../types';

interface ChatRoomProps {
  playerName: string;
  onClose: () => void;
}

export default function ChatRoom({ playerName, onClose }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'globalChat'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      setMessages(msgs);
      setIsLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'globalChat'), {
        sender: playerName,
        text: newMessage,
        timestamp: new Date().toISOString()
      });
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-0 right-0 h-full w-full md:w-96 bg-slate-950/95 backdrop-blur-2xl border-l border-white/10 z-[100] flex flex-col"
    >
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h2 className="text-lg font-black italic uppercase tracking-tighter">Global <span className="text-pink-500">Chat</span></h2>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Live Feed</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Users className="w-12 h-12" />
            <p className="text-sm font-mono uppercase tracking-widest">No messages yet. Be the first!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex flex-col ${msg.sender === playerName ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {msg.sender === playerName ? 'You' : msg.sender}
                </span>
              </div>
              <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] ${
                msg.sender === playerName 
                  ? 'bg-pink-600 text-white rounded-tr-none' 
                  : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-6 border-t border-white/10 bg-slate-900/50">
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500 transition-colors pr-14"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 p-3 bg-pink-600 rounded-xl text-white hover:bg-pink-500 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
