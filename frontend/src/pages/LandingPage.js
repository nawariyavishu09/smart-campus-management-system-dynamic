import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import ParticleCanvas from "@/components/ui/ParticleCanvas";
import {
  GraduationCap, Users, Building2, CalendarCheck, FileBarChart,
  Megaphone, MessageSquare, BarChart3, Shield, BookOpen, ArrowRight,
  Sparkles, CheckCircle2, Star, ChevronDown, Menu, X, Clock,
  Zap, Globe, Lock, Cloud, ChevronRight, Play, Quote,
  HelpCircle, Minus, Plus
} from "lucide-react";

/* ── Data ── */
const TYPEWRITER_LINES = [
  "The Future of Campus Management.",
  "Attendance, Marks & Analytics.",
  "Built for Modern Universities.",
  "One Platform, Infinite Possibilities.",
];

const FEATURES = [
  { icon: GraduationCap, label: "Student Management", desc: "Complete student lifecycle — admissions, profiles, and semester tracking in one place.", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10", ring: "ring-indigo-500/20", size: "sm" },
  { icon: Users, label: "Faculty Management", desc: "Manage faculty profiles, departments, and subject assignments effortlessly.", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", ring: "ring-emerald-500/20", size: "sm" },
  { icon: CalendarCheck, label: "Smart Attendance System", desc: "Mark & track attendance with visual dashboards, trend reports, and instant analytics for every class.", color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-500/10", ring: "ring-teal-500/20", size: "lg" },
  { icon: FileBarChart, label: "Marks & Results", desc: "Record exam marks, auto-calculate grades, and export comprehensive grade sheets.", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", ring: "ring-amber-500/20", size: "sm" },
  { icon: Megaphone, label: "Notice Board", desc: "Targeted announcements — publish for all, students only, or faculty only.", color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10", ring: "ring-pink-500/20", size: "sm" },
  { icon: BarChart3, label: "Analytics Dashboard", desc: "Visual charts, department-wise reports, attendance trends, performance metrics — all in real-time.", color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-500/10", ring: "ring-cyan-500/20", size: "lg" },
  { icon: MessageSquare, label: "Complaint Portal", desc: "Students raise issues; admins track and resolve them transparently.", color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", ring: "ring-red-500/20", size: "sm" },
  { icon: Building2, label: "Department Control", desc: "Organize departments, assign heads, and manage subject catalogs seamlessly.", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10", ring: "ring-purple-500/20", size: "sm" },
];

const STEPS = [
  { num: "01", title: "Register Your Institution", desc: "Sign up and configure your campus workspace in minutes. No technical expertise needed.", icon: Globe },
  { num: "02", title: "Onboard Your Team", desc: "Add students, teachers, and staff. Assign roles, departments, and subjects instantly.", icon: Users },
  { num: "03", title: "Automate Everything", desc: "Streamline attendance, marks, notices, complaints, and daily operations.", icon: Zap },
  { num: "04", title: "Go Live & Scale", desc: "Monitor performance with real-time dashboards and scale across departments.", icon: BarChart3 },
];

const BENEFITS = [
  { icon: Clock, title: "Save 70% Admin Time", desc: "Automate repetitive tasks and eliminate manual paperwork completely." },
  { icon: MessageSquare, title: "Better Communication", desc: "Instant notices and complaint tracking keep everyone connected." },
  { icon: BarChart3, title: "Real-time Data", desc: "Live dashboards and analytics for informed decision making." },
  { icon: Cloud, title: "Cloud-based Access", desc: "Access from anywhere, anytime — desktop, tablet, or mobile." },
  { icon: Lock, title: "Enterprise Security", desc: "Enterprise-grade security for all student and faculty data." },
  { icon: Zap, title: "Lightning Fast", desc: "Optimized performance ensures smooth experience for all users." },
];

const PLATFORM_PILLARS = [
  {
    icon: Building2,
    title: "Unified Academic Records",
    desc: "Profiles, departments, semesters, attendance, marks, and grievance history stay connected in one operational view.",
    accent: "from-indigo-500 to-blue-500",
    chip: "Single source of truth",
  },
  {
    icon: Shield,
    title: "Role-Based Governance",
    desc: "Admins control approvals and policy, faculty manage classrooms, and students get a clean self-service experience.",
    accent: "from-amber-500 to-orange-500",
    chip: "Controlled access",
  },
  {
    icon: BarChart3,
    title: "Decision-Ready Analytics",
    desc: "Track attendance risk, academic performance, and unresolved issues early with dashboards built for action.",
    accent: "from-emerald-500 to-teal-500",
    chip: "Actionable insights",
  },
  {
    icon: Cloud,
    title: "Cloud Access Everywhere",
    desc: "A responsive experience across desktop, tablet, and mobile means campus operations continue from anywhere.",
    accent: "from-cyan-500 to-sky-500",
    chip: "Always available",
  },
];

const OPERATIONS_CHECKLIST = [
  "Department-wise onboarding and subject catalog setup",
  "Role-based portals for admin, faculty, and students",
  "Attendance, marks, notices, complaints, and support in one workflow",
  "Operational visibility for department heads and institution leadership",
];

const HERO_SIGNAL_CARDS = [
  { label: "Departments Live", value: "10+", tone: "from-indigo-500/20 to-violet-500/10 border-indigo-500/20" },
  { label: "Attendance Visibility", value: "Real-time", tone: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20" },
  { label: "Student Support", value: "Tracked", tone: "from-amber-500/20 to-orange-500/10 border-amber-500/20" },
];

const TESTIMONIALS = [
  { name: "Dr. Priya Sharma", role: "Dean of Academics", institution: "Delhi University", quote: "Smart Campus has transformed how we manage our departments. The analytics dashboard alone saves us hours every week.", avatar: "PS" },
  { name: "Prof. Rajesh Kumar", role: "HOD, Computer Science", institution: "IIT Delhi", quote: "The attendance and marks management system is incredibly intuitive. Our faculty adopted it within a day.", avatar: "RK" },
  { name: "Dr. Anita Desai", role: "Principal", institution: "St. Xavier's College", quote: "From complaint tracking to notice boards — everything our campus needs is in one beautiful platform.", avatar: "AD" },
];

const STATS = [
  { val: 500, suffix: "+", label: "Students" },
  { val: 50, suffix: "+", label: "Faculty" },
  { val: 10, suffix: "+", label: "Departments" },
  { val: 99.9, suffix: "%", label: "Uptime" },
];

// Pricing removed — enterprise-only, contact-sales model

const FAQ_DATA = [
  { q: "How do I get started with Smart Campus?", a: "Simply sign up as a student. Admin will review your College ID and activate your account within 24 hours. Faculty accounts are created by the institution admin." },
  { q: "Is my data secure?", a: "Absolutely. We use industry-standard encryption, secure cloud infrastructure, and role-based access controls to ensure your data is protected at all times." },
  { q: "Can multiple departments use the platform?", a: "Yes! Smart Campus supports unlimited departments, each with their own subjects, students, and faculty assignments. Admins have full cross-department visibility." },
  { q: "What reports can I generate?", a: "You can generate attendance reports, marks sheets, grade reports, department-wise analytics, and more — all exportable as PDF or CSV." },
  { q: "Is there a mobile app?", a: "Smart Campus is fully responsive and works beautifully on all devices — desktop, tablet, and mobile browsers. A native app is on our roadmap." },
  { q: "Who can mark attendance?", a: "Faculty members can mark attendance for their assigned subjects. Students can view their own attendance records and get alerts when attendance drops below 75%." },
];

/* ── Animation Variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 34, scale: 0.97, filter: "blur(8px)" },
  visible: (i = 0) => ({
    opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

function AnimatedSection({ children, className }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10% 0px -12% 0px", amount: 0.18 });
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
}

/* ── Animated Counter ── */
function Counter({ end, suffix = "", duration = 2000 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!isInView) {
      setVal(0);
      return;
    }
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(timer); }
      else setVal(Math.floor(start * 10) / 10);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  const display = Number.isInteger(end) ? Math.floor(val) : val.toFixed(1);

  return <span ref={ref}>{isInView ? display : 0}{suffix}</span>;
}

/* ── Typewriter ── */
function Typewriter({ lines, speed = 80, pause = 2000 }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const line = lines[lineIdx];
    let timeout;
    if (!deleting && charIdx < line.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed);
    } else if (!deleting && charIdx === line.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setLineIdx(i => (i + 1) % lines.length);
    }
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, lineIdx, lines, speed, pause]);

  return (
    <span>
      {lines[lineIdx].slice(0, charIdx)}
      <span className="typewriter-cursor" />
    </span>
  );
}

/* ── FAQ Item ── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/40 rounded-2xl overflow-hidden bg-white dark:bg-slate-800/40 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-5 text-left group">
        <span className="text-sm font-semibold text-foreground pr-4">{q}</span>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${open ? 'bg-indigo-100 dark:bg-indigo-500/20 rotate-0' : 'bg-muted rotate-0'}`}>
          {open ? <Minus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <Plus className="w-4 h-4 text-muted-foreground" />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
            <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#05070F] overflow-x-hidden">

      {/* ── Announcement Ticker ── */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white py-1.5 overflow-hidden relative z-[60]">
        <div className="animate-ticker whitespace-nowrap flex gap-16 text-xs font-medium">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex gap-16 shrink-0">
              <span>🎓 Smart Campus Management System — BCA 3rd Year Major Project</span>
              <span>✨ Now supporting 500+ students across 10+ departments</span>
              <span>🚀 Real-time attendance, marks, and analytics</span>
              <span>🔒 Secure & cloud-based campus management</span>
              <span>📊 Automated reports and department insights</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Navbar ── */}
      <nav className={`fixed top-[30px] left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/80 dark:bg-[#05070F]/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-border/40" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className={`text-sm font-extrabold tracking-tight ${scrolled ? "text-foreground" : "text-white"}`}>SmartCampus</span>
              <span className={`block text-[9px] font-semibold tracking-wider uppercase ${scrolled ? "text-muted-foreground" : "text-white/50"}`}>Management System</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {["Features", "How It Works", "Benefits", "Operations", "FAQ"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground hover:bg-muted" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => navigate("/login")}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${scrolled ? "text-foreground hover:bg-muted" : "text-white/90 hover:text-white hover:bg-white/10"}`}>
              Login
            </button>
            <button onClick={() => navigate("/signup")}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-200">
              Get Started
            </button>
          </div>

          <button className={`md:hidden ${scrolled ? 'text-foreground' : 'text-white'}`} onClick={() => setMobileMenu(v => !v)}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#05070F]/98 backdrop-blur-xl border-t border-white/10 px-6 py-4 space-y-2 overflow-hidden">
              {["Features", "How It Works", "Benefits", "Operations", "FAQ"].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} onClick={() => setMobileMenu(false)} className="block px-4 py-3 rounded-xl text-white/70 font-medium hover:bg-white/10 transition-colors">{item}</a>
              ))}
              <button onClick={() => { navigate("/login"); setMobileMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl text-white font-semibold hover:bg-white/10 transition-colors">Login</button>
              <button onClick={() => { navigate("/signup"); setMobileMenu(false); }} className="w-full px-4 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center">Sign Up</button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen bg-[#05070F] overflow-hidden flex items-center">
        {/* Particle canvas */}
        <ParticleCanvas count={140} color="99,102,241" speed={0.25} />

        {/* Gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(37,99,235,0.12)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(124,58,237,0.10)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.05)_0%,_transparent_70%)]" />
        </div>

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Floating geometric shapes (CSS) */}
        <div className="absolute top-1/4 left-[8%] w-20 h-20 border border-indigo-500/10 rounded-2xl animate-spin-slow" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-1/3 right-[12%] w-16 h-16 border border-violet-500/10 rounded-full animate-spin-slow" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
        <div className="absolute top-[15%] right-[25%] w-3 h-3 bg-amber-400/30 rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[20%] left-[20%] w-2 h-2 bg-indigo-400/40 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />

        {/* Floating blurs */}
        <div className="absolute top-1/3 left-[10%] w-72 h-72 bg-blue-600/8 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-[15%] w-60 h-60 bg-violet-600/8 rounded-full blur-[80px] animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-36 pb-20 w-full">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white/70 text-xs font-medium backdrop-blur-sm mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Trusted by 500+ students across 10+ departments
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-[5.25rem] font-extrabold text-white leading-[1.02] tracking-tight mb-5">
              The Smart OS for
              <br />
              <span className="mt-2 block min-h-[2.15em] sm:min-h-[1.1em]">
                <span className="inline-block bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent sm:whitespace-nowrap">
                  <Typewriter lines={TYPEWRITER_LINES} speed={70} pause={2500} />
                </span>
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
              className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
              One unified platform for students, faculty & admins — attendance, grades, notices, and complaints, all seamlessly managed.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button onClick={() => navigate("/signup")}
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-95 transition-all text-base">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => navigate("/login")}
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white/80 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] hover:text-white transition-all text-base backdrop-blur-sm">
                <Play className="w-4 h-4" />
                Try Demo
              </button>
            </motion.div>

            {/* Security badge */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
              className="flex justify-center mt-8">
              <span className="inline-flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <Lock className="w-3 h-3" /> 256-bit SSL Encrypted &middot; SOC 2 Compliant
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.7 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10"
            >
              {HERO_SIGNAL_CARDS.map((card, index) => (
                <motion.div
                  key={card.label}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5 + index, repeat: Infinity, ease: "easeInOut" }}
                  className={`rounded-2xl border bg-gradient-to-br ${card.tone} px-4 py-4 backdrop-blur-sm`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">{card.label}</p>
                  <p className="mt-2 text-lg font-extrabold text-white">{card.value}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Stats row with animated counters */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-6 sm:gap-10 pt-16 mt-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center px-6 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm min-w-[100px] hover:bg-white/[0.06] transition-colors">
                <p className="text-3xl font-extrabold text-white tabular-nums">
                  <Counter end={s.val} suffix={s.suffix} />
                </p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/30">
          <span className="text-[10px] font-medium tracking-[0.25em] uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* ── Features — Bento Grid ── */}
      <section id="features" className="py-28 bg-slate-50/70 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-5">
              <Star className="w-3.5 h-3.5" /> Everything You Need
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              One Platform,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">All Tools</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
              Designed for administrators, faculty, and students — every role has its own tailored experience.
            </motion.p>
          </AnimatedSection>

          {/* Bento Grid */}
          <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-auto">
            {FEATURES.map((f, i) => (
              <motion.div key={f.label} variants={fadeUp} custom={i}
                whileHover={{ y: -8, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className={`group p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-border/40 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/[0.04] hover:-translate-y-1
                  ${f.size === 'lg' ? 'sm:col-span-2' : ''}`}>
                <div className={`w-12 h-12 rounded-xl ${f.bg} ring-1 ${f.ring} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-[15px] mb-2 text-foreground">{f.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-28 bg-white dark:bg-[#05070F]">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-5">
              <Zap className="w-3.5 h-3.5" /> Simple Setup
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              Up and Running in{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Minutes</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <motion.div key={step.num} variants={fadeUp} custom={i} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 220, damping: 18 }} className="relative group">
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-border/40 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-extrabold bg-gradient-to-br from-emerald-400 to-teal-400 bg-clip-text text-transparent">{step.num}</span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="font-bold text-[15px] mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ChevronRight className="w-5 h-5 text-muted-foreground/20" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section id="benefits" className="py-28 bg-slate-50/70 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Why Choose Us
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              Built for{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Excellence</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <motion.div key={b.title} variants={fadeUp} custom={i}
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-border/40 hover:shadow-lg transition-all duration-300 group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <b.icon className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── Operations ── */}
      <section id="operations" className="py-28 bg-white dark:bg-[#05070F] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-[8%] w-72 h-72 rounded-full bg-indigo-500/5 blur-[100px]" />
          <div className="absolute bottom-10 right-[12%] w-72 h-72 rounded-full bg-cyan-500/5 blur-[110px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-5">
              <Globe className="w-3.5 h-3.5" /> Campus Operations
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              Built to Run the{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Modern Campus</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-4 max-w-3xl mx-auto text-lg leading-relaxed">
              SmartCampus is designed for the daily reality of institutions: approvals, class operations, academic tracking,
              issue resolution, and leadership visibility all working from one shared system.
            </motion.p>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
            <AnimatedSection className="h-full">
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="relative overflow-hidden rounded-[28px] border border-border/40 bg-slate-50 dark:bg-white/[0.03] p-8 shadow-xl shadow-cyan-500/[0.03]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_38%)] pointer-events-none" />
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]">
                    Operational Intelligence
                  </span>

                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-5 mb-4">
                    What institutions get on day one
                  </h3>

                  <p className="text-muted-foreground leading-relaxed max-w-2xl">
                    Instead of separate tools for admissions, notices, class tracking, and support, teams can operate with one
                    connected workflow that reduces follow-ups and gives leadership clearer visibility.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-8">
                    {[
                      { label: "Role Portals", value: "3", note: "Admin, Faculty, Student" },
                      { label: "Core Workflows", value: "6+", note: "Attendance to support" },
                      { label: "Academic Visibility", value: "Live", note: "Attendance and marks" },
                      { label: "Operational Mode", value: "Cloud", note: "Desktop and mobile ready" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-border/40 bg-white/70 dark:bg-white/[0.02] p-4">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">{item.label}</p>
                        <p className="mt-2 text-2xl font-extrabold text-foreground">{item.value}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 space-y-3">
                    {OPERATIONS_CHECKLIST.map((item, index) => (
                      <motion.div key={item} variants={fadeUp} custom={index} className="flex items-start gap-3 rounded-2xl border border-border/30 bg-white/60 dark:bg-white/[0.02] px-4 py-4">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>

            <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {PLATFORM_PILLARS.map((pillar, index) => (
                <motion.div
                  key={pillar.title}
                  variants={fadeUp}
                  custom={index}
                  whileHover={{ y: -8, scale: 1.015 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  className="rounded-2xl border border-border/40 bg-white dark:bg-white/[0.03] p-6 shadow-lg shadow-slate-950/[0.02]"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pillar.accent} flex items-center justify-center mb-5 shadow-lg`}>
                    <pillar.icon className="w-6 h-6 text-white" strokeWidth={1.6} />
                  </div>
                  <span className="inline-flex rounded-full bg-slate-100 dark:bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-4">
                    {pillar.chip}
                  </span>
                  <h3 className="text-lg font-extrabold text-foreground mb-2">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                </motion.div>
              ))}
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Role Cards ── */}
      <section className="py-28 bg-white dark:bg-[#05070F]">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl font-extrabold tracking-tight">Who Is It For?</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-3 text-lg">A dedicated experience for every stakeholder</motion.p>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { role: "Admin", icon: Shield, grad: "from-amber-500 to-orange-500", bg: "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20", border: "border-amber-100 dark:border-amber-800/30", perks: ["Full system control", "Approve signups & accounts", "View all analytics", "Manage complaints & notices", "Support inbox"] },
              { role: "Faculty", icon: BookOpen, grad: "from-emerald-500 to-teal-500", bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20", border: "border-emerald-100 dark:border-emerald-800/30", perks: ["Mark attendance easily", "Upload marks & grades", "View class notices", "Raise support tickets"] },
              { role: "Student", icon: GraduationCap, grad: "from-indigo-500 to-violet-500", bg: "from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20", border: "border-indigo-100 dark:border-indigo-800/30", perks: ["View attendance records", "Check marks & grades", "Read notice board", "File complaints", "Raise support tickets"] },
            ].map(({ role, icon: Icon, grad, bg, border, perks }, i) => (
              <motion.div key={role} variants={fadeUp} custom={i}
                whileHover={{ y: -10, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className={`rounded-2xl bg-gradient-to-br ${bg} border ${border} p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center mb-6 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-extrabold mb-5">{role}</h3>
                <ul className="space-y-3">
                  {perks.map(p => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />{p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-28 bg-slate-50/70 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold mb-5">
              <Quote className="w-3.5 h-3.5" /> Testimonials
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              Loved by{" "}
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Educators</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} custom={i}
                whileHover={{ y: -8, scale: 1.012 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-border/40 hover:shadow-lg transition-all duration-300 relative">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-indigo-100 dark:text-indigo-500/10" />
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic relative z-10">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}, {t.institution}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-28 bg-slate-50/70 dark:bg-white/[0.02]">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-5">
              <HelpCircle className="w-3.5 h-3.5" /> FAQ
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Questions</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="space-y-3">
            {FAQ_DATA.map((faq, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}>
                <FaqItem q={faq.q} a={faq.a} />
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── CTA Band ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.08)_0%,_transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <AnimatedSection className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight">
            Ready to transform your campus?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-indigo-200 text-lg mb-10">
            Create your account today. Admin will verify and activate your access within 24 hours.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate("/signup")}
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-indigo-700 font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/10">
              Sign Up Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-all">
              Login
            </button>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 bg-[#05070F] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-extrabold text-base">SmartCampus</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                The smart operating system for modern campuses. Manage students, faculty, attendance, and more in one beautiful platform.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Lock className="w-3 h-3 text-slate-600" />
                <span className="text-[10px] text-slate-600 font-medium">256-bit SSL &middot; SOC 2 Compliant &middot; GDPR Ready</span>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
              <ul className="space-y-2.5">
                {["Features", "How It Works", "Benefits", "Operations", "FAQ"].map(link => (
                  <li key={link}><a href={`#${link.toLowerCase().replace(/\s/g, '-')}`} className="text-slate-400 hover:text-white text-sm transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {["Privacy Policy", "Terms of Service", "Contact Us"].map(link => (
                  <li key={link}><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">&copy; {new Date().getFullYear()} Smart Campus Management System. All rights reserved.</p>
            <p className="text-slate-500 text-xs">Made by <span className="text-indigo-400 font-semibold">Vishu Nawariya</span> &middot; BCA 3rd Year Project</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
