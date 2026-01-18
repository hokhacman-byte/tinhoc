
import React, { ReactNode } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import ChallengeGame from './pages/ChallengeGame';
import AdminPanel from './pages/AdminPanel';
import Chatbot from './pages/Chatbot';
import Posts from './pages/Posts';
import Profile from './pages/Profile';
import Infographics from './pages/Infographics';
import Lectures from './pages/Lectures';
import Worksheets from './pages/Worksheets';
import Survey from './pages/Survey';
import MockExams from './pages/MockExams';
import Calendar from './pages/Calendar';
import Library from './pages/Library';
import CodeLab from './pages/CodeLab';
import CodeExercise from './pages/CodeExercise'; // Import new page
import { Role } from './types';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children?: ReactNode, allowedRoles?: Role[] }) => {
  const { currentUser } = useApp();
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
    const { currentUser } = useApp();

    return (
        <Routes>
            <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <Login />} />
            
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/quiz" element={
                <ProtectedRoute>
                    <Layout><Quiz /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/mock-exams" element={
                <ProtectedRoute>
                    <Layout><MockExams /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/challenge" element={
                <ProtectedRoute>
                    <Layout><ChallengeGame /></Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/posts" element={
                <ProtectedRoute>
                    <Layout><Posts /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/infographics" element={
                <ProtectedRoute>
                    <Layout><Infographics /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/lectures" element={
                <ProtectedRoute>
                    <Layout><Lectures /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/worksheets" element={
                <ProtectedRoute>
                    <Layout><Worksheets /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/calendar" element={
                <ProtectedRoute>
                    <Layout><Calendar /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/library" element={
                <ProtectedRoute>
                    <Layout><Library /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/codelab" element={
                <ProtectedRoute>
                    <Layout><CodeLab /></Layout>
                </ProtectedRoute>
            } />

            {/* New Route for Code Exercise - No Layout wrapper to allow full screen */}
            <Route path="/code-exercise" element={
                <ProtectedRoute>
                    <CodeExercise />
                </ProtectedRoute>
            } />

            <Route path="/chatbot" element={
                <ProtectedRoute>
                    <Layout><Chatbot /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/survey" element={
                <ProtectedRoute>
                    <Layout><Survey /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/profile" element={
                <ProtectedRoute allowedRoles={[Role.STUDENT]}>
                    <Layout><Profile /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                    <Layout><AdminPanel /></Layout>
                </ProtectedRoute>
            } />
             {/* Teacher Panel reuses dashboard for simplicity in this demo, or redirects to admin if admin functions are shared */}
             <Route path="/teacher" element={
                <ProtectedRoute allowedRoles={[Role.TEACHER]}>
                    <Layout><Dashboard /></Layout>
                </ProtectedRoute>
            } />
        </Routes>
    );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;
