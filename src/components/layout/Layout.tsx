import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Briefcase, Building2, Bell, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const navLinks = user ? [
    { name: 'Opportunities', path: '/opportunities', icon: Briefcase },
    { name: 'Business Directory', path: '/business-directory', icon: Building2 },
    { name: 'Community', path: '/community-notices', icon: Bell },
  ] : [];

  return (
    <nav className="glass h-20 flex items-center justify-between px-6 sm:px-12 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-3 md:w-1/4 shrink-0">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-subtle group-hover:scale-105 transition-transform border border-slate-100">
            <div className="w-6 h-6 border-[5px] border-brand-blue rounded-md"></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">BethalHUB</span>
            <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full hidden sm:inline-block">Sandbox</span>
          </div>
        </Link>
      </div>

      {/* Desktop Center Nav */}
      <div className="flex-grow flex justify-center items-center">
        <div className="hidden lg:flex items-center gap-10 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-all hover:text-brand-blue hover:translate-y-[-1px] ${
                location.pathname === link.path ? 'text-brand-blue' : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {user && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex lg:hidden text-slate-400 hover:text-brand-blue p-2"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        )}
      </div>

      {/* Right Actions */}
      <div className="hidden md:flex items-center justify-end gap-6 md:w-1/4 shrink-0">
        {user ? (
          <div className="flex items-center gap-3">
            <Link 
              to="/profile" 
              className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl hover:bg-white hover:shadow-subtle transition-all group shrink-0"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-blue text-white flex items-center justify-center overflow-hidden shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-tighter">{(profile?.displayName || user?.displayName || 'C').charAt(0)}</span>
                )}
              </div>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="bg-brand-blue text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-modern hover:bg-slate-800 transition-all uppercase tracking-widest whitespace-nowrap">
              Join Hub
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu button */}
      {user && (
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-400 hover:text-brand-blue p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      )}

      {/* Nav Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-24 left-6 right-6 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col gap-4 lg:hidden shadow-modern z-50 overflow-y-auto max-h-[calc(100vh-120px)]"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-slate-600 hover:text-brand-blue p-4 font-bold flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-2xl transition-all border border-slate-100/50 hover:border-brand-blue/30"
                >
                  <div className="w-10 h-10 rounded-xl bg-white shadow-subtle flex items-center justify-center text-slate-400">
                    <link.icon size={20} />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-center">{link.name}</span>
                </Link>
              ))}
            </div>

            <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col gap-3">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="bg-brand-blue text-white p-4 rounded-xl text-center font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3"
                  >
                    <User size={16} />
                    My Account
                  </Link>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="bg-brand-blue text-white p-4 rounded-xl text-center font-bold text-[10px] uppercase tracking-widest whitespace-nowrap"
                  >
                    Join Hub
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 px-6 sm:px-12 shrink-0">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white border border-slate-100 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 border-[3px] border-brand-blue rounded-sm"></div>
             </div>
             <span className="text-sm font-bold tracking-tight text-slate-900">BethalHUB</span>
          </div>
        </div>

        <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <Link to="/privacy" className="hover:text-brand-blue transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-brand-blue transition-colors">Terms</Link>
          <Link to="/contact" className="hover:text-brand-blue transition-colors">Contact</Link>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">© 2026 KHOFA WORKS</span>
        </div>
      </div>
    </footer>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
