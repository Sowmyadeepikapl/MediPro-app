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

/**
 * FIX 1 — ±1 minute window
 * Returns true if reminder time matches current time within ±1 minute.
 * Prevents the "rings 1 min late" issue caused by interval timing drift.
 */
const isWithinWindow = (reminderTimeStr: string): boolean => {
  const now = new Date();

  // Parse stored "HH:MM AM/PM" back to total minutes
  const [timePart, ampm] = reminderTimeStr.split(" ");
  const [hStr, mStr] = timePart.split(":");
  let h = parseInt(hStr);
  const m = parseInt(mStr);
  if (ampm === "AM" && h === 12) h = 0;
  if (ampm === "PM" && h !== 12) h += 12;
  const reminderMinutes = h * 60 + m;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Match if within ±1 minute
  return Math.abs(nowMinutes - reminderMinutes) <= 1;
};

// ── FIX 3 — Shared AudioContext unlocked by user gesture ──
// Mobile Chrome blocks audio until after a user tap.
// We create one shared context and resume it on first interaction.
let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  try {
    if (!sharedAudioCtx) {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      sharedAudioCtx = new AudioCtx();
    }
    // Resume if suspended (happens after page background on mobile)
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
};

// Call this once on any user interaction to pre-unlock audio
export const unlockAudio = () => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume();
  }
};

const playAlarmSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

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

// ── FIX 2 — localStorage persistence for fired alarms ─
// In-memory firedRef dies when mobile suspends JS.
// We persist fired keys in localStorage so they survive tab suspension.
const FIRED_KEY = "medipro_fired_alarms";
const TODAY_KEY = "medipro_fired_date";

const loadFiredKeys = (): Set<string> => {
  try {
    const today = toDateKey(new Date());
    const savedDate = localStorage.getItem(TODAY_KEY);
    // Reset fired keys daily
    if (savedDate !== today) {
      localStorage.setItem(TODAY_KEY, today);
      localStorage.removeItem(FIRED_KEY);
      return new Set();
    }
    const raw = localStorage.getItem(FIRED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const saveFiredKey = (key: string) => {
  try {
    const keys = loadFiredKeys();
    keys.add(key);
    localStorage.setItem(FIRED_KEY, JSON.stringify([...keys]));
  } catch {}
};

const hasFiredKey = (key: string): boolean => {
  try {
    const keys = loadFiredKeys();
    return keys.has(key);
  } catch {
    return false;
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

  // In-memory cache as fast path; localStorage is source of truth
  const firedRef = useRef<Set<string>>(loadFiredKeys());

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

  // ── Permissions + audio unlock on first tap ───────────
  useEffect(() => {
    requestNotificationPermission();
    // FIX 3: unlock audio on first user interaction
    const unlock = () => {
      unlockAudio();
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("click", unlock);
    return () => {
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
  }, []);

  // ── Core alarm checker ────────────────────────────────
  const checkAlarms = useCallback(() => {
    const todayKey = toDateKey(new Date());

    const due = reminders.find((r) => {
      if (r.date !== todayKey) return false;
      if (r.taken || r.skipped) return false;

      const effectiveTime = r.snoozedTo ?? r.time;
      const fireKey = `${r.id}:${effectiveTime}`;

      // FIX 1: use ±1 min window instead of exact match
      // FIX 2: check both in-memory AND localStorage
      const alreadyFired =
        firedRef.current.has(fireKey) || hasFiredKey(fireKey);

      return isWithinWindow(effectiveTime) && !alreadyFired;
    });

    if (due) {
      const effectiveTime = due.snoozedTo ?? due.time;
      const fireKey = `${due.id}:${effectiveTime}`;

      // Save to both in-memory and localStorage
      firedRef.current.add(fireKey);
      saveFiredKey(fireKey);

      playAlarmSound();
      showBrowserNotification(due.medicationName, due.dosage);
      setAlarmReminder(due);
    }
  }, [reminders]);

  useEffect(() => {
    checkAlarms();
    const interval = setInterval(checkAlarms, 30_000);

    // FIX 2: re-check immediately when user returns to tab/app
    // This catches the case where mobile suspended JS and missed the interval
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Sync firedRef from localStorage (may have updated in another tab)
        firedRef.current = loadFiredKeys();
        checkAlarms();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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
