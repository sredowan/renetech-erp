import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import StudentLayout from './components/StudentLayout';
import Dashboard from './pages/Dashboard';
import AttendanceView from './pages/AttendanceView';
import PTEPractice from './pages/PTEPractice';
import LoginPage from './pages/Login';
import ScheduleView from './pages/ScheduleView';
import NotificationsView from './pages/NotificationsView';
import SubscriptionView from './pages/SubscriptionView';
import PracticeHub from './pages/pte/PracticeHub';
import QuestionBank from './pages/pte/QuestionBank';
import MockTests from './pages/pte/MockTests';
import SpeakingLounge from './pages/pte/SpeakingLounge';
import WritingLounge from './pages/pte/WritingLounge';
import ReadingLounge from './pages/pte/ReadingLounge';
import ListeningLounge from './pages/pte/ListeningLounge';
import ScoreReports from './pages/pte/ScoreReports';
import ProfileView from './pages/ProfileView';
import CommunityHub from './pages/CommunityHub';
import './styles/GlobalStyles.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router basename="/student">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <StudentLayout title="Student Dashboard">
                  <Dashboard />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/attendance" element={
              <ProtectedRoute>
                <StudentLayout title="Attendance History">
                  <AttendanceView />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/pte" element={
              <ProtectedRoute>
                <StudentLayout title="PTE Practice Hub">
                  <PracticeHub />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/pte/questions" element={
              <ProtectedRoute>
                <StudentLayout title="Question Bank">
                  <QuestionBank />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/pte/mocks" element={
              <ProtectedRoute>
                <StudentLayout title="Mock Test System">
                  <MockTests />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/pte/reports" element={
              <ProtectedRoute>
                <StudentLayout title="Score Reports">
                  <ScoreReports />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/pte/speaking" element={
              <ProtectedRoute>
                <StudentLayout title="Speaking Lounge">
                  <SpeakingLounge />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/pte/speaking/:taskId" element={
              <ProtectedRoute>
                <StudentLayout title="Speaking Lounge">
                  <SpeakingLounge />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/pte/writing" element={
              <ProtectedRoute>
                <StudentLayout title="Writing Lounge">
                  <WritingLounge />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/pte/writing/:taskId" element={
              <ProtectedRoute>
                <StudentLayout title="Writing Lounge">
                  <WritingLounge />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/pte/reading" element={
              <ProtectedRoute>
                <StudentLayout title="Reading Lounge">
                  <ReadingLounge />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/pte/reading/:taskId" element={
              <ProtectedRoute>
                <StudentLayout title="Reading Lounge">
                  <ReadingLounge />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/pte/listening" element={
              <ProtectedRoute>
                <StudentLayout title="Listening Lounge">
                  <ListeningLounge />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/pte/listening/:taskId" element={
              <ProtectedRoute>
                <StudentLayout title="Listening Lounge">
                  <ListeningLounge />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/schedule" element={
              <ProtectedRoute>
                <StudentLayout title="Class Schedule">
                  <ScheduleView />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute>
                <StudentLayout title="Notifications">
                  <NotificationsView />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/subscription" element={
              <ProtectedRoute>
                <StudentLayout title="Premium Plans">
                  <SubscriptionView />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/community" element={
              <ProtectedRoute>
                <StudentLayout title="Candidate Community">
                  <CommunityHub />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <StudentLayout title="My Profile">
                  <ProfileView />
                </StudentLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
