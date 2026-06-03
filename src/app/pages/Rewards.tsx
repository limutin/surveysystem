import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Trophy,
  Gift,
  Zap,
  Star,
  ChevronRight,
  Sparkles,
  Crown,
  TrendingUp,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

const rewards = [
  {
    id: 1,
    title: "$5 Amazon Gift Card",
    description: "Redeem for shopping on Amazon",
    points: 500,
    emoji: "🛍️",
    color: "from-orange-500 to-amber-400",
  },
  {
    id: 2,
    title: "$10 Starbucks Gift Card",
    description: "Enjoy your favorite drinks",
    points: 1000,
    emoji: "☕",
    color: "from-emerald-500 to-green-400",
  },
];

const milestones = [
  { level: 1, name: "Starter", minPts: 0, maxPts: 500, emoji: "🌱" },
  { level: 2, name: "Explorer", minPts: 500, maxPts: 1500, emoji: "🧭" },
  { level: 3, name: "Pro", minPts: 1500, maxPts: 3000, emoji: "⭐" },
  { level: 4, name: "Master", minPts: 3000, maxPts: 5000, emoji: "👑" },
];

export function Rewards() {
  const [currentPoints, setCurrentPoints] = useState(0);
  const [rewardsList, setRewardsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch points
        const { data: profile } = await supabase
          .from("profiles")
          .select("points")
          .eq("id", user.id)
          .single();
        if (profile) setCurrentPoints(profile.points);

        // Fetch rewards
        const { data: rewardsData } = await supabase
          .from("rewards")
          .select("*")
          .eq("is_active", true)
          .order("points", { ascending: true });
        
        if (rewardsData) {
          setRewardsList(rewardsData);
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const currentMilestone = milestones.find(
    (m) => currentPoints >= m.minPts && currentPoints < m.maxPts
  ) || milestones[milestones.length - 1];
  const nextMilestone = milestones.find((m) => currentPoints < m.maxPts);
  const milestoneProgress = nextMilestone
    ? ((currentPoints - currentMilestone.minPts) /
        (nextMilestone.maxPts - currentMilestone.minPts)) *
      100
    : 100;

  return (
    <div className="min-h-screen bg-background pb-20 w-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-purple-600 to-indigo-600 px-6 lg:px-10 pt-12 pb-8 rounded-b-[32px] lg:rounded-b-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-6 left-0 w-20 h-20 bg-white/5 rounded-full -translate-x-1/3" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-white text-2xl font-bold">Rewards</h1>
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
              <Crown className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-white/70 text-sm">Redeem your earned points</p>
        </motion.div>

        {/* Points Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-5 bg-white/12 backdrop-blur-xl rounded-2xl p-5 border border-white/15 shadow-xl shadow-black/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/60 text-xs mb-1 uppercase tracking-widest font-bold">Your Balance</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                <p className="text-white text-3xl font-black tracking-tighter">
                  {currentPoints.toLocaleString()}
                </p>
                <span className="text-white/50 text-sm font-bold uppercase">pts</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 border border-white/20">
              <Trophy className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Milestone Progress */}
          <div>
            <div className="flex items-center justify-between text-[10px] mb-2 font-bold uppercase tracking-wider">
              <span className="text-white/90 px-2 py-0.5 bg-white/10 rounded-lg flex items-center gap-1">
                {currentMilestone.emoji} {currentMilestone.name}
              </span>
              {nextMilestone && (
                <span className="text-white/50">
                  Target: {nextMilestone.name}
                </span>
              )}
            </div>
            <div className="h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                initial={{ width: 0 }}
                animate={{ width: `${milestoneProgress}%` }}
                transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              />
            </div>
            {nextMilestone && (
              <p className="text-white/40 text-[9px] mt-2 font-medium italic">
                Only {nextMilestone.maxPts - currentPoints} pts left until you reach {nextMilestone.name} tier!
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-10 py-6">
        {/* Section heading */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black text-foreground tracking-tight">
              AVAILABLE REWARDS
            </h2>
          </div>
          <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-lg uppercase">
            {rewardsList.length} items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewardsList.map((reward, index) => {
            const canRedeem = currentPoints >= reward.points;
            const progress = Math.min(
              (currentPoints / reward.points) * 100,
              100
            );

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
                className={`bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all group ${
                  canRedeem
                    ? "hover:shadow-xl cursor-pointer border-primary/20 bg-primary/[0.01]"
                    : "opacity-75"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${reward.color || 'from-orange-500 to-amber-400'} rounded-[20px] flex items-center justify-center text-3xl flex-shrink-0 shadow-lg border border-white/20 group-hover:scale-105 transition-transform`}
                    >
                      {reward.emoji || '🎁'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-foreground text-base leading-tight">
                          {reward.title}
                        </h3>
                        {canRedeem && (
                          <motion.div 
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter"
                          >
                            Ready
                          </motion.div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {reward.description}
                      </p>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[11px] mb-2">
                          <div className="flex items-center gap-1.5 font-black text-foreground">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{reward.points.toLocaleString()} pts</span>
                          </div>
                          <span className="text-muted-foreground font-bold">
                            {Math.round(progress)}% of goal
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100/50 rounded-full overflow-hidden p-[1.5px] border border-gray-100">
                          <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${reward.color || 'from-primary to-purple-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      {canRedeem && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full mt-4 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20 transition-all uppercase tracking-widest"
                        >
                          Redeem Reward
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {rewardsList.length === 0 && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex flex-col items-center justify-center p-12 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <Gift className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg">No Rewards Yet</h3>
              <p className="text-gray-400 text-sm text-center mt-1">
                Collect more points! We'll add new rewards very soon.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
