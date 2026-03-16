import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, CalendarCheck, FileBarChart, MessageSquare, Download, BarChart3, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const reports = [
  { id: 'attendance', title: 'Attendance Report', description: 'Comprehensive attendance report by department, subject, and date range', icon: CalendarCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { id: 'students', title: 'Student Report', description: 'Complete student directory with enrollment details and status', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  { id: 'results', title: 'Results Report', description: 'Marks and grade distribution report by subject and semester', icon: FileBarChart, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { id: 'complaints', title: 'Complaints Report', description: 'Complaint status report with resolution metrics', icon: MessageSquare, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  { id: 'faculty', title: 'Faculty Report', description: 'Faculty listing with department and designation details', icon: FileText, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30' },
];

export default function Reports() {
  const handleExport = (reportId) => {
    toast.success(`${reportId.charAt(0).toUpperCase() + reportId.slice(1)} report export initiated`, {
      description: 'Report will be downloaded shortly (demo)'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="reports-page">
      {/* Professional Hero Header */}
      <div className="hero-banner bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900">
        <div className="grid-pattern" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-500 rounded-full mix-blend-multiply blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl bg-cyan-600/30 backdrop-blur-xl border border-cyan-400/30">
              <BarChart3 className="w-6 h-6 text-cyan-200" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-bold">Reports & Analytics</h1>
          </div>
          <p className="text-cyan-100 leading-relaxed">Generate comprehensive reports and export data in multiple formats</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="pro-card bg-card stat-accent-cyan">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-cyan-600">{reports.length}</p>
                <p className="text-sm text-muted-foreground font-medium mt-2">Report Types</p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-100 dark:bg-cyan-950/30">
                <FileBarChart className="w-6 h-6 text-cyan-600" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pro-card bg-card stat-accent-emerald">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-teal-600">2</p>
                <p className="text-sm text-muted-foreground font-medium mt-2">Export Formats</p>
              </div>
              <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-950/30">
                <Download className="w-6 h-6 text-teal-600" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Available Reports</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(r => (
            <Card key={r.id} className="pro-card bg-card overflow-hidden transition-all duration-200 group" data-testid={`report-card-${r.id}`}>
              <div className={`h-1 ${r.color.replace('text-', 'bg-')}`}></div>
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${r.bg} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                  <r.icon className={`w-6 h-6 ${r.color}`} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 group-hover:text-cyan-600 transition-colors">{r.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">{r.description}</p>
                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button size="sm" className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs h-9 font-semibold" onClick={() => handleExport(r.id)} data-testid={`export-pdf-${r.id}`}>
                    <Download className="w-3.5 h-3.5 mr-1.5" /> PDF
                  </Button>
                  <Button size="sm" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs h-9 font-semibold" onClick={() => handleExport(r.id)} data-testid={`export-csv-${r.id}`}>
                    <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="pro-card overflow-hidden bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyan-600" />
            <Badge className="bg-cyan-600 hover:bg-cyan-700 text-white">Demo Mode</Badge>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Report exports are in demo mode. In production, these would generate and download actual PDF/CSV files with real data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
