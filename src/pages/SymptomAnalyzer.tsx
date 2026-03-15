import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  AlertCircle,
  Phone,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  symptomResults,
  medications,
  type SymptomResult,
} from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/MobileLayout";

const chips = [
  "Fever",
  "Cough",
  "Cold",
  "Headache",
  "Stomach Ache",
  "Acidity",
  "Body Pain",
  "Allergy",
  "Nausea",
  "Fatigue",
  "Sore Throat",
  "Back Pain",
  "Diarrhea",
  "Vomiting",
  "Constipation",
  "Joint Pain",
  "Chest Pain",
  "Dizziness",
  "Sneezing",
  "Runny Nose",
  "Eye Irritation",
  "Skin Rash",
  "Muscle Cramps",
  "Anxiety",
  "Insomnia",
  "Loss of Appetite",
  "Bloating",
  "Migraine",
  "Weakness",
  "Mouth Ulcer",
];

const severityColors: Record<string, string> = {
  mild: "bg-success text-success-foreground",
  moderate: "bg-warning text-warning-foreground",
  severe: "bg-destructive text-destructive-foreground",
};

const SymptomAnalyzer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [results, setResults] = useState<SymptomResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);

  const handleChip = (chip: string) => {
    const current = symptoms
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (current.includes(chip)) {
      setSymptoms(current.filter((s) => s !== chip).join(", "));
    } else {
      setSymptoms([...current, chip].join(", "));
    }
  };

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!symptoms.trim()) newErrors.symptoms = true;
    if (!age.trim() || isNaN(Number(age)) || Number(age) <= 0)
      newErrors.age = true;
    if (!weight.trim() || isNaN(Number(weight)) || Number(weight) <= 0)
      newErrors.weight = true;
    if (!gender) newErrors.gender = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const analyze = () => {
    if (!validate()) {
      toast({
        title: "⚠️ Incomplete Form",
        description: "Please fill all fields before analyzing",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setResults(null);
    setTimeout(() => {
      const key = symptoms.split(",")[0].trim().toLowerCase();
      setResults(symptomResults[key] || symptomResults["fever"]);
      setLoading(false);
    }, 1500);
  };

  const handleEmergencyCall = () => {
    setShowEmergencyDialog(false);
    window.open("tel:108", "_self");
  };

  const activeChips = symptoms.split(",").map((s) => s.trim().toLowerCase());
  const allFilled = symptoms.trim() && age.trim() && weight.trim() && gender;

  return (
    <MobileLayout>
      <div className="px-5 pt-4 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="tap-highlight p-1">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            Symptom Analyzer
          </h1>
        </div>

        {/* Symptom input */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Describe symptoms (comma separated)"
              className={`pl-10 h-12 rounded-xl ${errors.symptoms ? "border-2 border-destructive" : ""}`}
              value={symptoms}
              onChange={(e) => {
                setSymptoms(e.target.value);
                setErrors((prev) => ({ ...prev, symptoms: false }));
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChip(chip)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors tap-highlight ${
                  activeChips.includes(chip.toLowerCase())
                    ? "gradient-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Age"
              type="number"
              className={`h-11 rounded-xl ${errors.age ? "border-2 border-destructive" : ""}`}
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                setErrors((prev) => ({ ...prev, age: false }));
              }}
            />
            <Input
              placeholder="Weight (kg)"
              type="number"
              className={`h-11 rounded-xl ${errors.weight ? "border-2 border-destructive" : ""}`}
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setErrors((prev) => ({ ...prev, weight: false }));
              }}
            />
          </div>

          <Select
            value={gender}
            onValueChange={(v) => {
              setGender(v);
              setErrors((prev) => ({ ...prev, gender: false }));
            }}
          >
            <SelectTrigger
              className={`h-11 rounded-xl ${errors.gender ? "border-2 border-destructive" : ""}`}
            >
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-button"
            onClick={analyze}
            disabled={loading || !allFilled}
          >
            {loading ? "Analyzing..." : "Analyze Symptoms"}
          </Button>

          {/* Emergency Button */}
          <button
            onClick={() => setShowEmergencyDialog(true)}
            className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 text-white tap-highlight active:scale-[0.98] transition-transform"
            style={{ backgroundColor: "#dc3545" }}
          >
            <Phone className="w-5 h-5" />
            🚨 EMERGENCY - Call 108 (Ambulance)
          </button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              className="mt-5 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Safety Disclaimer */}
              <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-xs text-foreground leading-relaxed space-y-1.5">
                  <p>
                    <strong>⚠️ IMPORTANT SAFETY INFORMATION</strong>
                  </p>
                  <p>
                    These medication suggestions are for{" "}
                    <strong>common mild illnesses only</strong> and are meant
                    for informational purposes.
                  </p>
                  <p>
                    🚫 <strong>Do NOT self-medicate</strong> for serious
                    conditions.
                  </p>
                  <p>
                    🏥 <strong>Seek immediate medical help</strong> if you have
                    difficulty breathing, chest pain, high fever (&gt;103°F), or
                    symptoms that persist beyond 3 days.
                  </p>
                  <p>
                    💊 Always consult a licensed doctor or pharmacist before
                    taking any medication.
                  </p>
                  <p>
                    🤰 Pregnant or breastfeeding? Consult your OB/GYN before any
                    medication.
                  </p>
                </div>
              </div>

              {/* Condition */}
              <div className="bg-card rounded-2xl shadow-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">
                    Possible Condition
                  </h3>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${severityColors[results.severity]}`}
                  >
                    {results.severity.charAt(0).toUpperCase() +
                      results.severity.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {results.condition}
                </p>
              </div>

              {/* Medications */}
              <div className="bg-card rounded-2xl shadow-card p-4">
                <h3 className="font-semibold text-foreground mb-1">
                  Recommended Medications
                </h3>
                <p className="text-[11px] text-muted-foreground mb-3">
                  Tap any medication to view full details
                </p>
                <div className="space-y-2.5">
                  {results.medications.map((med) => {
                    const medId = medications.find(
                      (m) =>
                        med.name.toLowerCase().includes(m.name.toLowerCase()) ||
                        m.name
                          .toLowerCase()
                          .includes(med.name.split(" ")[0].toLowerCase()),
                    )?.id;
                    return (
                      <div
                        key={med.name}
                        onClick={() =>
                          medId && navigate(`/medication/${medId}`)
                        }
                        className={`flex items-center gap-3 bg-secondary/50 rounded-xl p-3 transition-transform active:scale-[0.97] ${medId ? "cursor-pointer tap-highlight" : ""}`}
                      >
                        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-foreground text-xs font-bold">
                            {med.admetScore}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground">
                            {med.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {med.purpose}
                          </p>
                        </div>
                        {medId && (
                          <span className="text-[10px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">
                            Info →
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Articles */}
              <div className="bg-card rounded-2xl shadow-card p-4">
                <h3 className="font-semibold text-foreground mb-3">
                  Research Articles
                </h3>
                {results.articles.map((article, i) => (
                  <a
                    key={i}
                    href={article.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm text-primary hover:underline mb-2 last:mb-0"
                  >
                    📄 {article.title}
                  </a>
                ))}
              </div>

              {/* Warning */}
              <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground leading-relaxed">
                  {results.warning}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Emergency Confirmation Dialog */}
      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent className="max-w-[340px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">🚨 Emergency Call</DialogTitle>
            <DialogDescription className="text-center">
              Call 108 Emergency Ambulance Services?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setShowEmergencyDialog(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEmergencyCall}
              className="flex-1 rounded-xl text-white"
              style={{ backgroundColor: "#dc3545" }}
            >
              Call 108
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default SymptomAnalyzer;
