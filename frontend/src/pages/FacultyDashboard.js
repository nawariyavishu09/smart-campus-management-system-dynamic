import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, BookOpen, Megaphone, Building2, CalendarCheck, FileBarChart } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in" data-testid="faculty-dashboard">
      {/* Hero Header */}
      <div className="hero-banner bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900">
        <div className="grid-pattern" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-500/20 backdrop-blur-md rounded-lg border border-blue-400/30">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-300 to-blue-400 flex items-center justify-center text-slate-900 font-bold text-lg">
                {faculty.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {faculty.name}!</h1>
              <p className="text-blue-200 text-sm font-medium mt-1">
                {faculty.faculty_id_number} • {faculty.designation} • {department?.name || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="pro-card bg-card stat-accent-blue" data-testid="stat-students-count">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">{students_count}</p>
                <p className="text-sm text-muted-foreground font-medium mt-2">Students</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                <Users className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pro-card bg-card stat-accent-emerald" data-testid="stat-subjects-count">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-emerald-600">{subjects?.length || 0}</p>
                <p className="text-sm text-muted-foreground font-medium mt-2">Subjects</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
                <BookOpen className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pro-card bg-card stat-accent-amber" data-testid="stat-department">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-600">{department?.code || '-'}</p>
                <p className="text-sm text-muted-foreground font-medium mt-2">{department?.name || 'Department'}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-950/30">
                <Building2 className="w-6 h-6 text-amber-600" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="pro-card bg-card overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/40">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-6 px-4 flex flex-col items-center gap-3 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors" 
              onClick={() => navigate('/attendance')} 
              data-testid="quick-attendance">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                <CalendarCheck className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Mark Attendance</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-6 px-4 flex flex-col items-center gap-3 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors" 
              onClick={() => navigate('/marks')} 
              data-testid="quick-marks">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
                <FileBarChart className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium">Enter Marks</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-6 px-4 flex flex-col items-center gap-3 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors" 
              onClick={() => navigate('/notices')} 
              data-testid="quick-notices">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/30">
                <Megaphone className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium">Post Notice</span>
            </Button>
          </div>
        </CardContent>
      </Card>

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