import {
  createContext,
  useContext,
  useState,
  useEffect,
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
});

export const useReminders = () => useContext(RemindersContext);

export const RemindersProvider = ({ children }: { children: ReactNode }) => {
  const [reminders, setReminders] = useState<ExtendedReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

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
      }}
    >
      {children}
    </RemindersContext.Provider>
  );
};
