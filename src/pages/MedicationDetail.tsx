import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Bell,
  ShieldCheck,
  FlaskConical,
  Pill,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { medications } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useMedications } from "@/contexts/MedicationsContext";
import { useReminders } from "@/contexts/RemindersContext";

const tabs = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "dosage", label: "Dosage", icon: Pill },
  { id: "safety", label: "Safety", icon: ShieldCheck },
  { id: "admet", label: "ADMET", icon: FlaskConical },
];

const MedicationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const { addMedication, medications: myMeds } = useMedications();
  const { addReminder } = useReminders();
  const med = medications.find((m) => m.id === id);
  if (!med)
    return (
      <div className="p-6 text-center text-muted-foreground">
        Medication not found
      </div>
    );

  const admetColor =
    med.admetScore >= 8
      ? "bg-success"
      : med.admetScore >= 7
        ? "bg-warning"
        : "bg-destructive";

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-background pb-6">
      {/* Header */}
      <div className="gradient-hero px-5 pt-4 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="tap-highlight p-1">
            <ArrowLeft size={22} className="text-primary-foreground" />
          </button>
          <h1 className="text-lg font-bold text-primary-foreground">
            Medication Details
          </h1>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3">
            <Pill className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-primary-foreground">
            {med.name}
          </h2>
          <p className="text-primary-foreground/70 text-sm mt-1">
            {med.generic}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span
              className={`${admetColor} text-white px-3 py-1 rounded-full text-xs font-bold`}
            >
              ADMET: {med.admetScore}/10
            </span>
            <span className="bg-primary-foreground/20 text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
              {med.prescriptionStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 -mt-4">
        <div className="bg-card rounded-2xl shadow-elevated overflow-hidden">
          <div className="flex border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors relative tap-highlight ${
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4 mx-auto mb-1" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 gradient-primary rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          <motion.div
            key={activeTab}
            className="p-5"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <div className="space-y-4">
                <InfoRow label="Generic Name" value={med.generic} />
                <InfoRow label="Drug Class" value={med.drugClass} />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Uses
                  </p>
                  <ul className="space-y-1.5">
                    {med.uses.map((use) => (
                      <li
                        key={use}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {use}
                      </li>
                    ))}
                  </ul>
                </div>
                <InfoRow label="Mechanism of Action" value={med.mechanism} />
                <InfoRow label="Expiry Information" value={med.expiryInfo} />
                <InfoRow label="If Missed Dose" value={med.missedDose} />
              </div>
            )}

            {activeTab === "dosage" && (
              <div className="space-y-4">
                <InfoRow label="Adult Dosage" value={med.dosage.adult} />
                {med.dosage.child && (
                  <InfoRow label="Child Dosage" value={med.dosage.child} />
                )}
                {med.dosage.elderly && (
                  <InfoRow label="Elderly Dosage" value={med.dosage.elderly} />
                )}
                <InfoRow
                  label="Maximum Daily Dose"
                  value={med.dosage.maxDaily}
                />
                {med.dosage.duration && (
                  <InfoRow label="Duration" value={med.dosage.duration} />
                )}
                <InfoRow label="When to Take" value={med.dosage.timing} />
                <InfoRow
                  label="Food Interaction"
                  value={med.dosage.foodInteraction}
                />
              </div>
            )}

            {activeTab === "safety" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Common Side Effects
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {med.safety.sideEffects.map((se) => (
                      <span
                        key={se}
                        className="bg-destructive/10 text-destructive px-2.5 py-1 rounded-lg text-xs font-medium"
                      >
                        {se}
                      </span>
                    ))}
                  </div>
                </div>
                <InfoRow
                  label="Allergies Warning"
                  value={med.safety.allergies}
                />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Contraindications
                  </p>
                  <ul className="space-y-1.5">
                    {med.safety.contraindications.map((c) => (
                      <li
                        key={c}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <InfoRow
                  label="Pregnancy Category"
                  value={med.safety.pregnancyCategory}
                />
                <InfoRow
                  label="Breastfeeding"
                  value={med.safety.breastfeeding}
                />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Drug Interactions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {med.safety.interactions.map((int) => (
                      <span
                        key={int}
                        className="bg-warning/10 text-warning-foreground px-2.5 py-1 rounded-lg text-xs font-medium"
                      >
                        {int}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "admet" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Mol. Weight", value: med.admet.molecularWeight },
                    { label: "LogP", value: med.admet.logP },
                    { label: "HBA", value: String(med.admet.hba) },
                    { label: "HBD", value: String(med.admet.hbd) },
                    { label: "TPSA", value: med.admet.tpsa },
                    {
                      label: "Lipinski Violations",
                      value: String(med.admet.lipinskiViolations),
                    },
                  ].map((prop) => (
                    <div
                      key={prop.label}
                      className="bg-secondary/50 rounded-xl p-3"
                    >
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                        {prop.label}
                      </p>
                      <p className="text-sm font-bold text-foreground mt-1">
                        {prop.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="bg-primary/5 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">
                    QED Score
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {med.admet.qedScore}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Quantitative Estimate of Drug-likeness
                  </p>
                </div>
              </div>
            )}
          </motion.div>
          {/* Action buttons */}
          <div className="flex gap-3 mt-5">
            <Button
              className="flex-1 h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-button gap-2"
              disabled={myMeds.some((m) => m.medicationId === med.id)}
              onClick={async () => {
                if (myMeds.some((m) => m.medicationId === med.id)) {
                  toast({
                    title: "Already added",
                    description: `${med.name} is already in your list`,
                  });
                  return;
                }
                await addMedication({
                  id: Date.now().toString(),
                  medicationId: med.id,
                  name: med.name,
                  dosage: med.dosage.adult,
                  frequency: med.dosage.timing,
                  daysRemaining: 30,
                });
                toast({
                  title: "✅ Added!",
                  description: `${med.name} added to My Medications`,
                });
              }}
            >
              <Plus size={18} />
              {myMeds.some((m) => m.medicationId === med.id)
                ? "Already Added"
                : "Add to My Meds"}
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-xl px-5 font-semibold gap-2"
              onClick={async () => {
                const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
                const newReminder = {
                  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  medicationName: med.name,
                  dosage: med.dosage.adult,
                  time: "08:00 AM",
                  withFood: med.dosage.foodInteraction
                    .toLowerCase()
                    .includes("food"),
                  taken: false,
                  skipped: false,
                  snoozedTo: undefined,
                  date: today,
                };
                try {
                  await addReminder(newReminder);
                  toast({
                    title: "⏰ Reminder Set!",
                    description: `Reminder added for ${med.name} at 8:00 AM`,
                  });
                } catch (e) {
                  console.error("[Remind] Failed:", e);
                  toast({
                    title: "❌ Failed",
                    description: "Could not save reminder. Check console.",
                  });
                }
              }}
            >
              <Bell size={18} />
              Remind
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-sm text-foreground leading-relaxed">{value}</p>
  </div>
);

export default MedicationDetail;
