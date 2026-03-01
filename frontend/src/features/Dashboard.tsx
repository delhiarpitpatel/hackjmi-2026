import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatContainer from './chat/ChatContainer';
import DietContainer from './diet/DietContainer';
import EmergencyContainer from './emergency/EmergencyContainer';
import MedicationsContainer from './medications/MedicationsContainer';
import RiskContainer from './risk/RiskContainer';
import UsersContainer from './users/UsersContainer';
import WearablesContainer from './wearables/WearablesContainer';
import WorkoutsContainer from './workouts/WorkoutsContainer';

type Tab = 'home' | 'chat' | 'diet' | 'emergency' | 'medications' | 'risk' | 'workouts' | 'wearables' | 'profile';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'home',        label: 'Home',        emoji: '🏠' },
  { id: 'diet',        label: 'Diet',        emoji: '🥗' },
  { id: 'workouts',    label: 'Workout',     emoji: '🏋️' },
  { id: 'medications', label: 'Medicines',   emoji: '💊' },
  { id: 'risk',        label: 'Risk',        emoji: '📊' },
  { id: 'chat',        label: 'Companion',   emoji: '💬' },
  { id: 'wearables',   label: 'Devices',     emoji: '⌚' },
  { id: 'profile',     label: 'Profile',     emoji: '👤' },
  { id: 'emergency',   label: 'SOS',         emoji: '🚨' },
];

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('home');

  return (
    <div className="min-h-screen bg-app-main flex flex-col">
      {/* Top Header */}
      <header className="bg-app-card border-b border-app-border px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div>
          <div className="text-xl font-bold text-app-primary">ElevateOS</div>
          <div className="text-sm text-app-secondary">
            Welcome back, {user?.full_name?.split(' ')[0]} 👋
          </div>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm border border-app-border rounded-xl text-app-secondary hover:bg-red-50 hover:text-red-500 hover:border-red-300 transition"
        >
          Logout
        </button>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-28">
        {tab === 'home'        && <HomeTab user={user} onNavigate={setTab} />}
        {tab === 'diet'        && <DietContainer />}
        {tab === 'medications' && <MedicationsContainer />}
        {tab === 'risk'        && <RiskContainer />}
        {tab === 'chat'        && <ChatContainer />}
        {tab === 'emergency'   && <EmergencyContainer />}
        {tab === 'workouts'    && <WorkoutsContainer />}
        {tab === 'wearables'   && <WearablesContainer />}
        {tab === 'profile'     && <UsersContainer />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-app-card border-t border-app-border flex justify-around items-center py-3 z-50">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
              tab === t.id
                ? t.id === 'emergency'
                  ? 'text-red-500 scale-110'
                  : 'text-indigo-600 scale-110'
                : 'text-app-secondary'
            }`}
          >
            <span className={`text-2xl ${t.id === 'emergency' ? 'text-3xl' : ''}`}>
              {t.emoji}
            </span>
            <span className="text-xs font-semibold">{t.label}</span>
            {tab === t.id && (
              <div className={`w-1 h-1 rounded-full ${t.id === 'emergency' ? 'bg-red-500' : 'bg-indigo-600'}`} />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

// ── Home Tab ──────────────────────────────────────────────────────────────────

function HomeTab({ user, onNavigate }: { user: any; onNavigate: (t: Tab) => void }) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const quickActions = [
    { label: 'Diet Plan',    emoji: '🥗', tab: 'diet'        as Tab, color: 'bg-green-50  border-green-200' },
    { label: 'Workout',      emoji: '🏋️', tab: 'workouts'    as Tab, color: 'bg-orange-50 border-orange-200'},
    { label: 'Medicines',    emoji: '💊', tab: 'medications' as Tab, color: 'bg-blue-50   border-blue-200'  },
    { label: 'Risk Score',   emoji: '📊', tab: 'risk'        as Tab, color: 'bg-purple-50 border-purple-200'},
    { label: 'AI Companion', emoji: '💬', tab: 'chat'        as Tab, color: 'bg-yellow-50 border-yellow-200'},
    { label: 'Devices',      emoji: '⌚', tab: 'wearables'   as Tab, color: 'bg-gray-50   border-gray-200'  },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="bg-indigo-600 rounded-3xl p-6 text-white">
        <div className="text-2xl font-bold mb-1">
          Good {getTimeOfDay()}, {user?.full_name?.split(' ')[0]}! 👴
        </div>
        <div className="text-indigo-200 text-sm">{today}</div>
        <div className="mt-3 text-indigo-100 text-sm">
          Your health companion is ready. How are you feeling today?
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-app-primary mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(a => (
            <button
              key={a.tab}
              onClick={() => onNavigate(a.tab)}
              className={`${a.color} border-2 rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-all shadow-sm`}
            >
              <span className="text-3xl">{a.emoji}</span>
              <span className="font-semibold text-app-primary text-sm">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SOS Banner */}
      <button
        onClick={() => onNavigate('emergency')}
        className="w-full bg-red-500 text-white rounded-3xl p-5 flex items-center justify-between hover:bg-red-600 transition shadow-lg"
      >
        <div className="text-left">
          <div className="font-bold text-lg">Emergency SOS</div>
          <div className="text-red-100 text-sm">Tap for immediate help</div>
        </div>
        <span className="text-5xl">🚨</span>
      </button>

      {/* Profile Summary */}
      <div className="bg-app-card border border-app-border rounded-3xl p-5 space-y-2">
        <h2 className="font-bold text-app-primary mb-2">Your Profile</h2>
        <Row label="Name"     value={user?.full_name}       />
        <Row label="Phone"    value={user?.phone}            />
        <Row label="Language" value={user?.language?.toUpperCase()} />
        <Row label="Mobility" value={user?.mobility_level?.replace('_', ' ')} />
        <Row label="Biometric" value={user?.biometric_enrolled ? '✅ Enrolled' : '❌ Not enrolled'} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-app-secondary">{label}</span>
      <span className="text-app-primary font-medium capitalize">{value ?? '—'}</span>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
