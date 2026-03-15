import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Pill } from "lucide-react";
import { Input } from "@/components/ui/input";
import { medications } from "@/data/mockData";
import MobileLayout from "@/components/MobileLayout";

const TabletInfo = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = medications.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.generic.toLowerCase().includes(search.toLowerCase()) ||
    m.drugClass.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MobileLayout>
      <div className="px-5 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="tap-highlight p-1"><ArrowLeft size={22} className="text-foreground" /></button>
          <h1 className="text-lg font-bold text-foreground">Tablet Info</h1>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search medications..." className="pl-10 h-12 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {search ? `Results (${filtered.length})` : "Popular Medications"}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {filtered.map((med, i) => (
            <motion.button
              key={med.id}
              onClick={() => navigate(`/medication/${med.id}`)}
              className="bg-card rounded-2xl p-4 shadow-card text-left tap-highlight active:scale-[0.97] transition-transform"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Pill className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">{med.name}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{med.drugClass}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className={`w-2 h-2 rounded-full ${med.admetScore >= 8 ? "bg-success" : med.admetScore >= 7 ? "bg-warning" : "bg-destructive"}`} />
                <span className="text-[11px] font-medium text-muted-foreground">ADMET: {med.admetScore}/10</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
};

export default TabletInfo;
