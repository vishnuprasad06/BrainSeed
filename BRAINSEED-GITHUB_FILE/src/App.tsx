import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Sprout, WifiOff } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Auth from './pages/Auth';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useApp();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-natural-bg">
        <Sprout className="animate-bounce text-natural-primary w-16 h-16" />
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { isLoggedIn, user, loading } = useApp();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-natural-bg">
        <Sprout className="animate-bounce text-natural-primary w-16 h-16" />
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/auth" replace />;
  if (!user) return <Navigate to="/setup" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AppProvider>
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2"
          >
            <WifiOff size={20} />
            You are offline. Some features may not be available.
          </motion.div>
        )}
      </AnimatePresence>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/setup" 
            element={
              <ProtectedRoute>
                <Setup />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
