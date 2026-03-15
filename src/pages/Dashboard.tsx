import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Pill,
  ClipboardList,
  Bell,
  Heart,
  Activity,
  Droplets,
} from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { useProfile } from "@/contexts/ProfileContext";
import { useReminders } from "@/contexts/RemindersContext";
import { useMedications } from "@/contexts/MedicationsContext";

const cards = [
  {
    icon: Stethoscope,
    label: "Symptom Analyzer",
    emoji: "🩺",
    desc: "Check symptoms and get recommendations",
    path: "/symptoms",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Pill,
    label: "Tablet Info",
    emoji: "💊",
    desc: "Search any medicine details",
    path: "/tablet-info",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: ClipboardList,
    label: "My Medications",
    emoji: "📋",
    desc: "View saved medications",
    path: "/my-medications",
    color: "from-violet-500 to-violet-600",
  },
  {
    icon: Bell,
    label: "Reminders",
    emoji: "⏰",
    desc: "Set medication reminders",
    path: "/reminders",
    color: "from-amber-500 to-amber-600",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { reminders } = useReminders();
  const { medications } = useMedications();

  const displayName = profile.name?.trim() ? profile.name : "Friend";

  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
  const todayReminders = reminders.filter((r) => r.date === todayStr);
  const nextReminder = todayReminders.find((r) => !r.taken && !r.skipped);

  // Pending reminders for today (not taken, not skipped)
  const pendingTodayReminders = todayReminders.filter(
    (r) => !r.taken && !r.skipped,
  );

  // Check if all today's reminders are done (taken or skipped)
  const allDoneToday =
    todayReminders.length > 0 && pendingTodayReminders.length === 0;

  // Medications count = total saved medications
  const medicationsCount = medications.length;

  // Reminders stat display
  const remindersDisplay = allDoneToday
    ? "✓"
    : String(pendingTodayReminders.length);

  const remindersLabel = allDoneToday ? "Done for Today!" : "Reminders Today";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <MobileLayout>
      {/* Header */}
      <div className="gradient-hero px-6 pt-10 pb-8 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium">
              {greeting} 👋
            </p>
            <h1 className="text-xl font-bold text-primary-foreground">
              {displayName}
            </h1>
          </div>
          <div className="w-11 h-11 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <div className="relative">
              <Heart
                className="w-5 h-5 text-primary-foreground"
                fill="currentColor"
              />
              <Activity className="w-3 h-3 text-primary-foreground absolute -right-1.5 -top-0.5" />
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary-foreground/15 backdrop-blur-sm rounded-xl px-3 py-3 text-center">
            <p className="text-lg font-bold text-primary-foreground">
              {medicationsCount}
            </p>
            <p className="text-[10px] text-primary-foreground/70 font-medium">
              Medications
            </p>
          </div>
          <div className="bg-primary-foreground/15 backdrop-blur-sm rounded-xl px-3 py-3 text-center">
            <p
              className={`font-bold text-primary-foreground ${
                allDoneToday ? "text-sm" : "text-lg"
              }`}
            >
              {remindersDisplay}
            </p>
            <p className="text-[10px] text-primary-foreground/70 font-medium">
              {remindersLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Reminder - Top */}
      <div className="px-5 -mt-4">
        <motion.div
          className="bg-card rounded-2xl p-4 shadow-card mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-foreground">
              🔔 Upcoming Reminder
            </h3>
            <button
              onClick={() => navigate("/reminders")}
              className="text-xs text-primary font-medium"
            >
              See All
            </button>
          </div>
          {nextReminder ? (
            <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">
                  {nextReminder.medicationName} {nextReminder.dosage}
                </p>
                <p className="text-xs text-muted-foreground">
                  Today, {nextReminder.snoozedTo || nextReminder.time}
                </p>
              </div>
              <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded-lg">
                Pending
              </span>
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-sm text-muted-foreground">
                {allDoneToday
                  ? "🎉 All reminders done for today!"
                  : "No upcoming reminders"}
              </p>
            </div>
          )}
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-2 gap-3.5">
          {cards.map((card, i) => (
            <motion.button
              key={card.label}
              onClick={() => navigate(card.path)}
              className="bg-card rounded-2xl p-4 shadow-card text-left tap-highlight active:scale-[0.97] transition-transform"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
            >
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}
              >
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-0.5">
                {card.label}
              </h3>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {card.desc}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Stay Hydrated Quote */}
        <motion.div
          className="mt-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl p-4 flex items-center gap-3 border border-blue-100 dark:border-blue-900/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
            <Droplets className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              💧 Stay Hydrated!
            </p>
            <p className="text-xs text-muted-foreground">
              Drink at least 8 glasses of water daily for better health &
              medication absorption.
            </p>
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default Dashboard;
