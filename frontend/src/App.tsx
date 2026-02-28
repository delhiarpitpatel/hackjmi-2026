import * as Icons from 'lucide-react';
import LandingPage from './LandingPage';

export default function App() {
  return <LandingPage />;
}

// Minimalist Sub-Components
function HealthCard({ label, value, unit, icon, color }: any) {
  // dynamically resolve icon and cast to a usable component type
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
    <button className="bg-app-card p-6 rounded-4xl border-2 border-app-border shadow-md flex flex-col items-center text-center gap-2 group hover:border-app-accent hover:bg-app-card transition-all">
      <Icon size={40} className="mb-3" aria-hidden="true" />
      <span className="font-bold text-lg text-app-primary">{label}</span>
      <span className="text-sm text-app-secondary">{sub}</span>
    </button>
  );
}

function NavItem({ icon, active, onClick }: any) {
  const Icon = Icons[icon as keyof typeof Icons] as React.ComponentType<any>;
  const classes = `p-3 transition-all ${
    active ? 'text-app-accent scale-110' : 'text-app-secondary hover:text-app-primary'
  }`;
  return (
    <button onClick={onClick} className={classes}>
      <Icon size={28} strokeWidth={active ? 2.5 : 2} />
    </button>
  );
}