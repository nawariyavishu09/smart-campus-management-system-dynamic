import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, Eye, EyeOff, Loader2, ShieldCheck, BookOpen, ArrowRight, Sparkles, AlertTriangle, Shield, Clock3 } from 'lucide-react';
import { toast } from 'sonner';

const roles = [
  { key: 'student', label: 'Student', icon: GraduationCap, expected: 'student', color: 'from-indigo-500 to-violet-600', glow: 'shadow-indigo-500/20', ring: 'ring-indigo-400/30', bg: 'bg-indigo-500', demo: { email: 'aarav.mehta@smartcampus.edu', pw: 'student123' } },
  { key: 'teacher', label: 'Teacher', icon: BookOpen, expected: 'faculty', color: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/20', ring: 'ring-emerald-400/30', bg: 'bg-emerald-500', demo: { email: 'rajesh.kumar@smartcampus.edu', pw: 'faculty123' } },
  { key: 'admin', label: 'Admin', icon: ShieldCheck, expected: 'admin', color: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/20', ring: 'ring-amber-400/30', bg: 'bg-amber-500', demo: { email: 'admin@smartcampus.edu', pw: 'admin123' } },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [rememberEmail, setRememberEmail] = useState(true);
  const [capsOn, setCapsOn] = useState(false);

  const selected = roles.find(r => r.key === activeRole);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('remembered_email');
    if (saved) {
      setEmail(saved);
      setRememberEmail(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Enter both email and password'); return; }
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') { toast.success(`Welcome back, ${user.name}!`); navigate('/dashboard'); return; }
      if (user.role !== selected.expected) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Access Denied: You cannot log in from this portal.');
        return;
      }
      toast.success(`Welcome, ${user.name}!`);
      if (rememberEmail) localStorage.setItem('remembered_email', email);
      else localStorage.removeItem('remembered_email');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Invalid credentials';
      toast.error(msg);
    }
    finally { setLoading(false); }
  };

  const fillDemo = () => { if (selected) { setEmail(selected.demo.email); setPassword(selected.demo.pw); } };
  const portalTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen flex overflow-hidden" data-testid="login-page">
      {/* ── Left Panel — Illustration side ── */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden bg-slate-950">
        {/* Gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,_rgba(99,102,241,0.2)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,_rgba(168,85,247,0.15)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,_rgba(14,165,233,0.12)_0%,_transparent_50%)]" />
        </div>

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />

        {/* Floating orbs */}
        <div className="absolute w-72 h-72 rounded-full bg-indigo-500/15 blur-[100px] top-[15%] left-[-10%] animate-float" />
        <div className="absolute w-56 h-56 rounded-full bg-violet-500/15 blur-[80px] bottom-[10%] right-[-5%] animate-float" style={{animationDelay: '3s'}} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-white font-extrabold text-xl tracking-tight block">Smart Campus</span>
              <span className="text-indigo-300/60 text-[10px] font-semibold tracking-[0.2em] uppercase">Management System</span>
            </div>
          </motion.div>

          {/* Center content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-sm mb-6">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-white/60 font-medium">BCA 3rd Year Major Project</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white tracking-tight leading-[1.15] mb-4">
                Simplify Your
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Campus Life
                </span>
              </h2>
              <p className="text-slate-400 text-base max-w-md leading-relaxed">
                Attendance, grades, notices, and complaints — all seamlessly managed in one beautiful, intuitive platform.
              </p>
            </div>

            {/* Live stats */}
            <div className="grid grid-cols-4 gap-4 pt-6 border-t border-white/[0.06]">
              {[['20+', 'Students'], ['5', 'Faculty'], ['3', 'Depts'], [portalTime, 'Live']].map(([n, l]) => (
                <div key={l}>
                  <p className="text-white font-extrabold text-xl tabular-nums">{n}</p>
                  <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mt-1">{l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-slate-600 text-xs font-medium">
            Made by Vishu Nawariya
          </motion.p>
        </div>
      </div>

      {/* ── Right Panel — Login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative bg-background">
        {/* Subtle background accents */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-indigo-100/30 dark:bg-indigo-500/5 blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-violet-100/20 dark:bg-violet-500/5 blur-[100px] -z-10" />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] space-y-6">

          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">Smart Campus</span>
          </div>

          {/* Greeting */}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Sign in to your campus portal to continue</p>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between text-xs bg-muted/50 dark:bg-muted/30 px-4 py-2.5 rounded-xl">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <Shield className="w-3.5 h-3.5" />
              Secure Session
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Clock3 className="w-3.5 h-3.5" />
              {portalTime}
            </span>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-2.5" data-testid="role-tabs">
            {roles.map((r) => {
              const active = activeRole === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => { setActiveRole(r.key); setEmail(''); setPassword(''); }}
                  data-testid={`role-tab-${r.key}`}
                  className={`group relative flex flex-col items-center gap-2 rounded-2xl py-4 px-3 transition-all duration-300 border overflow-hidden
                    ${active
                      ? `border-transparent shadow-lg ${r.glow} bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900`
                      : 'border-border/50 bg-card hover:border-border hover:shadow-sm'
                    }`}
                >
                  <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300
                    ${active
                      ? `bg-gradient-to-br ${r.color} shadow-lg text-white scale-105`
                      : 'bg-muted text-muted-foreground group-hover:scale-105'
                    }`}>
                    <r.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <span className={`text-xs font-bold transition-colors duration-300 ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{r.label}</span>
                  {active && <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r ${r.color}`} />}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <div className="relative group">
                  <Input type="email" placeholder={`Enter ${selected?.label.toLowerCase()} email`} value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-email"
                    className="w-full h-11 rounded-xl bg-background border border-border/60 text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm px-4" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Password</label>
                <div className="relative group">
                  <Input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) => setCapsOn(e.getModifierState && e.getModifierState('CapsLock'))}
                    onBlur={() => setCapsOn(false)}
                    data-testid="login-password"
                    className="w-full h-11 rounded-xl bg-background border border-border/60 text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm px-4 pr-11"
                  />
                  <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors" onClick={() => setShowPw(!showPw)} data-testid="toggle-password">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <AnimatePresence>
                  {capsOn && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-medium text-amber-600 inline-flex items-center gap-1.5" data-testid="caps-warning">
                      <AlertTriangle className="w-3.5 h-3.5" /> Caps Lock is ON
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={rememberEmail} onChange={(e) => setRememberEmail(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-border text-indigo-600 focus:ring-indigo-500/30" data-testid="remember-email" />
                  <span className="text-muted-foreground font-medium">Remember email</span>
                </label>
                <button type="button" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline underline-offset-2" onClick={() => toast.info('Please contact admin to reset your password.')} data-testid="forgot-password">
                  Forgot password?
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} data-testid="login-submit"
              className={`w-full h-11 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-200 bg-gradient-to-r ${selected?.color} hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
              {loading ? 'Signing in...' : <>Sign in as {selected?.label} <ArrowRight className="w-4 h-4 ml-2 inline" /></>}
            </Button>
          </form>

          {/* Demo quick-fill */}
          <button type="button" onClick={fillDemo} data-testid="demo-credential-card"
            className="w-full group flex items-center gap-3.5 p-3.5 rounded-xl border border-dashed border-border/60 bg-muted/30 hover:bg-muted/50 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 text-left">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selected?.color} flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Demo &middot; {selected?.label}</p>
              <p className="text-xs text-foreground truncate mt-0.5 font-medium">{selected?.demo.email}</p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-background border border-border/50 text-muted-foreground font-semibold shrink-0">{selected?.demo.pw}</span>
          </button>

          {/* Footer */}
          <div className="text-center pt-2 space-y-1">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{' '}
              <button onClick={() => navigate('/signup')} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline underline-offset-2">Sign up</button>
            </p>
            <p className="text-[10px] text-muted-foreground/50">Made by Vishu Nawariya &middot; BCA 3rd Year Project</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
