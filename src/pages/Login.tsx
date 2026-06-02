import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Chrome, Building2, Phone, MapPin, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { auth, db, isConfigValid } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'individual' | 'business'>('individual');
  
  // Custom states for distinct Business / Resident register components
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Retail');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');

  const [error, setError] = useState<string | null>(isConfigValid ? null : 'Firebase configuration is missing. Please add your keys in the Settings menu.');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigValid) {
      setError('Firebase configuration is missing. Please add your VITE_FIREBASE_* keys in the Settings -> Secrets menu.');
      return;
    }
    setError(null);
    setLoading(true);

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

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update display name
        const displayName = role === 'business' ? businessName : fullName;
        await updateProfile(user, { displayName });
        
        // Special Case: Grant admin to specific user for initial setup
        const userRole = email.toLowerCase() === 'boesackjnr@gmail.com' ? 'admin' : role;
        const isVerified = email.toLowerCase() === 'boesackjnr@gmail.com' ? true : false;
        
        const businessId = role === 'business' ? `biz_${user.uid}` : '';
        
        // Create user profile in Firestore
        const userPayload: any = {
          uid: user.uid,
          email: user.email,
          displayName,
          role: userRole,
          isVerified: isVerified,
          phoneNumber,
          location,
          createdAt: serverTimestamp()
        };
        
        if (role === 'business') {
          userPayload.businessName = businessName;
          userPayload.businessCategory = businessCategory;
          userPayload.businessDescription = businessDescription;
          userPayload.businessId = businessId;
        }
        
        await setDoc(doc(db, 'users', user.uid), userPayload);

        // Also create a business directory entry if the user registered as a business
        if (role === 'business') {
          await setDoc(doc(db, 'businesses', businessId), {
            id: businessId,
            name: businessName,
            category: businessCategory,
            description: businessDescription,
            location,
            contact: phoneNumber,
            website: '',
            ownerId: user.uid,
            verified: isVerified,
            createdAt: serverTimestamp()
          });
        }
      }
      navigate('/');
    } catch (err: any) {
      const errorCode = err?.code || '';
      const errorMessage = err?.message || '';
      const isCredentialError = 
        errorCode === 'auth/invalid-credential' || 
        errorCode === 'auth/wrong-password' || 
        errorCode === 'auth/user-not-found' ||
        errorMessage.includes('auth/invalid-credential') ||
        errorMessage.includes('auth/wrong-password') ||
        errorMessage.includes('auth/user-not-found');
      
      const isCommonUserError = isCredentialError || [
        'auth/email-already-in-use', 
        'auth/weak-password',
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request'
      ].includes(errorCode);

      // Don't log expected user input errors to console
      if (!isCommonUserError) {
        console.error("Auth error:", err);
      }
      
      let message = 'An error occurred during authentication.';
      
      if (isCredentialError) {
        message = 'Incorrect email or password. Please check your details and try again.';
      } else if (errorCode === 'auth/email-already-in-use') {
        message = 'An account already exists with this email address.';
      } else if (errorCode === 'auth/weak-password') {
        message = 'Your password is too weak. Please use at least 6 characters.';
      } else if (errorCode === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      } else if (errorCode === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Please try again later or reset your password.';
      } else if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
        message = 'Sign in was cancelled.';
      } else if (errorMessage && !errorMessage.includes('auth/')) {
        // Only use the raw error message if it's not a technical Firebase code
        message = errorMessage;
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Special Case: Grant admin to specific user
      const isAdmin = user.email?.toLowerCase() === 'boesackjnr@gmail.com';
      
      // Check if profile exists, if not check uniqueness and create one
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        const emailCheckQuery = query(collection(db, 'users'), where('email', '==', user.email?.trim().toLowerCase()));
        const emailCheckSnap = await getDocs(emailCheckQuery);
        if (!emailCheckSnap.empty) {
          await auth.signOut();
          setError('This Google email address is already registered to another account (Resident or Business).');
          setLoading(false);
          return;
        }

        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: isAdmin ? 'admin' : 'individual',
          isVerified: isAdmin ? true : false,
          createdAt: serverTimestamp()
        });
      }
      
      navigate('/');
    } catch (err: any) {
      console.error("Google auth error:", err);
      setError('Failed to sign in with Google. Make sure it is enabled in your Firebase console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center space-x-2 mb-8">
          <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center shadow-xl shadow-brand-blue/20">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <span className="text-brand-blue font-display font-bold text-3xl">BethalHUB</span>
        </Link>
        <h2 className="text-center text-3xl font-display font-bold text-slate-900 tracking-tight">
          {isLogin ? 'Sign in to your account' : 'Create your local account'}
        </h2>
        <p className="mt-4 text-center text-slate-500 font-medium">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-brand-blue font-bold hover:underline"
            disabled={loading}
          >
            {isLogin ? 'Register now' : 'Log in here'}
          </button>
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <motion.div
           layout
           className="card-standard py-12 px-8 sm:px-10"
        >
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-start gap-3">
              <span className="shrink-0 w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center text-[10px]">!</span>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleAuth}>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-6"
              >
                <div>
                  <label className="label-standard mb-2 block px-1 text-center">
                    I am registering as a:
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setRole('individual')}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        role === 'individual' 
                          ? 'bg-white text-slate-900 shadow-subtle' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Resident
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('business')}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        role === 'business' 
                          ? 'bg-white text-slate-900 shadow-subtle' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Business
                    </button>
                  </div>
                </div>

                {role === 'individual' ? (
                  <>
                    <div>
                      <label className="label-standard mb-2 block px-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <User size={18} />
                        </div>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="input-standard pl-12"
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label-standard mb-2 block px-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Phone size={18} />
                        </div>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="input-standard pl-12"
                          placeholder="e.g. 069 1856 391"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label-standard mb-2 block px-1">
                        Resident Location / Ward
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <MapPin size={18} />
                        </div>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="input-standard pl-12"
                          placeholder="e.g. Bethal West, Ext 4"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="label-standard mb-2 block px-1">
                        Business Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Building2 size={18} />
                        </div>
                        <input
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="input-standard pl-12"
                          placeholder="Enter legal business name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label-standard mb-2 block px-1">
                        Business Category
                      </label>
                      <div className="relative">
                        <select
                          value={businessCategory}
                          onChange={(e) => setBusinessCategory(e.target.value)}
                          className="input-standard block w-full bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/30 focus:bg-white transition-all font-bold text-sm px-4 py-4"
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

                    <div>
                      <label className="label-standard mb-2 block px-1">
                        Contact Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Phone size={18} />
                        </div>
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="input-standard pl-12"
                          placeholder="e.g. 017 647 1234"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label-standard mb-2 block px-1">
                        Physical Business Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <MapPin size={18} />
                        </div>
                        <input
                          type="text"
                          required
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="input-standard pl-12"
                          placeholder="e.g. 123 Block A, Bethal CBD"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label-standard mb-2 block px-1">
                        Business Description
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-4 text-slate-400">
                          <FileText size={18} />
                        </div>
                        <textarea
                          required
                          value={businessDescription}
                          onChange={(e) => setBusinessDescription(e.target.value)}
                          className="input-standard pl-12 pt-3.5 h-24 resize-none"
                          placeholder="Describe your activities/services..."
                        />
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            <div>
              <label className="label-standard mb-2 block px-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-standard pl-12"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="label-standard mb-2 block px-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-standard pl-12"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-brand-blue rounded border-slate-300 focus:ring-brand-blue"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-500 font-bold">
                    Remember me
                  </label>
                </div>
                <div className="text-xs">
                  <a href="#" className="font-extrabold text-brand-blue hover:underline">
                    Forgot password?
                  </a>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-3 py-5 px-4 bg-brand-blue text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-modern hover:bg-slate-800 hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
                {!loading && <ArrowRight size={20} />}
              </button>
            </div>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-4 bg-white text-slate-400 font-black uppercase tracking-[0.1em]">Verified Login</span>
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={signInWithGoogle}
                disabled={loading}
                className="flex items-center justify-center py-4 px-8 border border-slate-200 rounded-3xl text-slate-700 hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest space-x-3 w-full shadow-subtle active:scale-95"
              >
                <Chrome size={18} className="text-rose-500" />
                <span>Google Account</span>
              </button>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
             <div className="inline-flex items-center space-x-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={14} className="text-brand-accent" />
                <span>Encrypted & Secure</span>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
