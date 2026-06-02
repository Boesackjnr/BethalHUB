/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import BusinessAuth from './pages/BusinessAuth';
import ResidentAuth from './pages/ResidentAuth';
import { useAuth } from './contexts/AuthContext';
import Opportunities from './pages/Opportunities';
import BusinessDirectory from './pages/BusinessDirectory';
import CommunityNotices from './pages/CommunityNotices';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import TenderDetail from './pages/TenderDetail';
import Profile from './pages/Profile';

// Admin Imports
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBusinesses from './pages/admin/AdminBusinesses';
import AdminContent from './pages/admin/AdminContent';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Admin Dashboard - Separate Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="businesses" element={<AdminBusinesses />} />
          <Route path="notices" element={<AdminContent />} />
          <Route path="opportunities" element={<AdminContent />} />
        </Route>

        {/* Public Website */}
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={user ? <Home /> : <Landing />} />
                <Route path="/business-auth" element={user ? <Navigate to="/" /> : <BusinessAuth />} />
                <Route path="/resident-auth" element={user ? <Navigate to="/" /> : <ResidentAuth />} />
                <Route 
                  path="/opportunities" 
                  element={
                    <ProtectedRoute>
                      <Opportunities />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/opportunities/:id" 
                  element={
                    <ProtectedRoute>
                      <TenderDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/business-directory" 
                  element={
                    <ProtectedRoute>
                      <BusinessDirectory />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/community-notices" 
                  element={
                    <ProtectedRoute>
                      <CommunityNotices />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

// App component
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
