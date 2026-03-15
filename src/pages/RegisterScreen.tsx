import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Activity, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const RegisterScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirm) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirm) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setLoading(false);

    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Save name to profile so ProfileSetup can pre-fill it
    const existing = localStorage.getItem("mediscan_profile");
    const profile = existing ? JSON.parse(existing) : {};
    localStorage.setItem(
      "mediscan_profile",
      JSON.stringify({ ...profile, name, email }),
    );

    toast({
      title: "Account created! 🎉",
      description: "Let's set up your health profile",
    });
    navigate("/profile-setup", { replace: true });
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto flex flex-col bg-background">
      {/* Header */}
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
            Create Account
          </h1>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Join MediScan Pro today
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
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Full Name"
              className="pl-10 h-12 rounded-xl"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              className="pl-10 h-12 rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 6 characters)"
              className="pl-10 pr-10 h-12 rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground tap-highlight"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              className="pl-10 pr-10 h-12 rounded-xl"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground tap-highlight"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Password match indicator */}
          {confirm.length > 0 && (
            <p
              className={`text-xs font-medium ${password === confirm ? "text-green-500" : "text-destructive"}`}
            >
              {password === confirm
                ? "✓ Passwords match"
                : "✗ Passwords don't match"}
            </p>
          )}

          <Button
            className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-button text-base"
            onClick={handleRegister}
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
              "Create Account"
            )}
          </Button>
        </div>

        <p className="text-center mt-6 mb-8 text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-primary font-semibold tap-highlight"
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterScreen;
