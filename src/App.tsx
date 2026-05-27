import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';
import { AppLayout } from './components/layout/AppLayout';
import { Loader2, ShieldAlert } from 'lucide-react';

import SettingsPage from './pages/SettingsPage';
import FaqPage from './pages/FaqPage';
import HistoryPage from './pages/HistoryPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import NewsPage from './pages/NewsPage';
import AdminBlogPage from './pages/AdminBlogPage';
import AdminFeedbacksPage from './pages/AdminFeedbacksPage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

/**
 * ProtectedRoute component to handle authenticated access.
 */
function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { user, profile, loading } = useAuth();

  if (loading || (user && !profile)) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !profile?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (profile?.isBanned) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold font-bn text-slate-800 mb-2">একাউন্ট ব্যান করা হয়েছে (Account Banned)</h1>
        <p className="text-slate-600">আপনি এই প্ল্যাটফর্মটি ব্যবহার করতে পারবেন না। (You do not have access to this platform.)</p>
      </div>
    );
  }

  return <>{children}</>;
}

function AppContent() {
  const { loading } = useAuth();
  
  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/40 dark:bg-slate-950/40 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-white/80 dark:bg-slate-900/80 p-8 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <h2 className="text-xl font-bold font-bn text-slate-800 dark:text-slate-100 mb-1">একটু অপেক্ষা করুন...</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bn text-sm">ডেটাবেজ সিঙ্ক হচ্ছে (Loading data)</p>
          </div>
        </div>
      )}

      <div className={loading ? "blur-md pointer-events-none select-none opacity-40 h-screen overflow-hidden" : "transition-all duration-700 ease-in-out blur-0 opacity-100"}>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Future Placeholders */}
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <HistoryPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/faq" 
              element={
                <AppLayout>
                  <FaqPage />
                </AppLayout>
              } 
            />
            <Route 
              path="/about" 
              element={
                <AppLayout>
                  <AboutPage />
                </AppLayout>
              } 
            />
            <Route 
              path="/privacy-policy" 
              element={
                <AppLayout>
                  <PrivacyPolicyPage />
                </AppLayout>
              } 
            />
            <Route 
              path="/terms-of-service" 
              element={
                <AppLayout>
                  <TermsOfServicePage />
                </AppLayout>
              } 
            />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route 
              path="/admin/blog" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminBlogPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/feedbacks" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminFeedbacksPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
