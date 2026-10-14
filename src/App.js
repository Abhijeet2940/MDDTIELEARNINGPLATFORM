import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/Home';
import AboutPage from './pages/About';
import FacultyPage from './pages/Faculty';
import ContactPage from './pages/Contact';
import GuidePage from './pages/Guide';
import { getSession } from './auth/session';
import LoginPage from './AuthPage/LoginPage';
import RegisterPage from './AuthPage/RegisterPage';
import ForgotPasswordPage from './AuthPage/ForgotPasswordPage';
import LearnerLayout from './Learner/LearnerLayout';
import DashboardPage from './Learner/DashboardPage';
import ProfileSetupPage from './Learner/ProfileSetupPage';
import LearningPage from './Learner/LearningPage';
import CourseReaderPage from './Learner/CourseReaderPage';
import LessonReaderPage from './Learner/LessonReaderPage';
import AssessmentPage from './Learner/AssessmentPage';
import CertificatePage from './Learner/CertificatePage';
import ProgressPage from './Learner/ProgressPage';
import ProfilePage from './Learner/ProfilePage';
import AdminRequestsPage from './Admin/AdminRequestsPage';
import AdminLayout from './Admin/AdminLayout';
import AdminProgressPage from './Admin/AdminProgressPage';
import AdminCoursesPage from './Admin/AdminCoursesPage';
import AdminAssignmentsPage from './Admin/AdminAssignmentsPage';
import { ThemeProvider } from './contexts/ThemeContext';

function PublicSiteLayout() {
  return <Layout><Outlet /></Layout>;
}

function LearnerRoutes() {
  const user = getSession();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'ADMIN' ? <Navigate to="/admin/requests" replace /> : <Outlet />;
}

function AdminRoutes() {
  const user = getSession();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'ADMIN' ? <Outlet /> : <Navigate to="/app" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
        <Route element={<PublicSiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faculty" element={<FacultyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/guide" element={<GuidePage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route element={<AdminRoutes />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="requests" replace />} />
            <Route path="requests" element={<AdminRequestsPage />} />
            <Route path="progress" element={<AdminProgressPage />} />
            <Route path="courses" element={<AdminCoursesPage />} />
            <Route path="assignments" element={<AdminAssignmentsPage />} />
          </Route>
        </Route>
        <Route element={<LearnerRoutes />}>
          <Route path="/app" element={<LearnerLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="profile-setup" element={<ProfileSetupPage />} />
            <Route path="learning" element={<LearningPage />} />
            <Route path="learning/courses/:courseId" element={<CourseReaderPage />} />
            <Route path="learning/courses/:courseId/lessons/:lessonId" element={<LessonReaderPage />} />
            <Route path="assessment" element={<AssessmentPage />} />
            <Route path="certificates/:assessmentId" element={<CertificatePage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
