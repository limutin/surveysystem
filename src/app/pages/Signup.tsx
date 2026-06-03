import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, User, ChevronLeft } from "lucide-react";
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

/* ─── Signup Illustration ─── */
function SignupIllustration() {
  return (
    <motion.svg
      viewBox="0 0 280 200"
      fill="none"
      className="w-full max-w-[200px] mx-auto"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <circle cx="140" cy="100" r="80" fill="url(#circleGrad)" opacity="0.1" />
      <motion.path
        d="M100 100l25 25 55-55"
        stroke="url(#pathGrad)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      <motion.circle
        cx="140"
        cy="100"
        r="60"
        stroke="#5B4AE8"
        strokeWidth="2"
        strokeDasharray="8 8"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <defs>
        <linearGradient id="circleGrad" x1="60" y1="20" x2="220" y2="180">
          <stop stopColor="#5B4AE8" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="pathGrad" x1="100" y1="100" x2="180" y2="70">
          <stop stopColor="#5B4AE8" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

export function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Pre-check: Try to see if email exists in profiles table
      // Note: This may return null if RLS is enabled and user is not signed in
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingProfile) {
        setError("An account with this email already exists. Please sign in instead.");
        setIsLoading(false);
        return;
      }

      // 2. Attempt Signup
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      // 3. Post-check: Handle different Supabase error/response patterns
      if (signupError) {
        // Some Supabase configurations return an error directly
        if (signupError.message.toLowerCase().includes("already registered") || signupError.status === 422 || signupError.status === 400) {
          setError("An account with this email already exists. Please sign in instead.");
          setIsLoading(false);
          return;
        }
        throw signupError;
      }

      if (data.user) {
        // If data.user is returned but identities is empty, it's an existing user
        // (This is how Supabase handles existing users when email enumeration protection is ON)
        if (data.user.identities && data.user.identities.length === 0) {
          setError("An account with this email already exists. Please sign in instead.");
          setIsLoading(false);
          return;
        }
        
        // Successfully created account - now show confirmation notice
        setIsSignedUp(true);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSignedUp) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30"
            style={{
              background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
            }}
            animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-25"
            style={{
              background: "radial-gradient(circle, rgba(91,74,232,0.4) 0%, transparent 70%)",
            }}
            animate={{ x: [0, 30, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>

        <FloatingParticles />

        <div className="w-full max-w-[430px] relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-[32px] p-8 text-center space-y-6 shadow-xl shadow-black/5"
          >
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center"
              >
                <Mail className="w-10 h-10 text-primary" />
              </motion.div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Verify your email</h2>
              <p className="text-muted-foreground">
                We've sent a verification link to <span className="text-foreground font-semibold">{email}</span>. 
                Please check your inbox and click the link to activate your account.
              </p>
            </div>

            <div className="pt-4">
              <motion.button
                onClick={() => navigate("/")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-primary text-white rounded-2xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Return to Login
              </motion.button>
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              Didn't receive the email? Check your spam folder or try again in a few minutes.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
          }}
          animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-25"
          style={{
            background: "radial-gradient(circle, rgba(91,74,232,0.4) 0%, transparent 70%)",
          }}
          animate={{ x: [0, 30, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <FloatingParticles />

      <div className="w-full max-w-[430px] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div className="text-center space-y-4">
            <SignupIllustration />
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-primary/25">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold tracking-wide text-primary uppercase">
                  Join Us
                </span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
              <p className="text-muted-foreground text-sm">Start your journey with us today</p>
            </div>
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

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-200 ${
                    focusedField === "name" ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3.5 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-200 ${
                    focusedField === "email" ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-200 ${
                    focusedField === "password" ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Create a strong password"
                  className="w-full pl-11 pr-12 py-3.5 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all active:scale-[0.97] flex items-center justify-center gap-2 relative overflow-hidden group"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M12 2a10 10 0 019.2 6.1" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                    </svg>
                    <span>Creating Account…</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <div className="text-center space-y-4">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
