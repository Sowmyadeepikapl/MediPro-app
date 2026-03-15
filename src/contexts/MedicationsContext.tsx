import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { UserMedication } from "@/data/mockData";

interface MedicationsContextType {
  medications: UserMedication[];
  loading: boolean;
  addMedication: (m: UserMedication) => Promise<void>;
  updateMedication: (m: UserMedication) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
}

const MedicationsContext = createContext<MedicationsContextType>({
  medications: [],
  loading: true,
  addMedication: async () => {},
  updateMedication: async () => {},
  deleteMedication: async () => {},
});

export const useMedications = () => useContext(MedicationsContext);

export const MedicationsProvider = ({ children }: { children: ReactNode }) => {
  const [medications, setMedications] = useState<UserMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get session first (handles page refresh case)
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      console.log("[MedContext] Initial session userId:", uid);
      setUserId(uid);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_e, session) => {
        const uid = session?.user?.id ?? null;
        console.log("[MedContext] Auth state changed, userId:", uid);
        setUserId(uid);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setMedications([]);
      setLoading(false);
      return;
    }
    fetchMedications();
  }, [userId]);

  const fetchMedications = async () => {
    setLoading(true);
    console.log("[MedContext] Fetching medications for userId:", userId);
    const { data, error } = await supabase
      .from("user_medications")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(
        "[MedContext] Fetch error:",
        error.message,
        error.details,
        error.hint,
      );
    } else {
      console.log("[MedContext] Fetched rows:", data?.length, data);
      setMedications(
        (data ?? []).map((row) => ({
          id: row.id,
          medicationId: row.medication_id,
          name: row.name,
          dosage: row.dosage,
          frequency: row.frequency,
          timeOfDay: row.time_of_day,
          foodRelation: row.food_relation,
          startDate: row.start_date,
          endDate: row.end_date,
          refillDate: row.refill_date,
          quantity: row.quantity,
          notes: row.notes,
          daysRemaining: row.days_remaining,
        })),
      );
    }
    setLoading(false);
  };

  const addMedication = async (m: UserMedication) => {
    if (!userId) {
      console.error("[MedContext] addMedication called with no userId!");
      return;
    }
    console.log(
      "[MedContext] Inserting medication:",
      m.name,
      "for userId:",
      userId,
    );
    const { data, error } = await supabase
      .from("user_medications")
      .insert({
        id: m.id,
        user_id: userId,
        medication_id: m.medicationId ?? null,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        time_of_day: m.timeOfDay ?? null,
        food_relation: m.foodRelation ?? null,
        start_date: m.startDate ?? null,
        end_date: m.endDate ?? null,
        refill_date: m.refillDate ?? null,
        quantity: m.quantity ?? null,
        notes: m.notes ?? null,
        days_remaining: m.daysRemaining ?? 30,
      })
      .select();

    if (error) {
      console.error(
        "[MedContext] Insert error:",
        error.message,
        error.details,
        error.hint,
        error.code,
      );
    } else {
      console.log("[MedContext] Insert success:", data);
      setMedications((prev) => [...prev, m]);
    }
  };

  const updateMedication = async (m: UserMedication) => {
    if (!userId) return;
    const { error } = await supabase
      .from("user_medications")
      .update({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        time_of_day: m.timeOfDay ?? null,
        food_relation: m.foodRelation ?? null,
        days_remaining: m.daysRemaining ?? 30,
        notes: m.notes ?? null,
      })
      .eq("id", m.id);

    if (error) {
      console.error("[MedContext] Update error:", error.message, error.details);
    } else {
      setMedications((prev) => prev.map((med) => (med.id === m.id ? m : med)));
    }
  };

  const deleteMedication = async (id: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from("user_medications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[MedContext] Delete error:", error.message, error.details);
    } else {
      setMedications((prev) => prev.filter((med) => med.id !== id));
    }
  };

  return (
    <MedicationsContext.Provider
      value={{
        medications,
        loading,
        addMedication,
        updateMedication,
        deleteMedication,
      }}
    >
      {children}
    </MedicationsContext.Provider>
  );
};
