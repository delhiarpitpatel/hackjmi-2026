import { useState } from 'react';
import * as Icons from 'lucide-react';
import LandingPage from './LandingPage';
import { useAuth } from './context/AuthContext';

type Page = 'landing' | 'login' | 'register' | 'dashboard';

export default function App() {
  const { isLoggedIn, logout } = useAuth();
  const [page, setPage] = useState<Page>('landing');

  // If logged in, always show dashboard
  if (isLoggedIn) {
    return <Dashboard onLogout={() => { logout(); setPage('landing'); }} />;
  }

  if (page === 'login')    return <LoginPage onBack={() => setPage('landing')} onGoRegister={() => setPage('register')} />;
  if (page === 'register') return <RegisterPage onBack={() => setPage('landing')} onGoLogin={() => setPage('login')} />;

  return (
    <LandingPage
      onStartJourney={() => setPage('register')}
      onLaunchApp={() => setPage('login')}
    />
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────

function LoginPage({ onBack, onGoRegister }: { onBack: () => void; onGoRegister: () => void }) {
  const { login, isLoading } = useAuth();
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      await login(phone, password);
    } catch (e: any) {
      setError(e.message ?? 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-app-main flex items-center justify-center px-4">
      <div className="bg-app-card rounded-3xl p-8 w-full max-w-md shadow-xl border border-app-border">
        <button onClick={onBack} className="text-app-secondary text-sm mb-6 hover:underline">← Back</button>
        <h2 className="text-2xl font-bold text-app-primary mb-6">Welcome Back</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-app-secondary mb-1 block">Phone Number</label>
            <input
              type="tel"
              placeholder="+919876543210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-app-border bg-app-main text-app-primary text-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-app-secondary mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 rounded-xl border border-app-border bg-app-main text-app-primary text-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading || !phone || !password}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg mt-2"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-center text-sm text-app-secondary">
            Don't have an account?{' '}
            <button onClick={onGoRegister} className="text-indigo-600 font-semibold hover:underline">
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Register Page ─────────────────────────────────────────────────────────────

function RegisterPage({ onBack, onGoLogin }: { onBack: () => void; onGoLogin: () => void }) {
  const { register, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleRegister = async () => {
    setError('');
    try {
      await register(fullName, phone, password);
    } catch (e: any) {
      setError(e.message ?? 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-app-main flex items-center justify-center px-4">
      <div className="bg-app-card rounded-3xl p-8 w-full max-w-md shadow-xl border border-app-border">
        <button onClick={onBack} className="text-app-secondary text-sm mb-6 hover:underline">← Back</button>
        <h2 className="text-2xl font-bold text-app-primary mb-6">Create Account</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-app-secondary mb-1 block">Full Name</label>
            <input
              type="text"
              placeholder="Ramesh Kumar"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-app-border bg-app-main text-app-primary text-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-app-secondary mb-1 block">Phone Number</label>
            <input
              type="tel"
              placeholder="+919876543210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-app-border bg-app-main text-app-primary text-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-app-secondary mb-1 block">Password</label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              className="w-full px-4 py-3 rounded-xl border border-app-border bg-app-main text-app-primary text-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={isLoading || !fullName || !phone || !password}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg mt-2"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-app-secondary">
            Already have an account?{' '}
            <button onClick={onGoLogin} className="text-indigo-600 font-semibold hover:underline">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard (placeholder — replace with your full dashboard) ────────────────

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-app-main flex flex-col items-center justify-center gap-6">
      <div className="bg-app-card rounded-3xl p-8 shadow-xl border border-app-border text-center max-w-md w-full">
        <div className="text-5xl mb-4">👴</div>
        <h2 className="text-2xl font-bold text-app-primary mb-2">
          Welcome, {user?.full_name?.split(' ')[0]}!
        </h2>
        <p className="text-app-secondary mb-6">You are successfully logged in.</p>
        <button
          onClick={onLogout}
          className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

// ── Reusable sub-components (kept from original) ──────────────────────────────

function HealthCard({ label, value, unit, icon, color }: any) {
  const Icon = Icons[icon as keyof typeof Icons] as React.ComponentType<any>;
  return (
    <div className="bg-app-card p-6 rounded-4xl border-2 border-app-border shadow-md">
      <Icon size={40} className={`mb-3 ${color}`} aria-hidden="true" />
      <p className="text-lg font-bold text-app-primary mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-app-primary">{value}</span>
        <span className="text-lg font-medium text-app-secondary">{unit}</span>
      </div>
    </div>
  );
}

function FeatureItem({ label, icon, sub }: any) {
  const Icon = Icons[icon as keyof typeof Icons] as React.ComponentType<any>;
  return (
    <button className="bg-app-card p-6 rounded-4xl border-2 border-app-border shadow-md flex flex-col items-center text-center gap-2 hover:border-app-accent transition-all">
      <Icon size={40} className="mb-3" aria-hidden="true" />
      <span className="font-bold text-lg text-app-primary">{label}</span>
      <span className="text-sm text-app-secondary">{sub}</span>
    </button>
  );
}

function NavItem({ icon, active, onClick }: any) {
  const Icon = Icons[icon as keyof typeof Icons] as React.ComponentType<any>;
  return (
    <button
      onClick={onClick}
      className={`p-3 transition-all ${active ? 'text-app-accent scale-110' : 'text-app-secondary hover:text-app-primary'}`}
    >
      <Icon size={28} strokeWidth={active ? 2.5 : 2} />
    </button>
  );
}
