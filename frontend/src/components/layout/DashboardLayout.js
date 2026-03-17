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
  Sparkles, Shield, Command, ChevronLeft, Settings, Activity,
  CreditCard, UserCheck, Clock, PanelLeftClose, PanelLeftOpen,
  Home, Layers
} from 'lucide-react';

/* ── Navigation Config ─────────────────────────────────────────── */
const menuConfig = {
  admin: [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Dashboard',   icon: LayoutDashboard, path: '/dashboard',      color: 'text-indigo-400',  bg: 'bg-indigo-500/15' },
        { label: 'Reports',     icon: BarChart3,       path: '/reports',         color: 'text-orange-400',  bg: 'bg-orange-500/15' },
      ]
    },
    {
      group: 'ACADEMICS',
      items: [
        { label: 'Students',       icon: GraduationCap,   path: '/students',        color: 'text-blue-400',    bg: 'bg-blue-500/15' },
        { label: 'Faculty',        icon: Users,           path: '/faculty-members', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
        { label: 'Departments',    icon: Building2,       path: '/departments',     color: 'text-purple-400',  bg: 'bg-purple-500/15' },
        { label: 'Subjects',       icon: BookOpen,        path: '/subjects',        color: 'text-cyan-400',    bg: 'bg-cyan-500/15' },
        { label: 'Attendance',     icon: CalendarCheck,   path: '/attendance',      color: 'text-teal-400',    bg: 'bg-teal-500/15' },
        { label: 'Marks & Grades', icon: FileBarChart,    path: '/marks',           color: 'text-amber-400',   bg: 'bg-amber-500/15' },
      ]
    },
    {
      group: 'ADMINISTRATION',
      items: [
        { label: 'Notice Board',   icon: Megaphone,       path: '/notices',         color: 'text-pink-400',    bg: 'bg-pink-500/15' },
        { label: 'Complaints',     icon: MessageSquare,   path: '/complaints',      color: 'text-red-400',     bg: 'bg-red-500/15' },
      ]
    },
  ],
  faculty: [
    {
      group: 'MY CLASSES',
      items: [
        { label: 'Dashboard',       icon: LayoutDashboard, path: '/dashboard',  color: 'text-indigo-400', bg: 'bg-indigo-500/15' },
        { label: 'Attendance',      icon: CalendarCheck,   path: '/attendance', color: 'text-teal-400',   bg: 'bg-teal-500/15' },
        { label: 'Marks & Grades',  icon: FileBarChart,    path: '/marks',      color: 'text-amber-400',  bg: 'bg-amber-500/15' },
      ]
    },
    {
      group: 'COMMUNICATION',
      items: [
        { label: 'Notice Board',    icon: Megaphone,       path: '/notices',    color: 'text-pink-400',   bg: 'bg-pink-500/15' },
      ]
    },
  ],
  student: [
    {
      group: 'MY ACADEMIC LIFE',
      items: [
        { label: 'Dashboard',       icon: LayoutDashboard, path: '/dashboard',   color: 'text-indigo-400', bg: 'bg-indigo-500/15' },
        { label: 'Attendance',      icon: CalendarCheck,   path: '/attendance',  color: 'text-teal-400',   bg: 'bg-teal-500/15' },
        { label: 'Marks & Grades',  icon: FileBarChart,    path: '/marks',       color: 'text-amber-400',  bg: 'bg-amber-500/15' },
      ]
    },
    {
      group: 'CAMPUS SERVICES',
      items: [
        { label: 'Notice Board',    icon: Megaphone,       path: '/notices',     color: 'text-pink-400',   bg: 'bg-pink-500/15' },
        { label: 'Complaints',      icon: MessageSquare,   path: '/complaints',  color: 'text-red-400',    bg: 'bg-red-500/15' },
      ]
    },
  ],
};

const roleConfig = {
  admin:   { label: 'Administrator', icon: Shield,        gradient: 'from-amber-500 to-orange-600',  badge: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
  faculty: { label: 'Faculty',       icon: BookOpen,      gradient: 'from-emerald-500 to-teal-600',  badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  student: { label: 'Student',       icon: GraduationCap, gradient: 'from-indigo-500 to-purple-600', badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25' },
};

/* ── Flat items for search/current page lookup ─────────────────── */
function flatItems(role) {
  return (menuConfig[role] || menuConfig.student).flatMap(g => g.items);
}

/* ── Sidebar ───────────────────────────────────────────────────── */
function SidebarContent({ groups, user, collapsed = false, onItemClick, onToggleCollapse }) {
  const rc = roleConfig[user?.role] || roleConfig.student;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div
      className={`flex flex-col h-full transition-all duration-300 ${
        collapsed
          ? 'bg-[#0D1117] border-r border-white/[0.06] w-16'
          : 'bg-[#0D1117] border-r border-white/[0.06] w-70'
      }`}
      data-testid="sidebar"
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-white/[0.06] shrink-0 ${collapsed ? 'h-16 justify-center px-0' : 'h-16 px-5 gap-3'}`}>
        <div className={`shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${rc.gradient} flex items-center justify-center shadow-lg`}>
          <GraduationCap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white tracking-tight leading-tight" data-testid="app-title">SmartCampus</p>
            <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Management System</p>
          </div>
        )}
        {!collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/8 transition-colors shrink-0"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        )}
        {collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute right-0 translate-x-full top-5 w-5 h-8 bg-[#1C2128] border border-white/[0.08] rounded-r-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors shadow-lg"
          >
            <PanelLeftOpen className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Role pill */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-1 shrink-0">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${rc.badge} text-[11px] font-semibold`}>
            <rc.icon className="w-3 h-3 shrink-0" />
            <span className="truncate">{rc.label} Portal</span>
            <span className="ml-auto shrink-0">
              <span className="status-dot status-dot-green w-1.5 h-1.5" />
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 overflow-x-hidden">
        {groups.map((group) => (
          <div key={group.group} className="mb-1">
            {!collapsed && (
              <p className="px-3 py-2 text-[10px] font-bold text-slate-600 tracking-widest uppercase select-none">
                {group.group}
              </p>
            )}
            {collapsed && <div className="my-2 border-t border-white/[0.05]" />}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onItemClick}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer
                  ${collapsed ? 'h-10 w-10 mx-auto justify-center' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'text-white bg-white/10 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r-full bg-gradient-to-b from-blue-400 to-violet-500" />
                    )}
                    <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      isActive ? item.bg : 'bg-white/[0.04] group-hover:bg-white/[0.06]'
                    }`}>
                      <item.icon className={`w-4 h-4 transition-colors ${isActive ? item.color : 'text-slate-500 group-hover:text-slate-300'}`} strokeWidth={isActive ? 2 : 1.5} />
                    </span>
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    {/* Tooltip for collapsed */}
                    {collapsed && (
                      <span className="pointer-events-none absolute left-full ml-3 z-50 px-2 py-1 rounded-md bg-[#1C2128] border border-white/[0.08] text-xs text-white font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                        {item.label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className={`border-t border-white/[0.06] p-3 shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${rc.gradient} flex items-center justify-center text-white text-[10px] font-black shadow-lg cursor-default`} title={user?.name}>
            {initials}
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-colors cursor-default">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${rc.gradient} flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-md`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Search result badge colors ────────────────────────────────── */
const typeIcons  = { student: GraduationCap, faculty: Users, department: Building2, subject: BookOpen, notice: Megaphone, complaint: MessageSquare };
const typeLabels = { student: 'Student', faculty: 'Faculty', department: 'Dept', subject: 'Subject', notice: 'Notice', complaint: 'Complaint' };
const typeBadge  = { student: 'bg-blue-500/15 text-blue-400', faculty: 'bg-emerald-500/15 text-emerald-400', department: 'bg-purple-500/15 text-purple-400', subject: 'bg-cyan-500/15 text-cyan-400', notice: 'bg-amber-500/15 text-amber-400', complaint: 'bg-red-500/15 text-red-400' };

/* ── Inline Search (desktop navbar) ────────────────────────────── */
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

  const placeholder = { admin: 'Search students, faculty...', faculty: 'Search students, subjects...', student: 'Search notices, subjects...' }[user?.role] || 'Search...';

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); } };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await api.get('/search', { params: { q: q.trim() } });
      setResults(res.data.results || []);
      setOpen(true);
    } catch { setResults([]); setOpen(true); } finally { setLoading(false); }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 350);
  };

  const handleSelect = (result) => {
    setOpen(false); setQuery(''); setResults([]);
    navigate(result.path, { state: { searchItemId: result.id, searchItemType: result.type } });
  };

  useEffect(() => {
    const onOutside = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const grouped = results.reduce((acc, r) => { if (!acc[r.type]) acc[r.type] = []; acc[r.type].push(r); return acc; }, {});

  return (
    <div className="hidden md:flex items-center max-w-xs flex-1 mx-6 relative" ref={containerRef}>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          data-testid="search-input"
          className="w-full h-9 pl-9 pr-16 rounded-xl bg-white/[0.05] dark:bg-white/[0.04] border border-white/[0.08] dark:border-white/[0.06] text-sm text-slate-200 dark:text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all duration-200"
        />
        {query ? (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] font-semibold text-slate-500">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        )}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-[#161B22] border border-white/[0.08] rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto overflow-x-hidden"
          >
            {results.length === 0 && !loading ? (
              <div className="p-4 text-center text-sm text-slate-500">No results for "<span className="text-slate-300">{query}</span>"</div>
            ) : (
              Object.entries(grouped).map(([type, items]) => {
                const Icon = typeIcons[type] || Search;
                return (
                  <div key={type}>
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/[0.02] border-b border-white/[0.05] flex items-center gap-2">
                      <Icon className="w-3 h-3" />{typeLabels[type]}s ({items.length})
                    </div>
                    {items.map((item, idx) => (
                      <button key={idx} onClick={() => handleSelect(item)}
                        className="w-full text-left px-3 py-2.5 hover:bg-white/[0.05] transition-colors flex items-center gap-3 border-b border-white/[0.04] last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{item.title}</p>
                          <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${typeBadge[type] || 'bg-slate-700 text-slate-300'}`}>
                          {typeLabels[type]}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Layout ───────────────────────────────────────────────── */
export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return document.documentElement.classList.contains('dark');
  });
  const [notifications, setNotifications] = useState([]);
  const [allNotificationIds, setAllNotificationIds] = useState([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const noticeReadStorageKey = user ? `notice-read-${user.id || user.email}` : 'notice-read-anon';

  const getReadNoticeIds = useCallback(() => {
    if (!user) return [];
    try {
      return JSON.parse(localStorage.getItem(noticeReadStorageKey) || '[]');
    } catch {
      return [];
    }
  }, [noticeReadStorageKey, user]);

  const applyNoticeReadState = useCallback((notices) => {
    const readIds = new Set(getReadNoticeIds());
    return notices.map((notice) => ({
      ...notice,
      read: readIds.has(notice.id),
    }));
  }, [getReadNoticeIds]);

  const persistReadNoticeIds = useCallback((noticeIds) => {
    if (!user || noticeIds.length === 0) return;
    const mergedIds = [...new Set([...getReadNoticeIds(), ...noticeIds])];
    localStorage.setItem(noticeReadStorageKey, JSON.stringify(mergedIds));
  }, [getReadNoticeIds, noticeReadStorageKey, user]);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setAllNotificationIds([]);
      setUnreadCount(0);
      return;
    }

    try {
      const res = await api.get('/notices');
      const notices = res.data?.notices || [];
      const noticesWithReadState = applyNoticeReadState(notices);
      setAllNotificationIds(noticesWithReadState.map((notice) => notice.id));
      setNotifications(noticesWithReadState.slice(0, 8));
      setUnreadCount(noticesWithReadState.filter((notice) => !notice.read).length);
    } catch {}
  }, [applyNoticeReadState, user]);

  /* Apply theme on mount */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  /* Ctrl+K shortcut */
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(v => !v); }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  /* Fetch notifications */
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markNoticeIdsAsRead = useCallback((noticeIds) => {
    if (noticeIds.length === 0) return;
    persistReadNoticeIds(noticeIds);

    setNotifications((prev) => prev.map((notice) => (
      noticeIds.includes(notice.id) ? { ...notice, read: true } : notice
    )));
    setUnreadCount((prev) => Math.max(0, prev - noticeIds.length));
  }, [persistReadNoticeIds]);

  const handleMarkAllNotificationsRead = useCallback(() => {
    markNoticeIdsAsRead(allNotificationIds);
  }, [allNotificationIds, markNoticeIdsAsRead]);

  const handleViewNotification = useCallback((notification) => {
    if (!notification?.id || notification.read) return;
    markNoticeIdsAsRead([notification.id]);
  }, [markNoticeIdsAsRead]);

  const groups = (menuConfig[user?.role] || menuConfig.student);
  const allItems = flatItems(user?.role);
  const currentItem = allItems.find(i => location.pathname.startsWith(i.path));
  const currentPage = currentItem?.label || 'Dashboard';

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const rc = roleConfig[user?.role] || roleConfig.student;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-canvas)' }}>
      {/* ── Desktop Sidebar ── */}
      <aside className={`hidden lg:flex flex-col shrink-0 relative transition-all duration-300 z-30 ${
        sidebarCollapsed ? 'w-16' : 'w-[260px]'
      }`}>
        <SidebarContent
          groups={groups}
          user={user}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </aside>

      {/* ── Main Column ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── Top Navbar ── */}
        <header
          className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 z-20 border-b"
          style={{
            background: darkMode ? 'rgba(13,17,23,0.92)' : 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          }}
          data-testid="topbar"
        >
          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 rounded-lg" data-testid="mobile-menu-btn">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 border-r-0 bg-[#0D1117]">
                <SidebarContent groups={groups} user={user} onItemClick={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2" data-testid="page-title">
              <span className={`hidden sm:flex w-7 h-7 rounded-lg items-center justify-center ${currentItem?.bg || 'bg-indigo-500/15'}`}>
                {currentItem && <currentItem.icon className={`w-3.5 h-3.5 ${currentItem.color || 'text-indigo-400'}`} strokeWidth={2} />}
              </span>
              <div className="hidden sm:block">
                <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{currentPage}</p>
                <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>SmartCampus / {currentPage}</p>
              </div>
            </div>
          </div>

          {/* Center: Search */}
          <GlobalSearch />

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={toggleDark}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] dark:hover:bg-white/[0.07] transition-all"
              data-testid="theme-toggle"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4" />
              }
            </button>

            {/* Notifications */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] dark:hover:bg-white/[0.07] transition-all"
              data-testid="notifications-btn"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none ring-2 ring-[#0D1117]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 pl-1.5 pr-2.5 h-8 rounded-xl hover:bg-white/[0.06] dark:hover:bg-white/[0.07] transition-all ml-1"
                  data-testid="profile-dropdown"
                >
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${rc.gradient} flex items-center justify-center text-white text-[9px] font-black shadow`}>
                    {initials}
                  </div>
                  <span className="text-[13px] font-medium hidden sm:block" style={{ color: 'var(--text-primary)' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-500 hidden sm:block rotate-90" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl border-white/[0.08] bg-[#161B22] shadow-2xl p-0 overflow-hidden">
                {/* User info header */}
                <div className="px-4 py-3.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rc.gradient} flex items-center justify-center text-white font-black text-xs shrink-0 shadow-lg`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <span className={`inline-flex items-center mt-1 gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${rc.badge}`}>
                        <rc.icon className="w-2.5 h-2.5" />{rc.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-1.5">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 rounded-lg cursor-pointer text-[13px] font-medium"
                    data-testid="logout-btn"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />Sign Out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main
          className="flex-1 overflow-auto pb-20 lg:pb-6"
          style={{ background: darkMode ? 'var(--bg-canvas)' : '#F4F6FA' }}
          data-testid="main-content"
        >
          <div className="p-4 lg:p-6 min-h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ── Global Overlays ── */}
      <SupportWidget />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onViewNotification={handleViewNotification}
      />
      <MobileBottomNav />
    </div>
  );
}
