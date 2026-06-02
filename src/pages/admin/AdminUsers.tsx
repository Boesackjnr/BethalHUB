import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { ShieldCheck, ShieldAlert, Mail, User, Search, Filter, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isVerified: !currentStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const deleteAccount = async (userId: string, displayName: string, businessId?: string) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${displayName || 'Unnamed User'}"? All listings associated will be removed.`)) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        if (businessId) {
          await deleteDoc(doc(db, 'businesses', businessId));
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user profile. Check security constraints.");
      }
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'verified' && u.isVerified) || 
                         (filter === 'unverified' && !u.isVerified);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col lg:flex-row items-center lg:items-start justify-between text-center lg:text-left gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">User Verification</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">Verify Bethalhub residents to ensure a trusted community.</p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-subtle">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search residents by name or email..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-blue/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unverified')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'unverified' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'verified' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Verified
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-0">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resident</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Auth Provider</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((u) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={u.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs uppercase tracking-tighter ring-2 ring-white ring-offset-2 shrink-0">
                          {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" /> : u.displayName?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">{u.displayName || 'Unnamed User'}</p>
                          <p className="text-xs text-slate-500 font-medium truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-nowrap">
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-widest border border-slate-200">
                        Google OAuth
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-emerald-100 text-nowrap">
                          <ShieldCheck size={12} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-amber-100 text-nowrap">
                          <ShieldAlert size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-nowrap">
                        <button
                          onClick={() => toggleVerification(u.id, u.isVerified)}
                          className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border-2 ${
                            u.isVerified 
                              ? 'border-rose-100 text-rose-500 hover:bg-rose-50' 
                              : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.isVerified ? 'Revoke' : 'Verify Resident'}
                        </button>
                        {u.role !== 'admin' && u.email !== 'boesackjnr@gmail.com' && (
                          <button
                            onClick={() => deleteAccount(u.id, u.displayName, u.businessId)}
                            className="p-2.5 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 transition-all active:scale-95 flex items-center justify-center"
                            title="Delete Account"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && !loading && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={32} />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No residents found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
