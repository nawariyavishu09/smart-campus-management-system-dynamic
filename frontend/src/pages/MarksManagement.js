import { useState, useEffect } from "react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileBarChart, Plus, BarChart3, TrendingUp, Award, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MarksManagement() {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formStudent, setFormStudent] = useState("");
  const [form, setForm] = useState({ internal_marks: 0, practical_marks: 0, final_marks: 0 });
  const [saving, setSaving] = useState(false);
  const [studentMarks, setStudentMarks] = useState([]);

  const canEdit = ["admin", "faculty"].includes(user?.role);

  useEffect(() => {
    api.get("/subjects").then((r) => setSubjects(r.data.subjects || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.role === "student") {
      api.get("/marks").then((r) => setStudentMarks(r.data.marks || [])).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!selectedSubject) return;
    const subj = subjects.find((s) => String(s.id) === String(selectedSubject));
    if (!subj) return;

    Promise.all([
      api.get("/students", { params: { department_id: subj.department_id, limit: 100 } }),
      api.get("/marks", { params: { subject_id: selectedSubject } }),
    ])
      .then(([sRes, mRes]) => {
        setStudents(sRes.data.students || []);
        setMarks(mRes.data.marks || []);
      })
      .catch(() => {});
  }, [selectedSubject, subjects]);

  const getMarks = (studentId) => marks.find((m) => m.student_id === studentId);

  const openEntry = (studentId) => {
    const existing = getMarks(studentId);
    setFormStudent(studentId);
    setForm({
      internal_marks: existing?.internal_marks || 0,
      practical_marks: existing?.practical_marks || 0,
      final_marks: existing?.final_marks || 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (form.internal_marks > 30) {
      toast.error("Internal marks cannot be more than 30");
      return;
    }
    if (form.practical_marks > 20) {
      toast.error("Practical marks cannot be more than 20");
      return;
    }
    if (form.final_marks > 50) {
      toast.error("Final marks cannot be more than 50");
      return;
    }

    setSaving(true);
    try {
      await api.post("/marks", {
        student_id: formStudent,
        subject_id: selectedSubject,
        ...form,
      });
      toast.success("Marks saved successfully");
      setDialogOpen(false);

      const mRes = await api.get("/marks", { params: { subject_id: selectedSubject } });
      setMarks(mRes.data.marks || []);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const gradeClass = (grade) => {
    if (["O"].includes(grade)) return "grade-O";
    if (["A+", "A"].includes(grade)) return "grade-A";
    if (["B+", "B"].includes(grade)) return "grade-B";
    if (["C"].includes(grade)) return "grade-C";
    if (["D"].includes(grade)) return "grade-D";
    return "grade-F";
  };

  if (user?.role === "student") {
    const subjectMap = {};
    subjects.forEach((s) => {
      subjectMap[s.id] = s;
    });

    const passCount = studentMarks.filter((m) => m.result_status === "Pass").length;
    const avgPercentage =
      studentMarks.length > 0
        ? (studentMarks.reduce((sum, m) => sum + (m.total || 0), 0) / studentMarks.length).toFixed(1)
        : "0.0";

    return (
      <div className="space-y-6 animate-fade-in" data-testid="marks-management-student">
        <div className="hero-banner bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900">
          <div className="grid-pattern" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-blue-300" />
              </span>
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Academic Performance</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-1">My Results</h1>
            <p className="text-slate-400 text-sm">View grades, marks and pass status by subject</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="pro-card bg-card stat-accent-blue p-5 flex items-center justify-between">
            <div>
              <p className="text-2xl font-black">{studentMarks.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Subjects</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div className="pro-card bg-card stat-accent-emerald p-5 flex items-center justify-between">
            <div>
              <p className="text-2xl font-black">{passCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Passed</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          <div className="pro-card bg-card stat-accent-amber p-5 flex items-center justify-between">
            <div>
              <p className="text-2xl font-black">{avgPercentage}%</p>
              <p className="text-xs text-muted-foreground font-medium">Average</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="pro-card bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40">
            <h3 className="font-bold text-sm">Detailed Results</h3>
          </div>

          {studentMarks.length === 0 ? (
            <div className="p-16 text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No results available yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full pro-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th className="text-center">Internal</th>
                    <th className="text-center">Practical</th>
                    <th className="text-center">Final</th>
                    <th className="text-center">Total</th>
                    <th className="text-center">Grade</th>
                    <th className="text-center">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {studentMarks.map((m) => (
                    <tr key={m.id || m.subject_id}>
                      <td className="font-semibold">{m.subject_name || subjectMap[m.subject_id]?.name || "-"}</td>
                      <td className="text-center">{m.internal_marks}</td>
                      <td className="text-center">{m.practical_marks}</td>
                      <td className="text-center">{m.final_marks}</td>
                      <td className="text-center font-black text-blue-600">{m.total}</td>
                      <td className="text-center"><Badge className={`${gradeClass(m.grade)} border-0`}>{m.grade}</Badge></td>
                      <td className="text-center">
                        <Badge className={`border-0 ${m.result_status === "Pass" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                          {m.result_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="marks-management">
      <div className="hero-banner bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900">
        <div className="grid-pattern" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-400/30 flex items-center justify-center">
              <FileBarChart className="w-4 h-4 text-rose-300" />
            </span>
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Marks Management</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">Subject Marks Entry</h1>
          <p className="text-slate-400 text-sm">Enter, update and track student marks for each subject</p>
        </div>
      </div>

      <div className="pro-card bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <h3 className="font-bold text-sm">Select Subject</h3>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="sm:w-[320px] rounded-xl h-9">
              <SelectValue placeholder="Choose a subject to manage marks" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedSubject ? (
          <div className="p-16 text-center">
            <FileBarChart className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Select a subject to continue</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-muted-foreground font-medium">No students found in this department</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full pro-table">
              <thead>
                <tr>
                  <th className="text-center">#</th>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th className="text-center">Internal</th>
                  <th className="text-center">Practical</th>
                  <th className="text-center">Final</th>
                  <th className="text-center">Total</th>
                  <th className="text-center">Grade</th>
                  {canEdit && <th className="text-center">Action</th>}
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => {
                  const m = getMarks(s.id);
                  return (
                    <tr key={s.id}>
                      <td className="text-center">{idx + 1}</td>
                      <td className="font-semibold">{s.full_name}</td>
                      <td><Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg border-0 text-[11px]">{s.roll_number}</Badge></td>
                      <td className="text-center">{m?.internal_marks ?? "-"}</td>
                      <td className="text-center">{m?.practical_marks ?? "-"}</td>
                      <td className="text-center">{m?.final_marks ?? "-"}</td>
                      <td className="text-center font-black text-rose-600">{m?.total ?? "-"}</td>
                      <td className="text-center">{m ? <Badge className={`${gradeClass(m.grade)} border-0`}>{m.grade}</Badge> : <span className="text-muted-foreground">-</span>}</td>
                      {canEdit && (
                        <td className="text-center">
                          <Button size="sm" className={m ? "bg-blue-600 hover:bg-blue-700 text-white rounded-lg" : "bg-rose-600 hover:bg-rose-700 text-white rounded-lg"} onClick={() => openEntry(s.id)}>
                            <Plus className="w-3 h-3 mr-1" />
                            {m ? "Edit" : "Enter"}
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl" data-testid="marks-entry-dialog">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <FileBarChart className="w-4 h-4 text-rose-600" />
              </span>
              Enter Marks
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Internal Marks (max 30)</Label>
              <Input type="number" min={0} max={30} value={form.internal_marks} onChange={(e) => setForm({ ...form, internal_marks: parseFloat(e.target.value) || 0 })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Practical Marks (max 20)</Label>
              <Input type="number" min={0} max={20} value={form.practical_marks} onChange={(e) => setForm({ ...form, practical_marks: parseFloat(e.target.value) || 0 })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Final Marks (max 50)</Label>
              <Input type="number" min={0} max={50} value={form.final_marks} onChange={(e) => setForm({ ...form, final_marks: parseFloat(e.target.value) || 0 })} className="rounded-xl" />
            </div>
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40">
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Total: {(form.internal_marks + form.practical_marks + form.final_marks).toFixed(1)} / 100</p>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-5">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Marks"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
