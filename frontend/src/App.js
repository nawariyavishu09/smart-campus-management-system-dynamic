import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import AdminDashboard from '@/pages/AdminDashboard';
import StudentDashboard from '@/pages/StudentDashboard';
import FacultyDashboard from '@/pages/FacultyDashboard';
import StudentManagement from '@/pages/StudentManagement';
import FacultyManagement from '@/pages/FacultyManagement';
import DepartmentManagement from '@/pages/DepartmentManagement';
import SubjectManagement from '@/pages/SubjectManagement';
import AttendanceManagement from '@/pages/AttendanceManagement';
import MarksManagement from '@/pages/MarksManagement';
import NoticeBoard from '@/pages/NoticeBoard';
import ComplaintManagement from '@/pages/ComplaintManagement';
import Reports from '@/pages/Reports';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'student') return <StudentDashboard />;
  if (user?.role === 'faculty') return <FacultyDashboard />;
  return <AdminDashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardRouter />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="faculty-members" element={<FacultyManagement />} />
            <Route path="departments" element={<DepartmentManagement />} />
            <Route path="subjects" element={<SubjectManagement />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="marks" element={<MarksManagement />} />
            <Route path="notices" element={<NoticeBoard />} />
            <Route path="complaints" element={<ComplaintManagement />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
