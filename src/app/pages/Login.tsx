import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";

/* ─── Floating particle decorations ─── */
function FloatingParticles() {
  const particles = [
    { size: 6, x: "10%", y: "15%", delay: 0, duration: 6 },
    { size: 4, x: "85%", y: "20%", delay: 1.2, duration: 5 },
    { size: 8, x: "70%", y: "65%", delay: 0.5, duration: 7 },
    { size: 5, x: "25%", y: "75%", delay: 2, duration: 5.5 },
    { size: 3, x: "50%", y: "10%", delay: 0.8, duration: 6.5 },
    { size: 7, x: "90%", y: "80%", delay: 1.5, duration: 4.5 },
    { size: 4, x: "15%", y: "50%", delay: 3, duration: 5 },
    { size: 5, x: "60%", y: "40%", delay: 0.3, duration: 7.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
            background:
              i % 2 === 0
                ? "rgba(91, 74, 232, 0.25)"
                : "rgba(168, 85, 247, 0.2)",
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── SVG illustration for the hero area ─── */
function SurveyIllustration() {
  return (
    <motion.svg
      viewBox="0 0 280 200"
      fill="none"
      className="w-full max-w-[240px] mx-auto"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Phone body */}
      <rect
        x="80"
        y="20"
        width="120"
        height="170"
        rx="16"
        fill="url(#phoneGrad)"
        stroke="#E2E0F9"
        strokeWidth="2"
      />
      {/* Screen */}
      <rect x="88" y="36" width="104" height="140" rx="8" fill="#F8F9FE" />
      {/* Status bar */}
      <rect x="120" y="24" width="40" height="4" rx="2" fill="#C4C0F0" />

      {/* Survey checkbox rows */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x="96"
            y={50 + i * 32}
            width="16"
            height="16"
            rx="4"
            fill={i < 2 ? "#5B4AE8" : "#E8E6FC"}
          />
          {i < 2 && (
            <path
              d={`M${100} ${58 + i * 32}l3 3 5-6`}
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          <rect
            x="118"
            y={52 + i * 32}
            width={60 - i * 8}
            height="6"
            rx="3"
            fill={i < 2 ? "#D1CEF5" : "#E8E6FC"}
          />
          <rect
            x="118"
            y={61 + i * 32}
            width={40 - i * 4}
            height="4"
            rx="2"
            fill="#F0EFF8"
          />
        </g>
      ))}

      {/* Progress bar */}
      <rect x="96" y="148" width="88" height="8" rx="4" fill="#E8E6FC" />
      <motion.rect
        x="96"
        y="148"
        height="8"
        rx="4"
        fill="url(#progressGrad)"
        initial={{ width: 0 }}
        animate={{ width: 60 }}
        transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
      />

      {/* Floating elements */}
      <motion.g
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="50" cy="60" r="18" fill="#E8E6FC" />
        <path
          d="M43 60l4 4 8-8"
          stroke="#5B4AE8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>

      <motion.g
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <circle cx="230" cy="80" r="16" fill="#FEF3C7" />
        <path
          d="M225 80l3 3 5-6"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>

      <motion.g
        animate={{ y: [0, -5, 0], rotate: [0, 10, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <rect x="32" y="130" width="32" height="24" rx="6" fill="#DBEAFE" />
        <rect x="38" y="138" width="20" height="3" rx="1.5" fill="#60A5FA" />
        <rect x="38" y="144" width="14" height="3" rx="1.5" fill="#93C5FD" />
      </motion.g>

      <motion.g
        animate={{ y: [0, -7, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      >
        <circle cx="228" cy="140" r="14" fill="#FCE7F3" />
        <text
          x="228"
          y="145"
          textAnchor="middle"
          fontSize="14"
          fill="#EC4899"
        >
          ★
        </text>
      </motion.g>

      {/* Gradients */}
      <defs>
        <linearGradient id="phoneGrad" x1="80" y1="20" x2="200" y2="190">
          <stop stopColor="#F5F3FF" />
          <stop offset="1" stopColor="#EDE9FE" />
        </linearGradient>
        <linearGradient id="progressGrad" x1="96" y1="148" x2="156" y2="148">
          <stop stopColor="#5B4AE8" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

/* ─── Google icon SVG ─── */
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/* ─── Main Login Component ─── */
export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Hardcoded Admin Bypass for the requested credentials
      if (email === "survey@gmail.com" && password === "survey2026") {
        navigate("/admin");
        return;
      }

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        // If login fails, check if the user exists to give a more helpful error
        // Note: This check depends on your 'profiles' table RLS policies
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (existingUser === null && loginError.message.includes("Invalid login credentials")) {
          // If we can't find the profile AND login failed, it's likely the account doesn't exist
          setError("Account not found. Please sign up first.");
        } else {
          setError(loginError.message || "Invalid login credentials");
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Ensure a profile exists (fallback in case trigger is not set up)
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (!profile) {
          console.log("Creating missing profile for user...");
          await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || "New User",
            email: data.user.email,
            points: 0,
            completed_count: 0,
            role: "User",
          });
        }

        navigate("/app");
      }
    } catch (err: any) {
      setError(err.message || "Invalid login credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app`
        }
      });
      if (googleError) throw googleError;
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(91,74,232,0.4) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, 40, 0],
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/3 right-0 w-64 h-64 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <FloatingParticles />

      {/* Desktop Two-Panel Layout */}
      <div className="w-full max-w-[1000px] relative z-10 flex rounded-[40px] overflow-hidden lg:shadow-2xl lg:shadow-black/10 lg:border lg:border-white/20">
        {/* Left Panel - Desktop Only */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary via-purple-600 to-indigo-700 relative flex-col items-center justify-center p-12 overflow-hidden">
          {/* Decorative orbs */}
          <motion.div
            className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/[0.07]"
            animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-16 right-8 w-24 h-24 rounded-full bg-white/[0.05]"
            animate={{ y: [0, 12, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute top-1/2 right-0 w-40 h-40 rounded-full bg-white/[0.03]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          <SurveyIllustration />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mt-8 relative z-10"
          >
            <h2 className="text-3xl font-bold text-white mb-3 leading-tight">Share Your Voice,<br />Earn Rewards</h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-[280px] mx-auto">
              Join our community of survey takers. Complete surveys, earn points, and redeem exciting rewards.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex items-center gap-4 relative z-10"
          >
            {["🎯 Quick Surveys", "💰 Real Rewards", "🏆 Leaderboard"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="bg-white/10 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/15"
              >
                {item}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right Panel / Mobile Full */}
        <div className="w-full lg:w-1/2 lg:bg-white lg:p-10 flex items-center justify-center">
          <div className="w-full max-w-[430px] lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
          {/* Illustration + branding */}
          <div className="text-center space-y-4">
            <div className="lg:hidden">
              <SurveyIllustration />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-primary/25">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold tracking-wide text-primary uppercase">
                  Survey Platform
                </span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome Back{" "}
                <motion.span
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  className="inline-block origin-[70%_80%]"
                >
                  👋
                </motion.span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Sign in to access surveys & earn rewards
              </p>
            </motion.div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* ───── Google Sign In (Primary CTA) ───── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <button
              id="google-sign-in-btn"
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-4 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-foreground transition-all active:scale-[0.97] flex items-center justify-center gap-3 relative overflow-hidden group"
              style={{
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
              }}
            >
              {/* Hover shimmer */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/60 to-transparent" />

              <AnimatePresence mode="wait">
                {isGoogleLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-3"
                  >
                    <svg
                      className="w-5 h-5 animate-spin text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                      />
                      <path
                        d="M12 2a10 10 0 019.2 6.1"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="opacity-75"
                      />
                    </svg>
                    <span className="text-muted-foreground">
                      Connecting to Google…
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-3"
                  >
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>

          {/* ───── Divider ───── */}
          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.5 }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-background text-muted-foreground tracking-wider uppercase">
                Or sign in with email
              </span>
            </div>
          </motion.div>

          {/* ───── Email/Password Form ───── */}
          <motion.form
            onSubmit={handleLogin}
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
          >
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-200 ${
                    focusedField === "email"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="yourname@email.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-200 ${
                    focusedField === "password"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3.5 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <motion.button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all active:scale-[0.97] flex items-center justify-center gap-2 relative overflow-hidden group"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Button shimmer */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                      />
                      <path
                        d="M12 2a10 10 0 019.2 6.1"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="opacity-75"
                      />
                    </svg>
                    <span>Signing in…</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.form>

          {/* ───── Sign Up Link ───── */}
          <motion.div
            className="text-center pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                id="create-account-link"
                onClick={() => navigate("/signup")}
                className="text-primary font-semibold hover:underline underline-offset-2 transition-all"
              >
                Create Account
              </button>
            </p>
          </motion.div>

          {/* ───── Terms ───── */}
          <motion.p
            className="text-center text-[11px] text-muted-foreground/60 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            By continuing, you agree to our{" "}
            <button className="underline hover:text-muted-foreground transition-colors">
              Terms of Service
            </button>{" "}
            and{" "}
            <button className="underline hover:text-muted-foreground transition-colors">
              Privacy Policy
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
    </div>
    </div>
  );
}
