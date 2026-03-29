import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getRankInfo = (score: number) => {
  const rankLevel = Math.floor(score / 500);
  const ranks = [
    { name: 'Novice', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' },
    { name: 'Bronze', color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/20' },
    { name: 'Silver', color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/20' },
    { name: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
    { name: 'Platinum', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
    { name: 'Diamond', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { name: 'Master', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    { name: 'Grandmaster', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { name: 'Legend', color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  ];
  const rank = ranks[Math.min(rankLevel, ranks.length - 1)];
  return { ...rank, level: rankLevel + 1 };
};
