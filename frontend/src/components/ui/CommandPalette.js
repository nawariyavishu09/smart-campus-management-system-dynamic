import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import {
  Search, LayoutDashboard, GraduationCap, Users, Building2, BookOpen,
  CalendarCheck, FileBarChart, Megaphone, MessageSquare, BarChart3,
  ArrowRight, Loader2, X, Command, Hash, Clock
} from "lucide-react";

const PAGE_SHORTCUTS = {
  admin: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, keywords: "home overview" },
    { label: "Students", path: "/students", icon: GraduationCap, keywords: "student list" },
    { label: "Faculty", path: "/faculty-members", icon: Users, keywords: "teacher professor staff" },
    { label: "Departments", path: "/departments", icon: Building2, keywords: "department" },
    { label: "Subjects", path: "/subjects", icon: BookOpen, keywords: "subject course module" },
    { label: "Attendance", path: "/attendance", icon: CalendarCheck, keywords: "attendance record" },
    { label: "Marks & Results", path: "/marks", icon: FileBarChart, keywords: "marks grade result exam" },
    { label: "Notice Board", path: "/notices", icon: Megaphone, keywords: "notice announcement" },
    { label: "Complaints", path: "/complaints", icon: MessageSquare, keywords: "complaint grievance" },
    { label: "Reports", path: "/reports", icon: BarChart3, keywords: "report analytics chart" },
  ],
  faculty: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, keywords: "home overview" },
    { label: "Attendance", path: "/attendance", icon: CalendarCheck, keywords: "attendance record" },
    { label: "Marks & Results", path: "/marks", icon: FileBarChart, keywords: "marks grade result" },
    { label: "Notice Board", path: "/notices", icon: Megaphone, keywords: "notice announcement" },
  ],
  student: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, keywords: "home overview" },
    { label: "Attendance", path: "/attendance", icon: CalendarCheck, keywords: "attendance record" },
    { label: "Marks & Results", path: "/marks", icon: FileBarChart, keywords: "marks grade result" },
    { label: "Notice Board", path: "/notices", icon: Megaphone, keywords: "notice announcement" },
    { label: "Complaints", path: "/complaints", icon: MessageSquare, keywords: "complaint grievance" },
  ],
};

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cmd_recent") || "[]"); } catch { return []; }
  });
  const debounceRef = useRef(null);

  const pages = PAGE_SHORTCUTS[user?.role] || PAGE_SHORTCUTS.student;

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setActiveIdx(0);
    }
  }, [open]);

  // Filter pages by query
  const filteredPages = query.trim()
    ? pages.filter(p =>
        p.label.toLowerCase().includes(query.toLowerCase()) ||
        p.keywords.toLowerCase().includes(query.toLowerCase())
      )
    : pages;

  // Search API for data results
  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await api.get("/search", { params: { q: q.trim() } });
      setResults(res.data.results || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  const handleChange = (val) => {
    setQuery(val);
    setActiveIdx(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  // Combined items: pages first, then search results
  const allItems = [
    ...filteredPages.map(p => ({ type: "page", ...p })),
    ...results.map(r => ({ type: "result", ...r })),
  ];

  const handleSelect = (item) => {
    // Save to recent
    const entry = { label: item.label || item.title, path: item.path };
    const updated = [entry, ...recent.filter(r => r.path !== entry.path)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem("cmd_recent", JSON.stringify(updated));

    onClose();
    navigate(item.path, item.id ? { state: { searchItemId: item.id, searchItemType: item.type } } : undefined);
  };

  // Keyboard nav
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, allItems.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && allItems[activeIdx]) { e.preventDefault(); handleSelect(allItems[activeIdx]); }
      if (e.key === "Escape") { onClose(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  });

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
          onClick={onClose}>

          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl mx-4 rounded-2xl bg-card border border-border/60 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>

            {/* Search input */}
            <div className="flex items-center gap-3 px-5 h-14 border-b border-border/40">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search pages, students, faculty, notices..."
                value={query}
                onChange={e => handleChange(e.target.value)}
                className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground/50"
              />
              {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />}
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-muted-foreground/60 bg-muted border border-border/50">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[320px] overflow-y-auto py-2">
              {/* Recent (when no query) */}
              {!query && recent.length > 0 && (
                <div className="px-3 pb-1">
                  <p className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Recent
                  </p>
                  {recent.map((r, i) => (
                    <button key={r.path + i} onClick={() => handleSelect(r)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-muted transition-colors text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                      <span className="text-foreground">{r.label}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground/30 ml-auto" />
                    </button>
                  ))}
                </div>
              )}

              {/* Pages */}
              {filteredPages.length > 0 && (
                <div className="px-3">
                  <p className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Hash className="w-3 h-3" /> Pages
                  </p>
                  {filteredPages.map((p, i) => {
                    const idx = i;
                    return (
                      <button key={p.path} onClick={() => handleSelect(p)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-sm
                          ${activeIdx === idx ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" : "hover:bg-muted"}`}>
                        <p.icon className={`w-4 h-4 shrink-0 ${activeIdx === idx ? "text-indigo-500" : "text-muted-foreground/50"}`} strokeWidth={1.5} />
                        <span className="flex-1 font-medium">{p.label}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground/30" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Search results */}
              {results.length > 0 && (
                <div className="px-3 pt-1">
                  <p className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="w-3 h-3" /> Results
                  </p>
                  {results.map((r, i) => {
                    const idx = filteredPages.length + i;
                    return (
                      <button key={`${r.type}-${r.id}-${i}`} onClick={() => handleSelect(r)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-sm
                          ${activeIdx === idx ? "bg-indigo-50 dark:bg-indigo-500/10" : "hover:bg-muted"}`}>
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Search className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{r.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium shrink-0">{r.type}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* No results */}
              {query && filteredPages.length === 0 && results.length === 0 && !loading && (
                <div className="py-10 text-center">
                  <Search className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No results for "{query}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 border-t border-border/40 flex items-center gap-4 text-[10px] text-muted-foreground/50 font-medium">
              <span className="inline-flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-muted border border-border/50 text-[9px]">↑↓</kbd> Navigate</span>
              <span className="inline-flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-muted border border-border/50 text-[9px]">↵</kbd> Open</span>
              <span className="inline-flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-muted border border-border/50 text-[9px]">ESC</kbd> Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
