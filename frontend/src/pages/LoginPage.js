
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, Eye, EyeOff, Loader2, ShieldCheck, BookOpen, ArrowRight, Sparkles, AlertTriangle, Shield, Clock3 } from 'lucide-react';
import { toast } from 'sonner';

const roles = [
  { key: 'student', label: 'Student', icon: GraduationCap, expected: 'student', color: 'from-violet-500 to-indigo-600', glow: 'shadow-violet-500/25', ring: 'ring-violet-400', bg: 'bg-violet-500', demo: { email: 'aarav.mehta@smartcampus.edu', pw: 'student123' } },
  { key: 'teacher', label: 'Teacher', icon: BookOpen, expected: 'faculty', color: 'from-cyan-500 to-blue-600', glow: 'shadow-cyan-500/25', ring: 'ring-cyan-400', bg: 'bg-cyan-500', demo: { email: 'rajesh.kumar@smartcampus.edu', pw: 'faculty123' } },
  { key: 'admin', label: 'Admin', icon: ShieldCheck, expected: 'admin', color: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/25', ring: 'ring-amber-400', bg: 'bg-amber-500', demo: { email: 'admin@smartcampus.edu', pw: 'admin123' } },
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
    <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950" data-testid="login-page">
      {/* Left - Animated Hero */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        {/* Animated gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
          <div className="absolute inset-0 opacity-50" style={{background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.5) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.4) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(14,165,233,0.4) 0%, transparent 50%)'}} />
          {/* Floating orbs - MORE PROMINENT */}
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-3xl top-0 -left-32 opacity-40" style={{animation: 'float 8s ease-in-out infinite'}} />
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl -bottom-32 right-0 opacity-40" style={{animation: 'float 10s ease-in-out infinite reverse'}} />
          <div className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 blur-3xl top-1/3 -left-1/4 opacity-30" style={{animation: 'float 6s ease-in-out infinite 2s'}} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-white/20 shadow-2xl shadow-indigo-500/50 group-hover:shadow-indigo-500/80 transition-all duration-300 group-hover:scale-110">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-white font-black text-2xl tracking-tight block leading-tight">Smart Campus</span>
              <span className="text-indigo-300 text-xs font-semibold tracking-widest uppercase">Management System</span>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 backdrop-blur-md mb-6 group hover:border-indigo-400/60 transition-all">
                <Sparkles className="w-4 h-4 text-amber-300 group-hover:animate-spin" />
                <span className="text-sm text-indigo-100 font-semibold">🎓 BCA • 3rd Year Major Project</span>
              </div>
              <h2 className="text-5xl font-black text-white tracking-tight leading-[1.1] mb-4">
                Simplify Your
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse-slow">Campus Life</span>
              </h2>
              <p className="text-indigo-100 text-lg max-w-md leading-relaxed font-light">
                Attendance, grades, notices, and complaints—all seamlessly managed in one beautiful, intuitive platform.
              </p>
            </div>

            {/* Live stats strip */}
            <div className="grid grid-cols-4 gap-4 pt-8 border-t border-white/10">
              {[['20+', 'Students'], ['5', 'Faculty'], ['3', 'Depts'], [time.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), 'Live']].map(([n, l]) => (
                <div key={l} className="group">
                  <p className="text-white font-black text-2xl tabular-nums group-hover:text-indigo-300 transition-colors">{n}</p>
                  <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mt-1">{l}</p>
                </div>
              ))}
            </div>
            <p className="text-indigo-300/60 text-sm font-semibold mt-6 pt-6 border-t border-white/10">
              🚀 Made by Vishu Nawariya
            </p>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-indigo-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-purple-200/20 blur-3xl -z-10" />

        <div className="w-full max-w-[420px] space-y-7 relative z-10">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight">Smart Campus</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Welcome</h1>
            <p className="text-slate-500 text-base font-medium">Sign in to your campus portal</p>
          </div>

          <div className="pro-card bg-white/85 backdrop-blur-md p-3 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <Shield className="w-3.5 h-3.5" />
                Secure Session
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                <Clock3 className="w-3.5 h-3.5" />
                {portalTime}
              </span>
            </div>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-3 gap-3 pt-2" data-testid="role-tabs">
            {roles.map((r) => {
              const active = activeRole === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => { setActiveRole(r.key); setEmail(''); setPassword(''); }}
                  data-testid={`role-tab-${r.key}`}
                  className={`group relative flex flex-col items-center gap-2.5 rounded-2xl py-5 px-3 transition-all duration-300 border-2 overflow-hidden
                    ${active
                      ? `border-transparent shadow-xl ${r.glow} bg-gradient-to-br ${r.color}/10`
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md hover:bg-slate-50/50'
                    }`}
                >
                  {active && <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-[0.05]`} />}
                  <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 font-bold
                    ${active
                      ? `bg-gradient-to-br ${r.color} shadow-lg ${r.glow} text-white scale-110`
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:scale-105'
                    }`}>
                    <r.icon className={`w-6 h-6 transition-all duration-300`} strokeWidth={1.5} />
                  </div>
                  <span className={`relative text-sm font-bold transition-colors duration-300 text-center ${active ? `text-transparent bg-gradient-to-r ${r.color} bg-clip-text` : 'text-slate-700 group-hover:text-slate-900'}`}>{r.label}</span>
                  {active && <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r ${r.color}`} />}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 font-medium -mt-1">
            You are signing into the <span className="font-black text-slate-700">{selected?.label}</span> portal. Use matching credentials for role-based access.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 pt-3 pro-card bg-white/90 backdrop-blur-md p-5" data-testid="login-form">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Email Address</label>
                <div className="relative group">
                  <Input type="email" placeholder={`Enter ${selected?.label.toLowerCase()} email`} value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-email"
                    className="w-full h-12 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 transition-all duration-300 group-focus-within:border-indigo-500 group-focus-within:shadow-lg group-focus-within:shadow-indigo-200 focus:outline-none text-base px-4" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-focus-within:opacity-5 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Password</label>
                <div className="relative group">
                  <Input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) => setCapsOn(e.getModifierState && e.getModifierState('CapsLock'))}
                    onBlur={() => setCapsOn(false)}
                    data-testid="login-password"
                    className="w-full h-12 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 transition-all duration-300 group-focus-within:border-indigo-500 group-focus-within:shadow-lg group-focus-within:shadow-indigo-200 focus:outline-none text-base px-4 pr-12"
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-all duration-200 hover:scale-110" onClick={() => setShowPw(!showPw)} data-testid="toggle-password">
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {capsOn && (
                  <p className="text-xs font-semibold text-amber-700 inline-flex items-center gap-1.5" data-testid="caps-warning">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Caps Lock is ON
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberEmail}
                    onChange={(e) => setRememberEmail(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    data-testid="remember-email"
                  />
                  <span className="text-slate-600 font-medium">Remember email</span>
                </label>

                <button
                  type="button"
                  className="text-indigo-600 font-semibold hover:text-indigo-700"
                  onClick={() => toast.info('Please contact admin to reset your password.')}
                  data-testid="forgot-password"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} data-testid="login-submit"
              className={`w-full h-12 rounded-xl font-bold text-base text-white shadow-xl transition-all duration-300 bg-gradient-to-r ${selected?.color} hover:shadow-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed`}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2 inline" /> : null}
              {loading ? 'Signing in...' : <>Sign in as {selected?.label} <ArrowRight className="w-5 h-5 ml-2 inline transition-transform group-hover:translate-x-1" /></>}
            </Button>

            <p className="text-[11px] text-slate-500 text-center font-medium">
              By signing in, you agree to campus access and acceptable-use policy.
            </p>
          </form>

          {/* Demo quick-fill */}
          <button type="button" onClick={fillDemo} data-testid="demo-credential-card"
            className="w-full group flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 hover:border-indigo-400 transition-all duration-300 hover:shadow-lg text-left">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selected?.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Try Demo • {selected?.label}</p>
              <p className="text-sm text-slate-600 truncate mt-1 font-semibold">{selected?.demo.email}</p>
            </div>
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold shrink-0 shadow-sm">{selected?.demo.pw}</span>
          </button>

          <p className="text-xs text-slate-400 text-center font-medium">
            <span className="block font-bold text-slate-600 mb-2">Made by Vishu Nawariya</span>
            <span className="text-indigo-500 font-semibold">🎓 BCA • 3rd Year Major Project</span>
          </p>
        </div>
      </div>

    </div>
  );
}