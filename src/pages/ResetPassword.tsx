import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({
        title: "Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "✅ Password Updated!",
        description: "You can now login with your new password",
      });
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto flex flex-col items-center justify-center bg-background px-6">
      <motion.div
        className="w-full bg-card rounded-2xl shadow-elevated p-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-foreground text-center mb-2">
          Reset Password
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Enter your new password below
        </p>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            className="pl-10 pr-10 h-12 rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            className="pl-10 h-12 rounded-xl"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button
          className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-button"
          onClick={handleReset}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>

        <button
          onClick={() => navigate("/login")}
          className="w-full text-center text-sm text-muted-foreground tap-highlight"
        >
          Back to Login
        </button>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
