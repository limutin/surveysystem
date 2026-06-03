import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Star, 
  MessageSquare, 
  PieChart,
  Activity,
  Award
} from "lucide-react";
import { 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";
import { supabase } from "../../../lib/supabase";

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#10b981', '#06b6d4', '#eab308'];

export function AdminAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    totalUsers: 0,
    totalPointsAwarded: 0,
    avgResponsesPerSurvey: 0,
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [surveyPerformance, setSurveyPerformance] = useState<any[]>([]);
  const [topSurveys, setTopSurveys] = useState<any[]>([]);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        // Fetch all surveys
        const { data: surveys } = await supabase
          .from("surveys")
          .select("*")
          .order("responses", { ascending: false });

        // Fetch all responses
        const { data: responses } = await supabase
          .from("responses")
          .select("points_awarded, submitted_at");

        // Fetch user count
        const { count: userCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        const totalResponses = responses?.length || 0;
        const totalSurveys = surveys?.length || 0;
        const totalPoints = responses?.reduce((a, r) => a + (r.points_awarded || 0), 0) || 0;

        setStats({
          totalSurveys,
          totalResponses,
          totalUsers: userCount || 0,
          totalPointsAwarded: totalPoints,
          avgResponsesPerSurvey: totalSurveys > 0 ? Math.round(totalResponses / totalSurveys) : 0,
        });

        // Category breakdown
        if (surveys) {
          const catMap: Record<string, { count: number; responses: number }> = {};
          surveys.forEach(s => {
            const cat = s.category || "General";
            if (!catMap[cat]) catMap[cat] = { count: 0, responses: 0 };
            catMap[cat].count += 1;
            catMap[cat].responses += (s.responses || 0);
          });
          setCategoryBreakdown(
            Object.entries(catMap).map(([name, val]) => ({ name, value: val.count, responses: val.responses }))
          );

          // Top performing surveys
          setTopSurveys(surveys.slice(0, 5));

          // Survey performance data (for bar chart)
          setSurveyPerformance(
            surveys.slice(0, 8).map(s => ({
              name: s.title?.length > 15 ? s.title.substring(0, 15) + "..." : s.title,
              responses: s.responses || 0,
            }))
          );
        }
      } catch (err) {
        console.error("Analytics error:", err);
      }
      setIsLoading(false);
    }
    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summaryCards = [
    { label: "Total Surveys", value: stats.totalSurveys.toString(), icon: BarChart3, color: "bg-indigo-50 text-indigo-600" },
    { label: "Total Responses", value: stats.totalResponses.toString(), icon: MessageSquare, color: "bg-emerald-50 text-emerald-600" },
    { label: "Total Users", value: stats.totalUsers.toString(), icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Points Awarded", value: stats.totalPointsAwarded.toLocaleString(), icon: Award, color: "bg-amber-50 text-amber-600" },
    { label: "Avg Responses/Survey", value: stats.avgResponsesPerSurvey.toString(), icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics & Insights</h1>
        <p className="text-slate-500 mt-1">Comprehensive overview of your survey platform performance.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm"
            >
              <div className={`p-2.5 rounded-xl w-fit ${card.color} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900">Survey Distribution by Category</h2>
          </div>
          {categoryBreakdown.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-[200px] h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {categoryBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {categoryBreakdown.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{cat.value} surveys · {cat.responses} responses</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-slate-400 text-sm">No data yet</div>
          )}
        </motion.div>

        {/* Survey Performance Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900">Survey Performance</h2>
          </div>
          {surveyPerformance.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={surveyPerformance}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="responses" radius={[6, 6, 0, 0]} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-slate-400 text-sm">No data yet</div>
          )}
        </motion.div>
      </div>

      {/* Top Performing Surveys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Top Performing Surveys</h2>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {topSurveys.length > 0 ? topSurveys.map((survey, i) => (
            <div key={survey.id} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm">
                #{i + 1}
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-400 rounded-xl flex items-center justify-center text-lg">
                {survey.emoji || "📝"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{survey.title}</p>
                <p className="text-xs text-slate-400">{survey.category} · {survey.reward}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">{(survey.responses || 0).toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">responses</p>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-slate-400 text-sm">
              No surveys yet. Create your first survey to see analytics.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
