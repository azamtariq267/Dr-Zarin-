import { Moon, Sun } from "lucide-react";
import { useThemeContext } from "../src/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeContext();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="grid size-10 place-items-center rounded-full bg-slate-950/5 text-slate-700 transition-colors hover:bg-slate-950/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
