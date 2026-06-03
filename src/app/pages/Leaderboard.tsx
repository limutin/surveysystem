import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Trophy,
  Crown,
  Medal,
  Star,
  TrendingUp,
  Flame,
  ChevronUp,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface LeaderboardUser {
  id: string;
  full_name: string;
  email: string;
  points: number;
  completed_count: number;
  avatar_url: string | null;
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-xs font-black text-gray-400">#{rank}</span>;
}

function getRankBg(rank: number) {
  if (rank === 1) return "from-yellow-50 to-amber-50 border-yellow-200/60 ring-yellow-200/40";
  if (rank === 2) return "from-slate-50 to-gray-50 border-slate-200/60 ring-slate-200/40";
  if (rank === 3) return "from-orange-50 to-amber-50 border-orange-200/60 ring-orange-200/40";
  return "from-white to-gray-50/50 border-gray-100 ring-gray-100/40";
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      // Fetch all users ordered by points
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, points, completed_count, avatar_url")
        .order("points", { ascending: false })
        .limit(50);

      if (data) {
        setLeaderboard(data);
        // Find current user's rank
        const idx = data.findIndex(u => u.id === user?.id);
        if (idx !== -1) setCurrentUserRank(idx + 1);
      }
      setIsLoading(false);
    }
    loadLeaderboard();
  }, []);

  const currentUserData = leaderboard.find(u => u.id === currentUserId);

  return (
    <div className="min-h-screen bg-background pb-20 w-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-purple-600 to-indigo-600 px-6 lg:px-10 pt-12 pb-8 rounded-b-[32px] lg:rounded-b-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-6 left-0 w-20 h-20 bg-white/5 rounded-full -translate-x-1/3" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full bg-white/[0.04]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-white text-2xl font-bold">Leaderboard</h1>
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-white/70 text-sm">See where you stand among the community</p>
        </motion.div>

        {/* Your Rank Card */}
        {currentUserData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 bg-white/12 backdrop-blur-xl rounded-2xl p-5 border border-white/15 shadow-xl shadow-black/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-[2px]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      <img
                        src={currentUserData.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${currentUserData.full_name}&backgroundColor=b6e3f4`}
                        alt={currentUserData.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md">
                    #{currentUserRank}
                  </div>
                </div>
                <div>
                  <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-0.5">Your Ranking</p>
                  <p className="text-white text-lg font-black">{currentUserData.full_name}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                  <p className="text-white text-2xl font-black tracking-tighter">
                    {currentUserData.points.toLocaleString()}
                  </p>
                </div>
                <p className="text-white/50 text-[10px] font-bold uppercase">points earned</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="px-6 lg:px-10 -mt-0 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-end justify-center gap-3"
          >
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex flex-col items-center flex-1"
            >
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <img
                      src={leaderboard[1].avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${leaderboard[1].full_name}&backgroundColor=b6e3f4`}
                      alt={leaderboard[1].full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-md">2</div>
              </div>
              <p className="text-xs font-bold text-foreground truncate max-w-[90px] text-center">{leaderboard[1].full_name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="text-[11px] font-black text-muted-foreground">{leaderboard[1].points.toLocaleString()}</span>
              </div>
              <div className="w-full h-16 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-2xl mt-2 border border-slate-200/60 border-b-0" />
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-col items-center flex-1"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative mb-2"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 p-[2.5px] shadow-lg shadow-amber-300/30">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <img
                      src={leaderboard[0].avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${leaderboard[0].full_name}&backgroundColor=b6e3f4`}
                      alt={leaderboard[0].full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -top-2 -right-1 w-7 h-7 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/30">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              </motion.div>
              <p className="text-sm font-black text-foreground truncate max-w-[100px] text-center">{leaderboard[0].full_name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-black text-primary">{leaderboard[0].points.toLocaleString()}</span>
              </div>
              <div className="w-full h-24 bg-gradient-to-t from-amber-100 to-yellow-50 rounded-t-2xl mt-2 border border-amber-200/60 border-b-0" />
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center flex-1"
            >
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-amber-400 p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <img
                      src={leaderboard[2].avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${leaderboard[2].full_name}&backgroundColor=b6e3f4`}
                      alt={leaderboard[2].full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-md">3</div>
              </div>
              <p className="text-xs font-bold text-foreground truncate max-w-[90px] text-center">{leaderboard[2].full_name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="text-[11px] font-black text-muted-foreground">{leaderboard[2].points.toLocaleString()}</span>
              </div>
              <div className="w-full h-12 bg-gradient-to-t from-orange-100 to-amber-50 rounded-t-2xl mt-2 border border-orange-200/60 border-b-0" />
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Full Rankings */}
      <div className="px-6 lg:px-10 py-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-black text-foreground tracking-tight">All Rankings</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {leaderboard.map((user, index) => {
              const rank = index + 1;
              const isCurrentUser = user.id === currentUserId;
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 + index * 0.03 }}
                  className={`bg-gradient-to-r ${getRankBg(rank)} rounded-2xl border ring-1 p-4 transition-all ${
                    isCurrentUser ? "shadow-md shadow-primary/10 !border-primary/30 !ring-primary/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      {getRankIcon(rank)}
                    </div>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-white shadow-sm">
                      <img
                        src={user.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.full_name}&backgroundColor=b6e3f4`}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold truncate ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                          {user.full_name || "Anonymous"}
                        </p>
                        {isCurrentUser && (
                          <span className="text-[9px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-md uppercase">You</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {user.completed_count || 0} surveys completed
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-black text-foreground">{(user.points || 0).toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium">points</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {leaderboard.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-12 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-200"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
                  <Trophy className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-bold text-lg">No Rankings Yet</h3>
                <p className="text-gray-400 text-sm text-center mt-1">
                  Complete surveys to earn points and climb the leaderboard!
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
