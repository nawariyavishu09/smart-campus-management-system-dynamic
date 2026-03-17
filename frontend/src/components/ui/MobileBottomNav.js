import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, CalendarCheck, FileBarChart, Megaphone, MessageSquare, BarChart3, Menu
} from "lucide-react";

const navConfig = {
  admin: [
    { label: "Home", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Attendance", icon: CalendarCheck, path: "/attendance" },
    { label: "Marks", icon: FileBarChart, path: "/marks" },
    { label: "Notices", icon: Megaphone, path: "/notices" },
    { label: "Reports", icon: BarChart3, path: "/reports" },
  ],
  faculty: [
    { label: "Home", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Attendance", icon: CalendarCheck, path: "/attendance" },
    { label: "Marks", icon: FileBarChart, path: "/marks" },
    { label: "Notices", icon: Megaphone, path: "/notices" },
  ],
  student: [
    { label: "Home", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Attendance", icon: CalendarCheck, path: "/attendance" },
    { label: "Marks", icon: FileBarChart, path: "/marks" },
    { label: "Notices", icon: Megaphone, path: "/notices" },
    { label: "Complaints", icon: MessageSquare, path: "/complaints" },
  ],
};

export default function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const items = navConfig[user?.role] || navConfig.student;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-xl border-t border-border/40 shadow-[0_-1px_12px_rgba(0,0,0,0.05)] safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {items.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                active ? "bg-indigo-50 dark:bg-indigo-500/15 scale-105" : ""
              }`}>
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    active ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground/60"
                  }`}
                  strokeWidth={active ? 2 : 1.5}
                />
              </div>
              <span className={`text-[9px] font-semibold transition-colors ${
                active ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground/50"
              }`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
