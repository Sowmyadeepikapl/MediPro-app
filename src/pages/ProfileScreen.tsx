import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  Bell,
  Globe,
  Palette,
  Shield,
  Info,
  LogOut,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
import { useTheme } from "@/components/ThemeProvider";
import MobileLayout from "@/components/MobileLayout";

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, updateProfile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState(profile);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const validate = () => {
    const e: Record<string, boolean> = {};
    if (!editProfile.name.trim()) e.name = true;
    if (
      editProfile.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editProfile.email)
    )
      e.email = true;
    if (
      editProfile.age &&
      (isNaN(Number(editProfile.age)) ||
        Number(editProfile.age) <= 0 ||
        Number(editProfile.age) >= 150)
    )
      e.age = true;
    if (
      editProfile.weight &&
      (isNaN(Number(editProfile.weight)) || Number(editProfile.weight) <= 0)
    )
      e.weight = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      toast({
        title: "Invalid input",
        description: "Please check the highlighted fields",
        variant: "destructive",
      });
      return;
    }
    updateProfile(editProfile);
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your changes have been saved",
    });
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
    setErrors({});
  };

  const handleStartEdit = () => {
    setEditProfile(profile);
    setIsEditing(true);
  };

  const handleLogout = () => {
    const savedTheme = localStorage.getItem("theme");
    localStorage.clear();
    if (savedTheme) localStorage.setItem("theme", savedTheme);
    toast({ title: "Logged out", description: "You have been signed out" });
    navigate("/login", { replace: true });
  };

  const initials = (profile.name || "F")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const settings = [
    {
      icon: Bell,
      label: "Notifications",
      type: "toggle",
      value: notifications,
      onChange: setNotifications,
    },
    {
      icon: Globe,
      label: "Language",
      type: "info",
      value: "English",
    },
    {
      icon: Palette,
      label: "Theme",
      type: "theme",
      value: theme === "dark" ? "Dark" : "Light",
      themeValue: theme === "dark",
    },
    {
      icon: Shield,
      label: "Privacy",
      type: "info",
      value: "",
      onClick: () => navigate("/privacy"),
    },
    {
      icon: Info,
      label: "About",
      type: "info",
      value: "v1.0.0",
      onClick: () => navigate("/about"),
    },
  ];

  return (
    <MobileLayout>
      <div className="px-5 pt-4 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="tap-highlight p-1">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground flex-1">Profile</h1>
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="tap-highlight flex items-center gap-1 text-primary text-sm font-medium"
            >
              <Pencil size={14} /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="tap-highlight p-1.5 rounded-lg bg-muted"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={handleSave}
                className="tap-highlight p-1.5 rounded-lg bg-primary"
              >
                <Check size={16} className="text-primary-foreground" />
              </button>
            </div>
          )}
        </div>

        {/* Avatar */}
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-block">
            <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">
                {initials}
              </span>
            </div>
          </div>
          {isEditing ? (
            <div className="mt-3 space-y-2 max-w-[220px] mx-auto">
              <Input
                value={editProfile.name}
                onChange={(e) =>
                  setEditProfile({ ...editProfile, name: e.target.value })
                }
                placeholder="Full Name"
                className={`text-center text-sm ${errors.name ? "border-2 border-destructive" : ""}`}
              />
              <Input
                value={editProfile.email}
                onChange={(e) =>
                  setEditProfile({ ...editProfile, email: e.target.value })
                }
                placeholder="Email"
                className={`text-center text-sm ${errors.email ? "border-2 border-destructive" : ""}`}
              />
            </div>
          ) : (
            <>
              <h2 className="font-bold text-lg text-foreground mt-3">
                {profile.name || "Friend"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {profile.email || "No email set"}
              </p>
            </>
          )}
        </motion.div>

        {/* Personal Info */}
        <motion.div
          className="bg-card rounded-2xl shadow-card p-4 mb-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-semibold text-sm text-foreground mb-3">
            Personal Information
          </h3>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">
                  Age
                </p>
                <Input
                  value={editProfile.age}
                  onChange={(e) =>
                    setEditProfile({ ...editProfile, age: e.target.value })
                  }
                  className={`h-8 text-sm ${errors.age ? "border-2 border-destructive" : ""}`}
                  type="number"
                />
              </div>
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">
                  Weight (kg)
                </p>
                <Input
                  value={editProfile.weight}
                  onChange={(e) =>
                    setEditProfile({ ...editProfile, weight: e.target.value })
                  }
                  className={`h-8 text-sm ${errors.weight ? "border-2 border-destructive" : ""}`}
                  type="number"
                />
              </div>
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">
                  Gender
                </p>
                <Select
                  value={editProfile.gender}
                  onValueChange={(v) =>
                    setEditProfile({ ...editProfile, gender: v })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">
                  Blood Group
                </p>
                <Select
                  value={editProfile.bloodGroup}
                  onValueChange={(v) =>
                    setEditProfile({ ...editProfile, bloodGroup: v })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Blood" />
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
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Age",
                  value: profile.age ? `${profile.age} years` : "Not set",
                },
                {
                  label: "Weight",
                  value: profile.weight ? `${profile.weight} kg` : "Not set",
                },
                { label: "Gender", value: profile.gender || "Not set" },
                {
                  label: "Blood Group",
                  value: profile.bloodGroup || "Not set",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-secondary/50 rounded-xl p-3"
                >
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Settings */}
        <motion.div
          className="bg-card rounded-2xl shadow-card overflow-hidden mb-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold text-sm text-foreground px-4 pt-4 pb-2">
            Settings
          </h3>
          {settings.map((item, i) => (
            <div
              key={item.label}
              onClick={(item as any).onClick}
              className={`flex items-center gap-3 px-4 py-3.5 ${
                (item as any).onClick ? "cursor-pointer active:bg-muted/50" : ""
              } ${i < settings.length - 1 ? "border-b border-border" : ""}`}
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>

              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">
                  {item.label}
                </span>
                {item.label === "Language" && (
                  <p className="text-[10px] text-muted-foreground">
                    More languages coming soon
                  </p>
                )}
              </div>

              {/* Notifications */}
              {item.type === "toggle" && (
                <Switch
                  checked={item.value as boolean}
                  onCheckedChange={item.onChange as (v: boolean) => void}
                />
              )}

              {/* Theme */}
              {item.type === "theme" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {item.value}
                  </span>
                  <Switch
                    checked={item.themeValue as boolean}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              )}

              {/* Info rows */}
              {item.type === "info" && (
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={(item as any).onClick}
                >
                  {item.value && (
                    <span className="text-xs text-muted-foreground">
                      {item.value}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-destructive/10 text-destructive font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 tap-highlight active:bg-destructive/20 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </MobileLayout>
  );
};

export default ProfileScreen;
