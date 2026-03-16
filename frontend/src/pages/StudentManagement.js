import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Eye, Users, BookOpen, CheckCircle, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const emptyForm = {
  full_name: "",
  roll_number: "",
  enrollment_number: "",
  email: "",
  phone: "",
  gender: "Male",
  date_of_birth: "",
  address: "",
  department_id: "",
  semester: 1,
  section: "A",
  admission_date: "",
  status: "active",
};

export default function StudentManagement() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filterDept, setFilterDept] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterDept && filterDept !== "all") params.department_id = filterDept;
      const res = await api.get("/students", { params });
      setStudents(res.data.students || []);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [search, filterDept]);

  useEffect(() => {
    api.get("/departments").then((r) => setDepartments(r.data.departments || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (location.state?.searchItemId && students.length > 0) {
      const student = students.find((s) => s.id === location.state.searchItemId);
      if (student) {
        setViewStudent(student);
        setViewOpen(true);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state?.searchItemId, students]);

  const deptName = (id) => departments.find((d) => d.id === id)?.name || "-";

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (s) => {
    setForm({
      full_name: s.full_name,
      roll_number: s.roll_number,
      enrollment_number: s.enrollment_number || "",
      email: s.email,
      phone: s.phone || "",
      gender: s.gender || "Male",
      date_of_birth: s.date_of_birth || "",
      address: s.address || "",
      department_id: s.department_id || "",
      semester: s.semester || 1,
      section: s.section || "A",
      admission_date: s.admission_date || "",
      status: s.status || "active",
    });
    setEditId(s.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.roll_number || !form.email) {
      toast.error("Name, roll number and email are required");
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        await api.put(`/students/${editId}`, form);
        toast.success("Student updated");
      } else {
        await api.post("/students", form);
        toast.success("Student added");
      }
      setDialogOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student? This action cannot be undone.")) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success("Student deleted");
      fetchStudents();
    } catch {
      toast.error("Delete failed");
    }
  };

  const isAdmin = user?.role === "admin";
  const activeStudents = students.filter((s) => s.status === "active").length;
  const deptCount = new Set(students.map((s) => s.department_id)).size;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="student-management">
      <div className="hero-banner bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900">
        <div className="grid-pattern" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-300" />
              </span>
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Student Management</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-1">All Students</h1>
            <p className="text-slate-400 text-sm">Manage and track student records across campus</p>
          </div>
          {isAdmin && (
            <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 shadow-lg shadow-blue-900/30 shrink-0" data-testid="add-student-btn-hero">
              <Plus className="w-4 h-4 mr-2" /> Add Student
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Students", val: students.length, icon: GraduationCap, bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400", accent: "stat-accent-blue" },
          { label: "Active", val: activeStudents, icon: CheckCircle, bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-600 dark:text-emerald-400", accent: "stat-accent-emerald" },
          { label: "Departments", val: deptCount, icon: BookOpen, bg: "bg-amber-100 dark:bg-amber-900/30", color: "text-amber-600 dark:text-amber-400", accent: "stat-accent-amber" },
        ].map(({ label, val, icon: Icon, bg, color, accent }) => (
          <div key={label} className={`pro-card bg-card ${accent}`}>
            <div className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-2xl font-black">{val}</p>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pro-card bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h3 className="font-bold text-sm">All Records</h3>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 rounded-xl w-full sm:w-52" data-testid="student-search" />
            </div>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-full sm:w-44 h-9 rounded-xl" data-testid="dept-filter">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {isAdmin && (
              <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-4 shrink-0" data-testid="add-student-btn">
                <Plus className="w-4 h-4 mr-1.5" /> Add
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted/40 animate-pulse" />)}</div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full pro-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th className="hidden md:table-cell">Department</th>
                  <th className="hidden lg:table-cell">Sem · Sec</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const avatarColors = ["bg-indigo-500", "bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];
                  const avatarColor = avatarColors[(s.full_name?.charCodeAt(0) || 0) % avatarColors.length];
                  const initials = s.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??";
                  return (
                    <tr key={s.id} data-testid={`student-row-${s.id}`}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${avatarColor} flex items-center justify-center text-white text-xs font-black shrink-0`}>{initials}</div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{s.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-mono text-[11px] rounded-lg border-0">{s.roll_number}</Badge></td>
                      <td className="hidden md:table-cell text-sm text-muted-foreground">{deptName(s.department_id)}</td>
                      <td className="hidden lg:table-cell text-sm text-muted-foreground">Sem {s.semester} · {s.section}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {s.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30" onClick={() => { setViewStudent(s); setViewOpen(true); }} data-testid={`view-student-${s.id}`}>
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30" onClick={() => openEdit(s)} data-testid={`edit-student-${s.id}`}>
                                <Pencil className="w-3.5 h-3.5 text-amber-600" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30" onClick={() => handleDelete(s.id)} data-testid={`delete-student-${s.id}`}>
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {students.length > 0 && !loading && (
          <div className="px-5 py-3 border-t border-border/40">
            <p className="text-xs text-muted-foreground">{students.length} student{students.length !== 1 ? "s" : ""}</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl" data-testid="student-form-dialog">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <DialogTitle className="text-xl font-black">{editId ? "Edit Student" : "Add New Student"}</DialogTitle>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full Name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="rounded-xl" data-testid="form-fullname" /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Roll Number *</Label><Input value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} className="rounded-xl" data-testid="form-rollno" /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Enrollment No</Label><Input value={form.enrollment_number} onChange={(e) => setForm({ ...form, enrollment_number: e.target.value })} className="rounded-xl" data-testid="form-enrollment" /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl" data-testid="form-email" /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl" data-testid="form-phone" /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gender</Label><Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}><SelectTrigger className="rounded-xl" data-testid="form-gender"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="rounded-xl" data-testid="form-dob" /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Department</Label><Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}><SelectTrigger className="rounded-xl" data-testid="form-department"><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Semester</Label><Select value={String(form.semester)} onValueChange={(v) => setForm({ ...form, semester: parseInt(v) })}><SelectTrigger className="rounded-xl" data-testid="form-semester"><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Section</Label><Select value={form.section} onValueChange={(v) => setForm({ ...form, section: v })}><SelectTrigger className="rounded-xl" data-testid="form-section"><SelectValue /></SelectTrigger><SelectContent>{["A", "B", "C", "D"].map((s) => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admission Date</Label><Input type="date" value={form.admission_date} onChange={(e) => setForm({ ...form, admission_date: e.target.value })} className="rounded-xl" data-testid="form-admission" /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger className="rounded-xl" data-testid="form-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="graduated">Graduated</SelectItem></SelectContent></Select></div>
            <div className="space-y-1.5 md:col-span-2"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-xl" data-testid="form-address" /></div>
          </div>

          <DialogFooter className="mt-6 gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 shadow-lg shadow-blue-600/20" data-testid="save-student-btn">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : editId ? "Update Student" : "Add Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg rounded-2xl" data-testid="student-view-dialog">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Student Profile</DialogTitle>
          </DialogHeader>
          {viewStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/40">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                  {viewStudent.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-xl">{viewStudent.full_name}</p>
                  <p className="text-sm text-muted-foreground font-medium">{viewStudent.roll_number}</p>
                  <p className="text-xs text-muted-foreground">{viewStudent.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Enrollment", viewStudent.enrollment_number],
                  ["Phone", viewStudent.phone],
                  ["Gender", viewStudent.gender],
                  ["Date of Birth", viewStudent.date_of_birth],
                  ["Department", deptName(viewStudent.department_id)],
                  ["Semester", viewStudent.semester ? `Sem ${viewStudent.semester}` : "-"],
                  ["Section", viewStudent.section],
                  ["Status", viewStudent.status],
                  ["Admission Date", viewStudent.admission_date],
                  ["Address", viewStudent.address],
                ].map(([label, val]) => (
                  <div key={label} className="px-4 py-3 rounded-xl bg-muted/40 border border-border/40">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                    <p className="font-semibold text-sm">{val || "-"}</p>
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
