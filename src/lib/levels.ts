// Shared level/tier system based on points
export const levels = [
  { name: "Newbie", minPts: 0, emoji: "🌱", color: "from-gray-400 to-slate-500" },
  { name: "Explorer", minPts: 100, emoji: "🧭", color: "from-emerald-400 to-green-500" },
  { name: "Contributor", minPts: 300, emoji: "⚡", color: "from-blue-400 to-cyan-500" },
  { name: "Pro", minPts: 500, emoji: "⭐", color: "from-amber-400 to-orange-500" },
  { name: "Expert", minPts: 1000, emoji: "💎", color: "from-purple-400 to-violet-500" },
  { name: "Master", minPts: 2000, emoji: "👑", color: "from-yellow-400 to-amber-500" },
  { name: "Legend", minPts: 5000, emoji: "🏆", color: "from-rose-400 to-pink-500" },
];

export function getUserLevel(points: number) {
  let current = levels[0];
  for (const level of levels) {
    if (points >= level.minPts) {
      current = level;
    } else {
      break;
    }
  }

  // Find next level
  const currentIndex = levels.indexOf(current);
  const next = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;

  // Calculate progress to next level
  const progress = next
    ? ((points - current.minPts) / (next.minPts - current.minPts)) * 100
    : 100;

  return { current, next, progress };
}
