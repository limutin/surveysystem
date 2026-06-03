import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Clock,
  Trophy,
  Filter,
  TrendingUp,
  Calendar,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

type FilterType = "all" | "week" | "month";

export function Activity() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [responses, setResponses] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, avg: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("responses")
          .select(`
            *,
            survey:surveys (*)
          `)
          .eq("user_id", user.id)
          .order("submitted_at", { ascending: false });

        if (error) {
          console.error("Activity load error:", error);
          alert(`Could not load activity: ${error.message}`);
        }

        if (data) {
          console.log("Loaded activity data:", data);
          setResponses(data);
          const total = data.reduce((acc, r) => acc + (r.points_awarded || 0), 0);
          setStats({
            total,
            avg: data.length ? Math.round(total / data.length) : 0
          });
        }
      } catch (err) {
        console.error("Critical activity error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadActivity();
  }, []);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-purple-600 to-indigo-600 px-6 lg:px-10 pt-12 pb-8 rounded-b-[32px] lg:rounded-b-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-8 left-0 w-20 h-20 bg-white/5 rounded-full -translate-x-1/2" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-white text-2xl font-bold">Activity</h1>
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-white/70 text-sm">
            Track your survey completion history
          </p>
        </motion.div>

        {/* Summary Cards */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            {
              icon: CheckCircle2,
              label: "Completed",
              value: (responses?.length || 0).toString(),
              delay: 0.1,
            },
            {
              icon: Trophy,
              label: "Total Pts",
              value: (stats?.total || 0).toString(),
              delay: 0.15,
            },
            {
              icon: TrendingUp,
              label: "Avg Pts",
              value: (stats?.avg || 0).toString(),
              delay: 0.2,
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: stat.delay }}
                className="bg-white/12 backdrop-blur-xl rounded-xl p-3 border border-white/15 text-center"
              >
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-white text-lg font-bold leading-tight">
                  {stat.value}
                </p>
                <p className="text-white/60 text-[10px] mt-0.5">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-10 py-5">
        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex items-center gap-2 mb-5"
        >
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                filter === f.key
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Recent Activity
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {responses.length} surveys
          </span>
        </div>

        {/* Activity List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {responses.map((response, index) => (
            <motion.div
              key={response.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.3 + index * 0.05 }}
              className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-11 h-11 bg-gradient-to-br ${response.survey?.color || 'from-gray-500 to-gray-400'} rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm`}
                  >
                    {response.survey?.emoji || '📋'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm leading-snug truncate">
                          {response.survey?.title || 'Unknown Survey'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-[11px]">{response.submitted_at ? new Date(response.submitted_at).toLocaleDateString() : "Recently"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="text-xs font-bold text-amber-700">
                          +{response.points_awarded}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2.5">
                      <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-semibold text-emerald-600">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {responses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Activity Yet
            </h3>
            <p className="text-muted-foreground text-sm">
              Complete surveys to see your activity here
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
