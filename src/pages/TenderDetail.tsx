import React from 'react';
import { FileText, Calendar, Clock, MapPin, Mail, Phone, ExternalLink, Download, ArrowLeft, Bell, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const tenderData: Record<string, any> = {
  'lta002-2627': {
    orgName: 'Limpopo Tourism Agency',
    orgShort: 'LTA',
    orgLocation: 'Limpopo',
    bidNumber: 'LTA002-26/27',
    title: 'Appointment of a Service Provider for Website Design, Hosting, Maintenance and Digital Enhancement for a period of 36 Months',
    closingDate: '29 May 2026',
    closingTime: '11:00 AM',
    briefingVenue: 'Microsoft Teams (Virtual)',
    briefingDate: '18 May 2026 • 12:00 PM',
    briefingDetails: 'Meeting ID: 321 238 244 544 248',
    briefingPasscode: 'fV79rB3T',
    background: 'The Limpopo Tourism Agency (LTA) seeks to appoint a suitably qualified service provider to host, maintain, secure, optimise and continuously enhance the website for a period of thirty-six (36) months.',
    objectives: [
      '99.5% Minimum Annual Uptime',
      'Cybersecurity Resilience & Compliance',
      'SEO Optimization & Multilingual Capability',
      'Transition to Interactive Digital Platform'
    ],
    highlights: [
      'Domain Registration & Renewal Management',
      'Tier III Secure Hosting Environment',
      'Integration with CRM & Social Media',
      'Mobile App Development linked to site'
    ],
    contacts: [
      { name: 'Isaac Maelane', role: 'Specification Enquiries', email: 'isaacm@golimpopo.com', phone: '082 491 3204' },
      { name: 'Sewela Nyaka', role: 'SCM Process Enquiries', email: 'sewelan@golimpopo.com', phone: '066 039 0295' }
    ],
    themeColor: 'indigo'
  },
  'bs08-04-2026': {
    orgName: 'Steve Tshwete Local Municipality',
    orgShort: 'STLM',
    orgLocation: 'Mpumalanga',
    bidNumber: 'BS08/04/2026',
    title: 'Appointment of Service Provider for Printing and Posting of Monthly Accounts for 36 Months',
    closingDate: '10 June 2026',
    closingTime: '12:00 PM',
    briefingVenue: 'Library Auditorium, Middelburg',
    briefingDate: '19 May 2026 • 10:00 AM',
    briefingDetails: 'Non-compulsory Clarification Meeting',
    briefingPasscode: 'Gerard Sekoto Library, Civic Center',
    background: 'In terms of Section 110 of the Municipal Finance Management Act, 2003, tenders are hereby invited for the printing and posting of monthly accounts for the municipality for a 36-month period.',
    objectives: [
      'Efficient Printing Infrastructure',
      'Reliable Monthly Posting Schedule',
      'Compliance with MFMA Regulations',
      'Cost-Effective Distribution Solution'
    ],
    highlights: [
      'High-volume Document Processing',
      'Secure Data Handling protocol',
      'Logistics & Courier integration',
      '3-Year Fixed Term Contract'
    ],
    contacts: [
      { name: 'Ms. Puselletso Melato', role: 'Technical Enquiries', email: 'cfo@stlm.gov.za', phone: '013 249 7108' },
      { name: 'SM Mnguni', role: 'Municipal Manager', email: 'mm@stlm.gov.za', phone: '013 249 7000' }
    ],
    themeColor: 'blue'
  },
  'rfq2026-005-005': {
    orgName: 'National Lotteries Commission',
    orgShort: 'NLC',
    orgLocation: 'Mpumalanga',
    bidNumber: 'RFQ2026-005-005',
    title: 'Provision of Catering Services for the NLC Workshop in Witbank',
    closingDate: '12 May 2026',
    closingTime: '11:00 AM',
    briefingVenue: 'Witbank, Banquet Hall eMalahleni Local Municipality',
    briefingDate: 'Workshop Date: 21 May 2026',
    briefingDetails: 'E-Tender Portal Submission only',
    briefingPasscode: 'Witbank Warehouse Site',
    background: 'The NLC requires a suitably qualified service provider for the provision of catering services for the National Lotteries Commission Education and Awareness workshop in Mpumalanga province.',
    objectives: [
      'Pre-packaged Lunch for 150 Delegates',
      'High Quality Meat (Chicken & Beef Stew)',
      'Strict Hygiene & Safety Compliance',
      'On-time Delivery & Waste Removal'
    ],
    highlights: [
      '150 Full delegate meals',
      'Soft drinks & bottled water included',
      'Full cutlery and service logistics',
      'Witbank Local Municipality Venue'
    ],
    contacts: [
      { name: 'Innocent Tshakela', role: 'RFQ Enquiries', email: 'Innocent.Tshakela@nlcsa.org.za', phone: '012 432 1300' },
      { name: 'Calvin Kabinde', role: 'Technical Enquiries', email: 'Calvin.kabinde@nlcsa.org.za', phone: '012 432 1302' }
    ],
    themeColor: 'orange'
  },
  'e2759gxmptut': {
    orgName: 'Eskom Holdings SOC Ltd',
    orgShort: 'Eskom',
    orgLocation: 'Tutuka Power Station',
    bidNumber: 'E2759GXMPTUT',
    title: 'Transportation of employees to Tutuka Power Station for a period of 60 months',
    closingDate: '14 April 2026',
    closingTime: '10:00 AM',
    briefingVenue: 'Tutuka Power Station, Standerton',
    briefingDate: '10 April 2026 • 09:00 AM',
    briefingDetails: 'Main Reception Area',
    briefingPasscode: 'Enquiry: E2759GXMPTUT',
    background: 'Eskom requires transportation of employees from Kosmos Park, Flora Park, Margenzon, Mayerville & Town, Sakhile, Thuthukani and Extension 8 to Tutuka Power Station as and when required for a period of 60 months.',
    objectives: [
      '60-Month Fixed Term Contract',
      'Safety & Roadworthy Compliance',
      'Reliable Staff Arrival Times',
      'Multi-Area Coverage (8 Zones)'
    ],
    highlights: [
      'Long-term secure contract',
      'Strategic infrastructure support',
      'Eskom Procurement Policy compliant',
      'High-impact community service'
    ],
    contacts: [
      { name: 'Eskom Tender Office', role: 'Submission Support', email: 'tenders@eskom.co.za', phone: '017 749 5111' }
    ],
    themeColor: 'amber'
  }
};

const TenderDetail = () => {
  const { id } = useParams();
  const data = id ? tenderData[id] : null;

  if (!data) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h2 className="text-2xl font-bold">Tender not found</h2>
        <Link to="/opportunities" className="text-brand-blue font-bold hover:underline">Return to list</Link>
      </div>
    );
  }

  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-600 border-indigo-100 text-indigo-700 hover:bg-indigo-700 shadow-indigo-900/20',
    blue: 'bg-blue-600 border-blue-100 text-blue-700 hover:bg-blue-700 shadow-blue-900/20',
    orange: 'bg-orange-600 border-orange-100 text-orange-700 hover:bg-orange-700 shadow-orange-900/20',
    amber: 'bg-amber-600 border-amber-100 text-amber-700 hover:bg-amber-700 shadow-amber-900/20'
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-[0.03]">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/opportunities" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue mb-8 hover:gap-5 transition-all group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Opportunities
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-standard overflow-hidden bg-white"
        >
          {/* Header/Official Banner */}
          <div className="bg-slate-50 border-b border-slate-100 p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="flex justify-center mb-10 relative z-10">
              <div className="bg-white p-5 rounded-3xl shadow-subtle border border-slate-100 flex items-center gap-5">
                <div className={`w-16 h-16 bg-${data.themeColor}-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-modern`}>
                  {data.orgShort}
                </div>
                <div className="text-left pr-4">
                  <p className="text-[10px] font-black tracking-[0.2em] text-slate-300 uppercase leading-none mb-2">{data.orgLocation}</p>
                  <p className="text-sm font-black text-slate-800 leading-tight uppercase tracking-tight">{data.orgName}</p>
                </div>
              </div>
            </div>
            
            <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.4em] mb-4 block leading-none">Official Bid Document</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 max-w-3xl mx-auto leading-[0.95] tracking-tight">
              {data.bidNumber}
            </h1>
            <p className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              "{data.title}"
            </p>
          </div>

          {/* Critical Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-100 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="p-8 flex flex-col items-center text-center gap-3 bg-rose-50/20 group hover:bg-rose-50/40 transition-colors">
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-1">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submission Deadline</p>
                <p className="text-base font-black text-rose-600">{data.closingDate}</p>
              </div>
            </div>
            <div className="p-8 flex flex-col items-center text-center gap-3 bg-indigo-50/20 group hover:bg-indigo-50/40 transition-colors">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-1">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Closing Time</p>
                <p className="text-base font-black text-slate-900">{data.closingTime}</p>
              </div>
            </div>
            <div className="p-8 flex flex-col items-center text-center gap-3 bg-emerald-50/20 group hover:bg-emerald-50/40 transition-colors">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-1">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Venue</p>
                <p className="text-base font-black text-slate-900">{data.briefingVenue}</p>
              </div>
            </div>
          </div>

          <div className="p-10 md:p-16 space-y-20">
            {/* Section: Briefing */}
            <section className="bg-amber-50/50 rounded-[2.5rem] border border-amber-100 p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 blur-3xl rounded-full"></div>
              <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
                   <Bell size={24} />
                </div>
                <h3 className="text-xl font-extrabold text-amber-900 tracking-tight">Compulsory Clarification Session</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-10 relative z-10">
                <div className="bg-white/60 p-6 rounded-2xl border border-amber-200/40 backdrop-blur-sm">
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-3">Session Chronology</p>
                  <p className="text-base font-extrabold text-slate-900">{data.briefingDate}</p>
                </div>
                <div className="bg-white/60 p-6 rounded-2xl border border-amber-200/40 backdrop-blur-sm">
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-3">Location Manifest</p>
                  <p className="text-base font-extrabold text-slate-900">{data.briefingDetails}</p>
                  {data.briefingPasscode && (
                    <p className="text-[10px] text-slate-400 font-mono mt-2 bg-slate-50 px-2 py-1 rounded inline-block">Pass: {data.briefingPasscode}</p>
                  )}
                </div>
              </div>
              <button className="mt-10 w-full md:w-auto px-10 py-5 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-amber-700 transition-all shadow-modern flex items-center justify-center gap-4 group">
                Access Briefing Portal <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </section>

            {/* Section: Scope of Work */}
            <section>
              <h3 className="label-standard mb-8 block">Background & Scope of Services</h3>
              <div className="max-w-4xl">
                <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10 border-l-4 border-slate-100 pl-8 py-2">
                  {data.background}
                </p>
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-subtle group hover:border-brand-blue transition-colors">
                    <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-6 border-b border-blue-50 pb-4">Key Performance Objectives</p>
                    <ul className="space-y-4">
                      {data.objectives.map((obj: string) => (
                        <li key={obj} className="flex gap-3 text-xs font-bold text-slate-700">
                          <CheckCircle2 size={16} className="text-brand-blue shrink-0" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-subtle group hover:border-brand-accent transition-colors">
                    <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-6 border-b border-orange-50 pb-4">Technical Deliverables</p>
                    <ul className="space-y-4">
                      {data.highlights.map((h: string) => (
                        <li key={h} className="flex gap-3 text-xs font-bold text-slate-700">
                          <CheckCircle2 size={16} className="text-brand-accent shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Contact Info */}
            <section className="pt-16 border-t border-slate-100">
              <h3 className="label-standard mb-10 block">Enquiries Matrix</h3>
              <div className="grid sm:grid-cols-2 gap-10">
                {data.contacts.map((contact: any) => (
                  <div key={contact.name} className="flex gap-6 group">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 text-slate-300 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-brand-blue group-hover:border-blue-100 transition-all shadow-subtle">
                      <Mail size={24} />
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-slate-900 group-hover:text-brand-blue transition-colors">{contact.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">{contact.role}</p>
                      <div className="space-y-1">
                        <p className="text-[11px] text-brand-blue font-black uppercase tracking-tight hover:underline cursor-pointer">{contact.email}</p>
                        <p className="text-[11px] text-slate-500 font-bold">{contact.phone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Action Footer */}
          <div className="bg-slate-900 p-12 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-accent/10 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2"></div>
            
            <div className="text-center lg:text-left relative z-10">
               <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em] mb-4 block leading-none">Submission Protocol</span>
              <h3 className="text-2xl font-extrabold text-white mb-2">Ready to tender?</h3>
              <p className="text-slate-400 font-medium text-sm">Download official bid documents and mandatory annexures below.</p>
            </div>
            <div className="shrink-0 relative z-10 w-full lg:w-auto">
              <button className="w-full lg:w-auto px-12 py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-accent hover:text-white transition-all flex items-center justify-center gap-4 shadow-xl group">
                <Download size={20} className="group-hover:translate-y-1 transition-transform" /> Bid Documents Pack
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 bg-rose-50 rounded-[2.5rem] p-10 md:p-16 border border-rose-100 flex flex-col md:flex-row gap-10 items-center overflow-hidden relative shadow-subtle"
        >
           <div className="absolute top-0 right-0 w-48 h-48 bg-rose-100/30 blur-3xl rounded-full -mr-24 -mt-24"></div>
           <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-[2rem] flex items-center justify-center shrink-0 shadow-subtle ring-8 ring-rose-50 border border-rose-200">
             <ShieldAlert size={40} />
           </div>
           <div className="relative z-10 text-center md:text-left">
             <h4 className="font-extrabold text-rose-900 text-2xl tracking-tight mb-4">Official Anti-Scam Advisory</h4>
             <p className="text-rose-700/80 font-medium leading-relaxed max-w-2xl text-lg">
               {data.orgName} issues a critical alert to all potential bidders: <span className="font-black text-rose-800 underline decoration-rose-500/50 underline-offset-4">NO REGISTRATION OR PROCESSING FEES</span> are required to bid. Report any solicitor requesting payment to our official integrity hotline immediately.
             </p>
           </div>
        </motion.div>
      </div>
    </div>
  );

};

export default TenderDetail;
