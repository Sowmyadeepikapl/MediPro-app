import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { Reminder } from "@/data/mockdata";

export interface ExtendedReminder extends Reminder {
  date: string;
  skipped?: boolean;
  snoozedTo?: string;
}

interface RemindersContextType {
  reminders: ExtendedReminder[];
  loading: boolean;
  addReminder: (r: ExtendedReminder) => Promise<void>;
  updateReminder: (r: ExtendedReminder) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  markTaken: (id: string) => Promise<void>;
  snoozeReminder: (id: string) => Promise<void>;
  skipReminder: (id: string) => Promise<void>;
  // ── Global alarm ──────────────────────────────────
  alarmReminder: ExtendedReminder | null;
  dismissAlarm: () => void;
}

const RemindersContext = createContext<RemindersContextType>({
  reminders: [],
  loading: true,
  addReminder: async () => {},
  updateReminder: async () => {},
  deleteReminder: async () => {},
  markTaken: async () => {},
  snoozeReminder: async () => {},
  skipReminder: async () => {},
  alarmReminder: null,
  dismissAlarm: () => {},
});

export const useReminders = () => useContext(RemindersContext);

// ── Helpers ────────────────────────────────────────────
const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Convert current time to "HH:MM AM/PM" to match stored reminder format */
const getCurrentTimeStr = (): string => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
};

// ── Audio: 3-pulse gentle chime ────────────────────────
const playAlarmSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();

    const playBeep = (startTime: number) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(660, startTime + 0.15);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.45, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.4);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    };

    playBeep(ctx.currentTime);
    playBeep(ctx.currentTime + 0.55);
    playBeep(ctx.currentTime + 1.1);
    setTimeout(() => ctx.close(), 2000);
  } catch (err) {
    console.warn("Audio playback failed:", err);
  }
};

// ── Browser notification ───────────────────────────────
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
};

const showBrowserNotification = (medicationName: string, dosage: string) => {
  if (Notification.permission === "granted") {
    new Notification("💊 MediPro Reminder", {
      body: `Time to take ${medicationName} — ${dosage}`,
      icon: "/favicon.ico",
      tag: `medipro-${medicationName}`,
    });
  }
};

// ── Provider ───────────────────────────────────────────
export const RemindersProvider = ({ children }: { children: ReactNode }) => {
  const [reminders, setReminders] = useState<ExtendedReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [alarmReminder, setAlarmReminder] = useState<ExtendedReminder | null>(
    null,
  );

  // firedRef tracks "reminderID:timeString" so both original AND snoozed
  // times each get their own independent fire slot
  const firedRef = useRef<Set<string>>(new Set());

  // ── Auth ─────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_e, session) => {
        setUserId(session?.user?.id ?? null);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setReminders([]);
      setLoading(false);
      return;
    }
    fetchReminders();
  }, [userId]);

  // ── Notification permission ───────────────────────────
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // ── Global alarm checker ──────────────────────────────
  const checkAlarms = useCallback(() => {
    const todayKey = toDateKey(new Date());
    const currentTimeStr = getCurrentTimeStr();

    const due = reminders.find((r) => {
      if (r.date !== todayKey) return false;
      if (r.taken || r.skipped) return false;

      // ✅ FIX: use snoozedTo if it exists, otherwise use original time
      const effectiveTime = r.snoozedTo ?? r.time;

      // Unique key = id + effectiveTime so snoozed slot fires independently
      const fireKey = `${r.id}:${effectiveTime}`;

      return effectiveTime === currentTimeStr && !firedRef.current.has(fireKey);
    });

    if (due) {
      const effectiveTime = due.snoozedTo ?? due.time;
      const fireKey = `${due.id}:${effectiveTime}`;
      firedRef.current.add(fireKey);
      playAlarmSound();
      showBrowserNotification(due.medicationName, due.dosage);
      setAlarmReminder(due);
    }
  }, [reminders]);

  useEffect(() => {
    checkAlarms();
    const interval = setInterval(checkAlarms, 30_000);
    return () => clearInterval(interval);
  }, [checkAlarms]);

  const dismissAlarm = () => setAlarmReminder(null);

  // ── CRUD ─────────────────────────────────────────────
  const fetchReminders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_reminders")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      console.error("[Reminders] Fetch failed:", error.message, error.hint);
    } else {
      setReminders(
        (data ?? []).map((row) => ({
          id: row.id,
          medicationName: row.medication_name,
          dosage: row.dosage,
          time: row.time,
          withFood: row.with_food,
          taken: row.taken,
          skipped: row.skipped,
          snoozedTo: row.snoozed_to,
          date: row.date,
        })),
      );
    }
    setLoading(false);
  };

  const addReminder = async (r: ExtendedReminder) => {
    if (!userId) return;
    const { error } = await supabase.from("user_reminders").insert({
      id: r.id,
      user_id: userId,
      medication_name: r.medicationName,
      dosage: r.dosage,
      time: r.time,
      with_food: r.withFood,
      taken: r.taken,
      skipped: r.skipped ?? false,
      snoozed_to: r.snoozedTo ?? null,
      date: r.date,
    });
    if (error) {
      console.error(
        "[Reminders] Insert failed:",
        error.message,
        error.hint,
        error.code,
      );
    } else {
      await fetchReminders();
    }
  };

  const updateReminder = async (r: ExtendedReminder) => {
    if (!userId) return;
    const { error } = await supabase
      .from("user_reminders")
      .update({
        medication_name: r.medicationName,
        dosage: r.dosage,
        time: r.time,
        with_food: r.withFood,
        taken: r.taken,
        skipped: r.skipped,
        snoozed_to: r.snoozedTo ?? null,
      })
      .eq("id", r.id);
    if (error) {
      console.error("[Reminders] Update failed:", error.message);
    } else {
      await fetchReminders();
    }
  };

  const deleteReminder = async (id: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from("user_reminders")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("[Reminders] Delete failed:", error.message);
    } else {
      setReminders((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const markTaken = async (id: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from("user_reminders")
      .update({ taken: true, skipped: false })
      .eq("id", id);
    if (error) {
      console.error("[Reminders] markTaken failed:", error.message);
    } else {
      setReminders((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, taken: true, skipped: false } : r,
        ),
      );
    }
  };

  const snoozeReminder = async (id: string) => {
    if (!userId) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    const h = now.getHours();
    const m = now.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    const snoozedTo = `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;

    const { error } = await supabase
      .from("user_reminders")
      .update({ snoozed_to: snoozedTo })
      .eq("id", id);
    if (error) {
      console.error("[Reminders] Snooze failed:", error.message);
    } else {
      // ✅ FIX: don't delete from firedRef — the new snoozedTo time
      // gets its own unique fireKey so it fires independently
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, snoozedTo } : r)),
      );
    }
  };

  const skipReminder = async (id: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from("user_reminders")
      .update({ skipped: true, taken: false })
      .eq("id", id);
    if (error) {
      console.error("[Reminders] Skip failed:", error.message);
    } else {
      setReminders((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, skipped: true, taken: false } : r,
        ),
      );
    }
  };

  return (
    <RemindersContext.Provider
      value={{
        reminders,
        loading,
        addReminder,
        updateReminder,
        deleteReminder,
        markTaken,
        snoozeReminder,
        skipReminder,
        alarmReminder,
        dismissAlarm,
      }}
    >
      {children}
    </RemindersContext.Provider>
  );
};
