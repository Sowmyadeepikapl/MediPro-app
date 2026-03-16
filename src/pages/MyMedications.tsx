import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Pill, Trash2, Edit, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { medications } from "@/data/mockdata";
import { useMedications } from "@/contexts/MedicationsContext";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/MobileLayout";

const frequencyOptions = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Every 6 hours",
  "Every 8 hours",
  "Weekly",
  "As needed",
];
const foodOptions = [
  "Before food",
  "After food",
  "With food",
  "Empty stomach",
  "Any time",
];

const emptyForm = {
  name: "",
  dosage: "",
  frequency: "Once daily",
  timeOfDay: "",
  foodRelation: "After food",
  startDate: "",
  endDate: "",
  refillDate: "",
  quantity: 0,
  notes: "",
  daysRemaining: 30,
};

const MyMedications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    medications: meds,
    addMedication,
    updateMedication,
    deleteMedication,
  } = useMedications();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

  const filtered = meds.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (id: string) => {
    const med = meds.find((m) => m.id === id);
    if (!med) return;
    setEditingId(id);
    setForm({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      timeOfDay: med.timeOfDay || "",
      foodRelation: med.foodRelation || "After food",
      startDate: med.startDate || "",
      endDate: med.endDate || "",
      refillDate: med.refillDate || "",
      quantity: med.quantity || 0,
      notes: med.notes || "",
      daysRemaining: med.daysRemaining,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.dosage) {
      toast({
        title: "Error",
        description: "Please fill medication name and dosage",
        variant: "destructive",
      });
      return;
    }
    const medData = medications.find((m) => m.name === form.name);
    if (editingId) {
      updateMedication({
        id: editingId,
        medicationId: medData?.id || "",
        ...form,
      });
      toast({
        title: "Updated",
        description: "Medication updated successfully",
      });
    } else {
      addMedication({
        id: Date.now().toString(),
        medicationId: medData?.id || "",
        ...form,
      });
      toast({ title: "Added", description: "Medication added to your list" });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteMedication(id);
    setShowDeleteDialog(null);
    toast({
      title: "Removed",
      description: "Medication removed from your list",
    });
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="tap-highlight p-1">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">My Medications</h1>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search medications..."
            className="pl-10 h-12 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Pill className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              No medications added yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tap + to add your medications
            </p>
            <Button
              className="mt-4 gradient-primary text-primary-foreground rounded-xl"
              onClick={openAdd}
            >
              <Plus size={16} className="mr-1" /> Add Medication
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((med, i) => (
              <motion.div
                key={med.id}
                className="bg-card rounded-2xl shadow-card p-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Pill className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground">
                      {med.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {med.dosage} • {med.frequency}
                    </p>
                    {med.foodRelation && (
                      <p className="text-[10px] text-muted-foreground">
                        {med.foodRelation}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2">
                      <div
                        className={`w-2 h-2 rounded-full ${med.daysRemaining <= 7 ? "bg-destructive" : med.daysRemaining <= 14 ? "bg-warning" : "bg-success"}`}
                      />
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {med.daysRemaining} days until refill
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(med.id)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors tap-highlight"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setShowDeleteDialog(med.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors tap-highlight"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* FAB */}
        <button
          onClick={openAdd}
          className="fixed bottom-24 right-6 max-w-lg w-14 h-14 rounded-full gradient-primary shadow-button flex items-center justify-center tap-highlight active:scale-95 transition-transform z-40"
        >
          <Plus className="w-6 h-6 text-primary-foreground" />
        </button>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-[380px] rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Medication" : "Add Medication"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Select
              value={form.name}
              onValueChange={(v) => setForm({ ...form, name: v })}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select medication" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {medications.map((m) => (
                  <SelectItem key={m.id} value={m.name}>
                    {m.name} ({m.generic})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Dosage (e.g., 500mg)"
              className="h-11 rounded-xl"
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            />
            <Select
              value={form.frequency}
              onValueChange={(v) => setForm({ ...form, frequency: v })}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="time"
              placeholder="Time of day"
              className="h-11 rounded-xl"
              value={form.timeOfDay}
              onChange={(e) => setForm({ ...form, timeOfDay: e.target.value })}
            />
            <Select
              value={form.foodRelation}
              onValueChange={(v) => setForm({ ...form, foodRelation: v })}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Food relation" />
              </SelectTrigger>
              <SelectContent>
                {foodOptions.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Start Date
                </label>
                <Input
                  type="date"
                  className="h-11 rounded-xl"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold">
                  End Date
                </label>
                <Input
                  type="date"
                  className="h-11 rounded-xl"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Refill Date
                </label>
                <Input
                  type="date"
                  className="h-11 rounded-xl"
                  value={form.refillDate}
                  onChange={(e) =>
                    setForm({ ...form, refillDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Quantity
                </label>
                <Input
                  type="number"
                  className="h-11 rounded-xl"
                  value={form.quantity || ""}
                  onChange={(e) =>
                    setForm({ ...form, quantity: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <Textarea
              placeholder="Notes (optional)"
              className="rounded-xl"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 rounded-xl gradient-primary text-primary-foreground"
            >
              {editingId ? "Save Changes" : "Add Medication"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!showDeleteDialog}
        onOpenChange={() => setShowDeleteDialog(null)}
      >
        <DialogContent className="max-w-[320px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Medication?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(null)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}
              className="flex-1 rounded-xl"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default MyMedications;
