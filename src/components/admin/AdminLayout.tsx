import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import { Loader2, ShieldAlert } from 'lucide-react';

const AdminLayout = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-brand-blue" size={40} />
      </div>
    );
  }

  // Redirect if not an admin
  if (!user || profile?.role !== 'admin') {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 border border-rose-100 shadow-xl shadow-rose-200/50">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Access Denied</h1>
        <p className="text-slate-500 font-medium text-center max-w-sm mb-8">
          This area is restricted to Bethalhub Administrators only. Your attempt has been logged.
        </p>
        <a 
          href="/" 
          className="bg-brand-blue text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          Return to Home
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="lg:ml-72 p-4 md:p-8 lg:p-12 pt-24 lg:pt-12">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
