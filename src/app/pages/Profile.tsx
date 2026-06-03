import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Edit2,
  MapPin,
  Calendar,
  LogOut,
  Bell,
  Lock,
  HelpCircle,
  ChevronRight,
  Settings,
  Star,
  Award,
  FileText,
  Shield,
  Sparkles,
  Check,
  X
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { getUserLevel } from "../../lib/levels";
import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import type { User } from "@supabase/supabase-js";

export function Profile() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatars = [
    "Sophia", "Jack", "Felix", "Milo", "Luna", "Leo", 
    "Maya", "Oliver", "Zoe", "Jasper", "Bella", "Silas"
  ].map(seed => `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleUpdateAvatar = async (url: string) => {
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", user.id);
      
      if (!error) {
        setProfile({ ...profile, avatar_url: url });
        setShowAvatarModal(false);
      }
    }
    setIsSubmitting(false);
  };

  const user = {
    name: profile?.full_name || currentUser?.user_metadata?.full_name || "Guest User",
    email: currentUser?.email || "guest@email.com",
    joinedDate: currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString("en-US", { month: 'long', year: 'numeric' }) : "January 2026",
    avatar: currentUser?.user_metadata?.full_name?.charAt(0) || "G",
    level: getUserLevel(profile?.points || 0).current.name,
    surveysCompleted: profile?.completed_count || 0,
    totalPoints: profile?.points || 0,
    badges: 5,
  };

  const stats = [
    {
      label: "Surveys",
      value: user.surveysCompleted.toString(),
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Points",
      value: user.totalPoints.toLocaleString(),
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Badges",
      value: user.badges.toString(),
      icon: Award,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const menuSections = [
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          subtitle: "Push & email alerts",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        },
        {
          icon: Lock,
          label: "Privacy & Security",
          subtitle: "Password, 2FA settings",
          color: "text-violet-600",
          bgColor: "bg-violet-50",
        },
        {
          icon: Settings,
          label: "App Settings",
          subtitle: "Language, theme",
          color: "text-gray-600",
          bgColor: "bg-gray-100",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help & Support",
          subtitle: "FAQs and contact us",
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
        },
        {
          icon: Shield,
          label: "Terms & Privacy",
          subtitle: "Legal information",
          color: "text-amber-600",
          bgColor: "bg-amber-50",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-purple-600 to-indigo-600 px-6 lg:px-10 pt-8 pb-16 rounded-b-[32px] lg:rounded-b-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-10 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-1/3" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-white text-2xl font-bold">Profile</h1>
            <button className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-white/25 transition-colors">
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Profile Card - Overlapping header */}
      <div className="px-6 lg:px-10 -mt-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card rounded-3xl shadow-lg border border-border p-5"
        >
          {/* Avatar & Name */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <div className="w-18 h-18 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full p-[2.5px]">
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  <img
                    src={profile?.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.name}&backgroundColor=b6e3f4`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
                {getUserLevel(profile?.points || 0).current.emoji} {getUserLevel(profile?.points || 0).current.name}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground truncate">
                {user.name}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
              <p className="text-xs text-primary font-medium mt-0.5">
                {user.level}
              </p>
            </div>
            <button 
              onClick={() => setShowAvatarModal(true)}
              className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <Edit2 className="w-4 h-4 text-primary" />
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                  className={`${stat.bg} rounded-xl p-3 text-center`}
                >
                  <Icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                  <p className="text-base font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Personal Info */}
          <div className="space-y-3">
            {[
              {
                icon: Calendar,
                label: "Member Since",
                value: user.joinedDate,
                color: "text-violet-500",
                bg: "bg-violet-50",
              },
            ].map((info) => {
              const Icon = info.icon;
              return (
                <div
                  key={info.label}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30"
                >
                  <div
                    className={`w-9 h-9 ${info.bg} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className={`w-4 h-4 ${info.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {info.label}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {info.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <div key={section.title} className="mt-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
              {section.title}
            </p>
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === section.items.length - 1;
                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.3 + (sectionIndex * 3 + index) * 0.05,
                    }}
                    className={`w-full flex items-center gap-3.5 p-4 hover:bg-muted/30 transition-colors ${
                      !isLast ? "border-b border-border" : ""
                    }`}
                  >
                    <div
                      className={`w-10 h-10 ${item.bgColor} rounded-xl flex items-center justify-center`}
                    >
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-foreground">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.subtitle}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          onClick={handleSignOut}
          className="w-full mt-5 mb-8 bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-all active:scale-[0.97] p-4"
        >
          <div className="flex items-center justify-center gap-2.5">
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="font-semibold text-red-500 text-sm">
              Sign Out
            </span>
          </div>
        </motion.button>
      </div>

      {/* Avatar Selection Modal */}
      <AnimatePresence>
        {showAvatarModal && (
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
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Change Avatar</h2>
                  <button 
                    onClick={() => setShowAvatarModal(false)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 max-h-[300px] overflow-y-auto px-1 py-1">
                  {avatars.map((url, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateAvatar(url)}
                      className={`relative aspect-square rounded-[20px] overflow-hidden border-2 transition-all duration-300 ${
                        profile?.avatar_url === url
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                      {profile?.avatar_url === url && (
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
                      {isSubmitting && profile?.avatar_url !== url && (
                        <div className="absolute inset-0 bg-white/40" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
