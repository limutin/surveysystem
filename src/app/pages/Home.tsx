import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { getUserLevel } from "../../lib/levels";
import type { User } from "@supabase/supabase-js";
import {
  Clock,
  Trophy,
  ChevronRight,
  Flame,
  Target,
  Bell,
  Sparkles,
  TrendingUp,
  ClipboardList
} from "lucide-react";

/* ───── Floating Orb Component ───── */
function FloatingOrb({
  size,
  x,
  y,
  delay,
  duration,
}: {
  size: number;
  x: string;
  y: string;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-white/[0.07] backdrop-blur-sm"
      style={{ width: size, height: size, left: x, top: y }}
      animate={{
        y: [0, -18, 0, 12, 0],
        x: [0, 10, -8, 6, 0],
        scale: [1, 1.08, 0.95, 1.05, 1],
        opacity: [0.5, 0.8, 0.5, 0.7, 0.5],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* ───── Animated Counter ───── */
function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="inline-block"
    >
      {value}{suffix}
    </motion.span>
  );
}

/* ───── Shimmer Highlight ───── */
function ShimmerBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
        animate={{
          x: ["-150%", "150%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}

/* ───── Survey Card Component ───── */
function SurveyCard({
  survey,
  index,
  onClick,
}: {
  survey: any;
  index: number;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  // Fallback gradient colors
  const gradientColor = survey.color || "from-indigo-500 to-purple-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.3 + index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group relative"
    >
      {/* ── Cover Image Banner ── */}
      <div className="relative w-full h-44 overflow-hidden">
        {survey.image_url && !imgError ? (
          <img
            src={survey.image_url}
            alt={survey.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradientColor} flex items-center justify-center`}>
            <span className="text-5xl">{survey.emoji || "📝"}</span>
          </div>
        )}

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-bold text-white text-[16px] leading-snug drop-shadow-md line-clamp-2">
            {survey.title}
          </h3>
        </div>

        {/* Category tag – top left */}
        {survey.tag && (
          <div className="absolute top-2.5 left-2.5">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md backdrop-blur-sm ${survey.tagColor || "bg-white/20 text-white"}`}>
              {survey.tag}
            </span>
          </div>
        )}

        {/* Duration badge – top right */}
        {(survey.duration || survey.time) && (
          <div className="absolute top-2.5 right-2.5">
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md">
              <Clock className="w-3 h-3" />
              <span>{survey.duration || survey.time}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Card Footer ── */}
      <div className="p-3.5">
        <p className="text-xs text-muted-foreground line-clamp-1 mb-2.5">
          {survey.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-2 h-2 rounded-full bg-yellow-400"
              animate={{
                boxShadow: [
                  "0 0 0px rgba(250, 204, 21, 0.4)",
                  "0 0 8px rgba(250, 204, 21, 0.6)",
                  "0 0 0px rgba(250, 204, 21, 0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs font-bold text-foreground">{survey.reward}</span>
          </div>

          <motion.div
            className="flex items-center gap-1 text-primary text-xs font-semibold"
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Start</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}


/* ───── Main Home Component ───── */
export function Home() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeSurveys, setActiveSurveys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (profileData) setProfile(profileData);

        // Fetch rank (count users with more points)
        const { count: higherCount } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gt("points", profileData?.points || 0);
        setUserRank((higherCount || 0) + 1);

        // Calculate streak from responses
        const { data: userResps } = await supabase
          .from("responses")
          .select("submitted_at")
          .eq("user_id", user.id)
          .order("submitted_at", { ascending: false });

        if (userResps && userResps.length > 0) {
          let streakCount = 0;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const uniqueDays = new Set<string>();
          userResps.forEach(r => {
            if (r.submitted_at) {
              const d = new Date(r.submitted_at);
              uniqueDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
            }
          });
          // Count consecutive days backward from today
          for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
            if (uniqueDays.has(key)) {
              streakCount++;
            } else if (i === 0) {
              // today might not have activity yet, skip
              continue;
            } else {
              break;
            }
          }
          setStreak(streakCount);
        }
      }

      // Fetch user responses to filter out already answered surveys
      const { data: userResponses } = await supabase
        .from("responses")
        .select("survey_id")
        .eq("user_id", user?.id);

      const answeredIds = new Set(userResponses?.map(r => r.survey_id) || []);

      // Fetch surveys
      const { data: surveyData } = await supabase
        .from("surveys")
        .select("*")
        .eq("status", "Active")
        .order("created_at", { ascending: false });

      if (surveyData) {
        // Only show surveys the user hasn't answered yet
        const filtered = surveyData.filter(s => !answeredIds.has(s.id));
        setActiveSurveys(filtered);
      }
      
      setIsLoading(false);
    }

    loadData();
  }, []);

  const userName = profile?.full_name || currentUser?.user_metadata?.full_name || "Guest User";
  const userPoints = profile?.points || 0;
  const completedCount = profile?.completed_count || 0;

  return (
    <div className="min-h-screen bg-background w-full">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-primary via-purple-600 to-indigo-600 px-6 lg:px-10 pt-12 pb-8 rounded-b-[32px] lg:rounded-b-[40px] relative overflow-hidden">
        {/* Floating orbs / particles */}
        <FloatingOrb size={80} x="75%" y="8%" delay={0} duration={6} />
        <FloatingOrb size={50} x="10%" y="60%" delay={1} duration={7} />
        <FloatingOrb size={35} x="85%" y="70%" delay={2} duration={5} />
        <FloatingOrb size={60} x="50%" y="15%" delay={0.5} duration={8} />
        <FloatingOrb size={25} x="25%" y="85%" delay={1.5} duration={6.5} />

        {/* Radial gradient glow pulse */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-white/[0.04]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.04, 0.08, 0.04],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Background decoration blobs */}
        <motion.div
          className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-4 left-4 w-24 h-24 bg-white/5 rounded-full"
          animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Top bar with profile & notification */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Profile avatar with animated ring */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-[2px]"
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    <img
                      src={profile?.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${userName}&backgroundColor=b6e3f4`}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
                {/* Online indicator with pulse */}
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-purple-600"
                  animate={{
                    boxShadow: [
                      "0 0 0px rgba(52, 211, 153, 0.4)",
                      "0 0 10px rgba(52, 211, 153, 0.6)",
                      "0 0 0px rgba(52, 211, 153, 0.4)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <p className="text-white/70 text-xs font-medium tracking-wide">
                  Good Morning 👋
                </p>
                <h1 className="text-white text-xl font-bold tracking-tight">
                  {userName}
                </h1>
              </motion.div>
            </div>

            {/* Notification bell with bounce */}
            <motion.button
              className="relative w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-white/25 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 10, -10, 0] }}
                transition={{
                  duration: 0.6,
                  delay: 1.5,
                  repeat: Infinity,
                  repeatDelay: 5,
                }}
              >
                <Bell className="w-5 h-5 text-white" />
              </motion.div>
              <motion.div
                className="absolute top-2 right-2.5 w-2 h-2 bg-red-400 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.button>
          </div>

          {/* Greeting with typewriter-style reveal */}
          <motion.h2
            className="text-white text-2xl font-bold mb-1 tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Let's earn some rewards! 🎉
          </motion.h2>
          <motion.p
            className="text-white/70 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            You have {activeSurveys.length} {activeSurveys.length === 1 ? 'survey' : 'surveys'} waiting for you
          </motion.p>
        </motion.div>

        {/* Stats Card with glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-5 bg-white/12 backdrop-blur-xl rounded-2xl p-4 border border-white/15 relative overflow-hidden"
        >
          {/* Shimmer sweep over stats card */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
            animate={{ x: ["-200%", "200%"] }}
            transition={{
              duration: 3,
              delay: 1,
              repeat: Infinity,
              repeatDelay: 5,
              ease: "easeInOut",
            }}
          />

          <div className="flex items-center justify-between relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <p className="text-white/60 text-xs mb-0.5">Total Points</p>
              <div className="flex items-center gap-1.5">
                <motion.div
                  className="w-2 h-2 bg-yellow-400 rounded-full"
                  animate={{
                    boxShadow: [
                      "0 0 0px rgba(250, 204, 21, 0)",
                      "0 0 12px rgba(250, 204, 21, 0.6)",
                      "0 0 0px rgba(250, 204, 21, 0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <p className="text-white text-2xl font-bold tracking-tight">
                  <AnimatedCounter value={userPoints.toLocaleString()} />
                </p>
              </div>
            </motion.div>

            <div className="h-10 w-px bg-white/15" />

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <p className="text-white/60 text-xs mb-0.5">Completed</p>
              <p className="text-white text-2xl font-bold tracking-tight">
                <AnimatedCounter value={completedCount.toString()} />
              </p>
            </motion.div>

            <div className="h-10 w-px bg-white/15" />

            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <ShimmerBadge className={`w-11 h-11 bg-gradient-to-br ${getUserLevel(userPoints).current.color} rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30`}>
                <span className="text-xl relative z-10">{getUserLevel(userPoints).current.emoji}</span>
              </ShimmerBadge>
              <div>
                <p className="text-white/60 text-xs">Level</p>
                <p className="text-white text-lg font-bold">{getUserLevel(userPoints).current.name}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="px-6 lg:px-10 -mt-0 pt-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-4"
        >
          {[{
            icon: Flame,
            label: "Streak",
            value: `${streak} day${streak !== 1 ? 's' : ''}`,
            color: "text-orange-500",
            bg: "bg-gradient-to-br from-orange-50 to-amber-50",
            ringColor: "ring-orange-200/60",
          },
          {
            icon: Target,
            label: "Surveys",
            value: (completedCount || 0).toString(),
            color: "text-emerald-500",
            bg: "bg-gradient-to-br from-emerald-50 to-green-50",
            ringColor: "ring-emerald-200/60",
          },
          {
            icon: TrendingUp,
            label: "Rank",
            value: userRank ? `#${userRank}` : "--",
            color: "text-blue-500",
            bg: "bg-gradient-to-br from-blue-50 to-sky-50",
            ringColor: "ring-blue-200/60",
          }].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.45,
                  delay: 0.25 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -4,
                  scale: 1.03,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.95 }}
                className={`${stat.bg} rounded-2xl border border-border ring-1 ${stat.ringColor} p-3 text-center shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer`}
              >
                <motion.div
                  className="w-9 h-9 bg-white/80 rounded-xl flex items-center justify-center mx-auto mb-1.5 shadow-sm"
                  whileHover={{
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.4 },
                  }}
                >
                  <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </motion.div>
                <p className="text-sm font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* ── Available Surveys ── */}
      <div className="px-6 lg:px-10 py-5">
        <motion.div
          className="flex items-center justify-between mb-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                rotate: [0, 15, -15, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </motion.div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Available Surveys
            </h2>
          </div>
          <motion.button
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.95 }}
          >
            See All
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeSurveys.map((survey, index) => (
            <SurveyCard
              key={survey.id}
              survey={survey}
              index={index}
              onClick={() => navigate(`/app/survey/${survey.id}`)}
            />
          ))}
          {activeSurveys.length === 0 && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex flex-col items-center justify-center p-12 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <ClipboardList className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg">No Surveys Yet</h3>
              <p className="text-gray-400 text-sm text-center mt-1">
                Check back later! We'll notify you when new surveys are available.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
}
