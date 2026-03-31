import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Activity, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const LoginScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Check if profile is complete
    const savedProfile = localStorage.getItem("mediscan_profile");
    const profile = savedProfile ? JSON.parse(savedProfile) : null;
    const hasProfile = profile?.name && profile?.age && profile?.gender;

    navigate(hasProfile ? "/dashboard" : "/profile-setup", { replace: true });
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/profile-setup`,
      },
    });
    if (error) {
      setGoogleLoading(false);
      toast({
        title: "Google login failed",
        description: error.message,
        variant: "destructive",
      });
    }
    // No need to setGoogleLoading(false) on success — page will redirect
  };
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast({
        title: "Enter your email",
        description:
          "Please enter your email address first then click Forgot Password",
        variant: "destructive",
      });
      return;
    }
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotLoading(false);
    if (error) {
      toast({
        title: "Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "✅ Email Sent!",
        description: `Password reset link sent to ${email}`,
      });
    }
  };
  return (
    <div className="min-h-screen max-w-lg mx-auto flex flex-col bg-background">
      {/* Header gradient */}
      <div className="gradient-hero pt-12 pb-16 px-6 rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary-foreground"
              style={{
                width: `${20 + i * 15}px`,
                height: `${20 + i * 15}px`,
                top: `${10 + i * 12}%`,
                left: `${5 + i * 16}%`,
                opacity: 0.15 + i * 0.05,
              }}
            />
          ))}
        </div>
        <motion.div
          className="flex flex-col items-center relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mb-4">
            <div className="relative">
              <Heart
                className="w-8 h-8 text-primary-foreground"
                fill="currentColor"
              />
              <Activity className="w-4 h-4 text-primary-foreground absolute -right-2 -top-0.5" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">
            Welcome Back
          </h1>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Sign in to MediPro
          </p>
        </motion.div>
      </div>

      {/* Form */}
      <motion.div
        className="flex-1 px-6 -mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-card rounded-2xl shadow-elevated p-6 space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              className="pl-10 h-12 rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="pl-10 pr-10 h-12 rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground tap-highlight"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(v as boolean)}
              />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Remember Me
              </label>
            </div>
            <button
              onClick={handleForgotPassword}
              disabled={forgotLoading}
              className="text-sm text-primary font-medium tap-highlight"
            >
              {forgotLoading ? "Sending..." : "Forgot Password?"}
            </button>
          </div>

          <Button
            className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-button text-base"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <motion.div
                className="flex gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary-foreground"
                    animate={{ y: [-3, 3, -3] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </motion.div>
            ) : (
              "Sign In"
            )}
          </Button>
        </div>

        {/* Social login */}
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">
              or continue with
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl gap-2 font-medium"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <motion.div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                    animate={{ y: [-2, 2, -2] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </motion.div>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>
        </div>

        <p className="text-center mt-6 mb-8 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-primary font-semibold tap-highlight"
          >
            Register
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
