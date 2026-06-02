import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { seedDatabase } from '../../lib/seed';
import { 
  Users, 
  Building2, 
  Bell, 
  Briefcase, 
  TrendingUp, 
  ShieldCheck,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Database,
  Loader2,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';

const StatCard = ({ title, value, icon: Icon, trend, color, textColor }: any) => (
  <div className="bg-white p-6 lg:p-8 rounded-3xl lg:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col gap-4 lg:gap-6">
    <div className="flex items-center justify-between">
      <div className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl ${color} bg-opacity-10 ${textColor} group-hover:scale-110 transition-transform`}>
        <Icon size={20} className="lg:w-6 lg:h-6" />
      </div>
      {trend && (
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1 ${
          trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {trend > 0 ? <ArrowUpRight size={10} /> : <TrendingDown size={10} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <h3 className="text-slate-500 font-bold text-[10px] lg:text-xs uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
    </div>
  </div>
);

const AdminOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    totalNotices: 0,
    totalOpps: 0,
    pendingVerifications: 0
  });
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (s) => setStats(prev => ({ ...prev, totalUsers: s.size })));
    const unsubBiz = onSnapshot(collection(db, 'businesses'), (s) => setStats(prev => ({ ...prev, totalBusinesses: s.size })));
    const unsubNotices = onSnapshot(collection(db, 'notices'), (s) => setStats(prev => ({ ...prev, totalNotices: s.size })));
    const unsubOpps = onSnapshot(collection(db, 'opportunities'), (s) => setStats(prev => ({ ...prev, totalOpps: s.size })));
    
    const qPending = query(collection(db, 'users'), where('isVerified', '==', false));
    const unsubPending = onSnapshot(qPending, (s) => setStats(prev => ({ ...prev, pendingVerifications: s.size })));

    return () => {
      unsubUsers();
      unsubBiz();
      unsubNotices();
      unsubOpps();
      unsubPending();
    };
  }, []);

  const handleSeed = async () => {
    if (window.confirm("This will add sample businesses, opportunities, and notices to BethalHub. Continue?")) {
      setIsSeeding(true);
      try {
        await seedDatabase();
        setSeedSuccess(true);
        setTimeout(() => setSeedSuccess(false), 3000);
      } catch (error) {
        alert("Failed to seed database. Check console for details.");
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const handleClearAccounts = async () => {
    if (window.confirm("Are you sure you want to delete ALL non-admin resident profiles and registered businesses? This will reset the live register records.")) {
      setIsClearing(true);
      try {
        // 1. Get all users
        const usersSnap = await getDocs(collection(db, 'users'));
        for (const userDoc of usersSnap.docs) {
          const userData = userDoc.data();
          if (userData.role !== 'admin' && userData.email !== 'boesackjnr@gmail.com') {
            await deleteDoc(doc(db, 'users', userDoc.id));
          }
        }

        // 2. Get all businesses
        const bizSnap = await getDocs(collection(db, 'businesses'));
        for (const bizDoc of bizSnap.docs) {
          await deleteDoc(doc(db, 'businesses', bizDoc.id));
        }

        setClearSuccess(true);
        setTimeout(() => setClearSuccess(false), 3000);
      } catch (error) {
        console.error("Clearing database error:", error);
        alert("Failed to clear profiles. Access rules might prevent database reset.");
      } finally {
        setIsClearing(false);
      }
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col lg:flex-row items-center lg:items-start justify-between text-center lg:text-left gap-8">
        <div className="flex flex-col items-center lg:items-start">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-2 leading-none">
            Bethalhub Dashboard
          </h1>
          <p className="text-slate-500 font-medium text-sm lg:text-lg max-w-xl">
            Welcome back, Admin. Here's a snapshot of the community.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto shrink-0">
          <button
            onClick={handleSeed}
            disabled={isSeeding || isClearing}
            className={`flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all w-full sm:w-auto shadow-xl ${
              seedSuccess 
                ? 'bg-emerald-500 text-white shadow-emerald-200' 
                : 'bg-white border-2 border-slate-100 text-slate-900 hover:border-brand-blue hover:text-brand-blue shadow-subtle'
            }`}
          >
            {isSeeding ? (
              <Loader2 size={18} className="animate-spin" />
            ) : seedSuccess ? (
              <CheckCircle2 size={18} />
            ) : (
              <Database size={18} />
            )}
            {isSeeding ? 'Configuring System...' : seedSuccess ? 'Initialized' : 'Auto-Configure DB'}
          </button>

          <button
            onClick={handleClearAccounts}
            disabled={isSeeding || isClearing}
            className={`flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all w-full sm:w-auto shadow-xl ${
              clearSuccess 
                ? 'bg-rose-500 text-white shadow-rose-200' 
                : 'bg-white border-2 border-slate-100 text-rose-500 hover:border-rose-400 hover:text-rose-600 shadow-subtle'
            }`}
          >
            {isClearing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : clearSuccess ? (
              <CheckCircle2 size={18} />
            ) : (
              <Trash2 size={18} />
            )}
            {isClearing ? 'Clearing Records...' : clearSuccess ? 'Records Cleared' : 'Reset Accounts DB'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Residents" value={stats.totalUsers} icon={Users} color="bg-blue-500" textColor="text-blue-600" trend={12} />
        <StatCard title="Total Businesses" value={stats.totalBusinesses} icon={Building2} color="bg-emerald-500" textColor="text-emerald-600" trend={8} />
        <StatCard title="Active Notices" value={stats.totalNotices} icon={Bell} color="bg-amber-500" textColor="text-amber-600" trend={-2} />
        <StatCard title="Opportunities" value={stats.totalOpps} icon={Briefcase} color="bg-purple-500" textColor="text-purple-600" trend={24} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 p-6 lg:p-10">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-lg lg:text-xl font-black text-slate-900 uppercase tracking-tight">Recent Activity</h2>
            <button 
              onClick={() => navigate('/admin/businesses')}
              className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4 md:space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 md:gap-6 p-3 md:p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                  <Clock size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">New Business Registration</p>
                  <p className="text-xs text-slate-500 truncate">"Musa & Sons" requested verification.</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-nowrap">2h ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-blue rounded-3xl md:rounded-[2.5rem] p-6 lg:p-10 text-white relative overflow-hidden group">
          <div className="relative z-10 h-full flex flex-col">
            <ShieldCheck size={40} className="mb-4 lg:mb-6 text-brand-accent group-hover:scale-110 transition-transform" />
            <h2 className="text-xl lg:text-2xl font-black tracking-tight mb-3 md:mb-4 uppercase">Verification Queue</h2>
            <p className="text-blue-100 font-medium text-sm lg:text-base mb-6 md:mb-8">There are {stats.pendingVerifications} users waiting for verification. Keeping Bethalhub safe is our priority.</p>
            <div className="mt-auto">
              <button 
                onClick={() => navigate('/admin/users')}
                className="w-full bg-white text-brand-blue py-3.5 lg:py-4 rounded-xl font-black text-[10px] lg:text-xs uppercase tracking-widest hover:bg-brand-accent hover:text-white transition-all shadow-xl shadow-blue-900/20"
              >
                Start Reviewing
              </button>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
