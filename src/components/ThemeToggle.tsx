import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: "22px",
        padding: "6px",
        borderRadius: "8px",
        lineHeight: 1,
        transition: "transform 0.2s",
      }}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
