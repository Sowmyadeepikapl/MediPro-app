import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, Calendar, User, Bot } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Search, label: "Search", path: "/tablet-info" },
  { icon: Bot, label: "AI Chat", path: "/ai-assistant" },
  { icon: Calendar, label: "Reminders", path: "/reminders" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isAI = item.path === "/ai-assistant";
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="tap-highlight flex flex-col items-center gap-1 px-3 py-2 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 w-8 h-1 rounded-full gradient-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {/* Special glowing style for AI button */}
              {isAI ? (
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? "gradient-primary shadow-button"
                      : "bg-primary/10"
                  }`}
                >
                  <item.icon
                    size={17}
                    className={
                      isActive ? "text-primary-foreground" : "text-primary"
                    }
                  />
                </div>
              ) : (
                <item.icon
                  size={22}
                  className={
                    isActive ? "text-primary" : "text-muted-foreground"
                  }
                />
              )}
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
