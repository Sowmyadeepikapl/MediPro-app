import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Activity,
  Brain,
  Pill,
  Bell,
  Search,
  Bot,
  Shield,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import MobileLayout from "@/components/MobileLayout";

const features = [
  {
    icon: Search,
    label: "Symptom Analyzer",
    desc: "Describe symptoms and get instant health insights",
  },
  {
    icon: Pill,
    label: "Tablet Info",
    desc: "Search any medication for dosage and side effects",
  },
  {
    icon: Heart,
    label: "My Medications",
    desc: "Manage your personal medication list",
  },
  {
    icon: Bell,
    label: "Smart Reminders",
    desc: "Daily dose reminders with snooze and skip",
  },
  {
    icon: Bot,
    label: "AI Health Assistant",
    desc: "Chat with Cohere AI for health guidance",
  },
  {
    icon: Shield,
    label: "Secure Login",
    desc: "Protected by Supabase authentication",
  },
];

const techStack = [
  { label: "Frontend", value: "React + TypeScript" },
  { label: "Styling", value: "Tailwind CSS" },
  { label: "Auth & DB", value: "Supabase" },
  { label: "AI Assistant", value: "Cohere API" },
  { label: "Animations", value: "Framer Motion" },
  { label: "Version", value: "v1.0.0" },
];

const AboutScreen = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <div className="pb-8">
        {/* Header */}
        <div className="gradient-primary px-5 pt-10 pb-8 rounded-b-[2rem] mb-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-primary-foreground"
                style={{
                  width: `${30 + i * 20}px`,
                  height: `${30 + i * 20}px`,
                  top: `${10 + i * 15}%`,
                  right: `${5 + i * 10}%`,
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <button onClick={() => navigate(-1)} className="tap-highlight p-1">
              <ArrowLeft size={22} className="text-primary-foreground" />
            </button>
            <h1 className="text-lg font-bold text-primary-foreground">
              About MediPro
            </h1>
          </div>

          {/* App logo + name */}
          <motion.div
            className="flex flex-col items-center relative z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 rounded-3xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mb-3">
              <div className="relative">
                <Heart
                  className="w-10 h-10 text-primary-foreground"
                  fill="currentColor"
                />
                <Activity className="w-5 h-5 text-primary-foreground absolute -right-2 -top-1" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-primary-foreground">
              MediPro
            </h2>
            <p className="text-primary-foreground/75 text-sm mt-1">
              Your Personal Health Assistant
            </p>
            <div className="flex items-center gap-1.5 mt-2 bg-primary-foreground/15 rounded-full px-3 py-1">
              <Sparkles size={11} className="text-primary-foreground/80" />
              <span className="text-[11px] text-primary-foreground/80 font-medium">
                Version 1.0.0
              </span>
            </div>
          </motion.div>
        </div>

        <div className="px-5 space-y-4">
          {/* Description */}
          <motion.div
            className="bg-card rounded-2xl shadow-card p-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-semibold text-sm text-foreground mb-2">
              About the App
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              MediPro is a smart personal health management app that helps you
              track medications, understand symptoms, and stay on top of your
              wellness. Combining a clean hospital-grade UI with powerful AI
              features — making professional health management accessible to
              everyone.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            className="bg-card rounded-2xl shadow-card p-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h3 className="font-semibold text-sm text-foreground mb-3">
              Features
            </h3>
            <div className="space-y-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <f.icon size={15} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {f.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tech stack */}
          <motion.div
            className="bg-card rounded-2xl shadow-card p-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h3 className="font-semibold text-sm text-foreground mb-3">
              Built With
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {techStack.map((t) => (
                <div key={t.label} className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                    {t.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {t.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start gap-2">
              <Shield
                size={15}
                className="text-destructive mt-0.5 flex-shrink-0"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">
                  Medical Disclaimer:{" "}
                </span>
                MediPro is not a substitute for professional medical advice.
                Always consult a qualified healthcare provider for medical
                decisions.
              </p>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-xs text-muted-foreground">
              Made with ❤️ for better health management
            </p>
          </motion.div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default AboutScreen;
