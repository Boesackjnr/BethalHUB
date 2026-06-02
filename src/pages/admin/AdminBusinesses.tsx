import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { Building2, ShieldCheck, ShieldAlert, Globe, Phone, MapPin, Search, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminBusinesses = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'businesses'), orderBy('name', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setBusinesses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const toggleVerification = async (bizId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'businesses', bizId), {
        verified: !currentStatus
      });
    } catch (err) {
      console.error("Error updating business:", err);
    }
  };

  const deleteBusiness = async (bizId: string) => {
    if (window.confirm("Are you sure you want to remove this business listing? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'businesses', bizId));
      } catch (err) {
        console.error("Error deleting business:", err);
      }
    }
  };

  const filteredBiz = businesses.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex flex-col lg:flex-row items-center lg:items-start justify-between text-center lg:text-left gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Business Verification</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">Empower local commerce by verifying Bethal businesses.</p>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by name or category..."
          className="w-full pl-14 md:pl-16 pr-6 md:pr-8 py-4 md:py-6 bg-white border border-slate-100 rounded-2xl md:rounded-[2rem] text-base md:text-lg font-bold shadow-subtle focus:ring-4 focus:ring-brand-blue/10 transition-all outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {filteredBiz.map((biz) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={biz.id}
              className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 p-6 md:p-10 flex flex-col lg:flex-row lg:items-center gap-6 md:gap-10 shadow-subtle group hover:border-brand-blue/20 transition-all"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-2xl md:rounded-3xl flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden group-hover:scale-105 transition-transform mx-auto md:mx-0">
                {biz.logoUrl ? (
                  <img src={biz.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={32} className="text-slate-300" />
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight mb-2 text-center md:text-left">{biz.name}</h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                      <span className="text-[10px] font-black text-brand-blue bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                        {biz.category}
                      </span>
                      {biz.verified ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest whitespace-nowrap">
                          <ShieldCheck size={12} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg uppercase tracking-widest whitespace-nowrap">
                          <ShieldAlert size={12} /> Pending Verification
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => toggleVerification(biz.id, biz.verified)}
                      className={`flex-1 sm:flex-none px-4 md:px-8 py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${
                        biz.verified 
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                          : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200'
                      }`}
                    >
                      {biz.verified ? 'Revoke Status' : 'Verify Business'}
                    </button>
                    <button 
                      onClick={() => deleteBusiness(biz.id)}
                      className="p-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-wide">
                    <MapPin size={16} className="text-slate-300 shrink-0" />
                    <span className="truncate">{biz.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-wide">
                    <Phone size={16} className="text-slate-300 shrink-0" />
                    <span className="truncate">{typeof biz.contact === 'string' ? biz.contact : (biz.contact?.phone || 'No Phone')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {biz.website && (
                      <a href={biz.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-blue font-bold text-[10px] md:text-xs uppercase tracking-widest hover:underline">
                        <Globe size={16} className="shrink-0" /> <span className="truncate">Visit Site</span> <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminBusinesses;
