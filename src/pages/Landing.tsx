import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Megaphone, ShieldCheck, ArrowRight, Building2, User, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const Landing = () => {
  const [counts, setCounts] = useState({ businesses: 0, opportunities: 0, notices: 0, residents: 0 });

  useEffect(() => {
    const unsubscribeBiz = onSnapshot(collection(db, 'businesses'), (s) => setCounts(prev => ({ ...prev, businesses: s.size })));
    const unsubscribeOpps = onSnapshot(collection(db, 'opportunities'), (s) => setCounts(prev => ({ ...prev, opportunities: s.size })));
    const unsubscribeNotices = onSnapshot(collection(db, 'notices'), (s) => setCounts(prev => ({ ...prev, notices: s.size })));
    
    const qResidents = query(collection(db, 'users'), where('role', '==', 'individual'));
    const unsubscribeResidents = onSnapshot(qResidents, (s) => setCounts(prev => ({ ...prev, residents: s.size })));

    return () => {
      unsubscribeBiz();
      unsubscribeOpps();
      unsubscribeNotices();
      unsubscribeResidents();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10"></div>
        <div className="max-w-7xl mx-auto container relative">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
              </span>
              <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Bethal's Opportunity Portal</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8"
            >
              BethalHUB
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed mb-12"
            >
              The digital gateway for Bethal. Whether you're a business scaling up or a resident staying informed, everything you need is here.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/resident-auth"
                className="px-10 py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-brand-blue transition-all shadow-xl shadow-slate-900/10 active:scale-95"
              >
                Join the Hub
              </Link>
              <Link
                to="/about"
                className="px-10 py-5 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dual Nature Section */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto container">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Business Side */}
            <motion.div
              whileHover={{ y: -10 }}
              className="card-standard p-12 border-2 border-slate-100 hover:border-brand-blue group transition-all flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-3xl flex items-center justify-center mb-8 border border-blue-100 group-hover:scale-110 transition-transform">
                <Building2 size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">For Businesses</h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                Verified commercial accounts can post RFQs, Tenders, and Job opportunities directly to the Bethal workforce.
              </p>
              <ul className="space-y-4 mb-10 text-left w-fit">
                {[
                  'Post Tenders & RFQs',
                  'Register in Directory',
                  'Access Local Contractors',
                  'Business Verification Badge'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <CheckCircle2 size={18} className="text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/business-auth" className="flex items-center gap-2 text-xs font-black text-brand-blue uppercase tracking-widest group-hover:gap-4 transition-all">
                Register as Business <ArrowRight size={18} />
              </Link>
            </motion.div>

            {/* Individual Side */}
            <motion.div
              whileHover={{ y: -10 }}
              className="card-standard p-12 border-2 border-slate-100 hover:border-brand-accent group transition-all flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-orange-50 text-brand-accent rounded-3xl flex items-center justify-center mb-8 border border-orange-100 group-hover:scale-110 transition-transform">
                <User size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">For Residents</h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                Individuals stay informed with the community feed, service alerts, and access local employment opportunities.
              </p>
              <ul className="space-y-4 mb-10 text-left w-fit">
                {[
                  'Real-time Service Alerts',
                  'Post Community Notices',
                  'Find Local Employment',
                  'Support Local Businesses'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <CheckCircle2 size={18} className="text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/resident-auth" className="flex items-center gap-2 text-xs font-black text-brand-accent uppercase tracking-widest group-hover:gap-4 transition-all">
                Join as Resident <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-900 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-5xl mx-auto container px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Registered Businesses', val: counts.businesses },
              { label: 'Active Opportunities', val: counts.opportunities },
              { label: 'Community Notices', val: counts.notices },
              { label: 'Local Residents', val: counts.residents },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-black text-white mb-2 leading-none">{stat.val}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
