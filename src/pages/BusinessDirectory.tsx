import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Globe, Star, ShieldCheck, ArrowRight, Building2, ExternalLink, Loader2, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Business } from '../types';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

const BusinessCard = ({ business }: { business: Business, key?: any }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    className="card-standard p-8 group hover:border-brand-blue/30 transition-all flex flex-col h-full text-center sm:text-left items-center sm:items-start"
  >
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-blue-50 group-hover:text-brand-blue transition-colors overflow-hidden">
        {business.logoUrl ? (
          <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
        ) : (
          <Building2 size={32} className="text-slate-300" />
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-black text-brand-blue bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-blue-100">
            {business.category}
          </span>
          {(business.isVerified || business.verified) && (
            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">
              <ShieldCheck size={12} /> Verified
            </span>
          )}
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 leading-tight tracking-tight mb-1">
          {business.name}
        </h3>
        <p className="text-sm font-bold text-slate-400 capitalize flex items-center gap-2">
          <MapPin size={14} className="text-slate-300" /> {business.location}
        </p>
      </div>
    </div>

    <p className="text-slate-500 font-medium line-clamp-3 mb-8 leading-relaxed flex-grow">
      {business.description || "No description provided."}
    </p>

    <div className="pt-8 border-t border-slate-100 mt-auto flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           {((typeof business.contact === 'object' && business.contact?.phone) || business.phoneNumber) && <Phone size={16} className="text-slate-300" />}
           {business.website && <Globe size={16} className="text-slate-300" />}
        </div>
        <button className="text-[10px] font-black text-slate-900 group-hover:text-brand-blue uppercase tracking-widest flex items-center gap-2 transition-colors">
          View Profile <ArrowRight size={14} />
        </button>
      </div>
    </div>
  </motion.div>
);

const BusinessDirectory = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'businesses'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
      setBusinesses(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categories = ['All', 'Retail', 'Technology', 'Healthcare', 'Services', 'Construction', 'Education', 'Other'];

  const filtered = businesses.filter(biz => {
    const matchesFilter = filter === 'All' || biz.category === filter;
    const matchesSearch = biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         biz.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <section className="bg-white border-b border-slate-100 pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto container relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em] mb-4 block">Bethal's Opportunity Portal</span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-none">
              Business <span className="text-brand-blue">Hub</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl font-medium mx-auto mb-12">
              Discover and connect with trusted local businesses, service providers, and entrepreneurs in Bethal.
            </p>

            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4">
              <div className="flex-grow relative">
                <input
                  type="text"
                  placeholder="Search businesses, services, or industries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent/40 focus:bg-white transition-all shadow-modern font-medium"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-7xl py-12">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="animate-spin text-brand-blue w-10 h-10" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning Directory...</p>
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

            <div className="flex justify-between items-end mb-4 px-2">
              <div>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Results</p>
                 <p className="text-xl font-extrabold text-slate-900">{filtered.length} Businesses</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filtered.map((biz) => (
                  <BusinessCard key={biz.id} business={biz} />
                ))}
              </AnimatePresence>
            </div>

            {filtered.length === 0 && (
              <div className="py-32 text-center card-standard border-dashed border-2">
                <Building2 size={64} className="mx-auto text-slate-200 mb-8" />
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">No businesses found</h3>
                <p className="text-slate-500 font-medium">Try refining your search or explore other categories.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDirectory;
