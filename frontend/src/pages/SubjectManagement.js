import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, BookOpen, BookMarked, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const emptyForm = { name: '', code: '', department_id: '', semester: 1, credits: 3 };

export default function SubjectManagement() {
  const { user } = useAuth();
  const location = useLocation();
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const isAdmin = user?.role === 'admin';

  const fetchData = async () => {
    try {
      const [sRes, dRes] = await Promise.all([api.get('/subjects'), api.get('/departments')]);
      setSubjects(sRes.data.subjects); setDepartments(dRes.data.departments);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  // Auto-open detail when navigated from search results
  useEffect(() => {
    if (location.state?.searchItemId && subjects.length > 0) {
      const found = subjects.find(s => s.id === location.state.searchItemId);
      if (found) {
        openEdit(found);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state?.searchItemId, subjects]);

  const deptName = (id) => departments.find(d => d.id === id)?.name || '-';

  const openAdd = () => { setForm(emptyForm); setEditId(null); setDialogOpen(true); };
  const openEdit = (s) => {
    setForm({ name: s.name, code: s.code, department_id: s.department_id || '', semester: s.semester || 1, credits: s.credits || 3 });
    setEditId(s.id); setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) { toast.error('Name and Code required'); return; }
    setSaving(true);
    try {
      if (editId) { await api.put(`/subjects/${editId}`, form); toast.success('Subject updated'); }
      else { await api.post('/subjects', form); toast.success('Subject added'); }
      setDialogOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try { await api.delete(`/subjects/${id}`); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); }
  };

  const avgCredits = subjects.length > 0 ? (subjects.reduce((sum, s) => sum + (s.credits || 0), 0) / subjects.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="subject-management">
      <div className="hero-banner bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, indigo, transparent 50%)'}}></div>
        <div className="relative z-10">
          <div className="p-3 rounded-2xl bg-indigo-600/30 backdrop-blur-xl border border-indigo-400/30 w-fit mb-4">
            <BookOpen className="w-6 h-6 text-indigo-200" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold mb-2">Subject Management</h1>
          <p className="text-indigo-100/80">Organize and manage all academic subjects across departments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-xl border-border/50 overflow-hidden bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Subjects</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{subjects.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                <BookMarked className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-border/50 overflow-hidden bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Departments</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{departments.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/40">
                <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-border/50 overflow-hidden bg-gradient-to-br from-cyan-50/50 to-transparent dark:from-cyan-950/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg. Credits</p>
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{avgCredits}</p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-100 dark:bg-cyan-900/40">
                <BookOpen className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        {isAdmin && (
          <Button onClick={openAdd} className="rounded-xl h-auto py-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg" data-testid="add-subject-btn">
            <div className="flex flex-col items-center gap-2">
              <Plus className="w-5 h-5" />
              <span className="text-sm font-semibold">Add Subject</span>
            </div>
          </Button>
        )}
      </div>

      <Card className="pro-card bg-card shadow-md">
        <CardContent className="p-6">
          {loading ? <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div> : subjects.length === 0 ? (
            <div className="text-center py-12"><p className="text-muted-foreground">No subjects found</p></div>
          ) : (
            <Table className="pro-table">
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-slate-900/5 dark:bg-slate-700/20">
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100">Subject</TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100">Code</TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100 hidden md:table-cell">Department</TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100">Semester</TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100 hidden lg:table-cell">Credits</TableHead>
                  {isAdmin && <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map(s => (
                  <TableRow key={s.id} className="odd:bg-muted/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors" data-testid={`subject-row-${s.id}`}>
                    <TableCell className="font-semibold">{s.name}</TableCell>
                    <TableCell><Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60">{s.code}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell">{deptName(s.department_id)}</TableCell>
                    <TableCell className="text-sm font-medium"><Badge variant="outline" className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30">Sem {s.semester}</Badge></TableCell>
                    <TableCell className="hidden lg:table-cell"><Badge variant="secondary" className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">{s.credits} Credits</Badge></TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="subject-form-dialog">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <DialogTitle className="text-xl">{editId ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label className="font-semibold">Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="rounded-lg focus:ring-indigo-500 focus:ring-2 focus:ring-offset-0" data-testid="subj-form-name" /></div>
            <div className="space-y-2"><Label className="font-semibold">Code *</Label><Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="rounded-lg focus:ring-indigo-500 focus:ring-2 focus:ring-offset-0" data-testid="subj-form-code" /></div>
            <div className="space-y-2">
              <Label className="font-semibold">Department</Label>
              <Select value={form.department_id} onValueChange={v => setForm({...form, department_id: v})}>
                <SelectTrigger className="rounded-lg focus:ring-indigo-500"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="font-semibold">Semester</Label><Input type="number" min={1} max={8} value={form.semester} onChange={e => setForm({...form, semester: parseInt(e.target.value) || 1})} className="rounded-lg focus:ring-indigo-500 focus:ring-2 focus:ring-offset-0" /></div>
              <div className="space-y-2"><Label className="font-semibold">Credits</Label><Input type="number" min={1} max={6} value={form.credits} onChange={e => setForm({...form, credits: parseInt(e.target.value) || 3})} className="rounded-lg focus:ring-indigo-500 focus:ring-2 focus:ring-offset-0" /></div>
            </div>
          </div>
          <DialogFooter className="mt-6 gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg" data-testid="save-subject-btn">{saving ? 'Saving...' : editId ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
