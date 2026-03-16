import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Megaphone, Plus, Trash2, CalendarDays, User, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function NoticeBoard() {
  const { user } = useAuth();
  const location = useLocation();
  const highlightRef = useRef(null);
  const [highlightId, setHighlightId] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', audience: 'all' });
  const [saving, setSaving] = useState(false);
  const canPost = ['admin', 'faculty'].includes(user?.role);

  const fetchNotices = () => {
    api.get('/notices').then(r => setNotices(r.data.notices)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };
  useEffect(() => { fetchNotices(); }, []);

  // Auto-highlight & scroll when navigated from search results
  useEffect(() => {
    if (location.state?.searchItemId && notices.length > 0) {
      setHighlightId(location.state.searchItemId);
      window.history.replaceState({}, document.title);
      setTimeout(() => {
        if (highlightRef.current) {
          highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [location.state?.searchItemId, notices]);

  const handlePost = async () => {
    if (!form.title || !form.description) { toast.error('Title and description required'); return; }
    setSaving(true);
    try {
      await api.post('/notices', form);
      toast.success('Notice posted');
      setDialogOpen(false);
      setForm({ title: '', description: '', priority: 'medium', audience: 'all' });
      fetchNotices();
    } catch { toast.error('Failed to post'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try { await api.delete(`/notices/${id}`); toast.success('Deleted'); fetchNotices(); }
    catch { toast.error('Failed'); }
  };

  const priorityColor = (p) => {
    if (p === 'high') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200';
    if (p === 'medium') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200';
  };

  const highPriorityCount = notices.filter(n => n.priority === 'high').length;
  const recentNotices = notices.slice(0, 5).length;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="notice-board">
      <div className="hero-banner bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-500 rounded-full mix-blend-multiply blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-2xl bg-purple-600/30 backdrop-blur-xl border border-purple-400/30">
                  <Megaphone className="w-6 h-6 text-purple-200" strokeWidth={1.5} />
                </div>
                <h1 className="text-4xl font-bold">Notice Board</h1>
              </div>
              <p className="text-purple-100 leading-relaxed">Stay updated with important announcements and notifications</p>
            </div>
            {canPost && (
              <Button onClick={() => setDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2" data-testid="post-notice-btn">
                <Plus className="w-4 h-4" /> Post Notice
              </Button>
            )}
          </div>
        </div>
      </div>

      {!loading && notices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-xl border-border/50 overflow-hidden group hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-purple-600">{notices.length}</p>
                  <p className="text-sm text-muted-foreground font-medium mt-2">Total Notices</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-950/30">
                  <Megaphone className="w-6 h-6 text-purple-600" strokeWidth={1.5} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/50 overflow-hidden group hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-rose-600">{highPriorityCount}</p>
                  <p className="text-sm text-muted-foreground font-medium mt-2">High Priority</p>
                </div>
                <div className="p-3 rounded-lg bg-rose-100 dark:bg-rose-950/30">
                  <AlertCircle className="w-6 h-6 text-rose-600" strokeWidth={1.5} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/50 overflow-hidden group hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-blue-600">{recentNotices}</p>
                  <p className="text-sm text-muted-foreground font-medium mt-2">Recent Notices</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                  <Clock className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">All Notices</h2>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
        ) : notices.length === 0 ? (
          <Card className="rounded-xl border-border/50"><CardContent className="p-12 text-center">
            <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No notices posted yet</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-4">
          {notices.map(n => (
            <Card key={n.id} ref={highlightId === n.id ? highlightRef : null} className={`rounded-xl border-border/50 overflow-hidden hover:shadow-lg transition-all group ${highlightId === n.id ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`} data-testid={`notice-card-${n.id}`}>
              <div className={`h-1 ${n.priority === 'high' ? 'bg-rose-600' : n.priority === 'medium' ? 'bg-amber-600' : 'bg-emerald-600'}`}></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-purple-600 transition-colors">{n.title}</h3>
                      <Badge className={`text-[10px] font-semibold ${priorityColor(n.priority)}`}>{n.priority.toUpperCase()}</Badge>
                      <Badge className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 text-[10px] font-semibold capitalize">{n.audience}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{n.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-purple-600" /> {n.posted_by}</span>
                      <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-purple-600" /> {n.date}</span>
                    </div>
                  </div>
                  {canPost && (
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30 rounded-lg shrink-0 transition-colors" onClick={() => handleDelete(n.id)} data-testid={`delete-notice-${n.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-xl" data-testid="notice-form-dialog">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/30">
                  <Megaphone className="w-4 h-4 text-purple-600" />
                </div>
                Post New Notice
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700 dark:text-slate-300">Title <span className="text-purple-600">*</span></Label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Enter notice title" className="rounded-lg border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500" data-testid="notice-form-title" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700 dark:text-slate-300">Description <span className="text-purple-600">*</span></Label>
              <Textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Enter notice description" className="rounded-lg border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500" data-testid="notice-form-desc" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-slate-700 dark:text-slate-300">Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                  <SelectTrigger className="rounded-lg border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500" data-testid="notice-form-priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-slate-700 dark:text-slate-300">Audience</Label>
                <Select value={form.audience} onValueChange={v => setForm({...form, audience: v})}>
                  <SelectTrigger className="rounded-lg border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500" data-testid="notice-form-audience"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="faculty">Faculty Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg">Cancel</Button>
            <Button onClick={handlePost} disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg" data-testid="submit-notice-btn">{saving ? 'Posting...' : 'Post Notice'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
