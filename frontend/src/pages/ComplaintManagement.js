import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Plus, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ComplaintManagement() {
  const { user } = useAuth();
  const location = useLocation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [updateForm, setUpdateForm] = useState({ status: '', remarks: '' });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const fetchComplaints = () => {
    const params = {};
    if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
    api.get('/complaints', { params }).then(r => setComplaints(r.data.complaints)).catch(() => {}).finally(() => setLoading(false));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchComplaints(); }, [filterStatus]);

  // Auto-open detail modal when search result clicked
  useEffect(() => {
    if (location.state?.searchItemId && !loading && complaints.length > 0) {
      console.log('Auto-opening complaint:', location.state.searchItemId);
      const complaint = complaints.find(c => c.id === location.state.searchItemId);
      console.log('Found complaint:', complaint);
      if (complaint) {
        openUpdate(complaint);
        // Clear the state to prevent reopening on page refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state?.searchItemId, complaints, loading]);

  const handleSubmit = async () => {
    if (!form.title || !form.description) { toast.error('Title and description required'); return; }
    setSaving(true);
    try {
      await api.post('/complaints', form);
      toast.success('Complaint submitted');
      setDialogOpen(false);
      setForm({ title: '', description: '' });
      fetchComplaints();
    } catch { toast.error('Failed to submit'); }
    finally { setSaving(false); }
  };

  const openUpdate = (c) => {
    setSelectedComplaint(c);
    setUpdateForm({ status: c.status, remarks: c.remarks || '' });
    setUpdateOpen(true);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`/complaints/${selectedComplaint.id}`, updateForm);
      toast.success('Complaint updated');
      setUpdateOpen(false);
      fetchComplaints();
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const statusConfig = {
    pending: { label: 'Pending' },
    in_progress: { label: 'In Progress' },
    resolved: { label: 'Resolved' },
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="complaint-management">
      {/* Hero Header */}
      <div className="hero-banner bg-gradient-to-r from-slate-900 via-red-950 to-slate-900">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-500/20 backdrop-blur-md rounded-lg border border-red-400/30">
              <MessageSquare className="w-8 h-8 text-red-300" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Complaints & Helpdesk</h1>
              <p className="text-red-200 text-sm font-medium mt-1">Manage and resolve student complaints efficiently</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm font-medium text-muted-foreground">{complaints.length} total complaints</p>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40" data-testid="complaint-status-filter"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          {isStudent && (
            <Button onClick={() => setDialogOpen(true)} className="bg-red-600 hover:bg-red-700 text-white" data-testid="submit-complaint-btn">
              <Plus className="w-4 h-4 mr-2" /> New Complaint
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : complaints.length === 0 ? (
        <Card className="rounded-xl border-border/50"><CardContent className="p-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No complaints found</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {complaints.map(c => {
            const cfg = statusConfig[c.status] || statusConfig.pending;
            return (
              <Card key={c.id} className="rounded-xl border-border/50 overflow-hidden hover:shadow-lg transition-shadow" data-testid={`complaint-card-${c.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">{c.title}</h3>
                        <Badge className={`text-[10px] font-semibold ${
                          c.status === 'resolved' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                          c.status === 'in_progress' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                          'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}>
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                        <span>From: {c.student_name}</span>
                        <span>•</span>
                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      {c.remarks && (
                        <div className="mt-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Admin Remarks:</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{c.remarks}</p>
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <Button size="sm" variant="outline" className="shrink-0 text-xs h-8 rounded-lg border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => openUpdate(c)} data-testid={`update-complaint-${c.id}`}>
                        Update
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Complaint Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="complaint-form-dialog">
          <DialogHeader><DialogTitle>Submit Complaint</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} data-testid="complaint-form-title" /></div>
            <div className="space-y-2"><Label>Description *</Label><Textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} data-testid="complaint-form-desc" /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving} className="bg-primary" data-testid="submit-complaint-form-btn">{saving ? 'Submitting...' : 'Submit'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent data-testid="complaint-update-dialog">
          <DialogHeader><DialogTitle>Update Complaint Status</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={updateForm.status} onValueChange={v => setUpdateForm({...updateForm, status: v})}>
                <SelectTrigger data-testid="update-status-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Remarks</Label><Textarea rows={3} value={updateForm.remarks} onChange={e => setUpdateForm({...updateForm, remarks: e.target.value})} data-testid="update-remarks" /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setUpdateOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={saving} className="bg-primary" data-testid="update-complaint-btn">{saving ? 'Updating...' : 'Update'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
