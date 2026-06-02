import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  Bell, 
  Briefcase, 
  ShieldCheck,
  LayoutDashboard,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Verify Users', path: '/admin/users', icon: Users },
    { name: 'Verify Businesses', path: '/admin/businesses', icon: Building2 },
    { name: 'Manage Notices', path: '/admin/notices', icon: Bell },
    { name: 'Opportunities', path: '/admin/opportunities', icon: Briefcase },
  ];

  const sidebarContent = (
    <>
      <div className="p-8">
        <Link to="/" className="flex items-center gap-4 group py-2">
          <div className="flex flex-col">
            <h1 className="text-white font-black text-2xl tracking-tighter leading-none">BETHALHUB</h1>
            <span className="text-[9px] font-black text-brand-blue uppercase tracking-[0.4em] mt-1.5 opacity-80">Admin Panel</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        <div className="px-4 mb-4">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Main Menu</span>
        </div>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-brand-blue text-white shadow-lg shadow-blue-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-brand-blue'} />
              <span className="font-bold text-sm">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-slate-800 space-y-4">
        <Link 
          to="/" 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all font-bold text-sm"
        >
          <ArrowLeft size={18} />
          Exit Website
        </Link>
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck size={16} />
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security</p>
              <p className="text-xs font-bold text-slate-200">Protected</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-slate-900 border-b border-slate-800 z-[100] px-6 flex items-center justify-between">
        <div className="flex-1">
          <Link to="/admin" className="inline-flex items-center gap-3">
            <span className="text-white font-black text-sm md:text-base tracking-[0.2em] uppercase opacity-40">Admin</span>
          </Link>
        </div>
        
        <Link to="/" className="flex flex-col items-center">
          <h1 className="text-white font-black text-lg md:text-xl tracking-tighter leading-none">BETHALHUB</h1>
          <span className="text-[8px] font-black text-brand-blue uppercase tracking-[0.3em] mt-1">Bethal Dashboard</span>
        </Link>

        <div className="flex-1 flex justify-end">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-slate-900 h-screen fixed left-0 top-0 text-slate-300 flex-col border-r border-slate-800 z-50">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[110]"
            />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-slate-900 z-[120] text-slate-300 flex flex-col shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
