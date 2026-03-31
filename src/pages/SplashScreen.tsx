import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      // Check if user is already logged in
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setShow(false);
      setTimeout(() => {
        if (session) {
          // User is logged in — check if profile is set up
          const savedProfile = localStorage.getItem("mediscan_profile");
          const profile = savedProfile ? JSON.parse(savedProfile) : null;
          const hasProfile = profile?.name && profile?.age;

          if (hasProfile) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/profile-setup", { replace: true });
          }
        } else {
          // Not logged in — go to login
          navigate("/login", { replace: true });
        }
      }, 400);
    }, 2200);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gradient-hero"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Pulse rings */}
          <div className="relative mb-8">
            <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-primary-foreground/30 animate-pulse-ring" />
            <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-primary-foreground/20 animate-pulse-ring [animation-delay:0.5s]" />
            <motion.div
              className="w-24 h-24 rounded-3xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="relative">
                <Heart
                  className="w-10 h-10 text-primary-foreground animate-heartbeat"
                  fill="currentColor"
                />
                <Activity className="w-6 h-6 text-primary-foreground absolute -right-3 -top-1" />
              </div>
            </motion.div>
          </div>

          <motion.h1
            className="text-3xl font-bold text-primary-foreground mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            MediPro
          </motion.h1>
          <motion.p
            className="text-primary-foreground/80 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Your Personal Medication Assistant
          </motion.p>

          <motion.div
            className="flex gap-2 mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary-foreground/60"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
