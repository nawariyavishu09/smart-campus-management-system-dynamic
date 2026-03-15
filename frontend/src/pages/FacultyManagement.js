
import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Pencil, Trash2, Users, GraduationCap, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const emptyForm = { name: '', faculty_id_number: '', department_id: '', designation: '', email: '', phone: '' };

export default function FacultyManagement() {
  const { user } = useAuth();
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchFaculty = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterDept && filterDept !== 'all') params.department_id = filterDept;
      const res = await api.get('/faculty', { params });
      setFaculty(res.data.faculty);
    } catch { toast.error('Failed to load faculty'); }
    finally { setLoading(false); }
  }, [search, filterDept]);

  useEffect(() => { api.get('/departments').then(r => setDepartments(r.data.departments)).catch(() => {}); }, []);
  useEffect(() => { fetchFaculty(); }, [fetchFaculty]);

  const deptName = (id) => departments.find(d => d.id === id)?.name || '-';
  const isAdmin = user?.role === 'admin';

  const openAdd = () => { setForm(emptyForm); setEditId(null); setDialogOpen(true); };
  const openEdit = (f) => {
    setForm({ name: f.name, faculty_id_number: f.faculty_id_number, department_id: f.department_id || '',
      designation: f.designation || '', email: f.email, phone: f.phone || '' });
    setEditId(f.id); setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.faculty_id_number || !form.email) {
      toast.error('Name, Faculty ID and Email are required'); return;
    }
    setSaving(true);
    try {
      if (editId) { await api.put(`/faculty/${editId}`, form); toast.success('Faculty updated'); }
      else { await api.post('/faculty', form); toast.success('Faculty added'); }
      setDialogOpen(false); fetchFaculty();
    } catch (err) { toast.error(err.response?.data?.detail || 'Operation failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this faculty member?')) return;
    try { await api.delete(`/faculty/${id}`); toast.success('Faculty deleted'); fetchFaculty(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="faculty-management">
      {/* Professional Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-500 rounded-full mix-blend-multiply blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-2xl bg-indigo-600/30 backdrop-blur-xl border border-indigo-400/30">
                  <Users className="w-6 h-6 text-indigo-200" strokeWidth={1.5} />
                </div>
                <h1 className="text-4xl font-bold">Faculty Management</h1>
              </div>
              <p className="text-indigo-100 leading-relaxed">Manage faculty members, departments, and designations across the institution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-xl border-border/50 overflow-hidden group hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-indigo-600">{faculty.length}</p>
                <p className="text-sm text-muted-foreground font-medium mt-2">Total Faculty</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-950/30">
                <Users className="w-6 h-6 text-indigo-600" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/50 overflow-hidden group hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-blue-600">{departments.length}</p>
                <p className="text-sm text-muted-foreground font-medium mt-2">Departments</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                <GraduationCap className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/50 overflow-hidden group hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-amber-600">{faculty.filter(f => f.designation === 'Professor').length}</p>
                <p className="text-sm text-muted-foreground font-medium mt-2">Professors</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-950/30">
                <Eye className="w-6 h-6 text-amber-600" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-border/50 overflow-hidden">
        <CardHeader className="pb-4 bg-slate-100 dark:bg-slate-800 border-b">
          <CardTitle className="text-base font-semibold">Faculty Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search faculty by name, ID, or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-lg" data-testid="faculty-search" />
            </div>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-full sm:w-48 rounded-lg" data-testid="faculty-dept-filter">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {isAdmin && (
              <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2" data-testid="add-faculty-btn">
                <Plus className="w-4 h-4" /> Add Faculty
              </Button>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          ) : faculty.length === 0 ? (
            <div className="text-center py-12"><p className="text-muted-foreground">No faculty found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Name</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Faculty ID</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300 hidden md:table-cell">Department</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300 hidden lg:table-cell">Designation</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300 hidden lg:table-cell">Phone</TableHead>
                    {isAdmin && <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faculty.map(f => (
                    <TableRow key={f.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors" data-testid={`faculty-row-${f.id}`}>
                      <TableCell>
                        <div><p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{f.name}</p><p className="text-xs text-muted-foreground">{f.email}</p></div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 text-[10px]">{f.faculty_id_number}</Badge>
                      </TableCell>
                      <TableCell className="text-sm hidden md:table-cell text-slate-600 dark:text-slate-300">{deptName(f.department_id)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 text-[10px]">{f.designation || '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-sm hidden lg:table-cell text-slate-600 dark:text-slate-300">{f.phone || '-'}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-950/30 rounded-lg transition-colors" onClick={() => openEdit(f)} data-testid={`edit-faculty-${f.id}`}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30 rounded-lg transition-colors" onClick={() => handleDelete(f.id)} data-testid={`delete-faculty-${f.id}`}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
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
        <DialogContent className="max-w-lg rounded-xl" data-testid="faculty-form-dialog">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/30">
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                {editId ? 'Edit Faculty Member' : 'Add New Faculty Member'}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} data-testid="fac-form-name" /></div>
            <div className="space-y-2"><Label>Faculty ID *</Label><Input value={form.faculty_id_number} onChange={e => setForm({...form, faculty_id_number: e.target.value})} data-testid="fac-form-id" /></div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} data-testid="fac-form-email" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} data-testid="fac-form-phone" /></div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={form.department_id} onValueChange={v => setForm({...form, department_id: v})}>
                <SelectTrigger data-testid="fac-form-dept"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Select value={form.designation} onValueChange={v => setForm({...form, designation: v})}>
                <SelectTrigger data-testid="fac-form-desig"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'HOD'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary" data-testid="save-faculty-btn">{saving ? 'Saving...' : editId ? 'Update' : 'Add Faculty'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
