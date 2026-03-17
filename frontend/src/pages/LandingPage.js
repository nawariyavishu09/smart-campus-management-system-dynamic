import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Users, Building2, CalendarCheck, FileBarChart,
  Megaphone, MessageSquare, BarChart3, Shield, BookOpen, ArrowRight,
  Sparkles, CheckCircle2, Star, ChevronDown, Menu, X, Clock,
  Zap, Globe, Lock, Cloud, ChevronRight, Play, Quote
} from "lucide-react";

/* ── Data ── */
const HERO_SLIDES = [
  {
    headline: "The Smart Operating System",
    sub: "for Modern Campuses",
    desc: "One unified platform to manage students, faculty, attendance, marks, and more — built for modern universities and institutions.",
    accent: "from-indigo-500 to-violet-500",
  },
  {
    headline: "Track Attendance",
    sub: "Effortlessly",
    desc: "Real-time attendance management with instant reports for every faculty, student, and department.",
    accent: "from-teal-500 to-cyan-500",
  },
  {
    headline: "Academic Excellence",
    sub: "At Your Fingertips",
    desc: "Manage marks, results, grade sheets, and performance analytics across all semesters with ease.",
    accent: "from-amber-500 to-orange-500",
  },
  {
    headline: "Instant Notices &",
    sub: "Complaint Tracking",
    desc: "Publish notices to the right audience and let students raise complaints that reach admin instantly.",
    accent: "from-pink-500 to-rose-500",
  },
];

const FEATURES = [
  { icon: GraduationCap, label: "Student Management", desc: "Complete student lifecycle — admissions, profiles, and semester tracking in one place.", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10", ring: "ring-indigo-500/20" },
  { icon: Users, label: "Faculty Management", desc: "Manage faculty profiles, departments, and subject assignments effortlessly.", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", ring: "ring-emerald-500/20" },
  { icon: CalendarCheck, label: "Attendance System", desc: "Mark & track attendance with visual dashboards and detailed trend reports.", color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-500/10", ring: "ring-teal-500/20" },
  { icon: FileBarChart, label: "Marks & Results", desc: "Record exam marks, auto-calculate grades, and export comprehensive grade sheets.", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", ring: "ring-amber-500/20" },
  { icon: Megaphone, label: "Notice Board", desc: "Targeted announcements — publish for all, students only, or faculty only.", color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10", ring: "ring-pink-500/20" },
  { icon: MessageSquare, label: "Complaint Portal", desc: "Students raise issues; admins track and resolve them transparently.", color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", ring: "ring-red-500/20" },
  { icon: Building2, label: "Department Control", desc: "Organize departments, assign heads, and manage subject catalogs seamlessly.", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10", ring: "ring-purple-500/20" },
  { icon: BarChart3, label: "Analytics & Reports", desc: "Visual charts, department-wise reports, and exportable actionable insights.", color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-500/10", ring: "ring-cyan-500/20" },
];

const STEPS = [
  { num: "01", title: "Create Your Campus", desc: "Sign up and set up your campus workspace in minutes.", icon: Globe },
  { num: "02", title: "Add Your Team", desc: "Invite students, teachers, and staff to the platform.", icon: Users },
  { num: "03", title: "Automate Operations", desc: "Streamline attendance, marks, notices, and more.", icon: Zap },
  { num: "04", title: "Track Insights", desc: "Monitor performance with real-time analytics dashboards.", icon: BarChart3 },
];

const BENEFITS = [
  { icon: Clock, title: "Save Admin Time", desc: "Automate repetitive tasks and reduce manual work by up to 70%." },
  { icon: MessageSquare, title: "Better Communication", desc: "Instant notices and complaint tracking keep everyone connected." },
  { icon: BarChart3, title: "Real-time Data", desc: "Live dashboards and analytics for informed decision making." },
  { icon: Cloud, title: "Cloud-based Access", desc: "Access from anywhere, anytime — desktop, tablet, or mobile." },
  { icon: Lock, title: "Secure Records", desc: "Enterprise-grade security for all student and faculty data." },
  { icon: Zap, title: "Lightning Fast", desc: "Optimized performance ensures smooth experience for all users." },
];

const TESTIMONIALS = [
  { name: "Dr. Priya Sharma", role: "Dean of Academics", institution: "Delhi University", quote: "Smart Campus has transformed how we manage our departments. The analytics dashboard alone saves us hours every week.", avatar: "PS" },
  { name: "Prof. Rajesh Kumar", role: "HOD, Computer Science", institution: "IIT Delhi", quote: "The attendance and marks management system is incredibly intuitive. Our faculty adopted it within a day.", avatar: "RK" },
  { name: "Dr. Anita Desai", role: "Principal", institution: "St. Xavier's College", quote: "From complaint tracking to notice boards — everything our campus needs is in one beautiful platform.", avatar: "AD" },
];

const STATS = [
  { val: "500+", label: "Students" },
  { val: "50+", label: "Faculty" },
  { val: "10+", label: "Departments" },
  { val: "99.9%", label: "Uptime" },
];

/* ── Animation Variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

function AnimatedSection({ children, className }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, 5000);
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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-border/40" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className={`text-sm font-extrabold tracking-tight ${scrolled ? "text-foreground" : "text-white"}`}>
                SmartCampus
              </span>
              <span className={`block text-[9px] font-semibold tracking-wider uppercase ${scrolled ? "text-muted-foreground" : "text-white/50"}`}>
                Management System
              </span>
            </div>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {["Features", "How It Works", "Benefits"].map((item) => (
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

          <button className={`md:hidden ${scrolled ? 'text-foreground' : 'text-white'}`} onClick={() => setMobileMenu((v) => !v)}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-950/98 backdrop-blur-xl border-t border-white/10 px-6 py-4 space-y-2 overflow-hidden"
            >
              <button onClick={() => { navigate("/login"); setMobileMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl text-white font-semibold hover:bg-white/10 transition-colors">Login</button>
              <button onClick={() => { navigate("/signup"); setMobileMenu(false); }} className="w-full px-4 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center">Sign Up</button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen bg-slate-950 overflow-hidden flex items-center">
        {/* Gradient mesh background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.15)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.12)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.06)_0%,_transparent_70%)]" />
        </div>

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Floating shapes */}
        <div className="absolute top-1/3 left-[10%] w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-[15%] w-60 h-60 bg-violet-500/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white/70 text-xs font-medium backdrop-blur-sm mb-8">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Trusted by 500+ students across 10+ departments
            </motion.div>

            {/* Main headline */}
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
                  {current.headline}
                  <br />
                  <span className={`bg-gradient-to-r ${current.accent} bg-clip-text text-transparent`}>
                    {current.sub}
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
                  {current.desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button onClick={() => navigate("/signup")}
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-95 transition-all text-base">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => navigate("/login")}
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white/80 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] hover:text-white transition-all text-base backdrop-blur-sm">
                <Play className="w-4 h-4" />
                Try Demo
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-8 sm:gap-12 pt-16 mt-2">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl font-extrabold text-white">{s.val}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Slide indicators */}
          <div className="flex justify-center gap-2 mt-16">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)}
                className={`rounded-full transition-all duration-300 ${i === slide ? "w-8 h-2 bg-indigo-500" : "w-2 h-2 bg-white/20 hover:bg-white/40"}`} />
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/30">
          <span className="text-[10px] font-medium tracking-[0.25em] uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-28 bg-slate-50/70 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-5">
              <Star className="w-3.5 h-3.5" /> Everything You Need
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              One Platform,{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">All Tools</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
              Designed for administrators, faculty, and students — every role has its own tailored experience.
            </motion.p>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.label} variants={fadeUp} custom={i}
                className={`group p-6 rounded-2xl bg-white dark:bg-slate-800/40 border border-border/40 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/[0.04] hover:-translate-y-1`}>
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
      <section id="how-it-works" className="py-28 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-5">
              <Zap className="w-3.5 h-3.5" /> Simple Setup
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              Up and Running in{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Minutes</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
              Get started in four simple steps — no technical expertise required.
            </motion.p>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <motion.div key={step.num} variants={fadeUp} custom={i}
                className="relative group">
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-border/40 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-extrabold text-muted-foreground/20">{step.num}</span>
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
      <section id="benefits" className="py-28 bg-slate-50/70 dark:bg-slate-900/30">
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
                className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-slate-800/40 border border-border/40 hover:shadow-lg transition-all duration-300 group">
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

      {/* ── Role Cards ── */}
      <section className="py-28 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl font-extrabold tracking-tight">Who Is It For?</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-3 text-lg">A dedicated experience for every stakeholder</motion.p>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                role: "Admin", icon: Shield, grad: "from-amber-500 to-orange-500",
                bg: "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20",
                border: "border-amber-100 dark:border-amber-800/30",
                perks: ["Full system control", "Approve signups & accounts", "View all analytics", "Manage complaints & notices", "Support inbox"],
              },
              {
                role: "Faculty", icon: BookOpen, grad: "from-emerald-500 to-teal-500",
                bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
                border: "border-emerald-100 dark:border-emerald-800/30",
                perks: ["Mark attendance easily", "Upload marks & grades", "View class notices", "Raise support tickets"],
              },
              {
                role: "Student", icon: GraduationCap, grad: "from-indigo-500 to-violet-500",
                bg: "from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20",
                border: "border-indigo-100 dark:border-indigo-800/30",
                perks: ["View attendance records", "Check marks & grades", "Read notice board", "File complaints", "Raise support tickets"],
              },
            ].map(({ role, icon: Icon, grad, bg, border, perks }, i) => (
              <motion.div key={role} variants={fadeUp} custom={i}
                className={`rounded-2xl bg-gradient-to-br ${bg} border ${border} p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center mb-6 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-extrabold mb-5">{role}</h3>
                <ul className="space-y-3">
                  {perks.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-28 bg-slate-50/70 dark:bg-slate-900/30">
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
                className="p-6 rounded-2xl bg-white dark:bg-slate-800/40 border border-border/40 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
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

      {/* ── CTA Band ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.08)_0%,_transparent_70%)]" />

        <AnimatedSection className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight">
            Ready to get started?
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
      <footer className="py-12 bg-slate-950 border-t border-white/5">
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
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
              <ul className="space-y-2.5">
                {["Features", "How It Works", "Documentation"].map((link) => (
                  <li key={link}><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {["Privacy Policy", "Terms of Service", "Contact Us"].map((link) => (
                  <li key={link}><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">
              &copy; {new Date().getFullYear()} Smart Campus Management System. All rights reserved.
            </p>
            <p className="text-slate-500 text-xs">
              Made by <span className="text-indigo-400 font-semibold">Vishu Nawariya</span> &middot; BCA 3rd Year Project
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
