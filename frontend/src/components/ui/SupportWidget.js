import { useState, useEffect, useRef } from "react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageCircleQuestion, X, Send, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const roleColor = {
  student: "from-indigo-500 to-violet-600",
  faculty: "from-emerald-500 to-teal-600",
};

const statusColor = {
  open: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function SupportWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("new"); // "new" | "history"
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [unread, setUnread] = useState(0);
  const textRef = useRef(null);

  const isVisible = user && user.role !== "admin";
  const grad = roleColor[user?.role] || roleColor.student;
  const seenKey = `support_seen_${user?.id || user?.email}`;

  const getSeenIds = () => {
    try { return JSON.parse(localStorage.getItem(seenKey) || "[]"); } catch { return []; }
  };

  const markAllSeen = (msgs) => {
    const repliedIds = msgs
      .filter((m) => m.status === "resolved" && m.admin_reply)
      .map((m) => m.id);
    const existing = getSeenIds();
    const merged = [...new Set([...existing, ...repliedIds])];
    localStorage.setItem(seenKey, JSON.stringify(merged));
    setUnread(0);
  };

  const calcUnread = (msgs) => {
    const seen = getSeenIds();
    return msgs.filter((m) => m.status === "resolved" && m.admin_reply && !seen.includes(m.id)).length;
  };

  const loadHistory = async (markSeen = false) => {
    setLoadingHistory(true);
    try {
      const res = await api.get("/support-messages");
      const msgs = res.data.messages || [];
      setHistory(msgs);
      if (markSeen) {
        markAllSeen(msgs);
      } else {
        setUnread(calcUnread(msgs));
      }
    } catch {
      toast.error("Could not load message history");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    // When history tab is open, load and mark all as seen
    if (open && tab === "history") loadHistory(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab]);

  // Poll for unread badge count (only if visible)
  useEffect(() => {
    if (!isVisible) return;
    const fetchCount = async () => {
      try {
        const res = await api.get("/support-messages");
        const msgs = res.data.messages || [];
        setUnread(calcUnread(msgs));
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  if (!isVisible) return null;

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please type a message first");
      return;
    }
    setSending(true);
    try {
      await api.post("/support-messages", { message: message.trim() });
      toast.success("Message sent to admin!");
      setMessage("");
      setTab("history");
      loadHistory(true);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Tooltip */}
        {!open && (
          <span className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            Support
          </span>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          data-testid="support-widget-toggle"
          className={`group relative w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center`}
          aria-label="Toggle support chat"
        >
          {open ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircleQuestion className="w-6 h-6" />
          )}
          {!open && unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 ring-2 ring-white">
              {unread}
            </span>
          )}
        </button>
      </div>

      {/* Chat Drawer */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[340px] max-w-[calc(100vw-24px)] rounded-2xl shadow-2xl border border-border/60 bg-white dark:bg-slate-900 overflow-hidden animate-scale-in"
          data-testid="support-widget-panel"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${grad} p-4 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <MessageCircleQuestion className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-black text-sm">Support Center</p>
                  <p className="text-[11px] opacity-80 font-medium capitalize">
                    {user.role} Portal · {user.name}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 rounded-full px-2 py-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Online
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-3 bg-black/15 rounded-xl p-1">
              {[
                { key: "new", label: "New Message" },
                { key: "history", label: `My Tickets${unread > 0 ? ` (${unread})` : ""}` },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    tab === t.key ? "bg-white text-slate-800 shadow" : "text-white/80 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="p-4">
            {tab === "new" ? (
              <div className="space-y-3">
                {/* Sender info card */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-border/50">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-black shrink-0`}>
                    {user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black truncate">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${user.role === "faculty" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Describe your issue
                  </label>
                  <textarea
                    ref={textRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) handleSend();
                    }}
                    placeholder="Type your message here... (Ctrl+Enter to send)"
                    rows={4}
                    data-testid="support-message-input"
                    className="w-full rounded-xl border border-border/60 bg-background text-sm p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-muted-foreground/60 transition-all"
                  />
                  <p className="text-[10px] text-muted-foreground text-right">{message.length}/500</p>
                </div>

                <Button
                  onClick={handleSend}
                  disabled={sending || !message.trim()}
                  className={`w-full rounded-xl font-bold text-sm h-10 bg-gradient-to-r ${grad} text-white hover:opacity-90 disabled:opacity-50`}
                  data-testid="support-send-btn"
                >
                  {sending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" />Send to Admin</>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Tickets</p>
                  <button onClick={() => loadHistory(true)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {loadingHistory ? (
                  <div className="py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/40 mx-auto" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="py-10 text-center">
                    <MessageCircleQuestion className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">No tickets yet</p>
                    <button onClick={() => setTab("new")} className="text-xs text-indigo-600 font-semibold mt-1 hover:underline">
                      Send your first message
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {history.map((m) => (
                      <div key={m.id} className="rounded-xl border border-border/50 p-3 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold leading-snug flex-1">{m.message}</p>
                          <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${statusColor[m.status] || statusColor.open}`}>
                            {m.status === "resolved" ? "Resolved" : "Open"}
                          </span>
                        </div>
                        {m.admin_reply && (
                          <div className="pl-3 border-l-2 border-emerald-400">
                            <p className="text-[10px] text-muted-foreground font-semibold mb-0.5 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Admin Reply
                            </p>
                            <p className="text-xs text-foreground">{m.admin_reply}</p>
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground/60">
                          {new Date(m.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
