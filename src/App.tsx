import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import Publications from './pages/Publications';
import Settings from './pages/Settings';
import Website from './pages/Website';
import { AuthProvider, useAuth } from './lib/auth';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page route */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        
        {/* Public website route */}
        <Route path="/:username" element={<Website />} />
        
        {/* Auth & Dashboard routes */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <Layout>
                <Projects />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/publications"
          element={
            <PrivateRoute>
              <Layout>
                <Publications />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Layout>
                <Settings />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}