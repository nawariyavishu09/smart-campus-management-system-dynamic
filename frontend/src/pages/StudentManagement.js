import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { Plus, Search, Pencil, Trash2, Eye, X, Users, BookOpen, CheckCircle, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const emptyForm = {
  full_name: '', roll_number: '', enrollment_number: '', email: '', phone: '',
  gender: 'Male', date_of_birth: '', address: '', department_id: '', semester: 1,
  section: 'A', admission_date: '', status: 'active',
};

export default function StudentManagement() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filterDept, setFilterDept] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterDept && filterDept !== 'all') params.department_id = filterDept;
      const res = await api.get('/students', { params });
      setStudents(res.data.students);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  }, [search, filterDept]);

  useEffect(() => {
    api.get('/departments').then((r) => setDepartments(r.data.departments)).catch(() => {});
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const deptName = (id) => departments.find((d) => d.id === id)?.name || '-';

  const openAdd = () => { setForm(emptyForm); setEditId(null); setDialogOpen(true); };
  const openEdit = (s) => {
    setForm({ full_name: s.full_name, roll_number: s.roll_number, enrollment_number: s.enrollment_number || '',
      email: s.email, phone: s.phone || '', gender: s.gender || 'Male', date_of_birth: s.date_of_birth || '',
      address: s.address || '', department_id: s.department_id || '', semester: s.semester || 1,
      section: s.section || 'A', admission_date: s.admission_date || '', status: s.status || 'active' });
    setEditId(s.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.roll_number || !form.email) {
      toast.error('Name, roll number and email are required');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/students/${editId}`, form);
        toast.success('Student updated');
      } else {
        await api.post('/students', form);
        toast.success('Student added');
      }
      setDialogOpen(false);
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.detail || 'Operation failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student? This action cannot be undone.')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch { toast.error('Delete failed'); }
  };

  const isAdmin = user?.role === 'admin';

  const activeStudents = students.filter(s => s.status === 'active').length;
  const deptCount = new Set(students.map(s => s.department_id)).size;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="student-management">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, blue, transparent 50%)'}}></div>
        <div className="relative z-10">
          <div className="p-3 rounded-2xl bg-blue-600/30 backdrop-blur-xl border border-blue-400/30 w-fit mb-4">
            <Users className="w-6 h-6 text-blue-200" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold mb-2">Student Management</h1>
          <p className="text-blue-100/80">Manage and track all student information across the campus</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-xl border-border/50 overflow-hidden bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{students.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-border/50 overflow-hidden bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Students</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{activeStudents}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-border/50 overflow-hidden bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Departments</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{deptCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        {isAdmin && (
          <Button onClick={openAdd} className="rounded-xl h-auto py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg" data-testid="add-student-btn">
            <div className="flex flex-col items-center gap-2">
              <Plus className="w-5 h-5" />
              <span className="text-sm font-semibold">Add Student</span>
            </div>
          </Button>
        )}
      </div>

      <Card className="rounded-xl border-border/50 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name, roll no, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-lg focus:ring-blue-500" data-testid="student-search" />
            </div>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-full sm:w-48 rounded-lg" data-testid="dept-filter">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          ) : students.length === 0 ? (
            <div className="text-center py-12"><p className="text-muted-foreground">No students found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-slate-900/5 dark:bg-slate-700/20">
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100">Name</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100">Roll No</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100 hidden md:table-cell">Department</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100 hidden lg:table-cell">Semester</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100 hidden lg:table-cell">Section</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100">Status</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id} className="odd:bg-muted/30 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors" data-testid={`student-row-${s.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm">{s.full_name}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm"><Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60">{s.roll_number}</Badge></TableCell>
                      <TableCell className="text-sm hidden md:table-cell">{deptName(s.department_id)}</TableCell>
                      <TableCell className="text-sm hidden lg:table-cell">{s.semester}</TableCell>
                      <TableCell className="text-sm hidden lg:table-cell">{s.section}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === 'active' ? 'default' : 'secondary'} className={`text-[10px] ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}`}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setViewStudent(s); setViewOpen(true); }} data-testid={`view-student-${s.id}`}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)} data-testid={`edit-student-${s.id}`}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(s.id)} data-testid={`delete-student-${s.id}`}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="student-form-dialog">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <DialogTitle className="text-xl">{editId ? 'Edit Student' : 'Add New Student'}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="rounded-lg focus:ring-blue-500 focus:ring-2 focus:ring-offset-0" data-testid="form-fullname" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Roll Number *</Label>
              <Input value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} className="rounded-lg focus:ring-blue-500 focus:ring-2 focus:ring-offset-0" data-testid="form-rollno" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Enrollment No</Label>
              <Input value={form.enrollment_number} onChange={(e) => setForm({ ...form, enrollment_number: e.target.value })} className="rounded-lg focus:ring-blue-500 focus:ring-2 focus:ring-offset-0" data-testid="form-enrollment" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg focus:ring-blue-500 focus:ring-2 focus:ring-offset-0" data-testid="form-email" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-lg focus:ring-blue-500 focus:ring-2 focus:ring-offset-0" data-testid="form-phone" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger className="rounded-lg focus:ring-blue-500" data-testid="form-gender"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Date of Birth</Label>
              <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="rounded-lg focus:ring-blue-500 focus:ring-2 focus:ring-offset-0" data-testid="form-dob" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Department</Label>
              <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                <SelectTrigger className="rounded-lg focus:ring-blue-500" data-testid="form-department"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Semester</Label>
              <Select value={String(form.semester)} onValueChange={(v) => setForm({ ...form, semester: parseInt(v) })}>
                <SelectTrigger className="rounded-lg focus:ring-blue-500" data-testid="form-semester"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8].map((s) => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Section</Label>
              <Select value={form.section} onValueChange={(v) => setForm({ ...form, section: v })}>
                <SelectTrigger className="rounded-lg focus:ring-blue-500" data-testid="form-section"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['A','B','C','D'].map((s) => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Admission Date</Label>
              <Input type="date" value={form.admission_date} onChange={(e) => setForm({ ...form, admission_date: e.target.value })} className="rounded-lg focus:ring-blue-500 focus:ring-2 focus:ring-offset-0" data-testid="form-admission" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="rounded-lg focus:ring-blue-500" data-testid="form-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="font-semibold">Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-lg focus:ring-blue-500 focus:ring-2 focus:ring-offset-0" data-testid="form-address" />
            </div>
          </div>
          <DialogFooter className="mt-6 gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg" data-testid="save-student-btn">
              {saving ? 'Saving...' : editId ? 'Update Student' : 'Add Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg" data-testid="student-view-dialog">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <DialogTitle className="text-xl">Student Profile</DialogTitle>
            </div>
          </DialogHeader>
          {viewStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/40">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {viewStudent.full_name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div>
                  <p className="font-bold text-lg text-slate-900 dark:text-white">{viewStudent.full_name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{viewStudent.roll_number} &middot; {viewStudent.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Enrollment', viewStudent.enrollment_number],
                  ['Phone', viewStudent.phone],
                  ['Gender', viewStudent.gender],
                  ['DOB', viewStudent.date_of_birth],
                  ['Department', deptName(viewStudent.department_id)],
                  ['Semester', viewStudent.semester],
                  ['Section', viewStudent.section],
                  ['Status', viewStudent.status],
                  ['Admission', viewStudent.admission_date],
                  ['Address', viewStudent.address],
                ].map(([label, val]) => (
                  <div key={label} className="px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{val || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
