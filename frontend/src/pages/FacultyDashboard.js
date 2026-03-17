import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, BookOpen, Megaphone, Building2, CalendarCheck, FileBarChart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/faculty')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in" data-testid="faculty-dashboard-loading">
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20" data-testid="faculty-dashboard-empty">
        <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Faculty profile not found. Contact admin.</p>
      </div>
    );
  }

  const { faculty, department, subjects, students_count, notices } = data;

  return (
    <div className="space-y-6" data-testid="faculty-dashboard">
      {/* Hero Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="hero-banner bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900">
        <div className="grid-pattern" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-500/20 backdrop-blur-md rounded-2xl border border-emerald-400/30 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg">
                {faculty.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Welcome, {faculty.name}!</h1>
              <p className="text-emerald-100/90 text-sm font-medium mt-1">
                {faculty.faculty_id_number} • {faculty.designation} • {department?.name || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { key: 'students-count', value: students_count, label: 'Students', icon: Users, accent: 'stat-accent-blue', iconBg: 'bg-blue-100 dark:bg-blue-950/30', iconColor: 'text-blue-600' },
          { key: 'subjects-count', value: subjects?.length || 0, label: 'Subjects', icon: BookOpen, accent: 'stat-accent-emerald', iconBg: 'bg-emerald-100 dark:bg-emerald-950/30', iconColor: 'text-emerald-600' },
          { key: 'department', value: department?.code || '-', label: department?.name || 'Department', icon: Building2, accent: 'stat-accent-amber', iconBg: 'bg-amber-100 dark:bg-amber-950/30', iconColor: 'text-amber-600', small: true },
        ].map((stat, i) => (
          <motion.div key={stat.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 * i }}>
            <Card className={`pro-card bg-card ${stat.accent} group`} data-testid={`stat-${stat.key}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${stat.small ? 'text-2xl' : 'text-3xl'} font-bold ${stat.iconColor}`}>{stat.value}</p>
                    <p className="text-sm text-muted-foreground font-medium mt-2">{stat.label}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} strokeWidth={1.5} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        <Card className="pro-card bg-card overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Mark Attendance', icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-950/30', path: '/attendance', testId: 'quick-attendance' },
                { label: 'Enter Marks', icon: FileBarChart, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-950/30', path: '/marks', testId: 'quick-marks' },
                { label: 'Post Notice', icon: Megaphone, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-950/30', path: '/notices', testId: 'quick-notices' },
              ].map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto py-6 px-4 flex flex-col items-center gap-3 rounded-xl border border-border/60 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-muted/50 transition-all group"
                  onClick={() => navigate(action.path)}
                  data-testid={action.testId}
                >
                  <div className={`p-2.5 rounded-xl ${action.bg} group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">{action.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-foreground transition-colors" />
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subjects & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="pro-card bg-card overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              Department Subjects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {(subjects || []).length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No subjects assigned</p>
              </div>
            ) : (
              subjects.map(s => (
                <div key={s.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{s.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.code} • Sem {s.semester}</p>
                    </div>
                    <Badge className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold">{s.credits} Cr</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="pro-card bg-card overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/30">
                <Megaphone className="w-4 h-4 text-purple-600" />
              </div>
              Recent Notices
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {(notices || []).length === 0 ? (
              <div className="text-center py-8">
                <Megaphone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notices posted</p>
              </div>
            ) : (
              notices.map(n => (
                <div key={n.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{n.title}</p>
                    </div>
                    <Badge className={`shrink-0 text-[10px] font-semibold ${n.priority === 'high' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}>
                      {n.priority?.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{n.date} • {n.posted_by}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}