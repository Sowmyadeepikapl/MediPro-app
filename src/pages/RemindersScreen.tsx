import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Clock,
  Plus,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  X,
  AlarmClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/MobileLayout";
import { useReminders, ExtendedReminder } from "@/contexts/RemindersContext";
import { medications } from "@/data/mockdata";

// ── Helpers ────────────────────────────────────────────
const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── Add Reminder Modal ─────────────────────────────────
interface AddReminderModalProps {
  selectedDate: Date;
  onClose: () => void;
  onAdd: (r: ExtendedReminder) => void;
}

const AddReminderModal = ({
  selectedDate,
  onClose,
  onAdd,
}: AddReminderModalProps) => {
  const [form, setForm] = useState({
    medicationName: "",
    dosage: "",
    time: "08:00",
    withFood: false,
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSubmit = () => {
    const e: Record<string, boolean> = {};
    if (!form.medicationName.trim()) e.medicationName = true;
    if (!form.dosage.trim()) e.dosage = true;
    if (!form.time) e.time = true;
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const [h, m] = form.time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const timeStr = `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;

    onAdd({
      id: Date.now().toString(),
      medicationName: form.medicationName,
      dosage: form.dosage,
      time: timeStr,
      withFood: form.withFood,
      taken: false,
      skipped: false,
      date: toDateKey(selectedDate),
    });
    onClose();
  };

  const filteredMeds = medications.filter((m) =>
    m.name.toLowerCase().includes(form.medicationName.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div
        className="bg-card w-full max-w-md rounded-3xl shadow-elevated p-5 max-h-[90vh] overflow-y-auto"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base text-foreground">Add Reminder</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-muted tap-highlight"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          For:{" "}
          <span className="font-semibold text-primary">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </p>
        <div className="space-y-3">
          <div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Medication Name *
              </label>
              <div className="relative mt-1">
                <input
                  value={form.medicationName}
                  onChange={(e) => {
                    setForm({ ...form, medicationName: e.target.value });
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  placeholder="e.g. Paracetamol"
                  className={`w-full h-10 px-3 pr-9 rounded-xl border text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/40 ${errors.medicationName ? "border-destructive" : "border-border"}`}
                />
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowDropdown((prev) => !prev);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${showDropdown ? "rotate-180" : ""}`}
                  />
                </button>
                {showDropdown && filteredMeds.length > 0 && (
                  <div className="absolute z-10 top-full left-0 w-full mt-1 bg-card border border-border rounded-xl shadow-elevated max-h-48 overflow-y-auto">
                    {filteredMeds.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onMouseDown={() => {
                          setForm({
                            ...form,
                            medicationName: m.name,
                            dosage: m.dosage.adult,
                          });
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-primary/10 text-sm text-foreground border-b border-border/40 last:border-0 transition-colors"
                      >
                        <span className="font-medium">{m.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {m.dosage.adult}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dosage *
            </label>
            <input
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              placeholder="e.g. 500mg"
              className={`mt-1 w-full h-10 px-3 rounded-xl border text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/40 ${errors.dosage ? "border-destructive" : "border-border"}`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Time *
            </label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className={`mt-1 w-full h-10 px-3 rounded-xl border text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/40 ${errors.time ? "border-destructive" : "border-border"}`}
            />
          </div>
          <div className="flex items-center justify-between bg-secondary/50 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-foreground">
              Take with food?
            </span>
            <button
              onClick={() => setForm({ ...form, withFood: !form.withFood })}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.withFood ? "bg-primary" : "bg-muted"}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.withFood ? "left-5" : "left-0.5"}`}
              />
            </button>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-xl gradient-primary text-primary-foreground shadow-button"
            onClick={handleSubmit}
          >
            Add Reminder
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Main Screen ────────────────────────────────────────
const RemindersScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { reminders, markTaken, skipReminder, snoozeReminder, addReminder } =
    useReminders();

  const realToday = new Date();
  realToday.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(realToday.getFullYear(), realToday.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(realToday));
  const [showAddModal, setShowAddModal] = useState(false);

  const getDaysInMonth = (monthDate: Date): (number | null)[] => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  };

  const goToPrevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  const goToNextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  const goToToday = () => {
    setCurrentMonth(new Date(realToday.getFullYear(), realToday.getMonth(), 1));
    setSelectedDate(new Date(realToday));
  };
  const handleDayClick = (day: number) =>
    setSelectedDate(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day),
    );

  const isToday = (day: number) =>
    day === realToday.getDate() &&
    currentMonth.getMonth() === realToday.getMonth() &&
    currentMonth.getFullYear() === realToday.getFullYear();

  const isSelected = (day: number) =>
    day === selectedDate.getDate() &&
    currentMonth.getMonth() === selectedDate.getMonth() &&
    currentMonth.getFullYear() === selectedDate.getFullYear();

  const hasReminders = (day: number) => {
    const key = toDateKey(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day),
    );
    return reminders.some((r) => r.date === key);
  };

  const days = getDaysInMonth(currentMonth);
  const selectedKey = toDateKey(selectedDate);
  const selectedReminders = reminders
    .filter((r) => r.date === selectedKey)
    .sort((a, b) => a.time.localeCompare(b.time));

  const isSelectedToday =
    selectedDate.getDate() === realToday.getDate() &&
    selectedDate.getMonth() === realToday.getMonth() &&
    selectedDate.getFullYear() === realToday.getFullYear();

  const handleTake = (id: string) => {
    markTaken(id);
    toast({ title: "✅ Taken!", description: "Medication marked as taken" });
  };
  const handleSkip = (id: string) => {
    skipReminder(id);
    toast({ title: "⏭ Skipped", description: "Reminder marked as skipped" });
  };
  const handleSnooze = (id: string) => {
    snoozeReminder(id);
    toast({ title: "⏰ Snoozed 10 min", description: "Reminder snoozed" });
  };
  const handleAddReminder = (data: ExtendedReminder) => {
    addReminder(data);
    toast({
      title: "✅ Reminder added",
      description: `${data.medicationName} at ${data.time}`,
    });
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="tap-highlight p-1">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground flex-1">
            Reminders
          </h1>
          <button
            onClick={goToToday}
            className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg tap-highlight"
          >
            <CalendarDays size={13} /> Today
          </button>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-4 mb-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPrevMonth}
              className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center tap-highlight"
            >
              <ChevronLeft size={16} className="text-foreground" />
            </button>
            <h2 className="text-sm font-bold text-foreground">
              {MONTH_NAMES[currentMonth.getMonth()]}{" "}
              {currentMonth.getFullYear()}
            </h2>
            <button
              onClick={goToNextMonth}
              className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center tap-highlight"
            >
              <ChevronRight size={16} className="text-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {WEEK_DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-bold text-muted-foreground uppercase py-1"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {days.map((day, idx) => (
              <div key={idx} className="flex justify-center">
                {day === null ? (
                  <div className="w-9 h-9" />
                ) : (
                  <button
                    onClick={() => handleDayClick(day)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all tap-highlight relative
                      ${
                        isSelected(day)
                          ? "gradient-primary text-primary-foreground shadow-button"
                          : isToday(day)
                            ? "border-2 border-primary text-primary bg-primary/10"
                            : "text-foreground hover:bg-secondary"
                      }`}
                  >
                    {day}
                    {hasReminders(day) && !isSelected(day) && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {isSelectedToday
              ? "Today's Schedule"
              : selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
          </p>
          <span className="text-xs text-muted-foreground">
            {selectedReminders.length} reminder
            {selectedReminders.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {selectedReminders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl shadow-card p-8 flex flex-col items-center gap-3"
              >
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                  <AlarmClock className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  No reminders
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  No reminders set for this date. Tap "+ Add Reminder" to create
                  one.
                </p>
              </motion.div>
            ) : (
              selectedReminders.map((rem, i) => (
                <motion.div
                  key={rem.id}
                  className={`bg-card rounded-2xl shadow-card p-4 ${rem.taken || rem.skipped ? "opacity-60" : ""}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{
                    opacity: rem.taken || rem.skipped ? 0.6 : 1,
                    y: 0,
                  }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        rem.taken
                          ? "bg-success/20"
                          : rem.skipped
                            ? "bg-muted"
                            : "gradient-primary"
                      }`}
                    >
                      {rem.taken ? (
                        <Check className="w-5 h-5 text-success" />
                      ) : rem.skipped ? (
                        <X className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Clock className="w-5 h-5 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-semibold text-sm truncate ${rem.taken || rem.skipped ? "line-through text-muted-foreground" : "text-foreground"}`}
                        >
                          {rem.medicationName}
                        </h3>
                        {rem.withFood && (
                          <UtensilsCrossed className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {rem.dosage} •{" "}
                        {rem.snoozedTo ? (
                          <span className="text-warning font-medium">
                            Snoozed → {rem.snoozedTo}
                          </span>
                        ) : (
                          rem.time
                        )}
                      </p>
                      {rem.taken && (
                        <p className="text-[10px] text-success font-semibold mt-0.5">
                          ✓ Taken
                        </p>
                      )}
                      {rem.skipped && (
                        <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                          Skipped
                        </p>
                      )}
                    </div>
                    {!rem.taken && !rem.skipped && (
                      <div className="flex flex-col gap-1.5">
                        <Button
                          size="sm"
                          className="h-7 rounded-lg gradient-primary text-primary-foreground text-xs px-3 shadow-button"
                          onClick={() => handleTake(rem.id)}
                        >
                          Taken
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-lg text-xs px-3 text-warning border-warning/40"
                          onClick={() => handleSnooze(rem.id)}
                        >
                          +10m
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 rounded-lg text-xs px-3 text-muted-foreground"
                          onClick={() => handleSkip(rem.id)}
                        >
                          Skip
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <Button
          className="w-full mt-5 h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-button gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} /> Add Reminder
        </Button>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddReminderModal
            selectedDate={selectedDate}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddReminder}
          />
        )}
      </AnimatePresence>
    </MobileLayout>
  );
};

export default RemindersScreen;
