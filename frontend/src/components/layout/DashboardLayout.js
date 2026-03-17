import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import SupportWidget from '@/components/ui/SupportWidget';
import CommandPalette from '@/components/ui/CommandPalette';
import NotificationPanel from '@/components/ui/NotificationPanel';
import MobileBottomNav from '@/components/ui/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';
import {
  LayoutDashboard, GraduationCap, Users, Building2, CalendarCheck,
  FileBarChart, Megaphone, MessageSquare, BarChart3, LogOut,
  Menu, Search, Bell, Sun, Moon, BookOpen, Loader2, X, ChevronRight,
  Sparkles, Shield, Command
} from 'lucide-react';

const menuConfig = {
  admin: [
    { label: 'Dashboard',     icon: LayoutDashboard, path: '/dashboard',      color: 'text-indigo-400',  bg: 'bg-indigo-500/20' },
    { label: 'Students',      icon: GraduationCap,   path: '/students',        color: 'text-blue-400',    bg: 'bg-blue-500/20' },
    { label: 'Faculty',       icon: Users,           path: '/faculty-members', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { label: 'Departments',   icon: Building2,       path: '/departments',     color: 'text-purple-400',  bg: 'bg-purple-500/20' },
    { label: 'Subjects',      icon: BookOpen,        path: '/subjects',        color: 'text-cyan-400',    bg: 'bg-cyan-500/20' },
    { label: 'Attendance',    icon: CalendarCheck,   path: '/attendance',      color: 'text-teal-400',    bg: 'bg-teal-500/20' },
    { label: 'Marks & Results', icon: FileBarChart,  path: '/marks',           color: 'text-amber-400',   bg: 'bg-amber-500/20' },
    { label: 'Notice Board',  icon: Megaphone,       path: '/notices',         color: 'text-pink-400',    bg: 'bg-pink-500/20' },
    { label: 'Complaints',    icon: MessageSquare,   path: '/complaints',      color: 'text-red-400',     bg: 'bg-red-500/20' },
    { label: 'Reports',       icon: BarChart3,       path: '/reports',         color: 'text-orange-400',  bg: 'bg-orange-500/20' },
  ],
  faculty: [
    { label: 'Dashboard',      icon: LayoutDashboard, path: '/dashboard',  color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
    { label: 'Attendance',     icon: CalendarCheck,   path: '/attendance', color: 'text-teal-400',   bg: 'bg-teal-500/20' },
    { label: 'Marks & Results',icon: FileBarChart,    path: '/marks',      color: 'text-amber-400',  bg: 'bg-amber-500/20' },
    { label: 'Notice Board',   icon: Megaphone,       path: '/notices',    color: 'text-pink-400',   bg: 'bg-pink-500/20' },
  ],
  student: [
    { label: 'Dashboard',      icon: LayoutDashboard, path: '/dashboard',   color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
    { label: 'Attendance',     icon: CalendarCheck,   path: '/attendance',  color: 'text-teal-400',   bg: 'bg-teal-500/20' },
    { label: 'Marks & Results',icon: FileBarChart,    path: '/marks',       color: 'text-amber-400',  bg: 'bg-amber-500/20' },
    { label: 'Notice Board',   icon: Megaphone,       path: '/notices',     color: 'text-pink-400',   bg: 'bg-pink-500/20' },
    { label: 'Complaints',     icon: MessageSquare,   path: '/complaints',  color: 'text-red-400',    bg: 'bg-red-500/20' },
  ],
};

const roleConfig = {
  admin:   { label: 'Administrator', icon: Shield,      gradient: 'from-amber-500 to-orange-600', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  faculty: { label: 'Faculty',       icon: BookOpen,    gradient: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  student: { label: 'Student',       icon: GraduationCap, gradient: 'from-indigo-500 to-purple-600', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
};

function SidebarContent({ items, user, onItemClick }) {
  const rc = roleConfig[user?.role] || roleConfig.student;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" data-testid="sidebar">
      {/* Logo */}
      <div className="p-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rc.gradient} flex items-center justify-center shadow-lg`}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-sm tracking-tight text-white" data-testid="app-title">Smart Campus</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Management System</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${rc.badge} text-xs font-semibold`}>
          <rc.icon className="w-3.5 h-3.5" />
          {rc.label} Portal
          <span className="ml-auto">
            <span className="status-dot status-dot-green" />
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-3 space-y-0.5 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${isActive ? item.bg : 'bg-white/5 group-hover:bg-white/8'}`}>
                  <item.icon className={`w-4 h-4 ${isActive ? item.color : 'text-slate-500'}`} strokeWidth={isActive ? 2 : 1.5} />
                </span>
                <span className="flex-1 text-sm">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-white/8">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${rc.gradient} flex items-center justify-center text-white text-xs font-black shrink-0 shadow-lg`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const typeIcons = {
  student: GraduationCap,
  faculty: Users,
  department: Building2,
  subject: BookOpen,
  notice: Megaphone,
  complaint: MessageSquare,
};

const typeLabels = {
  student: 'Student',
  faculty: 'Faculty',
  department: 'Department',
  subject: 'Subject',
  notice: 'Notice',
  complaint: 'Complaint',
};

const typeBadgeColors = {
  student: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  faculty: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  department: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  subject: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  notice: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  complaint: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

function GlobalSearch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const placeholderByRole = {
    admin: 'Search students, faculty, departments...',
    faculty: 'Search students, subjects, notices...',
    student: 'Search notices, subjects, complaints...',
  };
  const placeholder = placeholderByRole[user?.role] || 'Search...';

  // Ctrl+K shortcut — handled at DashboardLayout level for CommandPalette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const doSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/search', { params: { q: searchQuery.trim() } });
      setResults(res.data.results || []);
      setOpen(true);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 350);
  };

  const handleSelect = (result) => {
    setOpen(false);
    setQuery('');
    setResults([]);
    // Pass the item ID in state so destination page can open detail modal
    navigate(`${result.path}`, {
      state: { searchItemId: result.id, searchItemType: result.type }
    });
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const grouped = results.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  return (
    <div className="hidden md:flex items-center max-w-sm flex-1 mx-8 relative" ref={containerRef}>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          className="pl-9 pr-20 h-9 bg-muted/50 border-0 rounded-xl"
          data-testid="search-input"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
        />
        {query ? (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
          </button>
        ) : (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-muted-foreground/60 bg-background border border-border/50">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {results.length === 0 && !loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            Object.entries(grouped).map(([type, items]) => {
              const Icon = typeIcons[type] || Search;
              return (
                <div key={type}>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border/50 flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    {typeLabels[type] || type}s ({items.length})
                  </div>
                  {items.map((item, idx) => (
                    <button
                      key={`${type}-${idx}`}
                      onClick={() => handleSelect(item)}
                      className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors flex items-center gap-3 border-b border-border/30 last:border-b-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${typeBadgeColors[type] || 'bg-muted text-muted-foreground'}`}>
                        {typeLabels[type]}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [notifications, setNotifications] = useState([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Ctrl+K shortcut for command palette
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(v => !v);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/notices')
        .then((res) => {
          if (res.data && res.data.notices) {
            setNotifications(res.data.notices.slice(0, 4));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const items = menuConfig[user?.role] || menuConfig.student;
  const currentItem = items.find((i) => location.pathname.startsWith(i.path));
  const currentPage = currentItem?.label || 'Dashboard';
  const CurrentIcon = currentItem?.icon || LayoutDashboard;

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const rc = roleConfig[user?.role] || roleConfig.student;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-slate-950 shadow-2xl">
        <SidebarContent items={items} user={user} />
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border/40 bg-background/95 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 shrink-0 z-20 shadow-sm" data-testid="topbar">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" data-testid="mobile-menu-btn">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 border-r-0">
                <SidebarContent items={items} user={user} onItemClick={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2" data-testid="page-title">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${currentItem?.bg || 'bg-indigo-500/15'}`}>
                <CurrentIcon className={`w-3.5 h-3.5 ${currentItem?.color || 'text-indigo-500'}`} strokeWidth={2} />
              </span>
              <h2 className="text-sm font-semibold text-foreground">{currentPage}</h2>
            </div>
          </div>

          <GlobalSearch />

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={toggleDark} className="h-9 w-9 rounded-xl" data-testid="theme-toggle">
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Notification Bell — opens slide-in panel */}
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl relative" data-testid="notifications-btn" onClick={() => setNotifOpen(true)}>
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background" />
              )}
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 pl-1.5 pr-3 rounded-xl hover:bg-muted" data-testid="profile-dropdown">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${rc.gradient} flex items-center justify-center text-white text-[10px] font-black`}>
                    {initials}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-2xl shadow-2xl border-border/50">
                <div className="px-3 py-3 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rc.gradient} flex items-center justify-center text-white text-xs font-black`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                      <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${rc.badge} bg-opacity-20`}>{rc.label}</span>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer mx-2 rounded-lg font-medium text-sm" data-testid="logout-btn">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 pb-20 lg:pb-6 bg-slate-50/50 dark:bg-background" data-testid="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <SupportWidget />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} notifications={notifications} />
      <MobileBottomNav />
    </div>
  );
}
