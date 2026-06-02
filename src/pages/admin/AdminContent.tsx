import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { Bell, Briefcase, Trash2, Eye, Filter, Calendar, MapPin, Tag, AlertTriangle, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine tab from path
  const currentTab = location.pathname.includes('/opportunities') ? 'opportunities' : 'notices';
  
  const [notices, setNotices] = useState<any[]>([]);
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<any | null>(null);

  useEffect(() => {
    const unsubNotices = onSnapshot(query(collection(db, 'notices'), orderBy('createdAt', 'desc')), (s) => {
      setNotices(s.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubOpps = onSnapshot(query(collection(db, 'opportunities'), orderBy('createdAt', 'desc')), (s) => {
      setOpps(s.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => { unsubNotices(); unsubOpps(); };
  }, []);

  const handleDelete = async (id: string, type: 'notices' | 'opportunities') => {
    if (window.confirm(`Are you sure you want to delete this ${type === 'notices' ? 'notice' : 'opportunity'}? This is permanent.`)) {
      try {
        await deleteDoc(doc(db, type, id));
      } catch (err) {
        console.error("Error deleting item:", err);
      }
    }
  };

  const handleTabChange = (tab: 'notices' | 'opportunities') => {
    navigate(`/admin/${tab}`);
  };

  return (
    <div className="space-y-6 md:space-y-12">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between text-center lg:text-left gap-6 md:gap-8">
        <div className="flex flex-col items-center lg:items-start">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Content Moderator</h1>
          <p className="text-slate-500 font-medium text-[13px] md:text-base">Review and manage announcements and community listings.</p>
        </div>
        <div className="bg-white p-1.5 md:p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => handleTabChange('notices')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${
              currentTab === 'notices' ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bell size={14} className="md:w-[16px] md:h-[16px]" /> Notices
          </button>
          <button
            onClick={() => handleTabChange('opportunities')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${
              currentTab === 'opportunities' ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Briefcase size={14} className="md:w-[16px] md:h-[16px]" /> Opportunities
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="wait">
          {currentTab === 'notices' ? (
            <motion.div
              key="notices"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {notices.map((n) => (
              <div key={n.id} className="bg-white rounded-2xl md:rounded-3xl lg:rounded-[2rem] p-5 md:p-6 lg:p-8 flex flex-col md:flex-row gap-5 md:gap-6 lg:gap-8 items-start hover:border-amber-200 transition-all shadow-subtle group">
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 border ${
                    n.type === 'Alert' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    {n.type === 'Alert' ? <AlertTriangle size={20} /> : <Bell size={20} />}
                  </div>
                  <div className="flex-1 space-y-4 w-full min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-base md:text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-tight mb-2 truncate md:whitespace-normal">{n.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                          <span className="text-[9px] md:text-[10px] font-black text-slate-400 bg-slate-50 px-2 md:px-2.5 py-1 rounded-lg uppercase tracking-widest">
                            {n.type}
                          </span>
                          <span className={`text-[9px] md:text-[10px] font-black px-2 md:px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                            n.priority === 'urgent' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {n.priority} priority
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedNotice(n)}
                          className="flex-1 sm:flex-none p-3 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all flex items-center justify-center"
                          title="Preview Notice"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(n.id, 'notices')}
                          className="flex-1 sm:flex-none p-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all flex items-center justify-center"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-3 font-medium">{n.content}</p>
                    <div className="flex items-center gap-4 text-[9px] md:text-[10px] font-black text-slate-400 tracking-widest uppercase">
                      <Calendar size={12} /> {n.createdAt?.toDate?.()?.toLocaleDateString() || new Date(n.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="opps"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6"
            >
              {opps.map((o) => (
                <div key={o.id} className="bg-white rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] p-5 md:p-6 lg:p-8 hover:border-purple-200 transition-all shadow-subtle group relative overflow-hidden flex flex-col">
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4 md:mb-6">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100 shrink-0">
                        <Briefcase size={20} />
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedOpp(o)}
                          className="p-2 lg:p-3 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all"
                          title="Preview Opportunity"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(o.id, 'opportunities')}
                          className="p-2 lg:p-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 md:space-y-2 mb-4 md:mb-6 min-w-0">
                      <h3 className="text-base md:text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-tight truncate md:whitespace-normal">{o.title}</h3>
                      <p className="text-[9px] md:text-[10px] lg:text-xs font-black text-brand-blue uppercase tracking-widest truncate">{o.organization}</p>
                    </div>
                    <div className="mt-auto space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-[9px] md:text-[10px] font-black text-slate-500 bg-slate-50 px-2 md:px-2.5 py-1 rounded-lg uppercase tracking-widest border border-slate-100">
                          {o.category}
                        </span>
                        <span className={`text-[9px] md:text-[10px] font-black px-2 md:px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                          o.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {o.status}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[9px] md:text-[10px] font-black text-slate-400 tracking-widest uppercase">
                        <span className="flex items-center gap-2 truncate"><MapPin size={12} /> {o.location}</span>
                        <span className="flex items-center gap-2 whitespace-nowrap"><Calendar size={12} /> Closes: {new Date(o.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notice Preview Modal */}
      <AnimatePresence>
        {selectedNotice && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest pl-1">Moderator Preview</span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Community Notice</h2>
                </div>
                <button onClick={() => setSelectedNotice(null)} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-10 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
                    selectedNotice.type === 'Alert' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-slate-50 text-slate-700 border-slate-100'
                  }`}>
                    {selectedNotice.type}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 px-2.5 py-1 rounded-lg">
                    {selectedNotice.priority} PRIORITY
                  </span>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight mb-4">
                    {selectedNotice.title}
                  </h3>
                  <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    {selectedNotice.content}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <Clock size={14} /> Created At: {selectedNotice.createdAt?.toDate?.()?.toLocaleString() || new Date(selectedNotice.createdAt).toLocaleString()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Opportunity Preview Modal */}
      <AnimatePresence>
        {selectedOpp && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest pl-1">Moderator Preview</span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Opportunity Listing</h2>
                </div>
                <button onClick={() => setSelectedOpp(null)} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-10 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] md:text-[10px] font-black text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-slate-100">
                    {selectedOpp.category}
                  </span>
                  <span className={`text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                    selectedOpp.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {selectedOpp.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight mb-2">
                    {selectedOpp.title}
                  </h3>
                  <p className="text-sm font-black text-brand-blue uppercase tracking-widest mb-4">
                    {selectedOpp.organization}
                  </p>
                  <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap">
                    {selectedOpp.description || selectedOpp.requirements || "No additional description details provided."}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-2 truncate"><MapPin size={14} /> {selectedOpp.location}</span>
                  <span className="flex items-center gap-2 whitespace-nowrap"><Calendar size={14} /> Deadline: {new Date(selectedOpp.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminContent;
