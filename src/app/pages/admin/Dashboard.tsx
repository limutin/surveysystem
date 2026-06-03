import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  ClipboardList, 
  CheckCircle2, 
  TrendingUp, 
  Plus,
  ArrowUpRight,
  MoreVertical,
  Calendar
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { supabase } from "../../../lib/supabase";

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

export function AdminDashboard() {
  const [counts, setCounts] = useState({ users: 0, surveys: 0, responses: 0, rate: "0%" });
  const [isLoading, setIsLoading] = useState(true);
  const [recentResponses, setRecentResponses] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [{ count: usersCount }, { count: surveysCount }, { count: responsesCount }] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("surveys").select("*", { count: "exact", head: true }),
          supabase.from("responses").select("*", { count: "exact", head: true }),
        ]);

        setCounts({
          users: usersCount || 0,
          surveys: surveysCount || 0,
          responses: responsesCount || 0,
          rate: surveysCount ? ((responsesCount || 0) / (surveysCount || 1)).toFixed(1) : "0"
        });

        // Fetch recent responses
        const { data: recentData } = await supabase
          .from("responses")
          .select(`
            *,
            survey:surveys (title, reward, emoji),
            profile:profiles (full_name, email, avatar_url)
          `)
          .order("submitted_at", { ascending: false })
          .limit(5);

        if (recentData) setRecentResponses(recentData);

        // Fetch surveys for category chart
        const { data: surveyData } = await supabase
          .from("surveys")
          .select("category, responses");

        if (surveyData) {
          const catMap: Record<string, number> = {};
          surveyData.forEach(s => {
            const cat = s.category || "General";
            catMap[cat] = (catMap[cat] || 0) + (s.responses || 0);
          });
          setCategoryData(Object.entries(catMap).map(([name, responses]) => ({ name, responses })));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
      setIsLoading(false);
    }
    fetchStats();
  }, []);

  const stats = [
    { label: "Total Users", value: (counts.users || 0).toLocaleString(), icon: Users, color: "bg-blue-50 text-blue-600", trend: `${counts.users}` },
    { label: "Active Surveys", value: (counts.surveys || 0).toLocaleString(), icon: ClipboardList, color: "bg-indigo-50 text-indigo-600", trend: `${counts.surveys}` },
    { label: "Total Responses", value: (counts.responses || 0).toLocaleString(), icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600", trend: `${counts.responses}` },
    { label: "Avg per Survey", value: counts.rate, icon: TrendingUp, color: "bg-amber-50 text-amber-600", trend: counts.rate },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-slate-900"
          >
            Dashboard Overview
          </motion.h1>
          <p className="text-slate-500 mt-1">Welcome back, manager. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm">
            <Calendar className="w-4 h-4" />
            Today
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className={`p-3 rounded-2xl w-fit ${stat.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <div className="flex items-end justify-between mt-1">
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-6">Responses by Category</h2>
          <div className="h-[300px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="responses" radius={[6, 6, 0, 0]}>
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No survey data yet. Create your first survey!
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Surveys</p>
                  <p className="text-sm font-bold text-slate-800">{counts.surveys} Created</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Responses Collected</p>
                  <p className="text-sm font-bold text-slate-800">{counts.responses} Total</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-purple-500 rounded-full" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Registered Users</p>
                  <p className="text-sm font-bold text-slate-800">{counts.users} Members</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Survey Submissions</h2>
          <span className="text-xs text-slate-400 font-bold">{recentResponses.length} recent</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Survey Title</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Points</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentResponses.length > 0 ? recentResponses.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                        <img src={r.profile?.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${r.profile?.full_name || 'User'}`} alt="user" />
                      </div>
                      <span className="text-sm font-bold text-slate-800">{r.profile?.full_name || "Anonymous"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{r.survey?.title || "Unknown Survey"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase">Completed</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-amber-600">+{r.points_awarded || 0} pts</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No submissions yet. Users will appear here after completing surveys.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
