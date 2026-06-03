import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, FileText, Trophy, User, Sparkles, X, Check, Menu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const avatars = [
    "Sophia", "Jack", "Felix", "Milo", "Luna", "Leo",
    "Maya", "Oliver", "Zoe", "Jasper", "Bella", "Silas"
  ].map(seed => `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`);

  useEffect(() => {
    async function ensureProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if profile exists and get avatar_url
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (!profileData) {
          console.log("Creating missing profile in Layout...");
          const { data: newProfile } = await supabase.from("profiles").insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || "New User",
            email: user.email,
            points: 0,
            completed_count: 0,
            role: "User",
          }).select().single();

          setProfile(newProfile);
          setShowOnboarding(true);
        } else {
          setProfile(profileData);
          if (!profileData.avatar_url) {
            setShowOnboarding(true);
          }
        }
      } else {
        // Redirect if not authenticated
        navigate("/");
      }
    }
    ensureProfile();
  }, [navigate]);

  const handleUpdateAvatar = async () => {
    if (!selectedAvatar) return;
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: selectedAvatar })
        .eq("id", user.id);

      if (!error) {
        setProfile({ ...profile, avatar_url: selectedAvatar });
        setShowOnboarding(false);
      } else {
        console.error("Error updating avatar:", error);
      }
    }
    setIsSubmitting(false);
  };

  const navItems = [
    { path: "/app", icon: Home, label: "Home" },
    { path: "/app/activity", icon: FileText, label: "Activity" },
    { path: "/app/leaderboard", icon: Trophy, label: "Ranking" },
    { path: "/app/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname.startsWith(path);
  };

  const isSurveyPage = location.pathname.includes("/survey/");

  return (
    <div className="min-h-screen bg-background flex">
      {/* ═══════ Desktop Sidebar (lg+) ═══════ */}
      {!isSurveyPage && (
        <motion.aside
          initial={false}
          animate={{ width: sidebarCollapsed ? 80 : 260 }}
          className="hidden lg:flex flex-col sticky top-0 h-screen bg-white border-r border-border z-40 overflow-hidden"
        >
          {/* Sidebar Header */}
          <div className="p-5 flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
            >
              <Menu className="text-white w-5 h-5" />
            </button>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-lg tracking-tight text-foreground whitespace-nowrap"
                >
                  S.U.R.V.E.Y
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* User Card */}
          <AnimatePresence>
            {!sidebarCollapsed && profile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-4"
              >
                <div className="bg-gradient-to-br from-primary/5 to-purple-50 rounded-2xl p-4 border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-[2px] flex-shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white">
                        <img
                          src={profile?.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.full_name}&backgroundColor=b6e3f4`}
                          alt={profile?.full_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{profile?.full_name || "User"}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{profile?.email}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav Items */}
          <nav className="flex-1 px-3 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group relative ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-primary" : "group-hover:scale-110 transition-transform"}`} />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-medium whitespace-nowrap text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="sidebarActiveNav"
                      className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 border-t border-border"
              >
                <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <p className="text-xs font-bold uppercase tracking-wider">Pro Tip</p>
                  </div>
                  <p className="text-[11px] text-white/80 leading-relaxed">
                    Complete more surveys to earn points and climb the leaderboard!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      )}

      {/* ═══════ Main Content Area ═══════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main Content */}
        <div className={`flex-1 overflow-auto ${isSurveyPage ? "" : "pb-24 lg:pb-6"}`}>
          <div className="w-full max-w-4xl mx-auto">
            <Outlet />
          </div>
        </div>

        {/* ═══════ Mobile Bottom Navigation ═══════ */}
        {!isSurveyPage && (
          <div className="fixed bottom-0 left-0 right-0 lg:hidden px-4 pb-safe z-50">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/8 border border-gray-200/60 mx-2 mb-2">
              <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 relative group"
                    >
                      <div className="relative">
                        {active && (
                          <motion.div
                            layoutId="navBg"
                            className="absolute -inset-1.5 bg-primary/10 rounded-xl"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                        <Icon
                          className={`w-5 h-5 relative z-10 transition-colors duration-200 ${active ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                            }`}
                        />
                      </div>
                      <span
                        className={`text-[10px] transition-colors duration-200 ${active
                            ? "text-primary font-semibold"
                            : "text-gray-400 group-hover:text-gray-500"
                          }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Avatar Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white w-full max-w-[400px] rounded-[32px] overflow-hidden shadow-2xl relative"
            >
              <div className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    Choose Your Avatar
                  </h2>
                  <p className="text-sm text-gray-500">
                    Pick a profile picture that represents you best.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 max-h-[320px] overflow-y-auto px-1 py-1">
                  {avatars.map((url, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedAvatar(url)}
                      className={`relative aspect-square rounded-[20px] overflow-hidden border-2 transition-all duration-300 ${selectedAvatar === url
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                          : "border-gray-100 hover:border-gray-200"
                        }`}
                    >
                      <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                      {selectedAvatar === url && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-primary text-white p-1 rounded-full"
                          >
                            <Check className="w-4 h-4" />
                          </motion.div>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  disabled={!selectedAvatar || isSubmitting}
                  onClick={handleUpdateAvatar}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/25 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Let's Go!</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}