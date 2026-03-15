import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  Menu, Search, Bell, Sun, Moon, BookOpen
} from 'lucide-react';

const menuConfig = {
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Students', icon: GraduationCap, path: '/students' },
    { label: 'Faculty', icon: Users, path: '/faculty-members' },
    { label: 'Departments', icon: Building2, path: '/departments' },
    { label: 'Subjects', icon: BookOpen, path: '/subjects' },
    { label: 'Attendance', icon: CalendarCheck, path: '/attendance' },
    { label: 'Marks & Results', icon: FileBarChart, path: '/marks' },
    { label: 'Notice Board', icon: Megaphone, path: '/notices' },
    { label: 'Complaints', icon: MessageSquare, path: '/complaints' },
    { label: 'Reports', icon: BarChart3, path: '/reports' },
  ],
  faculty: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Attendance', icon: CalendarCheck, path: '/attendance' },
    { label: 'Marks & Results', icon: FileBarChart, path: '/marks' },
    { label: 'Notice Board', icon: Megaphone, path: '/notices' },
  ],
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Attendance', icon: CalendarCheck, path: '/attendance' },
    { label: 'Marks & Results', icon: FileBarChart, path: '/marks' },
    { label: 'Notice Board', icon: Megaphone, path: '/notices' },
    { label: 'Complaints', icon: MessageSquare, path: '/complaints' },
  ],
};

function SidebarContent({ items, onItemClick }) {
  return (
    <div className="flex flex-col h-full" data-testid="sidebar">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight" data-testid="app-title">Smart Campus</h1>
            <p className="text-[10px] text-muted-foreground font-medium">Management System</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary border-l-[3px] border-primary ml-0'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
            {item.label}
          </NavLink>
        ))}
      </nav>
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

  // Fetching recent notifications (notices) from API
  useEffect(() => {
    if (user) {
      api.get('/notices')
        .then((res) => {
          if (res.data && res.data.notices) {
            setNotifications(res.data.notices.slice(0, 4)); // Only top 4 latest notices
          }
        })
        .catch((err) => console.log('Error fetching notifications:', err));
    }
  }, [user]);

  const items = menuConfig[user?.role] || menuConfig.student;
  const currentPage = items.find((i) => location.pathname.startsWith(i.path))?.label || 'Dashboard';

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/50 bg-card">
        <SidebarContent items={items} />
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shrink-0" data-testid="topbar">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" data-testid="mobile-menu-btn">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent items={items} onItemClick={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <h2 className="text-lg font-semibold tracking-tight hidden sm:block" data-testid="page-title">{currentPage}</h2>
          </div>

          <div className="hidden md:flex items-center max-w-sm flex-1 mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 h-9 bg-muted/50 border-0" data-testid="search-input" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleDark} className="h-9 w-9" data-testid="theme-toggle">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Notification Bell Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 relative" data-testid="notifications-btn">
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center py-2">
                  <span>Notifications</span>
                  <Badge variant="secondary" className="text-[10px]">{notifications.length} New</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No pending notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <DropdownMenuItem key={notif.id} className="cursor-pointer p-3 focus:bg-muted flex flex-col items-start gap-1" onClick={() => navigate('/notices')}>
                        <p className="text-sm font-medium leading-none">{notif.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notif.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </p>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer justify-center text-primary font-medium text-xs" onClick={() => navigate('/notices')}>
                  View all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 pl-2 pr-3" data-testid="profile-dropdown">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary" className="mt-1 text-[10px] capitalize">{user?.role}</Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer" data-testid="logout-btn">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6" data-testid="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
