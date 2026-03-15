import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Database,
  Bell,
  UserCheck,
} from "lucide-react";
import MobileLayout from "@/components/MobileLayout";

const sections = [
  {
    icon: Database,
    title: "Data We Collect",
    content:
      "We collect basic profile information you provide (name, age, gender, weight, blood group) and medication data you add to the app. This data is stored securely in your account via Supabase.",
  },
  {
    icon: Lock,
    title: "How We Store Your Data",
    content:
      "All your data is encrypted and stored securely. Authentication is handled by Supabase with industry-standard encryption. We never store passwords in plain text.",
  },
  {
    icon: Eye,
    title: "How We Use Your Data",
    content:
      "Your data is used solely to personalise your MediPro experience — including medication reminders, AI health assistant responses, and symptom analysis. We do not sell or share your data with third parties.",
  },
  {
    icon: Bell,
    title: "AI Health Assistant",
    content:
      "When you use the AI Health Assistant, your messages and saved medication list are sent to Cohere's API to generate responses. Please avoid sharing sensitive personal details beyond what is necessary.",
  },
  {
    icon: UserCheck,
    title: "Your Rights",
    content:
      "You can view, edit, or delete your profile data at any time from the Profile screen. You may also delete your account to permanently remove all associated data.",
  },
  {
    icon: Shield,
    title: "Medical Disclaimer",
    content:
      "MediPro is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions. The AI assistant provides general guidance only.",
  },
];

const PrivacyScreen = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <div className="pb-8">
        {/* Header */}
        <div className="gradient-primary px-5 pt-10 pb-6 rounded-b-[2rem] mb-5">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)} className="tap-highlight p-1">
              <ArrowLeft size={22} className="text-primary-foreground" />
            </button>
            <h1 className="text-lg font-bold text-primary-foreground">
              Privacy Policy
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-primary-foreground/15 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
              <Shield size={20} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-primary-foreground font-semibold text-sm">
                Your privacy matters
              </p>
              <p className="text-primary-foreground/70 text-xs mt-0.5">
                Last updated: March 2026
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="px-5 space-y-3">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              className="bg-card rounded-2xl shadow-card p-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <section.icon size={15} className="text-primary" />
                </div>
                <h3 className="font-semibold text-sm text-foreground">
                  {section.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}

          {/* Footer note */}
          <motion.div
            className="bg-secondary/50 rounded-2xl p-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-muted-foreground">
              Questions about your privacy?{" "}
              <span className="text-primary font-medium">
                Contact us at support@medipro.app
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default PrivacyScreen;
