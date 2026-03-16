
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const emptyForm = { name: '', code: '', head_faculty_id: '', description: '' };

export default function DepartmentManagement() {
  const { user } = useAuth();
  const location = useLocation();
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const isAdmin = user?.role === 'admin';

  const fetchData = async () => {
    try {
      const [dRes, fRes] = await Promise.all([api.get('/departments'), api.get('/faculty')]);
      setDepartments(dRes.data.departments);
      setFaculty(fRes.data.faculty);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Auto-open detail when navigated from search results
  useEffect(() => {
    if (location.state?.searchItemId && departments.length > 0) {
      const found = departments.find(d => d.id === location.state.searchItemId);
      if (found) {
        openEdit(found);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state?.searchItemId, departments]);

  const facName = (id) => faculty.find(f => f.id === id)?.name || '-';

  const openAdd = () => { setForm(emptyForm); setEditId(null); setDialogOpen(true); };
  const openEdit = (d) => {
    setForm({ name: d.name, code: d.code, head_faculty_id: d.head_faculty_id || '', description: d.description || '' });
    setEditId(d.id); setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) { toast.error('Name and Code are required'); return; }
    setSaving(true);
    try {
      if (editId) { await api.put(`/departments/${editId}`, form); toast.success('Department updated'); }
      else { await api.post('/departments', form); toast.success('Department added'); }
      setDialogOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try { await api.delete(`/departments/${id}`); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="department-management">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-500/20 backdrop-blur-md rounded-lg border border-indigo-400/30">
              <Building2 className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Departments</h1>
              <p className="text-indigo-200 text-sm font-medium mt-1">Manage all academic departments effectively</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm font-medium text-muted-foreground">{departments.length} departments</p>
        {isAdmin && (
          <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="add-dept-btn"><Plus className="w-4 h-4 mr-2" /> Add Department</Button>
        )}
      </div>

      <Card className="rounded-xl border-border/50 overflow-hidden shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          ) : departments.length === 0 ? (
            <div className="text-center py-12"><p className="text-muted-foreground">No departments found</p></div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-slate-100 dark:bg-slate-800 border-b">
                  <TableHead className="font-semibold text-xs">Name</TableHead>
                  <TableHead className="font-semibold text-xs">Code</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Head of Department</TableHead>
                  <TableHead className="font-semibold text-xs hidden lg:table-cell">Description</TableHead>
                  {isAdmin && <TableHead className="font-semibold text-xs text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map(d => (
                  <TableRow key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors" data-testid={`dept-row-${d.id}`}>
                    <TableCell className="font-medium text-sm">{d.name}</TableCell>
                    <TableCell className="text-sm"><Badge className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-950/50">{d.code}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{facName(d.head_faculty_id)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground truncate max-w-xs">{d.description || '-'}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:text-blue-600" onClick={() => openEdit(d)} data-testid={`edit-dept-${d.id}`}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-600" onClick={() => handleDelete(d.id)} data-testid={`delete-dept-${d.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="dept-form-dialog" className="rounded-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-bold">{editId ? 'Edit Department' : 'Add Department'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label className="font-semibold">Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Enter department name" className="rounded-lg" data-testid="dept-form-name" /></div>
            <div className="space-y-2"><Label className="font-semibold">Code *</Label><Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="e.g. CS, ECE, ME" className="rounded-lg" data-testid="dept-form-code" /></div>
            <div className="space-y-2"><Label className="font-semibold">Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Enter department description" className="rounded-lg" data-testid="dept-form-desc" /></div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg" data-testid="save-dept-btn">{saving ? 'Saving...' : editId ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
