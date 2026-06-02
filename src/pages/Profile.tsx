import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, auth, storage } from '../lib/firebase';
import { doc, updateDoc, setDoc, serverTimestamp, getDoc, deleteDoc } from 'firebase/firestore';
import { updateProfile, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Phone, MapPin, FileEdit, Save, Loader2, Camera, Upload, LogOut, LayoutDashboard, Briefcase, Bell, ShieldCheck, ShieldAlert, Building2, Globe, Trash2, LayoutGrid } from 'lucide-react';

const Profile = () => {
  const { user, profile, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err: any) {
      setError("Failed to log out: " + err.message);
    }
  };

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    phoneNumber: '',
    location: '',
    role: 'individual' as 'individual' | 'business',
    avatarUrl: '',
    // Business specific
    businessName: '',
    businessCategory: '',
    businessWebsite: '',
    businessDescription: ''
  });
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if ((user || profile) && !isEditing && !isSaving) {
      const data = {
        displayName: profile?.displayName || user?.displayName || '',
        bio: profile?.bio || '',
        phoneNumber: profile?.phoneNumber || '',
        location: profile?.location || '',
        role: profile?.role || 'individual',
        avatarUrl: profile?.avatarUrl || user?.photoURL || '',
        businessName: profile?.businessName || '',
        businessCategory: profile?.businessCategory || '',
        businessWebsite: profile?.businessWebsite || '',
        businessDescription: profile?.businessDescription || ''
      };
      setFormData(data);
      setInitialData(data);
    }
  }, [user, profile, isEditing, isSaving]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
        <a href="/login" className="text-brand-blue font-bold hover:underline">Sign In Here</a>
      </div>
    );
  }

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      setError("Display name is required.");
      return false;
    }
    if (formData.phoneNumber && !/^[0-9\s+()-]{7,20}$/.test(formData.phoneNumber)) {
      setError("Please enter a valid phone number.");
      return false;
    }
    if (formData.role === 'business') {
      if (!formData.businessName.trim()) {
        setError("Business name is required for business accounts.");
        return false;
      }
      if (!formData.businessCategory.trim()) {
        setError("Business category is required.");
        return false;
      }
    }
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isUploading) {
      setError("Please wait for the photo to finish uploading.");
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Update Firebase Auth Profile if name or photo changed
      const authUpdates: any = {};
      let needsAuthUpdate = false;

      if (formData.displayName !== user.displayName) {
        authUpdates.displayName = formData.displayName;
        needsAuthUpdate = true;
      }
      if (formData.avatarUrl !== user.photoURL) {
        authUpdates.photoURL = formData.avatarUrl;
        needsAuthUpdate = true;
      }

      if (needsAuthUpdate) {
        await updateProfile(auth.currentUser!, authUpdates);
      }

      // Update Firestore User Document
      const userRef = doc(db, 'users', user.uid);
      const activeRole = profile?.role || formData.role;
      const userUpdate: any = {
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        location: formData.location.trim(),
        avatarUrl: formData.avatarUrl,
        role: activeRole,
        updatedAt: serverTimestamp()
      };

      if (activeRole === 'business') {
        userUpdate.businessName = formData.businessName.trim();
        userUpdate.businessCategory = formData.businessCategory.trim();
        userUpdate.businessWebsite = formData.businessWebsite.trim();
        userUpdate.businessDescription = formData.businessDescription.trim();
      }

      await updateDoc(userRef, userUpdate);

      // Also update or create business directory entry if business
      if (activeRole === 'business') {
        const businessId = profile?.businessId || `biz_${user.uid}`;
        const businessRef = doc(db, 'businesses', businessId);
        
        const businessData = {
          id: businessId,
          name: formData.businessName.trim(),
          description: formData.businessDescription.trim() || formData.bio.trim(),
          category: formData.businessCategory.trim(),
          location: formData.location.trim(),
          contact: formData.phoneNumber.trim(),
          website: formData.businessWebsite.trim(),
          logoUrl: formData.avatarUrl,
          ownerId: user.uid,
          verified: profile?.isVerified || false,
          updatedAt: serverTimestamp()
        };

        await setDoc(businessRef, businessData, { merge: true });
        
        if (!profile?.businessId) {
          await updateDoc(userRef, { businessId });
        }
      }

      setSuccess("Your profile has been updated successfully!");
      setInitialData({ ...formData });
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError("Failed to save changes. " + (err.message || "Please try again later."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm("Disard unsaved changes?")) {
        setFormData(initialData);
        setIsEditing(false);
        setError(null);
      }
    } else {
      setIsEditing(false);
      setError(null);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const storageRef = ref(storage, `users/${user.uid}/profile-photo.jpg`);
      await uploadBytes(storageRef, originalFile);
      const downloadURL = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, avatarUrl: downloadURL }));
      setSuccess("Photo uploaded! Click 'Save' to apply changes.");
    } catch (err: any) {
      setError("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user.email) return;
    try {
      setSuccess("Sending password reset email...");
      await sendPasswordResetEmail(auth, user.email);
      setSuccess("Password reset email sent to " + user.email);
    } catch (err: any) {
      setError("Failed to send reset email: " + err.message);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    setError(null);

    try {
      // 1. Delete Firestore User Document
      await deleteDoc(doc(db, 'users', user.uid));
      
      // 2. Delete Business Listing if applicable
      if (profile?.businessId) {
        await deleteDoc(doc(db, 'businesses', profile.businessId));
      }

      // 3. Delete Firebase Auth Account
      // Note: This may fail if the user hasn't logged in recently (requires re-authentication)
      await deleteUser(auth.currentUser!);
      
      // 4. Log out and navigate
      await logout();
      navigate('/');
    } catch (err: any) {
      console.error("Deletion error:", err);
      if (err.code === 'auth/requires-recent-login') {
        setError("For security reasons, please log out and log back in before deleting your account.");
      } else {
        setError("An error occurred during account deletion. Your profile may have been partially removed. Please contact support if issues persist.");
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-standard overflow-hidden bg-white"
      >
        {/* Header/Cover */}
        <div className="h-40 bg-slate-900 relative">
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0">
            <div className="relative group">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-white border-4 border-white shadow-modern overflow-hidden flex items-center justify-center">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                    <User size={48} className="text-slate-200" />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="animate-spin text-brand-blue" />
                  </div>
                )}
              </div>
              {isEditing && (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-10 h-10 bg-brand-blue text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-slate-900 transition-colors"
                >
                  <Camera size={20} />
                </button>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>
          </div>
          
          <div className="absolute bottom-4 right-8 hidden md:flex items-center gap-2">
            {profile?.isVerified ? (
              <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg">
                <ShieldCheck size={14} /> Verified {profile?.role === 'business' ? 'Business' : 'Resident'}
              </div>
            ) : (
              <div className="bg-amber-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg">
                <ShieldAlert size={14} /> Verification Pending
              </div>
            )}
          </div>
        </div>

        <div className="pt-20 px-8 md:px-12 pb-12">
          {/* Main Info Header */}
          <div className="flex flex-col md:flex-row md:items-start md:text-left justify-between gap-6 mb-12 pb-10 border-b border-slate-100">
            <div className="text-center md:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight text-center sm:text-left">
                  {profile?.displayName || user?.displayName || 'Bethal Resident'}
                </h1>
                {profile?.isVerified && <ShieldCheck size={24} className="text-emerald-500 shrink-0 md:hidden lg:block" />}
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  profile?.role === 'business' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-brand-accent'
                }`}>
                  {profile?.role === 'business' ? 'Business Partner' : 'Community Resident'}
                </span>
                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 text-sm font-bold min-w-0">
                  <Mail size={14} className="shrink-0" /> <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-3 bg-slate-900 border-2 border-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-blue hover:border-brand-blue transition-all active:scale-95 shadow-modern"
                  >
                    <FileEdit size={16} /> Edit My Account
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 bg-white border-2 border-slate-100 text-slate-400 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95"
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !isDirty}
                    className="flex items-center gap-3 bg-brand-blue border-2 border-brand-blue text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-modern hover:bg-slate-900 hover:border-slate-900 transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Update Data
                  </button>
                </>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.form 
                key="edit"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                {error && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-4">
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    {success}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="pb-4 border-b border-slate-100">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <User size={16} className="text-brand-blue" />
                        Account Details
                      </h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name / Display Name</label>
                        <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input
                            type="text"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/30 focus:bg-white transition-all font-bold text-sm"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Member Category</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            disabled={!!profile?.role}
                            onClick={() => !profile?.role && setFormData({ ...formData, role: 'individual' })}
                            className={`p-5 rounded-2xl border-2 transition-all group flex flex-col items-center gap-2 ${
                              formData.role === 'individual' 
                              ? 'border-brand-blue bg-blue-50/50 text-brand-blue' 
                              : 'border-slate-100 text-slate-400 hover:border-slate-200'
                            } ${profile?.role ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            <User size={24} className={formData.role === 'individual' ? 'text-brand-blue' : 'text-slate-300'} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Resident</span>
                          </button>
                          <button
                            type="button"
                            disabled={!!profile?.role}
                            onClick={() => !profile?.role && setFormData({ ...formData, role: 'business' })}
                            className={`p-5 rounded-2xl border-2 transition-all group flex flex-col items-center gap-2 ${
                              formData.role === 'business' 
                              ? 'border-brand-blue bg-blue-50/50 text-brand-blue' 
                              : 'border-slate-100 text-slate-400 hover:border-slate-200'
                            } ${profile?.role ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            <Building2 size={24} className={formData.role === 'business' ? 'text-brand-blue' : 'text-slate-300'} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Business</span>
                          </button>
                        </div>
                        {profile?.role && (
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1.5 ml-1">
                            * Account type cannot be changed after registration.
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                          <div className="relative">
                            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input
                              type="text"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/30 transition-all font-bold text-sm"
                              placeholder="e.g Bethal West"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                          <div className="relative">
                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input
                              type="text"
                              value={formData.phoneNumber}
                              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/30 transition-all font-bold text-sm"
                              placeholder="071 000 0000"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="pb-4 border-b border-slate-100">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        {formData.role === 'business' ? (
                          <>
                            <Building2 size={16} className="text-brand-blue" />
                            Business Information
                          </>
                        ) : (
                          <>
                            <FileEdit size={16} className="text-brand-blue" />
                            Profile Bio
                          </>
                        )}
                      </h3>
                    </div>

                    <div className="space-y-6">
                      {formData.role === 'business' ? (
                        <>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trade Name</label>
                            <input
                              type="text"
                              value={formData.businessName}
                              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 transition-all font-bold text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Industry</label>
                              <select
                                value={formData.businessCategory}
                                onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 transition-all font-bold text-sm"
                              >
                                <option value="">Select Category</option>
                                <option value="Logistics">Logistics & Transport</option>
                                <option value="Construction">Construction</option>
                                <option value="Retail">Retail & Wholesale</option>
                                <option value="Services">Professional Services</option>
                                <option value="Agriculture">Agriculture</option>
                                <option value="IT">Technology</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website URL</label>
                              <input
                                type="text"
                                value={formData.businessWebsite}
                                onChange={(e) => setFormData({ ...formData, businessWebsite: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 transition-all font-bold text-sm"
                                placeholder="www.yourbiz.co.za"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Description</label>
                            <textarea
                              value={formData.businessDescription}
                              onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 transition-all font-bold text-sm min-h-[140px]"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">About Me</label>
                          <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 transition-all font-bold text-sm min-h-[280px]"
                            placeholder="Share some details about yourself with the Bethal community..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4 text-slate-400">
                    <ShieldCheck size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">All changes are encrypted and secure</span>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 border-slate-100 text-slate-500 hover:bg-slate-50 transition-all"
                    >
                      Reset Password
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 border-rose-50 text-rose-500 hover:bg-rose-50 transition-all"
                    >
                      Log Out Account
                    </button>
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="view"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1 space-y-6">
                    <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex flex-col gap-6">
                       <div className="space-y-4 min-w-0 flex flex-col items-center justify-center text-center w-full">
                          <div className="flex items-center justify-center gap-3 text-slate-500 min-w-0 w-full">
                            <Mail size={16} className="shrink-0" />
                            <span className="text-sm font-medium truncate">{user.email}</span>
                          </div>
                          {profile?.phoneNumber && (
                            <div className="flex items-center justify-center gap-3 text-slate-500 min-w-0 w-full">
                              <Phone size={16} className="shrink-0" />
                              <span className="text-sm font-medium truncate">{profile.phoneNumber}</span>
                            </div>
                          )}
                          {profile?.location && (
                            <div className="flex items-center justify-center gap-3 text-slate-500 min-w-0 w-full">
                              <MapPin size={16} className="shrink-0" />
                              <span className="text-sm font-medium truncate">{profile.location}</span>
                            </div>
                          )}
                       </div>
                       
                       <div className="pt-6 border-t border-slate-100 flex flex-col items-center justify-center text-center w-full">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3 text-center w-full">Verification</p>
                          {profile?.isVerified ? (
                            <div className="flex items-center justify-center gap-2 text-emerald-600 text-xs font-bold w-full">
                              <ShieldCheck size={16} /> Account Verified
                            </div>
                          ) : (
                            <div className="space-y-3 flex flex-col items-center justify-center w-full">
                              <div className="flex items-center justify-center gap-2 text-amber-600 text-xs font-bold w-full">
                                <ShieldAlert size={16} /> Verification Pending
                              </div>
                              <button className="text-[9px] font-black text-brand-blue uppercase tracking-widest hover:underline text-center w-full">
                                Learn about verification
                              </button>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-10">
                    {profile?.role === 'business' && (
                      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-subtle">
                        <div className="flex items-center justify-between mb-6">
                           <div>
                              <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-1">Active Business Profile</p>
                              <h3 className="text-2xl font-extrabold text-slate-900">{profile.businessName || 'Business Registration'}</h3>
                           </div>
                           <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                             <Building2 size={24} />
                           </div>
                        </div>
                        <p className="text-slate-600 font-medium leading-relaxed mb-6">
                          {profile.businessDescription || profile.bio || "No description provided."}
                        </p>
                        <div className="flex flex-wrap gap-4">
                           {profile.businessCategory && (
                              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-600">
                                <LayoutGrid size={14} /> {profile.businessCategory}
                              </div>
                           )}
                           {profile.businessWebsite && (
                              <a href={profile.businessWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-brand-blue hover:bg-blue-100 transition-colors">
                                <Globe size={14} /> {profile.businessWebsite.replace(/^https?:\/\//, '')}
                              </a>
                           )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 flex flex-col items-center justify-center text-center">
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">About Me</h3>
                       <div className="text-slate-700 leading-relaxed font-medium text-center">
                         {profile?.bio || "No bio added yet."}
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Danger Zone */}
          <div className="mt-20 pt-12 border-t border-slate-100">
            <div className="bg-rose-50/50 rounded-[2rem] p-8 md:p-12 border border-rose-100/50 relative overflow-hidden group">
              <div className="relative z-10 flex flex-col items-center justify-center text-center gap-8 w-full">
                <div className="flex flex-col items-center text-center min-w-0 w-full">
                  <h3 className="text-xl font-black text-rose-600 uppercase tracking-tight mb-2 flex items-center justify-center gap-3 w-full">
                    <ShieldAlert size={24} />
                    Danger Zone
                  </h3>
                  <p className="text-rose-500/70 font-medium max-w-xl text-center mx-auto w-full">
                    Once you delete your account, there is no going back. This will permanently remove your profile, business listings, and all associated community data from Bethalhub.
                  </p>
                </div>
                
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-white border-2 border-rose-100 text-rose-500 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-95 shadow-sm"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-2xl border border-rose-100 shadow-xl">
                    <p className="px-4 text-[10px] font-black text-rose-600 uppercase tracking-widest">Are you absolutely sure?</p>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
                      >
                        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-all" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
