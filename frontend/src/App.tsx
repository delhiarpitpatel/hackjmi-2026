import React, { useState } from 'react';
import * as Icons from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] pb-24 font-sans selection:bg-indigo-100">
      {/* 1. Dynamic Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Icons.Zap size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">ElevateOS</span>
        </div>
        <div className="flex gap-3">
          <button className="p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
            <Icons.Mic size={20} className="text-slate-600" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white shadow-sm" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-6 space-y-8">
        {/* 2. Priority Health Cards (Sugar/BP) */}
        <section className="grid grid-cols-2 gap-4">
          <HealthCard label="Blood Sugar" value="95" unit="mg/dL" trend="+2%" icon="Droplets" color="text-rose-500" />
          <HealthCard label="BP Level" value="120/80" unit="mmHg" trend="Stable" icon="Activity" color="text-blue-500" />
        </section>

        {/* 3. Action Grid (The "Everything" Menu) */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Daily Essentials</h2>
          <div className="grid grid-cols-2 gap-4">
            <FeatureItem label="AI Diet" icon="Utensils" sub="Personalized" />
            <FeatureItem label="Workout" icon="Dumbbell" sub="AI Coach" />
            <FeatureItem label="Social" icon="Users" sub="Community" />
            <FeatureItem label="UPI Pay" icon="CreditCard" sub="Scan & Go" />
          </div>
        </section>

        {/* 4. Emergency SOS (High Contrast) */}
        <button className="w-full py-5 bg-rose-50 border-2 border-rose-200 rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-transform group">
          <Icons.AlertTriangle className="text-rose-600 group-hover:animate-pulse" />
          <span className="text-lg font-bold text-rose-700">Emergency SOS</span>
        </button>
      </main>

      {/* 5. Floating Nav Bar */}
      <nav className="fixed bottom-6 left-6 right-6 h-16 bg-slate-900 rounded-2xl flex items-center justify-around px-4 shadow-2xl shadow-indigo-200">
        <NavItem icon="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavItem icon="PieChart" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
        <NavItem icon="MessageCircle" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
        <NavItem icon="User" active={activeTab === 'user'} onClick={() => setActiveTab('user')} />
      </nav>
    </div>
  );
}

// Minimalist Sub-Components
function HealthCard({ label, value, unit, trend, icon, color }: any) {
  const Icon = Icons[icon];
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
      <div className={`p-2 w-fit rounded-lg bg-slate-50 mb-3 ${color}`}><Icon size={20} /></div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-[10px] text-slate-400 font-medium">{unit}</span>
      </div>
    </div>
  );
}

function FeatureItem({ label, icon, sub }: any) {
  const Icon = Icons[icon];
  return (
    <button className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center gap-1 group hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
      <Icon size={24} className="text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
      <span className="font-semibold text-sm">{label}</span>
      <span className="text-[10px] text-slate-400">{sub}</span>
    </button>
  );
}

function NavItem({ icon, active, onClick }: any) {
  const Icon = Icons[icon];
  return (
    <button onClick={onClick} className={`p-2 transition-all ${active ? 'text-white scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    </button>
  );
}