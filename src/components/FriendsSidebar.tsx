import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Search, X, MessageCircle, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit, 
  addDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Friend, ChatMessage } from '../types';

interface FriendsSidebarProps {
  playerName: string;
  onClose: () => void;
}

export default function FriendsSidebar({ playerName, onClose }: FriendsSidebarProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'players', playerName, 'friends'), (snapshot) => {
      const friendsList = snapshot.docs.map(doc => ({ name: doc.id })) as Friend[];
      setFriends(friendsList);
      setIsLoading(false);
    });

    return () => unsub();
  }, [playerName]);

  useEffect(() => {
    if (activeChat) {
      const chatId = [playerName, activeChat].sort().join('_');
      const q = query(
        collection(db, 'privateChats', chatId, 'messages'),
        orderBy('timestamp', 'asc'),
        limit(50)
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChatMessage[];
        setMessages(msgs);
      });

      return () => unsub();
    }
  }, [activeChat, playerName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const q = query(
        collection(db, 'players'),
        where('name', '>=', searchQuery.toLowerCase()),
        where('name', '<=', searchQuery.toLowerCase() + '\uf8ff'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .map(doc => doc.id)
        .filter(name => name !== playerName && !friends.some(f => f.name === name));
      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (friendName: string) => {
    try {
      await setDoc(doc(db, 'players', playerName, 'friends', friendName), { addedAt: new Date().toISOString() });
      await setDoc(doc(db, 'players', friendName, 'friends', playerName), { addedAt: new Date().toISOString() });
      setSearchResults(prev => prev.filter(n => n !== friendName));
    } catch (err) {
      console.error("Error adding friend:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const chatId = [playerName, activeChat].sort().join('_');
    try {
      await addDoc(collection(db, 'privateChats', chatId, 'messages'), {
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
          {activeChat ? (
            <button 
              onClick={() => setActiveChat(null)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-black italic uppercase tracking-tighter">
              {activeChat ? activeChat : 'Friends'} <span className={activeChat ? 'text-cyan-400' : 'text-cyan-400'}>System</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
              {activeChat ? 'Private Chat' : 'Connect & Play'}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!activeChat ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Search Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Find Players</h3>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search usernames..."
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors pr-14"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 p-3 bg-cyan-600 rounded-xl text-white hover:bg-cyan-500 transition-all active:scale-95"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map(name => (
                  <div key={name} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <span className="font-black uppercase text-sm">{name}</span>
                    <button 
                      onClick={() => handleAddFriend(name)}
                      className="p-2 bg-cyan-600 rounded-lg text-white hover:bg-cyan-500 transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Friends List Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Your Friends</h3>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8 opacity-50 space-y-2">
                <Users className="w-10 h-10 mx-auto" />
                <p className="text-[10px] uppercase tracking-widest">No friends yet. Add some!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {friends.map(friend => (
                  <div 
                    key={friend.name} 
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group"
                    onClick={() => setActiveChat(friend.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="font-black uppercase text-sm">{friend.name}</span>
                    </div>
                    <MessageCircle className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <MessageCircle className="w-12 h-12" />
                <p className="text-sm font-mono uppercase tracking-widest">Start a conversation with {activeChat}</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === playerName ? 'items-end' : 'items-start'}`}
                >
                  <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] ${
                    msg.sender === playerName 
                      ? 'bg-cyan-600 text-white rounded-tr-none' 
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
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors pr-14"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 p-3 bg-cyan-600 rounded-xl text-white hover:bg-cyan-500 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
}
