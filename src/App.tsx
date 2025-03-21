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
import CustomPages from './pages/CustomPages';
import CustomSectionPage from './pages/CustomSectionPage';
import Website from './pages/Website';
import WebsiteDemo from './pages/WebsiteDemo';
import { AuthProvider, useAuth } from './lib/auth';
import WelcomeModal from './components/WelcomeModal';
import GoogleScholarModal from './components/GoogleScholarModal';
import ConfirmationModal from './components/ConfirmationModal';
import { fetchAuthorData } from './lib/serpapi';
import { createProfile } from './lib/auth';
import { initTheme } from './lib/theme';
import ResetPassword from './pages/ResetPassword';

initTheme();

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
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);
  const [showGoogleScholarModal, setShowGoogleScholarModal] = React.useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = React.useState(false);
  const [authorData, setAuthorData] = React.useState<any>(null);
  const [scholarId, setScholarId] = React.useState<string>("");

  const handleStartSetup = () => {
    setShowWelcomeModal(false);
    setShowGoogleScholarModal(true);
  };

  const handleAutoPopulate = async (url: string) => {
    const scholarMatch = url.match(/user=([^&]+)/);
    if (scholarMatch) {
      const scholar = scholarMatch[1];
      setScholarId(scholar);
      const data = await fetchAuthorData(scholar);
      setAuthorData(data);
      setShowGoogleScholarModal(false);
      setShowConfirmationModal(true);
    } else {
      alert("Invalid Google Scholar URL. Please ensure you've entered a valid URL with a 'user' parameter.");
    }
  };

  const handleConfirm = async () => {
    if (authorData && user) {
      await createProfile(user.id, authorData.author, authorData.articles);
      setShowConfirmationModal(false);
      sessionStorage.setItem('setupComplete', 'true');
      alert('Profile created successfully! You can now add your own projects and fill out your profile details.');
    }
  };

  const handleRemoveArticle = (indexToRemove: number): void => {
    if (authorData && authorData.articles) {
      setAuthorData({
        ...authorData,
        articles: authorData.articles.filter((_: any, index: number) => index !== indexToRemove),
      });
    }
  };

  React.useEffect(() => {
    if (user && localStorage.getItem('newUser') === 'true' && !localStorage.getItem('setupComplete')) {
      setShowWelcomeModal(true);
      localStorage.removeItem('newUser');
    }
  }, [user]);

  const hostname = window.location.hostname;
  const isSubdomain = hostname.includes('.myphd.site');

  // If we're on a subdomain, extract the username and render the Website component
  if (isSubdomain) {
    const username = hostname.split('.')[0];
    return <Website key={username} />;
  }

  // Otherwise, render the main app routes
  return (
    <>
      <Routes>
        {/* Landing page route */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        {/* Demo route */}
        <Route path="/demo" element={<WebsiteDemo />} />
        {/* Public website route - for path-based access */}
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
        {/* Custom Pages route */}
        <Route
          path="/custom-pages"
          element={
            <PrivateRoute>
              <Layout>
                <CustomPages />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/custom-pages/:pageTitle"
          element={
            <PrivateRoute>
              <Layout>
                <CustomSectionPage />
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
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
      </Routes>
      {showWelcomeModal && <WelcomeModal onStartSetup={handleStartSetup} />}
      {showGoogleScholarModal && <GoogleScholarModal onAutoPopulate={handleAutoPopulate} onClose={() => setShowGoogleScholarModal(false)} />}
      {showConfirmationModal && (
        <ConfirmationModal
          onConfirm={handleConfirm}
          publications={
            authorData?.articles?.map((article: any, index: number) => ({
              id: index,
              title: article.title,
            })) || []
          }
          onRemove={handleRemoveArticle}
          onCancel={() => setShowConfirmationModal(false)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
