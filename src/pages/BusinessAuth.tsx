import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Mail, Lock, User, ArrowRight, Loader2, ShieldCheck, Globe, Phone, MapPin, FileText } from 'lucide-react';
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

const BusinessAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Retail');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
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
        await updateProfile(user, { displayName: businessName });
        
        const businessId = `biz_${user.uid}`;
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: businessName,
          businessName: businessName,
          businessId: businessId,
          role: 'business',
          isVerified: false,
          phoneNumber,
          location,
          createdAt: serverTimestamp()
        });

        await setDoc(doc(db, 'businesses', businessId), {
          id: businessId,
          name: businessName,
          category: businessCategory,
          description: businessDescription,
          location,
          contact: phoneNumber,
          website: '',
          ownerId: user.uid,
          verified: false,
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
          role: 'business', // Default to business for this page
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
            <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-100">
              <Building2 size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Portal</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
              {isLogin ? 'Sign in to your account' : 'Register your business'}
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/30 focus:bg-white transition-all font-bold text-sm"
                      placeholder="Enter legal business name"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Category</label>
                  <div className="relative">
                    <select
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/30 focus:bg-white transition-all font-bold text-sm"
                    >
                      <option value="Retail">Retail</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Services">Services</option>
                      <option value="Construction">Construction</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/30 focus:bg-white transition-all font-bold text-sm"
                      placeholder="e.g. 017 647 1234"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Business Address</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/30 focus:bg-white transition-all font-bold text-sm"
                      placeholder="e.g. 123 Block A, Bethal CBD"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Description</label>
                  <div className="relative">
                    <FileText size={18} className="absolute left-4 top-4 text-slate-300" />
                    <textarea
                      required
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      className="w-full pl-12 pr-4 pt-3.5 h-24 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/30 focus:bg-white transition-all font-bold text-sm resize-none"
                      placeholder="Describe your activities/services..."
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
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/30 focus:bg-white transition-all font-bold text-sm"
                  placeholder="contact@business.com"
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
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/30 focus:bg-white transition-all font-bold text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-900 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] shadow-modern hover:bg-brand-blue transition-all disabled:opacity-50 active:scale-95 translate-y-0 hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  {isLogin ? 'Sign In' : 'Create Business Account'}
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
            Google Workspace
          </button>

          <p className="mt-10 text-center text-sm font-medium text-slate-500">
            {isLogin ? "New to the Hub?" : "Already registered?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-blue font-black uppercase text-[10px] tracking-widest hover:underline ml-1"
            >
              {isLogin ? 'Apply for Account' : 'Sign In Instead'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessAuth;
