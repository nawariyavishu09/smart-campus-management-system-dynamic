import { useState, useEffect } from "react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Save, Users, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AttendanceManagement() {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);

  const canMark = ["admin", "faculty"].includes(user?.role);

  useEffect(() => {
    api
      .get("/subjects")
      .then((res) => setSubjects(res.data.subjects || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;

    const subj = subjects.find((s) => String(s.id) === String(selectedSubject));
    if (!subj) return;

    api
      .get("/students", {
        params: {
          department_id: subj.department_id,
          limit: 100,
        },
      })
      .then((res) => {
        const list = res.data.students || [];
        setStudents(list);

        const initial = {};
        list.forEach((s) => {
          initial[s.id] = "present";
        });
        setAttendance(initial);
      })
      .catch(() => {});

    api
      .get("/attendance", {
        params: {
          subject_id: selectedSubject,
          date: selectedDate,
        },
      })
      .then((res) => {
        const existing = {};
        (res.data.attendance || []).forEach((a) => {
          existing[a.student_id] = a.status;
        });
        if (Object.keys(existing).length > 0) {
          setAttendance((prev) => ({ ...prev, ...existing }));
        }
      })
      .catch(() => {});
  }, [selectedSubject, selectedDate, subjects]);

  const handleMark = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSave = async () => {
    if (!selectedSubject || !selectedDate) {
      toast.error("Select subject and date");
      return;
    }

    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([student_id, status]) => ({
        student_id,
        status,
      }));

      await api.post("/attendance/bulk", {
        subject_id: selectedSubject,
        date: selectedDate,
        records,
      });

      toast.success("Attendance saved successfully");
    } catch {
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter((v) => v === "present").length;
  const absentCount = Object.values(attendance).filter((v) => v === "absent").length;
  const lateCount = Object.values(attendance).filter((v) => v === "late").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="hero-banner bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900">
        <div className="grid-pattern" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4 text-emerald-300" />
              </span>
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Attendance Management</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-1">Mark Attendance</h1>
            <p className="text-slate-400 text-sm">Real-time attendance tracking and management</p>
          </div>
          {canMark && selectedSubject && (
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 shadow-lg shadow-emerald-900/30 shrink-0">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Attendance
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="pro-card bg-card stat-accent-emerald">
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Select a subject..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="font-medium">{s.name}</span>
                      {s.code && <span className="text-muted-foreground ml-2 text-xs">({s.code})</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="h-10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {selectedSubject && students.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="pro-card bg-card stat-accent-emerald p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-black">{presentCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Present</p>
            </div>
          </div>
          <div className="pro-card bg-card stat-accent-red p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-black">{absentCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Absent</p>
            </div>
          </div>
          <div className="pro-card bg-card stat-accent-amber p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-black">{lateCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Late</p>
            </div>
          </div>
        </div>
      )}

      <div className="pro-card bg-card overflow-hidden">
        {!selectedSubject ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="font-semibold text-muted-foreground">Select a subject to begin</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Choose a subject and date from above</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No students enrolled</p>
          </div>
        ) : (
          <>
            <div className="px-5 py-3.5 border-b border-border/40 flex items-center justify-between">
              <p className="text-sm font-bold">{students.length} Students</p>
              <p className="text-xs text-muted-foreground">{selectedDate}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full pro-table">
                <thead>
                  <tr>
                    <th className="w-10">#</th>
                    <th>Student</th>
                    <th className="hidden sm:table-cell">Roll No</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => {
                    const avatarColors = ["bg-indigo-500", "bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];
                    const avatarColor = avatarColors[(s.full_name?.charCodeAt(0) || 0) % avatarColors.length];
                    const initials = s.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??";
                    const status = attendance[s.id] || "present";
                    return (
                      <tr key={s.id}>
                        <td className="text-muted-foreground text-sm">{idx + 1}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg ${avatarColor} flex items-center justify-center text-white text-xs font-black shrink-0`}>{initials}</div>
                            <span className="font-semibold text-sm">{s.full_name}</span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell">
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-mono text-[11px] rounded-lg border-0">{s.roll_number}</Badge>
                        </td>
                        <td>
                          {canMark ? (
                            <div className="flex gap-1.5">
                              <button onClick={() => handleMark(s.id, "present")} className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${status === "present" ? "bg-emerald-600 text-white shadow-sm" : "bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20"}`}>Present</button>
                              <button onClick={() => handleMark(s.id, "absent")} className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${status === "absent" ? "bg-red-600 text-white shadow-sm" : "bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"}`}>Absent</button>
                              <button onClick={() => handleMark(s.id, "late")} className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${status === "late" ? "bg-amber-500 text-white shadow-sm" : "bg-muted text-muted-foreground hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20"}`}>Late</button>
                            </div>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status === "present" ? "bg-emerald-100 text-emerald-700" : status === "absent" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                              {status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
