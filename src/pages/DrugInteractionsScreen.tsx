import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  X,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  medications,
  drugInteractions,
  type DrugInteraction,
} from "@/data/mockdata";
import MobileLayout from "@/components/MobileLayout";

const severityConfig = {
  low: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
    label: "Low Risk",
  },
  moderate: {
    icon: AlertCircle,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    label: "Moderate Risk",
  },
  high: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    label: "High Risk",
  },
};

const DrugInteractionsScreen = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [results, setResults] = useState<DrugInteraction[]>([]);
  const [checked, setChecked] = useState(false);

  const suggestions = search
    ? medications
        .filter(
          (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) &&
            !selectedDrugs.includes(m.name),
        )
        .slice(0, 5)
    : [];

  const addDrug = (name: string) => {
    setSelectedDrugs([...selectedDrugs, name]);
    setSearch("");
    setChecked(false);
  };

  const removeDrug = (name: string) => {
    setSelectedDrugs(selectedDrugs.filter((d) => d !== name));
    setChecked(false);
  };

  const checkInteractions = () => {
    const found = drugInteractions.filter(
      (int) =>
        (selectedDrugs.includes(int.drug1) &&
          selectedDrugs.includes(int.drug2)) ||
        (selectedDrugs.includes(int.drug2) &&
          selectedDrugs.includes(int.drug1)),
    );
    setResults(found);
    setChecked(true);
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="tap-highlight p-1">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            Drug Interactions
          </h1>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search and add medications..."
            className="pl-10 h-12 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-card rounded-xl shadow-card mb-3 overflow-hidden">
            {suggestions.map((med) => (
              <button
                key={med.id}
                onClick={() => addDrug(med.name)}
                className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-secondary/50 transition-colors border-b border-border last:border-0 tap-highlight"
              >
                {med.name}{" "}
                <span className="text-muted-foreground text-xs">
                  ({med.drugClass})
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Selected chips */}
        {selectedDrugs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedDrugs.map((drug) => (
              <motion.span
                key={drug}
                className="flex items-center gap-1.5 gradient-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {drug}
                <button
                  onClick={() => removeDrug(drug)}
                  className="tap-highlight"
                >
                  <X size={14} />
                </button>
              </motion.span>
            ))}
          </div>
        )}

        <Button
          className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-button"
          onClick={checkInteractions}
          disabled={selectedDrugs.length < 2}
        >
          Check Interactions ({selectedDrugs.length} selected)
        </Button>

        {/* Results */}
        <AnimatePresence>
          {checked && (
            <motion.div
              className="mt-5 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {results.length === 0 ? (
                <div className="bg-success/10 border border-success/30 rounded-2xl p-4 flex gap-3 items-center">
                  <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      No interactions found
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      These medications appear safe to use together.
                    </p>
                  </div>
                </div>
              ) : (
                results.map((int, i) => {
                  const config = severityConfig[int.severity];
                  return (
                    <motion.div
                      key={i}
                      className={`${config.bg} border ${config.border} rounded-2xl p-4`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <config.icon className={`w-5 h-5 ${config.color}`} />
                        <span className={`text-xs font-bold ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        {int.drug1} + {int.drug2}
                      </p>
                      <p className="text-sm text-foreground leading-relaxed mb-2">
                        {int.description}
                      </p>
                      <div className="bg-card/50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          Recommendation
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {int.recommendation}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileLayout>
  );
};

export default DrugInteractionsScreen;
