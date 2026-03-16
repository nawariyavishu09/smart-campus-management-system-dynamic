import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap, Users, Building2, CalendarCheck, FileBarChart,
  Megaphone, MessageSquare, BarChart3, Shield, BookOpen, ArrowRight,
  Sparkles, CheckCircle2, Star, ChevronDown, Menu, X
} from "lucide-react";

const HERO_SLIDES = [
  {
    headline: "Smart Campus,",
    sub: "Smarter Future",
    desc: "One unified platform to manage students, faculty, attendance, marks, and more — built for modern universities.",
    accent: "from-indigo-600 to-violet-600",
    bg: "from-slate-950 via-indigo-950 to-slate-950",
    img: "🎓",
  },
  {
    headline: "Track Attendance",
    sub: "Effortlessly",
    desc: "Real-time attendance management with instant reports for every faculty, student, and department.",
    accent: "from-teal-500 to-emerald-600",
    bg: "from-slate-950 via-teal-950 to-slate-950",
    img: "📋",
  },
  {
    headline: "Academic Excellence",
    sub: "At Your Fingertips",
    desc: "Manage marks, results, grade sheets, and performance analytics across all semesters with ease.",
    accent: "from-amber-500 to-orange-600",
    bg: "from-slate-950 via-amber-950 to-slate-950",
    img: "📊",
  },
  {
    headline: "Instant Notices &",
    sub: "Complaint Tracking",
    desc: "Publish notices to the right audience and let students raise complaints that reach admin instantly.",
    accent: "from-pink-500 to-rose-600",
    bg: "from-slate-950 via-pink-950 to-slate-950",
    img: "📣",
  },
];

const FEATURES = [
  { icon: GraduationCap, label: "Student Management", desc: "Complete student lifecycle — admissions, profiles, semester tracking.", color: "text-indigo-500", bg: "bg-indigo-500/10 dark:bg-indigo-500/20" },
  { icon: Users, label: "Faculty Management", desc: "Manage faculty profiles, departments, and subject assignments.", color: "text-emerald-500", bg: "bg-emerald-500/10 dark:bg-emerald-500/20" },
  { icon: CalendarCheck, label: "Attendance System", desc: "Mark & track attendance with visual dashboards and trend reports.", color: "text-teal-500", bg: "bg-teal-500/10 dark:bg-teal-500/20" },
  { icon: FileBarChart, label: "Marks & Results", desc: "Record exam marks, auto-calculate grades, and export grade sheets.", color: "text-amber-500", bg: "bg-amber-500/10 dark:bg-amber-500/20" },
  { icon: Megaphone, label: "Notice Board", desc: "Targeted announcements — publish for all, students, or faculty.", color: "text-pink-500", bg: "bg-pink-500/10 dark:bg-pink-500/20" },
  { icon: MessageSquare, label: "Complaint Portal", desc: "Students can raise issues; admins track and resolve transparently.", color: "text-red-500", bg: "bg-red-500/10 dark:bg-red-500/20" },
  { icon: Building2, label: "Department Control", desc: "Organize departments, assign heads, and manage subject catalogs.", color: "text-purple-500", bg: "bg-purple-500/10 dark:bg-purple-500/20" },
  { icon: BarChart3, label: "Analytics Reports", desc: "Visual charts, department-wise reports, and exportable insights.", color: "text-cyan-500", bg: "bg-cyan-500/10 dark:bg-cyan-500/20" },
];

const STATS = [
  { val: "500+", label: "Students Managed" },
  { val: "50+", label: "Faculty Members" },
  { val: "10+", label: "Departments" },
  { val: "99%", label: "Uptime" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Auto-rotate slides
  useEffect(() => {
    const t = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setSlide((s) => (s + 1) % HERO_SLIDES.length);
        setAnimating(false);
      }, 400);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const current = HERO_SLIDES[slide];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-lg border-b border-border/40" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-black text-white dark:text-white" style={{ color: scrolled ? undefined : "white" }}>
                SmartCampus
              </span>
              <span className={`block text-[9px] font-semibold tracking-wider uppercase ${scrolled ? "text-muted-foreground" : "text-white/60"}`}>
                Management System
              </span>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${scrolled ? "text-foreground hover:bg-muted" : "text-white/90 hover:text-white hover:bg-white/10"}`}
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-white" onClick={() => setMobileMenu((v) => !v)}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-slate-900/98 backdrop-blur-md border-t border-white/10 px-4 py-4 space-y-2">
            <button onClick={() => { navigate("/login"); setMobileMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl text-white font-semibold hover:bg-white/10 transition-colors">Login</button>
            <button onClick={() => { navigate("/signup"); setMobileMenu(false); }} className="w-full px-4 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center">Sign Up</button>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className={`relative min-h-screen bg-gradient-to-br ${current.bg} transition-all duration-700 overflow-hidden flex items-center`}>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className={`space-y-6 transition-all duration-400 ${animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Smart Campus Management Platform
              </div>

              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black text-white leading-[1.1] tracking-tight">
                {current.headline}
                <br />
                <span className={`bg-gradient-to-r ${current.accent} bg-clip-text text-transparent`}>
                  {current.sub}
                </span>
              </h1>

              <p className="text-lg text-white/70 leading-relaxed max-w-lg">
                {current.desc}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => navigate("/signup")}
                  className={`group flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r ${current.accent} shadow-2xl hover:scale-105 active:scale-95 transition-all text-base`}
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-base backdrop-blur-sm"
                >
                  Login
                </button>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-white/10">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-black text-white">{s.val}</p>
                    <p className="text-xs text-white/50 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — animated card stack */}
            <div className={`hidden lg:flex items-center justify-center transition-all duration-400 ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
              <div className="relative w-80 h-80">
                {/* Big emoji center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9rem] filter drop-shadow-2xl select-none">{current.img}</span>
                </div>
                {/* Floating feature pills */}
                {[
                  { label: "Attendance ✓", top: "8%", left: "-10%", delay: "0s" },
                  { label: "Marks 98%", top: "20%", right: "-12%", delay: "0.3s" },
                  { label: "Notice Posted", bottom: "25%", left: "-15%", delay: "0.6s" },
                  { label: "Report Ready", bottom: "10%", right: "-8%", delay: "0.9s" },
                ].map(({ label, delay, ...pos }) => (
                  <div
                    key={label}
                    className="absolute px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl shadow-xl text-xs font-bold text-slate-800 dark:text-white border border-white/30 animate-bounce"
                    style={{ ...pos, animationDelay: delay, animationDuration: "3s" }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Slide dots */}
          <div className="flex justify-center gap-2 mt-12">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`rounded-full transition-all duration-300 ${i === slide ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/30 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 animate-bounce">
          <span className="text-[10px] font-semibold tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-4">
              <Star className="w-3.5 h-3.5" /> Everything You Need
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
              One Platform,<br />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">All Tools</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
              Designed for administrators, faculty, and students — every role has its own tailored experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.label} className="group p-6 rounded-2xl bg-white dark:bg-slate-800/60 border border-border/50 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-bold text-sm mb-1.5">{f.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Cards ── */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black tracking-tight">Who Is It For?</h2>
            <p className="text-muted-foreground mt-3 text-lg">A dedicated experience for every stakeholder</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                role: "Admin",
                icon: Shield,
                grad: "from-amber-500 to-orange-600",
                bg: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
                border: "border-amber-200 dark:border-amber-800",
                perks: ["Full system control", "Approve signups & accounts", "View all analytics", "Manage complaints & notices", "Support inbox"],
              },
              {
                role: "Faculty",
                icon: BookOpen,
                grad: "from-emerald-500 to-teal-600",
                bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
                border: "border-emerald-200 dark:border-emerald-800",
                perks: ["Mark attendance easily", "Upload marks & grades", "View class notices", "Raise support tickets"],
              },
              {
                role: "Student",
                icon: GraduationCap,
                grad: "from-indigo-500 to-violet-600",
                bg: "from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30",
                border: "border-indigo-200 dark:border-indigo-800",
                perks: ["View attendance records", "Check marks & grades", "Read notice board", "File complaints", "Raise support tickets"],
              },
            ].map(({ role, icon: Icon, grad, bg, border, perks }) => (
              <div key={role} className={`rounded-2xl bg-gradient-to-br ${bg} border ${border} p-7 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center mb-5 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-black mb-4">{role}</h3>
                <ul className="space-y-2">
                  {perks.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Band ── */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            Create your account today. Admin will verify and activate your access within 24 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-indigo-700 font-black text-base hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              Sign Up Now <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/40 text-white font-bold text-base hover:bg-white/10 transition-all"
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 bg-slate-950 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-black text-sm">SmartCampus</span>
        </div>
        <p className="text-slate-500 text-xs">© {new Date().getFullYear()} Smart Campus Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}
