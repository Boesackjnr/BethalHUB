import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, ArrowRight, Loader2, Megaphone, Bell, Phone, MapPin } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

const ResidentAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // 1. Check if email already exists in Firestore 'users' collection
        const emailCheckQuery = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()));
        const emailCheckSnap = await getDocs(emailCheckQuery);
        if (!emailCheckSnap.empty) {
          throw new Error('This email address is already registered to another account (Resident or Business).');
        }

        // 2. Check if phone number already exists in Firestore 'users' collection (if provided)
        if (phoneNumber && phoneNumber.trim()) {
          const trimmedPhone = phoneNumber.trim();
          const phoneCheckQuery = query(collection(db, 'users'), where('phoneNumber', '==', trimmedPhone));
          const phoneCheckSnap = await getDocs(phoneCheckQuery);
          if (!phoneCheckSnap.empty) {
            throw new Error('This phone number is already registered to another account (Resident or Business).');
          }
        }

        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, { displayName: fullName });
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: fullName,
          role: 'individual',
          isVerified: false,
          phoneNumber,
          location,
          createdAt: serverTimestamp()
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const emailCheckQuery = query(collection(db, 'users'), where('email', '==', user.email?.trim().toLowerCase()));
        const emailCheckSnap = await getDocs(emailCheckQuery);
        if (!emailCheckSnap.empty) {
          await auth.signOut();
          throw new Error('This Google email address is already registered to another account.');
        }

        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'individual', // Default to resident/individual for this page
          isVerified: false,
          createdAt: serverTimestamp()
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-32 pb-20">
      <div className="max-w-md w-full">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="card-standard p-10 bg-white"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-orange-50 text-brand-accent rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-100">
              <User size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resident Hub</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
              {isLogin ? 'Sign in to your account' : 'Join the community'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold flex items-center gap-3">
              <div className="shrink-0 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent/30 focus:bg-white transition-all font-bold text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent/30 focus:bg-white transition-all font-bold text-sm"
                      placeholder="e.g. 069 1856 391"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resident Location / Ward</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent/30 focus:bg-white transition-all font-bold text-sm"
                      placeholder="e.g. Bethal West, Ext 4"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent/30 focus:bg-white transition-all font-bold text-sm"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent/30 focus:bg-white transition-all font-bold text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-900 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] shadow-modern hover:bg-brand-accent transition-all disabled:opacity-50 active:scale-95 translate-y-0 hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  {isLogin ? 'Sign In' : 'Create Resident Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-slate-100"></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Or Continue With</span>
            <div className="h-[1px] flex-1 bg-slate-100"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 border-2 border-slate-100 rounded-[1.25rem] text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Google Account
          </button>

          <p className="mt-10 text-center text-sm font-medium text-slate-500">
            {isLogin ? "New here?" : "Already part of the hub?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-accent font-black uppercase text-[10px] tracking-widest hover:underline ml-1"
            >
              {isLogin ? 'Join Hub' : 'Sign In'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ResidentAuth;
