import React from 'react';

const About = () => (
  <div className="bg-slate-50 min-h-screen pt-40 pb-24 relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:24px_24px]"></div>
    </div>
    
    <div className="container mx-auto px-6 max-w-5xl relative z-10">
      <div className="card-standard p-12 md:p-24 overflow-hidden relative">
        <div className="relative z-10">
          <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em] mb-4 block">Bethal's Opportunity Portal</span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-12 leading-[0.9]">
            About <span className="text-brand-blue font-black underline decoration-slate-100 underline-offset-8">BethalHUB</span>
          </h1>
          
          <div className="max-w-3xl space-y-8 text-slate-500 font-medium leading-relaxed">
            <p className="text-2xl text-slate-700 leading-tight tracking-tight font-extrabold border-l-8 border-brand-accent pl-8 py-2">
              BethalHUB is a community-driven digital ecosystem designed to centralize opportunities, information, and local businesses in Bethal, Mpumalanga.
            </p>
            
            <p className="text-lg">
              Our mission is to empower the youth, support small businesses, and bridge the digital divide by making critical information like tenders, jobs, and municipal notices easily accessible to everyone.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-12">
              <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 shadow-subtle group hover:-translate-y-1 transition-all text-left">
                <h3 className="text-xs font-black text-brand-blue uppercase tracking-widest mb-6 border-b border-blue-100 pb-4">Our Vision</h3>
                <p className="text-sm font-bold text-slate-800 leading-relaxed">To become the digital home of Bethal, where every resident has the tools and information they need to thrive in the modern economy.</p>
              </div>
              <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 shadow-subtle group hover:-translate-y-1 transition-all text-left">
                <h3 className="text-xs font-black text-brand-accent uppercase tracking-widest mb-6 border-b border-orange-100 pb-4">Our Values</h3>
                <p className="text-sm font-bold text-slate-800 leading-relaxed">Transparency, accessibility, community empowerment, and supporting local business growth in our district.</p>
              </div>
            </div>

            <div className="text-center pt-8">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">Bridging the Gap</h2>
              <p className="text-lg max-w-2xl mx-auto">
                By providing a central platform for all Bethal-related updates, we ensure that opportunities don't pass by those who need them most. Whether you are a small contractor looking for municipal RFQs or a youth seeking learnerships, BethalHUB is here to guide you.
              </p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/[0.03] rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-accent/[0.03] rounded-full -ml-24 -mb-24 blur-3xl"></div>
      </div>
    </div>
  </div>
);

export default About;
