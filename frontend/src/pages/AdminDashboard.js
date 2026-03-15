import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // navigate add kiya gaya hai
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, GraduationCap, Building2, CalendarCheck, MessageSquare, Megaphone, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

const statCards = [
  { key: 'total_students', label: 'Students', icon: GraduationCap, color: 'text-indigo-600', route: '/students' },
  { key: 'total_faculty', label: 'Faculty', icon: Users, color: 'text-emerald-600', route: '/faculty-members' },
  { key: 'total_departments', label: 'Departments', icon: Building2, color: 'text-amber-600', route: '/departments' },
  { key: 'avg_attendance', label: 'Avg Attendance', icon: CalendarCheck, color: 'text-blue-600', suffix: '%', route: '/attendance' },
  { key: 'pending_complaints', label: 'Complaints', icon: MessageSquare, color: 'text-red-600', route: '/complaints' },
  { key: 'total_notices', label: 'Notices', icon: Megaphone, color: 'text-purple-600', route: '/notices' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // hook start kiya

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in" data-testid="admin-dashboard-loading">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" data-testid="admin-dashboard">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-blue-200 text-sm font-medium">Real-time campus management and analytics</p>
        </div>
      </div>

      {/* Stat Cards - Professional styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            onClick={() => navigate(card.route)}
            className="group relative cursor-pointer rounded-xl border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-lg"
            data-testid={`stat-${card.key}`}
          >
            <div className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <card.icon className={`w-5 h-5 ${card.color}`} strokeWidth={2} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {stats?.[card.key] || 0}{card.suffix || ''}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-1">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative rounded-xl border border-border/50 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 border-b">
            <CardTitle className="text-base font-semibold">Attendance Trend (7 Days)</CardTitle>
          </div>
            <CardContent className="p-6">
              <div className="h-64" data-testid="attendance-chart">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                  <LineChart data={stats?.attendance_trend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #4f46e5', background: '#fff', boxShadow: '0 20px 25px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="percentage" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
        </div>

        <div className="relative rounded-xl border border-border/50 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 border-b">
            <CardTitle className="text-base font-semibold">Department Distribution</CardTitle>
          </div>
            <CardContent className="p-6">
              <div className="h-64 flex items-center" data-testid="department-chart">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                  <PieChart>
                    <Pie data={stats?.dept_distribution || []} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, count }) => `${name}: ${count}`} labelLine={false}>
                      {(stats?.dept_distribution || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #f59e0b', background: '#fff', boxShadow: '0 20px 25px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
        </div>
      </div>

      {/* Recent Activity - Professional styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative rounded-xl border border-border/50 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 border-b">
            <CardTitle className="text-base font-semibold">Recent Notices</CardTitle>
          </div>
          <CardContent className="p-6 space-y-3">
            {(stats?.recent_notices || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No notices yet</p>
            ) : (
              stats.recent_notices.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => navigate('/notices')}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors" 
                  data-testid={`notice-${n.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.posted_by} • {n.date}</p>
                  </div>
                  <Badge className={`shrink-0 text-[10px] font-semibold ${
                    n.priority === 'high' ? 'bg-red-600 hover:bg-red-700 text-white' :
                    n.priority === 'medium' ? 'bg-amber-600 hover:bg-amber-700 text-white' :
                    'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}>
                    {n.priority.toUpperCase()}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </div>

        <div className="relative rounded-xl border border-border/50 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 border-b">
            <CardTitle className="text-base font-semibold">Recent Complaints</CardTitle>
          </div>
          <CardContent className="p-6 space-y-3">
            {(stats?.recent_complaints || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No complaints</p>
            ) : (
              stats.recent_complaints.map((c) => (
                <div 
                  key={c.id} 
                  onClick={() => navigate('/complaints')}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors" 
                  data-testid={`complaint-${c.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{c.student_name}</p>
                  </div>
                  <Badge className={`shrink-0 text-[10px] font-semibold ${
                    c.status === 'resolved' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                    c.status === 'in_progress' ? 'bg-amber-600 hover:bg-amber-700 text-white' :
                    'bg-red-600 hover:bg-red-700 text-white'
                  }`}>
                    {c.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </div>
      </div>
    </div>
  );
}
