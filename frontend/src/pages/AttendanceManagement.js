import { useState, useEffect } from "react"
import api from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CalendarCheck, Save } from "lucide-react"
import { toast } from "sonner"

export default function AttendanceManagement() {

  const { user } = useAuth()

  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  )

  const [attendance, setAttendance] = useState({})
  const [saving, setSaving] = useState(false)

  const canMark = ["admin", "faculty"].includes(user?.role)

  useEffect(() => {
    api.get("/subjects")
      .then((res) => {
        setSubjects(res.data.subjects || [])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {

    if (!selectedSubject) return

    const subj = subjects.find(
      (s) => String(s.id) === String(selectedSubject)
    )

    if (!subj) return

    api.get("/students", {
      params: {
        department_id: subj.department_id,
        limit: 100,
      },
    })
      .then((res) => {

        const list = res.data.students || []
        setStudents(list)

        const initial = {}

        list.forEach((s) => {
          initial[s.id] = "present"
        })

        setAttendance(initial)

      })
      .catch(() => {})

    api.get("/attendance", {
      params: {
        subject_id: selectedSubject,
        date: selectedDate,
      },
    })
      .then((res) => {

        const existing = {}

        ;(res.data.attendance || []).forEach((a) => {
          existing[a.student_id] = a.status
        })

        if (Object.keys(existing).length > 0) {
          setAttendance((prev) => ({ ...prev, ...existing }))
        }

      })
      .catch(() => {})

  }, [selectedSubject, selectedDate, subjects])

  const handleMark = (studentId, status) => {

    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }))

  }

  const handleSave = async () => {

    if (!selectedSubject || !selectedDate) {
      toast.error("Select subject and date")
      return
    }

    setSaving(true)

    try {

      const records = Object.entries(attendance).map(
        ([student_id, status]) => ({
          student_id,
          status,
        })
      )

      await api.post("/attendance/bulk", {
        subject_id: selectedSubject,
        date: selectedDate,
        records,
      })

      toast.success("Attendance saved successfully")

    } catch {
      toast.error("Failed to save attendance")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Professional Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl -top-32 -right-32"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/20 backdrop-blur-md rounded-lg border border-blue-400/30">
              <CalendarCheck className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Attendance Management</h1>
              <p className="text-blue-200 text-sm font-medium mt-1">Real-time attendance tracking and management system</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-slate-600 to-slate-900"></div>
        
        <CardContent className="relative p-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest block mb-3">Subject</label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="w-full h-11 rounded-lg bg-slate-50 border-2 border-slate-200 text-slate-900 transition-all duration-200 hover:border-blue-400 focus:border-blue-600 focus:shadow-md focus:shadow-blue-100 text-sm font-medium">
                  <SelectValue placeholder="Select a subject..." />
                </SelectTrigger>

                <SelectContent className="rounded-lg">
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="cursor-pointer">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-slate-500 ml-2 text-xs">({s.code})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest block mb-3">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full h-11 rounded-lg bg-slate-50 border-2 border-slate-200 text-slate-900 transition-all duration-200 hover:border-blue-400 focus:border-blue-600 focus:shadow-md focus:shadow-blue-100 focus:outline-none text-sm font-medium px-3"
              />
            </div>

            <div className="md:col-span-1 flex items-end">
              {canMark && selectedSubject && (
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="w-full h-11 rounded-lg font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Attendance"}
                </Button>
              )}
            </div>

          </div>

          {!selectedSubject ? (

            <div className="text-center py-20 px-6">
              <div className="inline-block p-4 bg-slate-100 rounded-xl mb-4">
                <CalendarCheck className="w-12 h-12 text-slate-400" />
              </div>
              <p className="text-slate-600 font-semibold text-lg mb-1">
                No subject selected
              </p>
              <p className="text-slate-400 text-sm">Select a subject from the dropdown to begin marking attendance</p>
            </div>

          ) : students.length === 0 ? (

            <div className="text-center py-20 px-6">
              <div className="inline-block p-4 bg-slate-100 rounded-xl mb-4">
                <CalendarCheck className="w-12 h-12 text-slate-400" />
              </div>
              <p className="text-slate-600 font-semibold text-lg mb-1">
                No students enrolled
              </p>
              <p className="text-slate-400 text-sm">This subject has no students to mark attendance for</p>
            </div>

          ) : (

            <div className="overflow-x-auto">
              <Table>

                <TableHeader>
                  <TableRow className="bg-slate-50 border-b-2 border-slate-200 hover:bg-slate-50">
                    <TableHead className="font-bold text-slate-700 text-xs">#</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs">Student Name</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs">Roll Number</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs">Attendance Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>

                  {students.map((s, idx) => (

                    <TableRow key={s.id} className="hover:bg-blue-50/50 transition-colors border-b border-slate-150">

                      <TableCell className="font-semibold text-slate-700 py-4">{idx + 1}</TableCell>
                      <TableCell className="font-medium text-slate-900 py-4">{s.full_name}</TableCell>
                      <TableCell className="font-mono text-slate-600 text-sm py-4">{s.roll_number}</TableCell>

                      <TableCell className="py-4">

                        <div className="flex gap-2">

                          <button
                            onClick={() => handleMark(s.id, "present")}
                            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all duration-200 ${
                              attendance[s.id] === "present"
                                ? "bg-emerald-600 text-white shadow-md"
                                : "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-emerald-50 hover:border-emerald-300"
                            }`}
                          >
                            Present
                          </button>

                          <button
                            onClick={() => handleMark(s.id, "absent")}
                            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all duration-200 ${
                              attendance[s.id] === "absent"
                                ? "bg-red-600 text-white shadow-md"
                                : "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-red-50 hover:border-red-300"
                            }`}
                          >
                            Absent
                          </button>

                          <button
                            onClick={() => handleMark(s.id, "late")}
                            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all duration-200 ${
                              attendance[s.id] === "late"
                                ? "bg-amber-600 text-white shadow-md"
                                : "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-amber-50 hover:border-amber-300"
                            }`}
                          >
                            Late
                          </button>

                        </div>

                      </TableCell>

                    </TableRow>

                  ))}

                </TableBody>

              </Table>
            </div>

          )}

        </CardContent>
      </div>

    </div>
  )
}