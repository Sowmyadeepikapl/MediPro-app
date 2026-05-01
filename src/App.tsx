import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { MedicationsProvider } from "@/contexts/MedicationsContext";
import { RemindersProvider } from "@/contexts/RemindersContext";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReminders, ExtendedReminder } from "@/contexts/RemindersContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import SplashScreen from "./pages/SplashScreen";
import LoginScreen from "./pages/LoginScreen";
import RegisterScreen from "./pages/RegisterScreen";
import ProfileSetupScreen from "./pages/ProfileSetupScreen";
import Dashboard from "./pages/Dashboard";
import SymptomAnalyzer from "./pages/SymptomAnalyzer";
import TabletInfo from "./pages/TabletInfo";
import MedicationDetail from "./pages/MedicationDetail";
import MyMedications from "./pages/MyMedications";
import RemindersScreen from "./pages/RemindersScreen";
import ProfileScreen from "./pages/ProfileScreen";
import PrivacyScreen from "./pages/PrivacyScreen";
import AboutScreen from "./pages/AboutScreen";
import NotFound from "./pages/NotFound";
import AIAssistant from "./pages/AIAssistant";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

// ── Global Alarm Modal ─────────────────────────────────
// Rendered at top level so it appears on ANY page
const GlobalAlarmModal = () => {
  const {
    alarmReminder,
    dismissAlarm,
    markTaken,
    snoozeReminder,
    skipReminder,
  } = useReminders();
  const { toast } = useToast();

  // Debug logging - helps identify if alarm is being set on mobile
  useEffect(() => {
    if (alarmReminder) {
      console.log("[Modal] Alarm reminder received:", alarmReminder);
    }
  }, [alarmReminder]);

  // Don't return null early - we want to check if alarmReminder exists
  // But also ensure it's not undefined or null
  if (!alarmReminder) return null;

  const handleTake = () => {
    markTaken(alarmReminder.id);
    toast({ title: "✅ Taken!", description: "Medication marked as taken" });
    // No need to call dismissAlarm() here - markTaken already clears it in context
  };

  const handleSnooze = () => {
    snoozeReminder(alarmReminder.id);
    toast({
      title: "⏰ Snoozed 10 min",
      description: "We'll remind you again soon",
    });
    // No need to call dismissAlarm() here - snoozeReminder already clears it in context
  };

  const handleSkip = () => {
    skipReminder(alarmReminder.id);
    toast({
      title: "⏭ Skipped",
      description: "Reminder marked as skipped",
    });
    // No need to call dismissAlarm() here - skipReminder already clears it in context
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <motion.div
          className="bg-card w-full max-w-sm rounded-3xl shadow-elevated p-6 flex flex-col items-center gap-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Pulsing bell */}
          <motion.div
            className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-button"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          >
            <Bell className="w-9 h-9 text-primary-foreground" />
          </motion.div>

          <div className="text-center">
            <h2 className="text-lg font-bold text-foreground">
              Medication Reminder
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              It's time to take your medication
            </p>
          </div>

          <div className="bg-secondary/60 rounded-2xl px-5 py-3 w-full text-center">
            <p className="font-bold text-base text-foreground">
              {alarmReminder.medicationName}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {alarmReminder.dosage}
            </p>
            <p className="text-xs text-primary font-semibold mt-1">
              {alarmReminder.snoozedTo || alarmReminder.time}
            </p>
            {alarmReminder.withFood && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <UtensilsCrossed className="w-3.5 h-3.5 text-warning" />
                <span className="text-xs text-warning font-medium">
                  Take with food
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Button
              className="w-full h-11 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-button"
              onClick={handleTake}
            >
              ✅ Mark as Taken
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-10 rounded-xl text-sm text-warning border-warning/40"
                onClick={handleSnooze}
              >
                ⏰ Snooze 10 min
              </Button>
              <Button
                variant="ghost"
                className="flex-1 h-10 rounded-xl text-sm text-muted-foreground"
                onClick={handleSkip}
              >
                Skip
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ── Inner App (needs to be inside RemindersProvider) ───
const AppInner = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    {/* Global alarm modal — always rendered, shows on any page */}
    <GlobalAlarmModal />
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/profile-setup" element={<ProfileSetupScreen />} />

        {/* App routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/symptoms" element={<SymptomAnalyzer />} />
        <Route path="/tablet-info" element={<TabletInfo />} />
        <Route path="/medication/:id" element={<MedicationDetail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/my-medications" element={<MyMedications />} />
        <Route path="/reminders" element={<RemindersScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/privacy" element={<PrivacyScreen />} />
        <Route path="/about" element={<AboutScreen />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProfileProvider>
        <MedicationsProvider>
          <RemindersProvider>
            <AppInner />
          </RemindersProvider>
        </MedicationsProvider>
      </ProfileProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
