import React from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { motion } from 'motion/react';

const Contact = () => (
  <div className="bg-slate-50 min-h-screen pt-40 pb-24 relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:24px_24px]"></div>
    </div>

    <div className="container mx-auto px-6 max-w-6xl relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center max-w-3xl mx-auto"
      >
        <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em] mb-4 block">Bethal's Opportunity Portal</span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[0.9]">
          Get in <span className="text-brand-blue">Touch</span>
        </h1>
        <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
          Have a question about an opportunity or want to list your business? Our team is ready to assist you in navigating the Bethal digital ecosystem.
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="card-standard p-8 md:p-16 relative overflow-hidden">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-10 tracking-tight">Send us a Message</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="label-standard">Your Full Name</label>
                <input 
                  type="text" 
                  className="input-standard" 
                  placeholder="e.g. John Doe" 
                />
              </div>
              <div className="space-y-2">
                <label className="label-standard">Email Address</label>
                <input 
                  type="email" 
                  className="input-standard" 
                  placeholder="e.g. john@example.com" 
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="label-standard">Subject of Inquiry</label>
                <input 
                  type="text" 
                  className="input-standard" 
                  placeholder="How can we help?" 
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="label-standard">Your Message</label>
                <textarea 
                  rows={6} 
                  className="input-standard pt-4 resize-none" 
                  placeholder="Describe your inquiry in detail..."
                ></textarea>
              </div>
              <div className="md:col-span-2 pt-6">
                <button className="w-full sm:w-auto px-12 py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-brand-accent transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 group">
                  <span>Dispatch Message</span>
                  <Send size={18} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          <div className="card-standard p-10">
            <h3 className="text-xl font-extrabold text-slate-900 mb-8 tracking-tight">Contact Matrix</h3>
            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 shadow-subtle group-hover:scale-110 transition-transform">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">HQ Location</p>
                  <p className="text-slate-800 font-bold leading-snug">3905 Ext 4 Musa Street, Bethal Wst<br/>Mpumalanga, 2310</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-emerald-50 text-brand-accent rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100 shadow-subtle group-hover:scale-110 transition-transform">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Direct Support</p>
                  <p className="text-slate-800 font-bold">info@bethalhub.co.za</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-orange-50 text-brand-orange rounded-2xl flex items-center justify-center shrink-0 border border-orange-100 shadow-subtle group-hover:scale-110 transition-transform">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Phone Registry</p>
                  <p className="text-slate-800 font-bold">+27 17 000 0000</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-extrabold mb-8 tracking-tight flex items-center gap-3">
                <Clock size={20} className="text-brand-accent" />
                Service Window
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Business Week</span>
                  <span className="font-bold text-sm">08:00 - 17:00</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Weekend Matrix</span>
                  <span className="font-bold text-sm">09:00 - 13:00</span>
                </div>
              </div>
              <p className="mt-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed text-center">
                * Emergency portal available 24/7 for verified business partners.
              </p>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          </div>
        </motion.div>
      </div>
    </div>
  </div>
);

export default Contact;
