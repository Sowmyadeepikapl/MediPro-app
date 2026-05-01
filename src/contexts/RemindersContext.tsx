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

const timeStrToMinutes = (timeStr: string): number => {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return -1;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === "AM" && h === 12) h = 0;
  if (ampm === "PM" && h !== 12) h += 12;
  return h * 60 + m;
};

const nowMinutes = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

// ── Persistent fired keys ──────────────────────────────
const FIRED_KEY = "medipro_fired_alarms";
const getFiredSet = (): Set<string> => {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};
const addFiredKey = (key: string) => {
  try {
    const set = getFiredSet();
    set.add(key);
    localStorage.setItem(FIRED_KEY, JSON.stringify([...set]));
  } catch {}
};

// ── Persistent pending alarm ───────────────────────────
const PENDING_ALARM_KEY = "medipro_pending_alarm";
const savePendingAlarm = (r: ExtendedReminder | null) => {
  try {
    if (r) localStorage.setItem(PENDING_ALARM_KEY, JSON.stringify(r));
    else localStorage.removeItem(PENDING_ALARM_KEY);
  } catch {}
};
const loadPendingAlarm = (): ExtendedReminder | null => {
  try {
    const raw = localStorage.getItem(PENDING_ALARM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ── AudioContext — MOBILE FIX ──────────────────────────
// On mobile, AudioContext MUST be created inside a user-gesture handler.
// We create it once on the first tap and reuse it forever.
// Trying to create it inside a timer callback (no gesture) is silently blocked.
let sharedAudioCtx: AudioContext | null = null;
let audioUnlocked = false;

export const unlockAudio = () => {
  // Already unlocked — nothing to do
  if (audioUnlocked && sharedAudioCtx) return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    // Resume if the browser suspended it (common on mobile after backgrounding)
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }
    // Play a silent 1-sample buffer — this is the "unlock" gesture handshake
    const buf = sharedAudioCtx.createBuffer(1, 1, 22050);
    const src = sharedAudioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(sharedAudioCtx.destination);
    src.start(0);
    audioUnlocked = true;
  } catch {
    // Silently ignore — will retry on next gesture
  }
};

// ── Play alarm using the pre-unlocked shared context ──
const playAlarmSound = () => {
  try {
    const ctx = sharedAudioCtx;

    // If context was never unlocked (user never tapped), we can't play audio.
    // This is a hard browser restriction on mobile — nothing we can do.
    if (!ctx) {
      console.warn("[Alarm] AudioContext not unlocked yet — no sound played");
      return;
    }

    // Always resume in case the browser suspended the context while backgrounded
    const play = () => {
      const playBeep = (startTime: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          660,
          startTime + 0.15,
        );
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + 0.4);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.4);
      };

      const t = ctx.currentTime;
      playBeep(t);
      playBeep(t + 0.55);
      playBeep(t + 1.1);
    };

    if (ctx.state === "suspended") {
      ctx
        .resume()
        .then(play)
        .catch(() => {});
    } else {
      play();
    }
  } catch (err) {
    console.warn("[Alarm] Audio playback failed:", err);
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

// ── Wake Lock — keeps screen/JS alive on mobile ────────
// Without this, Chrome on Android throttles timers aggressively.
// The Wake Lock API (where supported) prevents the CPU from sleeping.
let wakeLock: WakeLockSentinel | null = null;

const acquireWakeLock = async () => {
  if (!("wakeLock" in navigator)) return;
  try {
    wakeLock = await (navigator as any).wakeLock.request("screen");
    wakeLock.addEventListener("release", () => {
      // Re-acquire when the browser releases it (e.g. tab becomes visible again)
      wakeLock = null;
    });
  } catch {
    // Not critical — timers still run, just possibly at reduced frequency
  }
};

const releaseWakeLock = async () => {
  if (wakeLock) {
    await wakeLock.release().catch(() => {});
    wakeLock = null;
  }
};

// ── Provider ───────────────────────────────────────────
export const RemindersProvider = ({ children }: { children: ReactNode }) => {
  const [reminders, setReminders] = useState<ExtendedReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [alarmReminder, setAlarmReminder] = useState<ExtendedReminder | null>(
    () => loadPendingAlarm(),
  );

  const remindersRef = useRef<ExtendedReminder[]>([]);
  remindersRef.current = reminders;

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

  // ── Unlock audio + notifications on FIRST USER TAP ───
  // CRITICAL for mobile: AudioContext must be created/resumed inside
  // a touchstart or click handler. We attach these once and remove after.
  useEffect(() => {
    requestNotificationPermission();

    const handleGesture = () => {
      unlockAudio();
      acquireWakeLock();
      // Remove listeners after first unlock — we don't need them again
      document.removeEventListener("touchstart", handleGesture);
      document.removeEventListener("click", handleGesture);
    };

    document.addEventListener("touchstart", handleGesture, { passive: true });
    document.addEventListener("click", handleGesture);

    return () => {
      document.removeEventListener("touchstart", handleGesture);
      document.removeEventListener("click", handleGesture);
    };
  }, []);

  // ── Core alarm checker ────────────────────────────────
  const checkAlarms = useCallback(() => {
    const todayKey = toDateKey(new Date());
    const currentMins = nowMinutes();
    const firedSet = getFiredSet();

    const due = remindersRef.current.find((r) => {
      if (r.date !== todayKey) return false;
      if (r.taken || r.skipped) return false;

      const effectiveTime = r.snoozedTo ?? r.time;
      const fireKey = `${r.id}:${effectiveTime}`;
      if (firedSet.has(fireKey)) return false;

      const reminderMins = timeStrToMinutes(effectiveTime);
      if (reminderMins < 0) return false;

      // ±2 min window to catch throttled timer checks on mobile
      const diff = Math.abs(currentMins - reminderMins);
      return diff <= 2;
    });

    if (due) {
      const effectiveTime = due.snoozedTo ?? due.time;
      const fireKey = `${due.id}:${effectiveTime}`;
      addFiredKey(fireKey);
      savePendingAlarm(due);
      playAlarmSound();
      showBrowserNotification(due.medicationName, due.dosage);
      setAlarmReminder(due);
    }
  }, []);

  // ── Timer: every 20s ──────────────────────────────────
  // Mobile Chrome throttles hidden-tab timers to ~60s.
  // We use visibilitychange + PageLifecycle to compensate (see below).
  useEffect(() => {
    checkAlarms();
    const interval = setInterval(checkAlarms, 20_000);
    return () => clearInterval(interval);
  }, [checkAlarms]);

  // ── Visibility change — fires when user returns to tab ─
  // This is the KEY fix for mobile: when Chrome brings the tab back to the
  // foreground, we immediately run a check. This catches any alarms that
  // were due while the tab was throttled/suspended in the background.
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState === "visible") {
        // Re-acquire wake lock (browser releases it when tab is hidden)
        acquireWakeLock();

        // Resume audio context if it was suspended while backgrounded
        if (sharedAudioCtx?.state === "suspended") {
          await sharedAudioCtx.resume().catch(() => {});
        }

        // First check if there's a pending alarm saved to localStorage
        // (set before the tab was backgrounded/suspended)
        const pending = loadPendingAlarm();
        if (pending) {
          setAlarmReminder(pending);
          playAlarmSound();
          return;
        }

        // Otherwise run a fresh check — alarms due while we were away
        checkAlarms();
      } else {
        // Tab going to background — release wake lock to save battery
        releaseWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [checkAlarms]);

  // ── Page freeze/resume (mobile app-switching) ─────────
  // The Page Lifecycle API fires "freeze" when Android kills the tab's
  // CPU budget and "resume" when the user comes back. Older Chrome on
  // Android may not fire visibilitychange reliably — this is the fallback.
  useEffect(() => {
    const handleResume = () => {
      const pending = loadPendingAlarm();
      if (pending) {
        setAlarmReminder(pending);
        playAlarmSound();
      } else {
        checkAlarms();
      }
    };

    window.addEventListener("resume", handleResume);
    window.addEventListener("pageshow", handleResume);
    return () => {
      window.removeEventListener("resume", handleResume);
      window.removeEventListener("pageshow", handleResume);
    };
  }, [checkAlarms]);

  const dismissAlarm = () => {
    savePendingAlarm(null);
    setAlarmReminder(null);
  };

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
      savePendingAlarm(null);
      setReminders((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, taken: true, skipped: false } : r,
        ),
      );
      setAlarmReminder(null);
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
      savePendingAlarm(null);
      setAlarmReminder(null);
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
      savePendingAlarm(null);
      setAlarmReminder(null);
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
