import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileBarChart, Plus, BarChart3, TrendingUp, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function MarksManagement() {

const { user } = useAuth();

const [subjects,setSubjects] = useState([]);
const [students,setStudents] = useState([]);
const [marks,setMarks] = useState([]);
const [selectedSubject,setSelectedSubject] = useState('');
const [dialogOpen,setDialogOpen] = useState(false);
const [formStudent,setFormStudent] = useState('');

const [form,setForm] = useState({
internal_marks:0,
practical_marks:0,
final_marks:0
});

const [saving,setSaving] = useState(false);
const [studentMarks,setStudentMarks] = useState([]);

const canEdit = ['admin','faculty'].includes(user?.role);

useEffect(()=>{

api.get('/subjects')
.then(r=>setSubjects(r.data.subjects || []))
.catch(()=>{})

},[])

useEffect(()=>{

if(user?.role === 'student'){

api.get('/marks')
.then(r=>setStudentMarks(r.data.marks || []))
.catch(()=>{})

}

},[user])

useEffect(()=>{

if(!selectedSubject) return

const subj = subjects.find(
s=>String(s.id) === String(selectedSubject)
)

if(!subj) return

Promise.all([

api.get('/students',{
params:{
department_id:subj.department_id,
limit:100
}
}),

api.get('/marks',{
params:{
subject_id:selectedSubject
}
})

])

.then(([sRes,mRes])=>{

setStudents(sRes.data.students || [])
setMarks(mRes.data.marks || [])

})

.catch(()=>{})

},[selectedSubject,subjects])

const getMarks=(studentId)=>{
return marks.find(m=>m.student_id===studentId)
}

const openEntry=(studentId)=>{

const existing = getMarks(studentId)

setFormStudent(studentId)

setForm({
internal_marks:existing?.internal_marks || 0,
practical_marks:existing?.practical_marks || 0,
final_marks:existing?.final_marks || 0
})

setDialogOpen(true)

}

const handleSave = async ()=>{

if(form.internal_marks > 30){
toast.error("Internal marks cannot be more than 30")
return
}

if(form.practical_marks > 20){
toast.error("Practical marks cannot be more than 20")
return
}

if(form.final_marks > 50){
toast.error("Final marks cannot be more than 50")
return
}

setSaving(true)

try{

await api.post('/marks',{
student_id:formStudent,
subject_id:selectedSubject,
...form
})

toast.success('Marks saved successfully')

setDialogOpen(false)

const mRes = await api.get('/marks',{
params:{subject_id:selectedSubject}
})

setMarks(mRes.data.marks || [])

}catch(err){

toast.error(err.response?.data?.detail || 'Failed')

}finally{

setSaving(false)

}

}

const gradeColor=(g)=>{

if(['A+','A'].includes(g))
return 'bg-emerald-100 text-emerald-700'

if(['B+','B'].includes(g))
return 'bg-blue-100 text-blue-700'

if(g==='C')
return 'bg-amber-100 text-amber-700'

return 'bg-rose-100 text-rose-700'

}

if(user?.role === 'student'){

const subjectMap = {}
subjects.forEach(s=>{subjectMap[s.id]=s})

const passCount = studentMarks.filter(m => m.result_status === 'Pass').length;
const avgPercentage = studentMarks.length > 0 ? (studentMarks.reduce((sum, m) => sum + m.total, 0) / studentMarks.length).toFixed(1) : 0;

return(

<div className="space-y-6 animate-fade-in">

<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-8 text-white shadow-xl">
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply blur-3xl"></div>
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-500 rounded-full mix-blend-multiply blur-3xl"></div>
  </div>
  <div className="relative z-10">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-3 rounded-2xl bg-blue-600/30 backdrop-blur-xl border border-blue-400/30">
        <BarChart3 className="w-6 h-6 text-blue-200" strokeWidth={1.5} />
      </div>
      <h1 className="text-4xl font-bold">My Academic Results</h1>
    </div>
    <p className="text-blue-100 leading-relaxed">View your marks, grades, and academic performance</p>
  </div>
</div>

{studentMarks.length > 0 && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card className="rounded-xl border-border/50 overflow-hidden group hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold text-blue-600">{studentMarks.length}</p>
            <p className="text-sm text-muted-foreground font-medium mt-2">Subjects</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950/30">
            <BarChart3 className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="rounded-xl border-border/50 overflow-hidden group hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold text-emerald-600">{passCount}</p>
            <p className="text-sm text-muted-foreground font-medium mt-2">Passed</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
            <TrendingUp className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="rounded-xl border-border/50 overflow-hidden group hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold text-amber-600">{avgPercentage}%</p>
            <p className="text-sm text-muted-foreground font-medium mt-2">Average</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-950/30">
            <Award className="w-6 h-6 text-amber-600" strokeWidth={1.5} />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)}

<div>
<h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Detailed Results</h2>

{studentMarks.length===0 ?(

<Card className="rounded-xl border-border/50">
<CardContent className="p-12 text-center"><div className="flex flex-col items-center gap-3"><BarChart3 className="w-10 h-10 text-muted-foreground/30" /><p className="text-muted-foreground">No results available yet</p></div></CardContent>
</Card>

):(

<Card className="rounded-xl border-border/50 overflow-hidden">
<CardHeader className="pb-4 bg-slate-100 dark:bg-slate-800 border-b">
  <CardTitle className="text-base font-semibold">Results Summary</CardTitle>
</CardHeader>
<CardContent className="p-4">

<div className="overflow-x-auto">
<Table>

<TableHeader>

<TableRow className="hover:bg-transparent border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">

<TableHead className="font-bold text-slate-700 dark:text-slate-300">Subject</TableHead>
<TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Internal</TableHead>
<TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Practical</TableHead>
<TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Final</TableHead>
<TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Total</TableHead>
<TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Grade</TableHead>
<TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Result</TableHead>

</TableRow>

</TableHeader>

<TableBody>

{studentMarks.map(m=>(

<TableRow key={m.id || m.subject_id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">

<TableCell className="font-semibold text-slate-900 dark:text-slate-100">
{m.subject_name || subjectMap[m.subject_id]?.name || '-'}
</TableCell>

<TableCell className="text-center text-sm font-medium text-slate-600 dark:text-slate-300">{m.internal_marks}</TableCell>
<TableCell className="text-center text-sm font-medium text-slate-600 dark:text-slate-300">{m.practical_marks}</TableCell>
<TableCell className="text-center text-sm font-medium text-slate-600 dark:text-slate-300">{m.final_marks}</TableCell>

<TableCell className="text-center font-bold text-lg">
<span className="text-blue-600 dark:text-blue-400">{m.total}</span>
</TableCell>

<TableCell className="text-center">
<Badge className={gradeColor(m.grade)}>
{m.grade}
</Badge>
</TableCell>

<TableCell className="text-center">
<Badge className={m.result_status==='Pass'?'bg-emerald-600 hover:bg-emerald-700 text-white':'bg-red-600 hover:bg-red-700 text-white'}>
{m.result_status}
</Badge>
</TableCell>

</TableRow>

))}

</TableBody>

</Table>
</div>

</CardContent>
</Card>

)}
</div>

</div>

)

}

return(

<div className="space-y-6 animate-fade-in">

<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-rose-900 to-slate-900 p-8 text-white shadow-xl">
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500 rounded-full mix-blend-multiply blur-3xl"></div>
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-500 rounded-full mix-blend-multiply blur-3xl"></div>
  </div>
  <div className="relative z-10">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-3 rounded-2xl bg-rose-600/30 backdrop-blur-xl border border-rose-400/30">
        <FileBarChart className="w-6 h-6 text-rose-200" strokeWidth={1.5} />
      </div>
      <h1 className="text-4xl font-bold">Marks Management</h1>
    </div>
    <p className="text-rose-100 leading-relaxed">Enter, manage, and track student marks across all subjects</p>
  </div>
</div>

<Card className="rounded-xl border-border/50 overflow-hidden">

<CardHeader className="pb-4 bg-slate-100 dark:bg-slate-800 border-b">
  <CardTitle className="text-base font-semibold">Select Subject</CardTitle>
</CardHeader>

<CardContent className="p-4">

<Select value={selectedSubject} onValueChange={setSelectedSubject}>

<SelectTrigger className="flex-1 rounded-lg">
<SelectValue placeholder="Choose a subject to manage marks" />
</SelectTrigger>

<SelectContent>

{subjects.map(s=>(

<SelectItem key={s.id} value={s.id}>
{s.name} ({s.code})
</SelectItem>

))}

</SelectContent>

</Select>

{!selectedSubject ?(

<div className="text-center py-12">

<FileBarChart className="w-12 h-12 mx-auto mb-3 opacity-40"/>
<p className="text-muted-foreground">Select a subject from the dropdown above</p>

</div>

): students.length===0 ?(

<div className="text-center py-12">
<p className="text-muted-foreground">No students found in this department</p>
</div>

):( 

<div className="overflow-x-auto">
<Table>

<TableHeader>

<TableRow className="hover:bg-transparent border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">

<TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">#</TableHead>
<TableHead className="font-bold text-slate-700 dark:text-slate-300">Student Name</TableHead>
<TableHead className="font-bold text-slate-700 dark:text-slate-300">Roll No</TableHead>
<TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Internal</TableHead>
<TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Practical</TableHead>
<TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Final</TableHead>
<TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Total</TableHead>
<TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Grade</TableHead>

{canEdit && <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Action</TableHead>}

</TableRow>

</TableHeader>

<TableBody>

{students.map((s,idx)=>{

const m = getMarks(s.id)

return(

<TableRow key={s.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors">

<TableCell className="text-center font-medium text-slate-600 dark:text-slate-300">{idx+1}</TableCell>
<TableCell className="font-semibold text-slate-900 dark:text-slate-100">{s.full_name}</TableCell>
<TableCell className="text-sm text-slate-600 dark:text-slate-300">
<Badge className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 text-[10px]">{s.roll_number}</Badge>
</TableCell>

<TableCell className="text-center font-medium text-slate-600 dark:text-slate-300">{m?.internal_marks ?? <span className="text-muted-foreground">-</span>}</TableCell>
<TableCell className="text-center font-medium text-slate-600 dark:text-slate-300">{m?.practical_marks ?? <span className="text-muted-foreground">-</span>}</TableCell>
<TableCell className="text-center font-medium text-slate-600 dark:text-slate-300">{m?.final_marks ?? <span className="text-muted-foreground">-</span>}</TableCell>

<TableCell className="text-center font-bold text-lg">
{m?.total ? <span className="text-rose-600 dark:text-rose-400">{m.total}</span> : <span className="text-muted-foreground">-</span>}
</TableCell>

<TableCell className="text-center">

{m ? (
<Badge className={gradeColor(m.grade)}>
{m.grade}
</Badge>
) : <span className="text-muted-foreground text-sm">-</span>}

</TableCell>

{canEdit && (

<TableCell className="text-center">

<Button
size="sm"
className={m ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}
onClick={()=>openEntry(s.id)}
>

<Plus className="w-3 h-3 mr-1"/>

{m ? 'Edit':'Enter'}

</Button>

</TableCell>

)}

</TableRow>

)

})}

</TableBody>

</Table>
</div>

)}

</CardContent>

</Card>

<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>

<DialogContent className="rounded-xl">

<DialogHeader>
<DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
  <div className="flex items-center gap-2">
    <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/30">
      <FileBarChart className="w-4 h-4 text-rose-600" />
    </div>
    Enter Marks
  </div>
</DialogTitle>
</DialogHeader>

<div className="space-y-4 py-4">

<div>
<Label className="font-semibold text-slate-700 dark:text-slate-300">Internal Marks <span className="text-rose-600">(max 30)</span></Label>

<Input
type="number"
min={0}
max={30}
value={form.internal_marks}
onChange={e=>setForm({
...form,
internal_marks:parseFloat(e.target.value)||0
})}
className="rounded-lg border-slate-300 dark:border-slate-600 focus:border-rose-500 focus:ring-rose-500"
/>

</div>

<div>
<Label className="font-semibold text-slate-700 dark:text-slate-300">Practical Marks <span className="text-rose-600">(max 20)</span></Label>

<Input
type="number"
min={0}
max={20}
value={form.practical_marks}
onChange={e=>setForm({
...form,
practical_marks:parseFloat(e.target.value)||0
})}
className="rounded-lg border-slate-300 dark:border-slate-600 focus:border-rose-500 focus:ring-rose-500"
/>

</div>

<div>
<Label className="font-semibold text-slate-700 dark:text-slate-300">Final Marks <span className="text-rose-600">(max 50)</span></Label>

<Input
type="number"
min={0}
max={50}
value={form.final_marks}
onChange={e=>setForm({
...form,
final_marks:parseFloat(e.target.value)||0
})}
className="rounded-lg border-slate-300 dark:border-slate-600 focus:border-rose-500 focus:ring-rose-500"
/>

</div>

<div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">

<p className="text-sm font-medium text-rose-900 dark:text-rose-100">
Total Marks: <span className="font-bold text-lg text-rose-600 dark:text-rose-400">{(form.internal_marks + form.practical_marks + form.final_marks).toFixed(1)}/100</span>
</p>

</div>

</div>

<DialogFooter className="mt-6">

<Button variant="outline" onClick={()=>setDialogOpen(false)} className="rounded-lg">
Cancel
</Button>

<Button onClick={handleSave} disabled={saving} className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg">
{saving?'Saving...':'Save Marks'}
</Button>

</DialogFooter>

</DialogContent>

</Dialog>

</div>

)

}