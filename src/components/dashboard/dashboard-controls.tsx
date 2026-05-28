import { useState, useEffect, useRef } from "react";
import { RefreshCw, ChevronDown, Check, Sun, Moon, Printer } from "lucide-react";

const INTERVAL_OPTIONS = [
  { label: "Every 5 min", ms: 5 * 60 * 1000 },
  { label: "Every 15 min", ms: 15 * 60 * 1000 },
  { label: "Every 1 hour", ms: 60 * 60 * 1000 },
  { label: "Every 24 hours", ms: 24 * 60 * 60 * 1000 },
];

export function SplitRefreshButton({ onRefresh }: { onRefresh?: () => void }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedIntervalMs, setSelectedIntervalMs] = useState(5 * 60 * 1000);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      handleRefresh();
    }, selectedIntervalMs);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedIntervalMs]);

  const handleRefresh = () => {
    setIsSpinning(true);
    onRefresh?.();
    setTimeout(() => setIsSpinning(false), 600);
  };

  const isDark = document.documentElement.classList.contains("dark");

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center rounded-[6px] overflow-hidden h-[26px] text-[12px]"
        style={{
          backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2",
          color: isDark ? "#c8c9cc" : "#4b5563",
        }}
      >
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 px-2 h-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
          Refresh
        </button>
        <div className="w-px h-4 shrink-0" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }} />
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center justify-center px-1.5 h-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-popover text-popover-foreground shadow-md z-50 overflow-hidden">
          <div className="p-2 flex items-center justify-between border-b">
            <span className="text-sm font-medium">Auto-refresh</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoRefresh ? "bg-primary" : "bg-input"}`}
            >
              <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${autoRefresh ? "translate-x-3" : "translate-x-0"}`} />
            </button>
          </div>
          <div className="py-1">
            {INTERVAL_OPTIONS.map((opt) => (
              <button
                key={opt.ms}
                disabled={!autoRefresh}
                onClick={() => { setSelectedIntervalMs(opt.ms); setDropdownOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-sm flex items-center justify-between hover:bg-accent hover:text-accent-foreground ${!autoRefresh ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {opt.label}
                {selectedIntervalMs === opt.ms && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((d) => !d)}
      className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors"
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2",
        color: isDark ? "#c8c9cc" : "#4b5563",
      }}
      aria-label="Toggle dark mode"
    >
      {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
    </button>
  );
}

export function PrintButton() {
  const isDark = document.documentElement.classList.contains("dark");
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors"
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2",
        color: isDark ? "#c8c9cc" : "#4b5563",
      }}
      aria-label="Export as PDF"
    >
      <Printer className="w-3.5 h-3.5" />
    </button>
  );
}
