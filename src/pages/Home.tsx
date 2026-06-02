import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Briefcase, Building2, Bell, ArrowRight, TrendingUp, CheckCircle2, Loader2, Megaphone, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { Opportunity, CommunityNotice, Business } from '../types';

const Hero = () => {
  return (
    <header className="bg-white border-b border-slate-100 px-6 sm:px-12 py-16 sm:py-24 pt-32 sm:pt-44 overflow-hidden relative text-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>
      <div className="max-w-5xl mx-auto flex flex-col items-center relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="max-w-3xl"
        >
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 block leading-none">Bethal's Opportunity Portal</span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[0.9]">
            BethalHUB
          </h1>
          <p className="text-slate-500 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Your centralized portal for local tenders, employment, and community notices in Bethal.
          </p>
        </motion.div>
        
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.2 }}
           className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mt-12"
        >
          <div className="relative flex-grow text-left">
            <input 
              type="text" 
              placeholder="Search jobs, tenders, RFQs..." 
              className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 focus:bg-white transition-all shadow-subtle font-medium"
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={22} />
            </div>
          </div>
          <button className="bg-brand-blue text-white px-10 py-5 rounded-2xl text-base font-bold hover:bg-slate-800 transition-all shadow-modern active:scale-95">
            Search
          </button>
        </motion.div>
      </div>
    </header>
  );
};

const OpportunityItem = ({ opp }: { opp: Opportunity, key?: any }) => (
  <Link to={`/opportunities/${opp.id}`} className="card-standard p-8 hover:border-brand-accent group flex flex-col items-center text-center md:flex-row md:items-center md:text-left gap-8 translate-y-0 hover:-translate-y-1">
    <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center shrink-0 shadow-subtle group-hover:scale-110 transition-transform border border-blue-100">
      <Briefcase size={24} />
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
    <div className="w-full md:w-auto md:border-l border-slate-100 md:pl-8 flex flex-col items-center md:items-end gap-3 justify-center">
      <div className="text-center md:text-right">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5 whitespace-nowrap">Deadline</p>
         <p className="text-sm font-bold text-slate-700">{new Date(opp.deadline).toLocaleDateString()}</p>
      </div>
      <div className="flex items-center gap-2 text-brand-accent font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all whitespace-nowrap">
        View <ArrowRight size={16} />
      </div>
    </div>
  </Link>
);

const Home = () => {
  const [recentOpps, setRecentOpps] = useState<Opportunity[]>([]);
  const [recentNotices, setRecentNotices] = useState<CommunityNotice[]>([]);
  const [counts, setCounts] = useState({ opps: 0, biz: 0, notices: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recent Opportunities
    const oppsQ = query(collection(db, 'opportunities'), orderBy('createdAt', 'desc'), limit(3));
    const unsubscribeOpps = onSnapshot(oppsQ, (snapshot) => {
      setRecentOpps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity)));
    });

    // Recent Notices
    const noticesQ = query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(4));
    const unsubscribeNotices = onSnapshot(noticesQ, (snapshot) => {
      setRecentNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityNotice)));
    });

    // Counts
    const unsubscribeCountsOpps = onSnapshot(collection(db, 'opportunities'), (s) => setCounts(prev => ({ ...prev, opps: s.size })));
    const unsubscribeCountsBiz = onSnapshot(collection(db, 'businesses'), (s) => setCounts(prev => ({ ...prev, biz: s.size })));
    const unsubscribeCountsNotices = onSnapshot(collection(db, 'notices'), (s) => setCounts(prev => ({ ...prev, notices: s.size })));

    setLoading(false);

    return () => {
      unsubscribeOpps();
      unsubscribeNotices();
      unsubscribeCountsOpps();
      unsubscribeCountsBiz();
      unsubscribeCountsNotices();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Hero />
      
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Quick Categories Aside */}
          <aside className="lg:w-72 flex flex-col gap-8 shrink-0">
            <div className="card-standard p-6 md:sticky md:top-28">
              <h3 className="label-standard mb-6 text-center">Bethal Hub</h3>
              <div className="space-y-1">
                {[
                  { name: 'Opportunities', count: counts.opps, link: '/opportunities' },
                  { name: 'Businesses', count: counts.biz, link: '/business-directory' },
                  { name: 'Community Feed', count: counts.notices, link: '/community-notices' },
                  { name: 'Tenders & RFQs', count: recentOpps.filter(o => o.category === 'Tender' || o.category === 'RFQ').length, link: '/opportunities' },
                ].map((cat) => (
                  <Link 
                    to={cat.link}
                    key={cat.name}
                    className="w-full px-4 py-3 rounded-xl text-xs flex justify-between items-center group transition-all text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  >
                    <span className="uppercase tracking-widest leading-none font-bold">{cat.name}</span>
                    <span className="text-[9px] w-6 h-6 flex items-center justify-center rounded-lg font-black bg-slate-100 text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all">
                      {cat.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Feed */}
          <section className="flex-1 flex flex-col gap-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recent Opportunities</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Latest updates for you</p>
              </div>
              <Link to="/opportunities" className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline">View All</Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {recentOpps.length > 0 ? (
                recentOpps.map((opp) => (
                  <OpportunityItem key={opp.id} opp={opp} />
                ))
              ) : (
                <div className="py-20 text-center card-standard border-dashed border-2">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No recent opportunities</p>
                </div>
              )}
            </div>
            
            <div className="mt-12 border-t border-slate-100 pt-16">
               <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Community Watch</h2>
                  <Link to="/community-notices" className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline">Full Feed</Link>
               </div>
               <div className="grid md:grid-cols-2 gap-6">
                  {recentNotices.length > 0 ? (
                    recentNotices.map((notice) => (
                      <Link to="/community-notices" key={notice.id} className="card-standard p-6 flex flex-col items-center text-center gap-4 hover:border-brand-blue transition-colors cursor-pointer group">
                         <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-blue-50 group-hover:text-brand-blue transition-all">
                            {notice.type === 'Alert' ? <AlertTriangle size={20} className="text-rose-500" /> : <Megaphone size={20} />}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900 leading-tight mb-1 group-hover:text-brand-blue transition-colors truncate w-full max-w-[200px]">{notice.title}</p>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(notice.createdAt).toLocaleDateString()}</p>
                         </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-2 py-10 text-center card-standard border-dashed border-2">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No recent notices</p>
                    </div>
                  )}
               </div>
            </div>
          </section>

          {/* Right Panel */}
          <aside className="lg:w-80 shrink-0 flex flex-col gap-8">
            <div className="bg-slate-900 rounded-[2rem] p-8 shadow-modern relative overflow-hidden group flex flex-col items-center text-center border border-white/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/20 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
              <h3 className="text-xs font-black text-brand-accent uppercase tracking-[0.3em] mb-4">Support Hub</h3>
              <p className="text-white font-bold leading-relaxed mb-8 flex flex-col items-center gap-3">
                <CheckCircle2 size={18} className="text-brand-accent" />
                Dedicated municipal support to help you apply.
              </p>
              <button className="w-full bg-white text-slate-900 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all">
                Get Assistance
              </button>
            </div>

            <div className="card-standard p-8 flex flex-col items-center text-center">
              <h3 className="label-standard mb-6">Service Status</h3>
              <div className="space-y-6 w-full">
                {[
                  { name: 'Electrical Grid', info: 'Operational', status: 'optimal' },
                  { name: 'Water Services', info: 'Lower Flow (Ext 5)', status: 'alert' },
                  { name: 'Waste Mgmt', info: 'On Schedule', status: 'optimal' },
                ].map((s) => (
                  <div key={s.name} className="flex flex-col items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${s.status === 'optimal' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}></div>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none mb-1">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{s.info}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-standard p-8 flex flex-col items-center text-center">
              <h3 className="label-standard mb-6">Local Spotlight</h3>
              <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100 w-full flex flex-col items-center">
                <div className="aspect-video w-full bg-slate-200 rounded-2xl mb-4 overflow-hidden shadow-subtle border border-slate-200">
                  <img src="https://images.unsplash.com/photo-1556761175-59733c302f35?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Business" />
                </div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-tight mb-1">Local Business</h4>
                <p className="text-[10px] text-brand-accent font-black uppercase tracking-widest mb-4">Community Focused</p>
                <Link to="/business-directory" className="w-full inline-block text-center text-[10px] font-black uppercase tracking-widest py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600">
                  Directory
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Home;