import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarCheck, FileBarChart, Megaphone, MessageSquare, BookOpen, GraduationCap } from 'lucide-react';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/student')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in" data-testid="student-dashboard-loading">
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20" data-testid="student-dashboard-empty">
        <GraduationCap className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Student profile not found. Please contact admin.</p>
      </div>
    );
  }

  const { student, department, attendance_percentage, marks, avg_marks, notices, complaints, total_subjects } = data;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="student-dashboard">
      {/* Hero Header */}
      <div className="hero-banner bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900">
        <div className="grid-pattern" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-600/40 backdrop-blur-xl rounded-2xl border border-blue-400/30 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-300 to-blue-400 flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg">
                {student.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Welcome, {student.full_name.split(' ')[0]}!</h1>
              <p className="text-blue-100/90 text-sm font-medium mt-1">
                {student.roll_number} • {department?.name || 'N/A'} • Sem {student.semester} • Sec {student.section}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="pro-card bg-card stat-accent-emerald" data-testid="stat-attendance">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-3xl font-bold ${attendance_percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : attendance_percentage >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                  {attendance_percentage}%
                </p>
                <p className="text-sm text-muted-foreground font-semibold mt-2">Attendance</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pro-card bg-card stat-accent-blue" data-testid="stat-avg-marks">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{avg_marks}%</p>
                <p className="text-sm text-muted-foreground font-semibold mt-2">Avg Marks</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/40 group-hover:scale-110 transition-transform">
                <FileBarChart className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pro-card bg-card stat-accent-amber" data-testid="stat-subjects">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{total_subjects}</p>
                <p className="text-sm text-muted-foreground font-semibold mt-2">Subjects</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/40 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pro-card bg-card stat-accent-red" data-testid="stat-complaints">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{complaints?.length || 0}</p>
                <p className="text-sm text-muted-foreground font-semibold mt-2">Complaints</p>
              </div>
              <div className="p-3 rounded-lg bg-rose-100 dark:bg-rose-900/40 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-rose-600 dark:text-rose-400" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Marks */}
        <Card className="pro-card bg-card overflow-hidden shadow-md">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <FileBarChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Recent Marks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {marks.length === 0 ? (
              <div className="text-center py-8">
                <FileBarChart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No marks available yet</p>
              </div>
            ) : (
              <Table className="pro-table">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-xs text-slate-900 dark:text-slate-100">Subject</TableHead>
                    <TableHead className="font-bold text-xs text-slate-900 dark:text-slate-100">Total</TableHead>
                    <TableHead className="font-bold text-xs text-slate-900 dark:text-slate-100">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marks.slice(0, 5).map(m => (
                    <TableRow key={m.subject_id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
                      <TableCell className="text-sm font-semibold">{m.subject_name || '-'}</TableCell>
                      <TableCell className="text-sm font-bold text-blue-600 dark:text-blue-400">{m.total}/100</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white text-[10px] font-bold">{m.grade}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Latest Notices */}
        <Card className="pro-card bg-card overflow-hidden shadow-md">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40">
                <Megaphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              Latest Notices
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {notices.length === 0 ? (
              <div className="text-center py-8">
                <Megaphone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notices posted</p>
              </div>
            ) : (
              notices.map(n => {
                const highPriority = n.priority === 'high';
                const mediumPriority = n.priority === 'medium';
                return (
                  <div key={n.id} className="group relative p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-all duration-300 hover:shadow-md">
                    <div className={`h-1 absolute top-0 left-0 right-0 rounded-t-lg ${highPriority ? 'bg-rose-500' : mediumPriority ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{n.title}</p>
                      </div>
                      <Badge className={`shrink-0 text-[10px] font-bold text-white ${highPriority ? 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800' : mediumPriority ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800' : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800'}`}>
                        {n.priority?.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{n.date} • {n.posted_by}</p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
