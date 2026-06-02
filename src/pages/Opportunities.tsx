import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Building2, ExternalLink, Briefcase, Plus, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Opportunity } from '../types';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const OpportunityCard = ({ opp }: { opp: Opportunity, key?: any }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="card-standard p-8 hover:border-brand-accent group flex flex-col items-center text-center md:flex-row md:items-center md:text-left gap-8"
  >
    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0 shadow-subtle group-hover:bg-blue-50 group-hover:text-brand-accent transition-all">
      <Briefcase size={28} />
    </div>
    <div className="flex-1 flex flex-col items-center md:items-start w-full">
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
         <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
          opp.category === 'Tender' ? 'bg-orange-50 text-orange-700 border-orange-100' :
          opp.category === 'RFQ' ? 'bg-amber-50 text-amber-700 border-amber-100' :
          'bg-emerald-50 text-emerald-700 border-emerald-100'
        }`}>{opp.category}</span>
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
           <MapPin size={12} /> {opp.location}
         </span>
      </div>
      <h4 className="text-xl font-extrabold text-slate-900 group-hover:text-brand-accent transition-colors leading-tight mb-1">{opp.title}</h4>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{opp.organization}</p>
      <p className="text-sm text-slate-500 mt-3 font-medium line-clamp-2 leading-relaxed">"{opp.description}"</p>
    </div>
    <div className="w-full md:w-auto md:border-l border-slate-100 md:pl-8 flex flex-col items-center md:items-end gap-4 justify-center">
      <div className="text-center md:text-right text-slate-500">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Deadline</p>
         <p className="text-sm font-black">{new Date(opp.deadline).toLocaleDateString()}</p>
      </div>
      <Link 
        to={`/opportunities/${opp.id}`} 
        className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-brand-accent transition-all flex items-center justify-center gap-2"
      >
        View Details <ExternalLink size={14} />
      </Link>
    </div>
  </motion.div>
);

const Opportunities = () => {
  const { profile } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'opportunities'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
      setOpportunities(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categories = ['All', 'Tender', 'RFQ', 'Job', 'Learnership', 'Internship'];

  const filtered = opportunities.filter(opp => {
    const matchesFilter = filter === 'All' || opp.category === filter;
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         opp.organization.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <section className="bg-white border-b border-slate-100 pt-40 pb-20 px-6 relative">
        <div className="max-w-5xl mx-auto container relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em] mb-4 block text-center">Bethal's Opportunity Portal</span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-none">
              Community <span className="text-brand-blue">Opportunities</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl font-medium mx-auto mb-10">
              Connecting Bethal businesses and individuals with the latest tenders, jobs, and development projects.
            </p>
            
            {profile?.role === 'business' && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-brand-blue text-white px-8 py-4 rounded-2xl font-bold hover:shadow-modern transition-all active:scale-95 translate-y-0 hover:-translate-y-1"
              >
                <Plus size={20} /> Post New Opportunity
              </button>
            )}
          </motion.div>

          <div className="mt-12 max-w-3xl mx-auto flex flex-col sm:flex-row gap-4">
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder="Search keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent/40 focus:bg-white transition-all shadow-subtle"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-5xl py-16">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="animate-spin text-brand-blue w-10 h-10" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Opportunities...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            <div className="flex flex-wrap items-center justify-center gap-2 pb-2 px-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                    filter === cat
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((opp) => (
                  <OpportunityCard key={opp.id} opp={opp} />
                ))}
              </AnimatePresence>
              
              {filtered.length === 0 && (
                <div className="py-24 text-center card-standard border-dashed border-2">
                  <Search size={48} className="mx-auto text-slate-200 mb-6" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No opportunities found</h3>
                  <p className="text-slate-500 font-medium">Try different keywords or filters.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && <CreateOpportunityModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
};

const CreateOpportunityModal = ({ onClose }: { onClose: () => void }) => {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    organization: profile?.businessName || '',
    category: 'Tender' as any,
    description: '',
    deadline: '',
    location: profile?.location || '',
    contactDetails: profile?.phoneNumber || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'opportunities'), {
        ...formData,
        status: 'open',
        authorId: user?.uid,
        businessId: profile?.businessId,
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to post opportunity.");
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
        className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Post New Opportunity</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Share with the Bethal Hub</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Job/Tender Title</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-standard" placeholder="e.g. Senior Electrician Needed" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input-standard">
                <option value="Tender">Tender</option>
                <option value="RFQ">RFQ</option>
                <option value="Job">Job</option>
                <option value="Learnership">Learnership</option>
                <option value="Internship">Internship</option>
                <option value="Training">Training</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Detailed Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-standard min-h-[120px] py-4" placeholder="Describe the requirements, scope of work, etc..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Deadline Date</label>
              <input required type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="input-standard" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Organization Name</label>
              <input required type="text" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} className="input-standard" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Location</label>
              <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="input-standard" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Contact Details</label>
              <input required type="text" value={formData.contactDetails} onChange={e => setFormData({...formData, contactDetails: e.target.value})} className="input-standard" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-blue transition-all shadow-modern disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Publish Opportunity"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Opportunities;
