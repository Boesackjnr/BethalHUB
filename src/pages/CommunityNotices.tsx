import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, User, MapPin, Search, Filter, Plus, Clock, Loader2, X, MessageSquare, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CommunityNotice } from '../types';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const NoticeCard = ({ notice }: { notice: CommunityNotice, key?: any }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="card-standard p-8 hover:border-brand-accent group flex flex-col gap-6"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
            notice.type === 'Alert' ? 'bg-rose-50 text-rose-700 border-rose-100' :
            notice.type === 'Event' ? 'bg-blue-50 text-blue-700 border-blue-100' :
            'bg-slate-50 text-slate-700 border-slate-100'
          }`}>
            {notice.type}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border border-slate-100 px-2.5 py-1 rounded-lg">
            {notice.priority}
          </span>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 group-hover:text-brand-accent transition-colors leading-tight mb-2">
          {notice.title}
        </h3>
        <p className="text-slate-600 font-medium leading-relaxed">
          {notice.content}
        </p>
      </div>
      <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-brand-blue/5 group-hover:text-brand-blue transition-all">
        {notice.type === 'Alert' ? <AlertTriangle size={24} /> : <Megaphone size={24} />}
      </div>
    </div>
    
    <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <Clock size={12} /> {new Date(notice.createdAt).toLocaleDateString()}
        </div>
      </div>
      <button className="text-[10px] font-black text-brand-accent uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
        Read Full Notice <Plus size={12} />
      </button>
    </div>
  </motion.div>
);

const CommunityNotices = () => {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<CommunityNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as CommunityNotice));
      setNotices(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const types = ['All', 'Alert', 'Event', 'General'];

  const filtered = notices.filter(n => filter === 'All' || n.type === filter);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <section className="bg-white border-b border-slate-100 pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto container relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em] mb-4 block">Bethal's Opportunity Portal</span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-none">
              Community <span className="text-brand-blue">Feed</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl font-medium mx-auto mb-10">
              Stay updated with local news, events, and important alerts from across Bethal.
            </p>
            
            {(profile?.role === 'individual' || profile?.role === 'admin') && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-modern transition-all active:scale-95 translate-y-0 hover:-translate-y-1"
              >
                <Plus size={20} /> Share a Notice
              </button>
            )}
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-4xl py-16">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="animate-spin text-brand-blue w-10 h-10" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Feed...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            <div className="flex flex-wrap items-center justify-center gap-2 pb-2 px-1">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                    filter === t
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-8">
              <AnimatePresence mode="popLayout">
                {filtered.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </AnimatePresence>
              
              {filtered.length === 0 && (
                <div className="py-24 text-center card-standard border-dashed border-2">
                  <Megaphone size={48} className="mx-auto text-slate-200 mb-6" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No notices yet</h3>
                  <p className="text-slate-500 font-medium">Be the first to share something with the community.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && <CreateNoticeModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
};

const CreateNoticeModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'General' as any,
    priority: 'Normal' as any
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'notices'), {
        ...formData,
        authorId: user?.uid,
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to post notice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl"
      >
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Share Community Notice</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Updates for the neighborhood</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Notice Title</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-standard" placeholder="e.g. Neighborhood Clean-up Day" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="input-standard">
                <option value="General">General</option>
                <option value="Alert">Alert</option>
                <option value="Event">Event</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="input-standard">
                <option value="Normal">Normal</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Content</label>
            <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="input-standard min-h-[150px] py-4" placeholder="What would you like to share?" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-blue transition-all shadow-modern disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Post Notice"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CommunityNotices;
