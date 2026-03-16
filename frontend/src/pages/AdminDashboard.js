import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, GraduationCap, Building2, CalendarCheck, MessageSquare, Megaphone, TrendingUp, ArrowUpRight, BarChart3, Zap, Headphones, CheckCircle2, Loader2, Send, X } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4"];

const statCards = [
  { key: "total_students", label: "Total Students", icon: GraduationCap, accent: "stat-accent-indigo", iconBg: "bg-indigo-100 dark:bg-indigo-900/30", iconColor: "text-indigo-600", route: "/students", trend: "+12%" },
  { key: "total_faculty", label: "Faculty Members", icon: Users, accent: "stat-accent-emerald", iconBg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600", route: "/faculty-members", trend: "+2%" },
  { key: "total_departments", label: "Departments", icon: Building2, accent: "stat-accent-purple", iconBg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600", route: "/departments" },
  { key: "avg_attendance", label: "Avg Attendance", icon: CalendarCheck, accent: "stat-accent-blue", iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600", route: "/attendance", suffix: "%" },
  { key: "pending_complaints", label: "Pending Complaints", icon: MessageSquare, accent: "stat-accent-red", iconBg: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-600", route: "/complaints" },
  { key: "total_notices", label: "Active Notices", icon: Megaphone, accent: "stat-accent-amber", iconBg: "bg-amber-100 dark:bg-amber-900/30", iconColor: "text-amber-600", route: "/notices" },
];

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-border/50 px-4 py-3 text-sm">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-indigo-600 font-bold">{payload[0].value}{unit || ""}</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supportMsgs, setSupportMsgs] = useState([]);
  const [supportLoading, setSupportLoading] = useState(true);
  const [replyTarget, setReplyTarget] = useState(null); // { id, sender_name }
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    api
      .get("/support-messages")
      .then((res) => setSupportMsgs(res.data.messages || []))
      .catch(() => {})
      .finally(() => setSupportLoading(false));
  }, []);

  const loadSupport = () => {
    setSupportLoading(true);
    api.get("/support-messages")
      .then((res) => setSupportMsgs(res.data.messages || []))
      .catch(() => {})
      .finally(() => setSupportLoading(false));
  };

  const handleReply = async () => {
    if (!replyText.trim() || !replyTarget) return;
    setReplySending(true);
    try {
      await api.patch(`/support-messages/${replyTarget.id}`, { status: "resolved", admin_reply: replyText.trim() });
      setReplyTarget(null);
      setReplyText("");
      loadSupport();
    } catch {}
    setReplySending(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in" data-testid="admin-dashboard-loading">
        <Skeleton className="h-36 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="admin-dashboard">
      <div className="hero-banner bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 shadow-2xl">
        <div className="grid-pattern" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">{greeting}, Admin</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm">Real-time campus analytics and management overview</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: "Students", val: stats?.total_students || 0, color: "bg-indigo-500/20 border-indigo-500/30 text-indigo-300" },
              { label: "Faculty", val: stats?.total_faculty || 0, color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" },
              { label: "Attendance", val: `${stats?.avg_attendance || 0}%`, color: "bg-blue-500/20 border-blue-500/30 text-blue-300" },
            ].map(({ label, val, color }) => (
              <div key={label} className={`px-4 py-3 rounded-xl border ${color} backdrop-blur-sm text-center min-w-[80px]`}>
                <p className="text-xl font-black">{val}</p>
                <p className="text-[11px] font-semibold opacity-80">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 stagger-children">
        {statCards.map((card) => (
          <div
            key={card.key}
            onClick={() => navigate(card.route)}
            className={`group pro-card cursor-pointer bg-card ${card.accent} animate-fade-in`}
            data-testid={`stat-${card.key}`}
          >
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} strokeWidth={1.8} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight">
                  {stats?.[card.key] ?? 0}
                  {card.suffix || ""}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5 leading-tight">{card.label}</p>
              </div>
              {card.trend && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-600">{card.trend} this month</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 pro-card bg-card overflow-hidden">
          <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Attendance Trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Last 7 days percentage</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="p-6">
            <div className="h-56" data-testid="attendance-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.attendance_trend || []}>
                  <defs>
                    <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip unit="%" />} />
                  <Area type="monotone" dataKey="percentage" stroke="#6366f1" strokeWidth={2.5} fill="url(#attGrad)" dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 pro-card bg-card overflow-hidden">
          <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Department Distribution</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Students per department</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="p-6">
            <div className="h-56 flex items-center" data-testid="department-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats?.dept_distribution || []} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3}>
                    {(stats?.dept_distribution || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-1.5 mt-2">
              {(stats?.dept_distribution || []).slice(0, 4).map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground truncate flex-1">{d.name}</span>
                  <span className="font-semibold">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="pro-card bg-card overflow-hidden">
          <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                <Megaphone className="w-3.5 h-3.5 text-pink-600" />
              </div>
              <h3 className="font-bold text-sm">Recent Notices</h3>
            </div>
            <button onClick={() => navigate("/notices")} className="text-xs text-primary font-semibold hover:underline">{"View all ->"}</button>
          </div>
          <div className="divide-y divide-border/40">
            {(stats?.recent_notices || []).length === 0 ? (
              <div className="p-8 text-center">
                <Megaphone className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notices yet</p>
              </div>
            ) : (
              stats.recent_notices.map((n) => (
                <div key={n.id} onClick={() => navigate("/notices")} className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-muted/40 transition-colors group" data-testid={`notice-${n.id}`}>
                  <div className={`w-2 h-8 rounded-full shrink-0 ${n.priority === "high" ? "bg-red-500" : n.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.posted_by} · {n.date}</p>
                  </div>
                  <Badge className={`shrink-0 text-[10px] font-bold rounded-lg ${n.priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : n.priority === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>
                    {n.priority?.toUpperCase()}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pro-card bg-card overflow-hidden">
          <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-red-600" />
              </div>
              <h3 className="font-bold text-sm">Recent Complaints</h3>
            </div>
            <button onClick={() => navigate("/complaints")} className="text-xs text-primary font-semibold hover:underline">{"View all ->"}</button>
          </div>
          <div className="divide-y divide-border/40">
            {(stats?.recent_complaints || []).length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No complaints</p>
              </div>
            ) : (
              stats.recent_complaints.map((c) => (
                <div key={c.id} onClick={() => navigate("/complaints")} className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-muted/40 transition-colors group" data-testid={`complaint-${c.id}`}>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-slate-600 dark:text-slate-300">{c.student_name?.charAt(0)?.toUpperCase() || "?"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.student_name}</p>
                  </div>
                  <Badge className={`shrink-0 text-[10px] font-bold rounded-lg ${c.status === "resolved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : c.status === "in_progress" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                    {c.status === "in_progress" ? "In Progress" : c.status === "resolved" ? "Resolved" : "Pending"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Support Inbox ── */}
      <div className="pro-card bg-card overflow-hidden" data-testid="support-inbox">
        <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Headphones className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Support Inbox</h3>
              <p className="text-[11px] text-muted-foreground">Messages from faculty &amp; students</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {supportMsgs.filter((m) => m.status === "open").length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {supportMsgs.filter((m) => m.status === "open").length} Open
              </span>
            )}
            <button onClick={loadSupport} className="text-xs text-primary font-semibold hover:underline">Refresh</button>
          </div>
        </div>
        <div className="divide-y divide-border/40 max-h-96 overflow-y-auto">
          {supportLoading ? (
            <div className="py-10 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30 mx-auto" />
            </div>
          ) : supportMsgs.length === 0 ? (
            <div className="py-12 text-center">
              <Headphones className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No support messages yet</p>
            </div>
          ) : (
            supportMsgs.map((m) => (
              <div key={m.id} className="flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors" data-testid={`support-msg-${m.id}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 bg-gradient-to-br ${m.sender_role === "faculty" ? "from-emerald-500 to-teal-600" : "from-indigo-500 to-violet-600"}`}>
                  {m.sender_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold">{m.sender_name}</p>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${m.sender_role === "faculty" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"}`}>
                      {m.sender_role}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70">{m.sender_email}</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-snug">{m.message}</p>
                  {m.admin_reply && (
                    <div className="pl-3 border-l-2 border-emerald-400 mt-1">
                      <p className="text-[10px] text-muted-foreground font-semibold mb-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Your reply
                      </p>
                      <p className="text-xs text-foreground/70">{m.admin_reply}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground/50">
                    {new Date(m.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${m.status === "resolved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                    {m.status === "resolved" ? "Resolved" : "Open"}
                  </span>
                  {m.status === "open" && (
                    <button
                      onClick={() => { setReplyTarget(m); setReplyText(""); }}
                      className="text-[11px] font-bold text-violet-600 hover:text-violet-700 hover:underline transition-colors"
                      data-testid={`reply-btn-${m.id}`}
                    >
                      Reply &amp; Resolve
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reply Modal — rendered via Portal so it's always viewport-centered */}
      {replyTarget && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          data-testid="reply-modal"
          onClick={(e) => { if (e.target === e.currentTarget) setReplyTarget(null); }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-border/50 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div>
                <p className="font-black text-sm">Reply to {replyTarget.sender_name}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{replyTarget.sender_role} · {replyTarget.sender_email}</p>
              </div>
              <button onClick={() => setReplyTarget(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-border/50 text-sm text-foreground/80">
                {replyTarget.message}
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={4}
                autoFocus
                data-testid="reply-textarea"
                className="w-full rounded-xl border border-border/60 bg-background text-sm p-3 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all"
              />
              <button
                onClick={handleReply}
                disabled={replySending || !replyText.trim()}
                data-testid="reply-submit-btn"
                className="w-full h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {replySending ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</> : <><Send className="w-4 h-4" />Send Reply &amp; Resolve</>}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
