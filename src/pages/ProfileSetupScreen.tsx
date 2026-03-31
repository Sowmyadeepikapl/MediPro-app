import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Calendar,
  Weight,
  Heart,
  Droplets,
  ChevronRight,
  Check,
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
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/contexts/ProfileContext";

const STEPS = [
  {
    id: 1,
    title: "What's your name?",
    subtitle: "Let's personalise your experience",
  },
  {
    id: 2,
    title: "Basic Health Info",
    subtitle: "This helps us tailor your health assistant",
  },
  {
    id: 3,
    title: "Medical Details",
    subtitle: "Optional but useful for your AI assistant",
  },
];

const ProfileSetupScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, updateProfile } = useProfile();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: profile.name || "",
    age: profile.age || "",
    weight: profile.weight || "",
    gender: profile.gender || "",
    bloodGroup: profile.bloodGroup || "",
    email: profile.email || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // If profile already complete, skip to dashboard
  useEffect(() => {
    if (profile.name && profile.age && profile.gender) {
      navigate("/dashboard", { replace: true });
    }
  }, []);

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 0 && !form.name.trim()) e.name = "Name is required";
    if (step === 1) {
      if (!form.age) e.age = "Age is required";
      else if (Number(form.age) <= 0 || Number(form.age) >= 150)
        e.age = "Enter a valid age";
      if (!form.gender) e.gender = "Please select a gender";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleFinish();
  };

  const handleFinish = () => {
    updateProfile({
      name: form.name,
      email: form.email,
      age: form.age,
      weight: form.weight,
      gender: form.gender,
      bloodGroup: form.bloodGroup,
    });
    toast({
      title: "Profile saved! 🎉",
      description: "Welcome to MediPro",
    });
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-background overflow-y-auto">
      {/* Header */}
      <div className="gradient-hero pt-12 pb-10 px-6 rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary-foreground"
              style={{
                width: `${25 + i * 20}px`,
                height: `${25 + i * 20}px`,
                top: `${15 + i * 15}%`,
                right: `${5 + i * 12}%`,
              }}
            />
          ))}
        </div>
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-5">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step
                      ? "bg-primary-foreground text-primary"
                      : i === step
                        ? "bg-primary-foreground/30 text-primary-foreground border-2 border-primary-foreground"
                        : "bg-primary-foreground/15 text-primary-foreground/50"
                  }`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-8 rounded-full transition-all ${i < step ? "bg-primary-foreground" : "bg-primary-foreground/20"}`}
                  />
                )}
              </div>
            ))}
          </div>
          <h1 className="text-xl font-bold text-primary-foreground">
            {STEPS[step].title}
          </h1>
          <p className="text-primary-foreground/75 text-sm mt-1">
            {STEPS[step].subtitle}
          </p>
        </motion.div>
      </div>

      {/* Form */}
      <div className="px-5 py-6">
        <div className="bg-card rounded-2xl shadow-elevated p-5">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="s0"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-4"
              >
                <div className="flex justify-center py-3">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                    <User size={30} className="text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Full Name *
                  </label>
                  <Input
                    placeholder="e.g. John Doe"
                    className={`h-12 rounded-xl ${errors.name ? "border-2 border-destructive" : ""}`}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    autoFocus
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Email (optional)
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="h-12 rounded-xl"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                      <Calendar size={13} /> Age *
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 25"
                      className={`h-12 rounded-xl ${errors.age ? "border-2 border-destructive" : ""}`}
                      value={form.age}
                      onChange={(e) =>
                        setForm({ ...form, age: e.target.value })
                      }
                    />
                    {errors.age && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.age}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                      <Weight size={13} /> Weight (kg)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 60"
                      className="h-12 rounded-xl"
                      value={form.weight}
                      onChange={(e) =>
                        setForm({ ...form, weight: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                    <User size={13} /> Gender *
                  </label>
                  <Select
                    value={form.gender}
                    onValueChange={(v) => setForm({ ...form, gender: v })}
                  >
                    <SelectTrigger
                      className={`h-12 rounded-xl ${errors.gender ? "border-2 border-destructive" : ""}`}
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.gender}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-4"
              >
                <div className="bg-primary/5 rounded-xl p-3 flex items-start gap-2">
                  <Heart
                    size={15}
                    className="text-primary mt-0.5 flex-shrink-0"
                  />
                  <p className="text-xs text-muted-foreground">
                    This info helps your AI Health Assistant give more accurate
                    advice. All fields are optional.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                    <Droplets size={13} /> Blood Group
                  </label>
                  <Select
                    value={form.bloodGroup}
                    onValueChange={(v) => setForm({ ...form, bloodGroup: v })}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                        (bg) => (
                          <SelectItem key={bg} value={bg}>
                            {bg}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-secondary/40 rounded-xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Profile Summary
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: "Name", value: form.name },
                      {
                        label: "Age",
                        value: form.age ? `${form.age} years` : "—",
                      },
                      { label: "Gender", value: form.gender || "—" },
                      {
                        label: "Weight",
                        value: form.weight ? `${form.weight} kg` : "—",
                      },
                      { label: "Blood Group", value: form.bloodGroup || "—" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="font-medium text-foreground">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            )}
            <Button
              className="flex-1 h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-button gap-2"
              onClick={handleNext}
            >
              {step === STEPS.length - 1 ? (
                <>
                  <Check size={16} /> All Done!
                </>
              ) : (
                <>
                  Next <ChevronRight size={16} />
                </>
              )}
            </Button>
          </div>

          {step === STEPS.length - 1 && (
            <button
              onClick={handleFinish}
              className="w-full text-center text-xs text-muted-foreground mt-3 tap-highlight py-1"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupScreen;
