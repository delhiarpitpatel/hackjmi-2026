import { useState, useEffect, useRef } from "react";

// ── API CLIENT ─────────────────────────────────────────────────────────────
const BASE = "http://localhost:8000/api/v1";
let _token = "";
const setToken = (t) => { _token = t; };
const api = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...((_token) ? { Authorization: `Bearer ${_token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const detail = data.detail;
    if (Array.isArray(detail)) {
      throw new Error(detail.map(e => `${e.loc?.slice(-1)[0] ?? "field"}: ${e.msg}`).join(", "));
    }
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail) || "Request failed");
  }
  return res.json();
};

// ── THEME ──────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --cream: #faf7f2;
    --warm-white: #fff8f0;
    --sage: #7a9e7e;
    --sage-light: #a8c5ab;
    --sage-dark: #5a7d5e;
    --coral: #e07a5f;
    --coral-light: #f5b8a8;
    --gold: #c9a84c;
    --gold-light: #f0d891;
    --navy: #2d3748;
    --navy-light: #4a5568;
    --text: #2d3748;
    --text-muted: #718096;
    --border: #e8ddd0;
    --shadow: 0 4px 24px rgba(45,55,72,0.08);
    --shadow-lg: 0 12px 48px rgba(45,55,72,0.14);
    --radius: 20px;
    --radius-sm: 12px;
  }
  body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--text); font-size: 16px; }
  h1,h2,h3,h4 { font-family: 'Lora', serif; }
  button { cursor: pointer; font-family: 'DM Sans', sans-serif; }
  input, textarea, select { font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  .app { display: flex; min-height: 100vh; }

  /* SIDEBAR */
  .sidebar {
    width: 280px; min-height: 100vh; background: var(--navy);
    display: flex; flex-direction: column; padding: 0;
    position: fixed; left: 0; top: 0; bottom: 0; z-index: 100;
  }
  .sidebar-logo {
    padding: 32px 28px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .sidebar-logo h1 { color: #fff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
  .sidebar-logo span { color: var(--sage-light); font-size: 12px; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; display: block; margin-top: 2px; }
  .sidebar-user {
    padding: 20px 28px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; gap: 12px;
  }
  .user-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    background: linear-gradient(135deg, var(--sage), var(--sage-dark));
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; color: white; font-family: 'Lora', serif; font-weight: 700;
    flex-shrink: 0;
  }
  .user-info { flex: 1; min-width: 0; }
  .user-info strong { color: #fff; font-size: 14px; font-weight: 600; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-info span { color: var(--text-muted); font-size: 12px; }
  .nav { flex: 1; padding: 16px 0; overflow-y: auto; }
  .nav-section { padding: 8px 28px 4px; color: rgba(255,255,255,0.3); font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; }
  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 28px; color: rgba(255,255,255,0.6);
    cursor: pointer; transition: all 0.2s; font-size: 15px; font-weight: 400;
    border: none; background: none; width: 100%; text-align: left;
  }
  .nav-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
  .nav-item.active { background: rgba(122,158,126,0.2); color: var(--sage-light); font-weight: 500; }
  .nav-item .nav-icon { width: 20px; text-align: center; flex-shrink: 0; }
  .nav-item .nav-badge {
    margin-left: auto; background: var(--coral); color: white;
    font-size: 10px; padding: 2px 7px; border-radius: 10px; font-weight: 600;
  }
  .sidebar-sos {
    padding: 20px 28px; border-top: 1px solid rgba(255,255,255,0.08);
  }
  .sos-btn {
    width: 100%; background: var(--coral); color: white; border: none;
    padding: 14px; border-radius: var(--radius-sm); font-size: 16px; font-weight: 700;
    letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s; font-family: 'Lora', serif;
  }
  .sos-btn:hover { background: #c9604a; transform: scale(1.02); box-shadow: 0 8px 24px rgba(224,122,95,0.4); }

  /* MAIN */
  .main { margin-left: 280px; flex: 1; min-height: 100vh; }
  .topbar {
    background: var(--warm-white); border-bottom: 1px solid var(--border);
    padding: 18px 40px; display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50;
  }
  .topbar-title { }
  .topbar-title h2 { font-size: 22px; color: var(--navy); font-weight: 700; }
  .topbar-title p { color: var(--text-muted); font-size: 14px; margin-top: 1px; font-family: 'DM Sans', sans-serif; font-style: italic; }
  .topbar-actions { display: flex; align-items: center; gap: 12px; }
  .content { padding: 36px 40px; }

  /* CARDS */
  .card {
    background: var(--warm-white); border-radius: var(--radius);
    border: 1px solid var(--border); box-shadow: var(--shadow);
    padding: 28px; transition: box-shadow 0.2s;
  }
  .card:hover { box-shadow: var(--shadow-lg); }
  .card-title { font-size: 16px; color: var(--navy); font-weight: 700; margin-bottom: 4px; font-family: 'Lora', serif; }
  .card-sub { color: var(--text-muted); font-size: 13px; margin-bottom: 20px; }

  /* STAT CARDS */
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }
  .stat-card {
    background: var(--warm-white); border-radius: var(--radius);
    border: 1px solid var(--border); padding: 22px 24px;
    display: flex; flex-direction: column; gap: 8px;
    transition: all 0.2s; position: relative; overflow: hidden;
  }
  .stat-card::before {
    content: ''; position: absolute; top: 0; right: 0;
    width: 80px; height: 80px; border-radius: 0 0 0 80px;
    opacity: 0.08;
  }
  .stat-card.sage::before { background: var(--sage); }
  .stat-card.coral::before { background: var(--coral); }
  .stat-card.gold::before { background: var(--gold); }
  .stat-card.navy::before { background: var(--navy); }
  .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .stat-icon { font-size: 24px; }
  .stat-label { color: var(--text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; }
  .stat-value { font-size: 32px; font-weight: 700; font-family: 'Lora', serif; color: var(--navy); line-height: 1; }
  .stat-value small { font-size: 14px; color: var(--text-muted); font-family: 'DM Sans'; font-weight: 400; }
  .stat-trend { font-size: 12px; color: var(--sage-dark); font-weight: 500; }
  .stat-trend.bad { color: var(--coral); }

  /* GRID LAYOUTS */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
  .grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }

  /* FORMS */
  .form-group { margin-bottom: 18px; }
  .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--navy); margin-bottom: 6px; }
  .form-input {
    width: 100%; padding: 12px 16px; border: 1.5px solid var(--border);
    border-radius: var(--radius-sm); font-size: 15px; background: var(--cream);
    color: var(--text); transition: border-color 0.2s; outline: none;
  }
  .form-input:focus { border-color: var(--sage); background: #fff; }
  .form-select { appearance: none; cursor: pointer; }

  /* BUTTONS */
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600;
    border: none; transition: all 0.2s; cursor: pointer;
  }
  .btn-primary { background: var(--sage); color: white; }
  .btn-primary:hover { background: var(--sage-dark); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(122,158,126,0.35); }
  .btn-outline { background: transparent; color: var(--navy); border: 1.5px solid var(--border); }
  .btn-outline:hover { border-color: var(--sage); color: var(--sage-dark); }
  .btn-coral { background: var(--coral); color: white; }
  .btn-coral:hover { background: #c9604a; }
  .btn-gold { background: var(--gold); color: white; }
  .btn-sm { padding: 7px 14px; font-size: 13px; }
  .btn-lg { padding: 15px 30px; font-size: 16px; }

  /* BADGES */
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-sage { background: rgba(122,158,126,0.15); color: var(--sage-dark); }
  .badge-coral { background: rgba(224,122,95,0.15); color: #b55a42; }
  .badge-gold { background: rgba(201,168,76,0.15); color: #9a7a20; }
  .badge-navy { background: rgba(45,55,72,0.1); color: var(--navy); }

  /* RISK METER */
  .risk-bar { height: 10px; border-radius: 5px; background: var(--border); overflow: hidden; margin: 8px 0; }
  .risk-fill { height: 100%; border-radius: 5px; transition: width 0.6s ease; }
  .risk-low { background: linear-gradient(90deg, var(--sage-light), var(--sage)); }
  .risk-moderate { background: linear-gradient(90deg, var(--gold-light), var(--gold)); }
  .risk-high { background: linear-gradient(90deg, var(--coral-light), var(--coral)); }

  /* VITAL CHART (pure CSS) */
  .vital-bars { display: flex; align-items: flex-end; gap: 6px; height: 60px; padding-top: 4px; }
  .vital-bar { flex: 1; border-radius: 4px 4px 0 0; background: linear-gradient(180deg, var(--sage-light), var(--sage)); transition: height 0.4s; min-width: 8px; }

  /* CHAT */
  .chat-window { height: 360px; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; background: var(--cream); border-radius: var(--radius-sm); border: 1px solid var(--border); }
  .chat-msg { max-width: 80%; }
  .chat-msg.user { align-self: flex-end; }
  .chat-msg.assistant { align-self: flex-start; }
  .chat-bubble {
    padding: 12px 16px; border-radius: 18px; font-size: 15px; line-height: 1.5;
  }
  .chat-msg.user .chat-bubble { background: var(--sage); color: white; border-radius: 18px 18px 4px 18px; }
  .chat-msg.assistant .chat-bubble { background: var(--warm-white); color: var(--text); border: 1px solid var(--border); border-radius: 18px 18px 18px 4px; }
  .chat-time { font-size: 11px; color: var(--text-muted); margin-top: 4px; padding: 0 4px; }
  .chat-input-row { display: flex; gap: 10px; margin-top: 14px; }
  .chat-input { flex: 1; padding: 13px 18px; border: 1.5px solid var(--border); border-radius: 24px; font-size: 15px; background: var(--cream); outline: none; }
  .chat-input:focus { border-color: var(--sage); }

  /* MEDICATION LIST */
  .med-item { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--border); }
  .med-item:last-child { border-bottom: none; }
  .med-icon { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, var(--sage-light), var(--sage)); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .med-info { flex: 1; }
  .med-info strong { font-size: 15px; color: var(--navy); font-weight: 600; display: block; }
  .med-info span { font-size: 13px; color: var(--text-muted); }
  .med-times { display: flex; gap: 6px; margin-top: 4px; }

  /* EMERGENCY CONTACTS */
  .contact-item { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .contact-item:last-child { border-bottom: none; }
  .contact-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--coral-light), var(--coral)); display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 15px; flex-shrink: 0; }
  .contact-info { flex: 1; }
  .contact-info strong { font-size: 14px; color: var(--navy); display: block; }
  .contact-info span { font-size: 13px; color: var(--text-muted); }

  /* AUTH */
  .auth-wrap { min-height: 100vh; display: flex; align-items: stretch; }
  .auth-left { flex: 1; background: var(--navy); display: flex; flex-direction: column; justify-content: center; padding: 60px; position: relative; overflow: hidden; }
  .auth-left::before { content: ''; position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; border-radius: 50%; background: rgba(122,158,126,0.15); }
  .auth-left::after { content: ''; position: absolute; bottom: -80px; left: -60px; width: 300px; height: 300px; border-radius: 50%; background: rgba(224,122,95,0.1); }
  .auth-left-content { position: relative; z-index: 1; }
  .auth-left h1 { color: #fff; font-size: 48px; line-height: 1.1; margin-bottom: 16px; }
  .auth-left p { color: rgba(255,255,255,0.6); font-size: 18px; line-height: 1.6; max-width: 380px; }
  .auth-features { margin-top: 48px; display: flex; flex-direction: column; gap: 16px; }
  .auth-feature { display: flex; align-items: center; gap: 14px; color: rgba(255,255,255,0.7); font-size: 15px; }
  .auth-feature-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .auth-right { width: 480px; background: var(--cream); display: flex; align-items: center; justify-content: center; padding: 60px 48px; }
  .auth-form-box { width: 100%; }
  .auth-form-box h2 { font-size: 30px; color: var(--navy); margin-bottom: 6px; }
  .auth-form-box .auth-sub { color: var(--text-muted); font-size: 15px; margin-bottom: 36px; }
  .auth-tabs { display: flex; gap: 0; border: 1.5px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 28px; }
  .auth-tab { flex: 1; padding: 10px; text-align: center; font-size: 14px; font-weight: 600; background: transparent; border: none; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
  .auth-tab.active { background: var(--sage); color: white; }

  /* TOAST */
  .toast { position: fixed; bottom: 24px; right: 24px; z-index: 999; display: flex; flex-direction: column; gap: 8px; }
  .toast-item { padding: 14px 20px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 500; box-shadow: var(--shadow-lg); animation: slideIn 0.3s ease; max-width: 320px; }
  .toast-item.success { background: var(--sage); color: white; }
  .toast-item.error { background: var(--coral); color: white; }
  .toast-item.info { background: var(--navy); color: white; }
  @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(45,55,72,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
  .modal { background: var(--warm-white); border-radius: var(--radius); padding: 36px; width: 480px; max-width: 95vw; box-shadow: var(--shadow-lg); }
  .modal h3 { font-size: 22px; color: var(--navy); margin-bottom: 6px; }
  .modal-sub { color: var(--text-muted); font-size: 14px; margin-bottom: 24px; }
  .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }

  /* MISC */
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .section-header h3 { font-size: 18px; color: var(--navy); }
  .divider { height: 1px; background: var(--border); margin: 20px 0; }
  .empty-state { text-align: center; padding: 40px 20px; color: var(--text-muted); }
  .empty-state .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .empty-state p { font-size: 15px; }
  .loading { display: flex; align-items: center; justify-content: center; padding: 40px; }
  .spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--sage); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .pill { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: var(--border); color: var(--text-muted); margin: 2px; }
  .pill.active-pill { background: rgba(122,158,126,0.2); color: var(--sage-dark); }
  .tag-time { background: rgba(201,168,76,0.15); color: var(--gold); border-radius: 8px; padding: 2px 8px; font-size: 12px; font-weight: 600; }
  .sos-pulse {
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(224,122,95,0.5); }
    50% { box-shadow: 0 0 0 12px rgba(224,122,95,0); }
  }
`;

// ── TOAST ──────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };
  return { toasts, toast: add };
}

// ── VITALS MINI CHART ──────────────────────────────────────────────────────
function VitalChart({ values, color }) {
  if (!values || values.length === 0) return <div style={{height:60, background:"var(--border)", borderRadius:4}} />;
  const max = Math.max(...values);
  return (
    <div className="vital-bars">
      {values.map((v, i) => (
        <div key={i} className="vital-bar" style={{
          height: `${(v / max) * 100}%`,
          background: color || "linear-gradient(180deg, var(--sage-light), var(--sage))"
        }} />
      ))}
    </div>
  );
}

// ── RISK METER ─────────────────────────────────────────────────────────────
function RiskMeter({ score, label }) {
  const pct = Math.round(score * 100);
  const cls = score > 0.6 ? "risk-high" : score > 0.3 ? "risk-moderate" : "risk-low";
  const txt = score > 0.6 ? "High" : score > 0.3 ? "Moderate" : "Low";
  const col = score > 0.6 ? "var(--coral)" : score > 0.3 ? "var(--gold)" : "var(--sage)";
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:14,fontWeight:600,color:"var(--navy)"}}>{label}</span>
        <span style={{fontSize:13,fontWeight:700,color:col}}>{txt} ({pct}%)</span>
      </div>
      <div className="risk-bar">
        <div className={`risk-fill ${cls}`} style={{width:`${pct}%`}} />
      </div>
    </div>
  );
}

// ── AUTH ────────────────────────────────────────────────────────────────────
function AuthPage({ onLogin, toast }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ full_name:"", phone:"", password:"", email:"", language:"en" });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  const handleLogin = async () => {
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", form.phone);
      formData.append("password", form.password);
      const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const detail = err.detail;
        throw new Error(Array.isArray(detail) ? detail.map(e => e.msg).join(", ") : (detail || "Login failed"));
      }
      const data = await res.json();
      setToken(data.access_token);
      toast("Welcome back! \uD83D\uDC4B", "success");
      onLogin(data.access_token);
    } catch(e) { toast(e.message, "error"); }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await api("POST", "/auth/register", form);
      toast("Account created! Please log in.", "success");
      setTab("login");
    } catch(e) { toast(e.message, "error"); }
    setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-left-content">
          <h1>Your health,<br /><em>in caring hands.</em></h1>
          <p>A companion designed for every step of your wellness journey — simple, secure, and always with you.</p>
          <div className="auth-features">
            {[["🏥","AI-powered health predictions","Fall, cardiac & diabetic risk monitoring"],
              ["💊","Smart medication reminders","Never miss a dose with intelligent alerts"],
              ["🚨","One-tap emergency SOS","Instant alerts to family & authorities"],
              ["🤖","Conversational AI companion","24/7 emotional support & health guidance"]
            ].map(([icon, title, desc]) => (
              <div key={title} className="auth-feature">
                <div className="auth-feature-icon">{icon}</div>
                <div>
                  <div style={{fontWeight:600,color:"rgba(255,255,255,0.9)",fontSize:14}}>{title}</div>
                  <div style={{fontSize:13,marginTop:2}}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-box">
          <h2>CareCompanion</h2>
          <p className="auth-sub">{tab === "login" ? "Sign in to your account" : "Create your account"}</p>
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Sign In</button>
            <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Register</button>
          </div>

          {tab === "register" && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.full_name} onChange={set("full_name")} placeholder="Ramesh Kumar" />
              </div>
              <div className="form-group">
                <label className="form-label">Email (optional)</label>
                <input className="form-input" type="email" value={form.email} onChange={set("email")} placeholder="ramesh@email.com" />
              </div>
            </>
          )}
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" value={form.phone} onChange={set("phone")} placeholder="+919876543210" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" />
          </div>
          <button
            className="btn btn-primary btn-lg" style={{width:"100%",justifyContent:"center"}}
            onClick={tab === "login" ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? "Please wait…" : tab === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────
function Dashboard({ user, toast }) {
  const [vitals, setVitals] = useState(null);
  const [riskHistory, setRiskHistory] = useState([]);
  const [meds, setMeds] = useState([]);

  useEffect(() => {
    api("GET", "/vitals/latest").then(setVitals).catch(() => {});
    api("GET", "/risk/history").then(d => setRiskHistory(d.slice(0, 3))).catch(() => {});
    api("GET", "/medications").then(d => setMeds(d.slice(0, 3))).catch(() => {});
  }, []);

  const dec = (v) => { try { return parseFloat(v).toFixed(0); } catch { return v || "—"; } };

  const quickVitals = [
    { label: "Heart Rate", val: vitals ? `${dec(vitals.heart_rate)}` : "—", unit: "bpm", icon: "❤️", cls: "coral" },
    { label: "Blood Pressure", val: vitals ? `${dec(vitals.systolic_bp)}/${dec(vitals.diastolic_bp)}` : "—", unit: "mmHg", icon: "🩺", cls: "sage" },
    { label: "Blood Glucose", val: vitals ? `${dec(vitals.glucose_level)}` : "—", unit: "mg/dL", icon: "🩸", cls: "gold" },
    { label: "SpO₂", val: vitals ? `${dec(vitals.spo2)}` : "—", unit: "%", icon: "💨", cls: "navy" },
  ];

  const recentRisks = riskHistory.reduce((acc, r) => {
    if (!acc[r.risk_type]) acc[r.risk_type] = r; return acc;
  }, {});

  return (
    <div>
      <div className="stat-grid">
        {quickVitals.map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.val} <small>{s.unit}</small></div>
            {vitals && <div className="stat-trend">✓ Latest reading</div>}
          </div>
        ))}
      </div>

      <div className="grid-2-1" style={{marginBottom:20}}>
        <div className="card">
          <div className="card-title">Health Overview</div>
          <div className="card-sub">Your wellness at a glance</div>
          <VitalChart values={[72,75,68,80,74,71,76]} />
          <div style={{display:"flex",gap:20,marginTop:16}}>
            {[["❤️","Heart","72 bpm"],["😴","Sleep","7.2 hrs"],["👣","Steps","4,231"]].map(([i,l,v]) => (
              <div key={l} style={{textAlign:"center",flex:1}}>
                <div style={{fontSize:20}}>{i}</div>
                <div style={{fontSize:12,color:"var(--text-muted)",marginTop:2}}>{l}</div>
                <div style={{fontSize:15,fontWeight:700,color:"var(--navy)"}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Risk Scores</div>
          <div className="card-sub">3-month prediction window</div>
          {Object.keys(recentRisks).length > 0 ? Object.values(recentRisks).map(r => (
            <RiskMeter key={r.risk_type} score={r.score} label={r.risk_type.charAt(0).toUpperCase() + r.risk_type.slice(1)} />
          )) : (
            <div style={{color:"var(--text-muted)",fontSize:14,padding:"20px 0"}}>
              No risk scores yet. Run a prediction in the Risk tab.
            </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header">
            <h3 className="card-title" style={{margin:0}}>Today's Medications</h3>
            <span className="badge badge-sage">{meds.length} active</span>
          </div>
          {meds.length === 0 ? <div className="empty-state"><div className="empty-icon">💊</div><p>No medications added yet</p></div> : meds.map(m => (
            <div key={m.id} className="med-item">
              <div className="med-icon">💊</div>
              <div className="med-info">
                <strong>{m.name} — {m.dosage}</strong>
                <span>{m.frequency}</span>
                <div className="med-times">{(m.times || []).map(t => <span key={t} className="tag-time">{t}</span>)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Quick Actions</div>
          <div className="card-sub">Common tasks</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[["📊 Log Vitals", "sage"],["💊 Add Medication", "outline"],["🤖 Chat with AI", "outline"],["🚨 Test SOS", "coral"]].map(([l, t]) => (
              <button key={l} className={`btn btn-${t}`} style={{justifyContent:"flex-start"}}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── VITALS ─────────────────────────────────────────────────────────────────
function VitalsPage({ toast }) {
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ heart_rate:"", systolic_bp:"", diastolic_bp:"", glucose_level:"", spo2:"", weight_kg:"", steps:"", sleep_hours:"", source:"manual" });

  const load = () => {
    setLoading(true);
    api("GET", "/vitals").then(d => { setVitals(d); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  const submit = async () => {
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => { if (v !== "") payload[k] = k === "steps" ? parseInt(v) : (k === "source" ? v : parseFloat(v)); });
      payload.source = form.source;
      await api("POST", "/vitals", payload);
      toast("Vitals logged successfully! ✅");
      setShowForm(false);
      load();
    } catch(e) { toast(e.message, "error"); }
  };

  const dec = v => { try { return parseFloat(v).toFixed(1); } catch { return v || "—"; } };

  return (
    <div>
      <div className="section-header">
        <div />
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Log Vitals</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Log Vital Signs</h3>
            <p className="modal-sub">Record your current health measurements</p>
            <div className="grid-2">
              {[["Heart Rate (bpm)","heart_rate"],["Systolic BP","systolic_bp"],["Diastolic BP","diastolic_bp"],["Glucose (mg/dL)","glucose_level"],["SpO₂ (%)","spo2"],["Weight (kg)","weight_kg"],["Steps","steps"],["Sleep (hrs)","sleep_hours"]].map(([l,k]) => (
                <div key={k} className="form-group" style={{marginBottom:12}}>
                  <label className="form-label" style={{fontSize:12}}>{l}</label>
                  <input className="form-input" type="number" value={form[k]} onChange={set(k)} placeholder="—" style={{padding:"10px 12px"}} />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Source</label>
              <select className="form-input form-select" value={form.source} onChange={set("source")}>
                <option value="manual">Manual Entry</option>
                <option value="wearable">Wearable Device</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit}>Save Vitals</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="loading"><div className="spinner" /></div> : (
        <div className="card">
          {vitals.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📊</div><p>No vitals recorded yet. Log your first reading!</p></div>
          ) : (
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
                <thead>
                  <tr style={{borderBottom:"2px solid var(--border)"}}>
                    {["Date","Heart Rate","Blood Pressure","Glucose","SpO₂","Weight","Steps","Sleep","Source"].map(h => (
                      <th key={h} style={{padding:"10px 12px",textAlign:"left",color:"var(--text-muted)",fontWeight:600,fontSize:12,whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vitals.map(v => (
                    <tr key={v.id} style={{borderBottom:"1px solid var(--border)"}}>
                      <td style={{padding:"12px 12px",fontWeight:500,color:"var(--navy)",whiteSpace:"nowrap"}}>{new Date(v.recorded_at).toLocaleDateString()}</td>
                      <td style={{padding:"12px"}}>{dec(v.heart_rate)} bpm</td>
                      <td style={{padding:"12px"}}>{dec(v.systolic_bp)}/{dec(v.diastolic_bp)}</td>
                      <td style={{padding:"12px"}}>{dec(v.glucose_level)}</td>
                      <td style={{padding:"12px"}}>{dec(v.spo2)}%</td>
                      <td style={{padding:"12px"}}>{dec(v.weight_kg)} kg</td>
                      <td style={{padding:"12px"}}>{v.steps || "—"}</td>
                      <td style={{padding:"12px"}}>{dec(v.sleep_hours)} h</td>
                      <td style={{padding:"12px"}}><span className="badge badge-sage">{v.source}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── MEDICATIONS ────────────────────────────────────────────────────────────
function MedicationsPage({ toast }) {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", dosage:"", frequency:"", with_food:true, prescribing_doctor:"", notes:"" });

  const load = () => { api("GET", "/medications").then(d => { setMeds(d); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);
  const set = k => e => setForm(f => ({...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value}));

  const submit = async () => {
    try {
      await api("POST", "/medications", form);
      toast("Medication added! 💊");
      setShowForm(false);
      setForm({ name:"", dosage:"", frequency:"", with_food:true, prescribing_doctor:"", notes:"" });
      load();
    } catch(e) { toast(e.message, "error"); }
  };

  const remove = async (id) => {
    try { await api("DELETE", `/medications/${id}`); toast("Medication removed"); load(); }
    catch(e) { toast(e.message, "error"); }
  };

  return (
    <div>
      <div className="section-header">
        <div />
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Medication</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add Medication</h3>
            <p className="modal-sub">Add a new medication to your schedule</p>
            {[["Medication Name","name","Metformin"],["Dosage","dosage","500mg"],["Frequency","frequency","Twice daily"],["Prescribing Doctor","prescribing_doctor","Dr. Sharma"]].map(([l,k,p]) => (
              <div key={k} className="form-group">
                <label className="form-label">{l}</label>
                <input className="form-input" value={form[k]} onChange={set(k)} placeholder={p} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={2} value={form.notes} onChange={set("notes")} placeholder="Any special instructions..." />
            </div>
            <label style={{display:"flex",alignItems:"center",gap:8,fontSize:14,cursor:"pointer",marginBottom:16}}>
              <input type="checkbox" checked={form.with_food} onChange={set("with_food")} />
              Take with food
            </label>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit}>Add Medication</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="loading"><div className="spinner" /></div> : (
        <div className="grid-2">
          {meds.length === 0 ? (
            <div className="card" style={{gridColumn:"1/-1"}}><div className="empty-state"><div className="empty-icon">💊</div><p>No medications yet. Add your first medication.</p></div></div>
          ) : meds.map(m => (
            <div key={m.id} className="card">
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div className="med-icon">💊</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:16,color:"var(--navy)",fontFamily:"Lora, serif"}}>{m.name}</div>
                    <div style={{fontSize:14,color:"var(--text-muted)",marginTop:2}}>{m.dosage} · {m.frequency}</div>
                    {m.with_food && <span className="badge badge-sage" style={{marginTop:6}}>🍽 With food</span>}
                    {m.times && m.times.length > 0 && (
                      <div className="med-times" style={{marginTop:8}}>{m.times.map(t => <span key={t} className="tag-time">{t}</span>)}</div>
                    )}
                  </div>
                </div>
                <button className="btn btn-sm btn-outline" style={{color:"var(--coral)",borderColor:"var(--coral-light)"}} onClick={() => remove(m.id)}>Remove</button>
              </div>
              {m.notes && <div style={{marginTop:12,padding:12,background:"var(--cream)",borderRadius:8,fontSize:13,color:"var(--text-muted)"}}>{m.notes}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── RISK PREDICTION ─────────────────────────────────────────────────────────
function RiskPage({ toast }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(null);

  const load = () => { api("GET", "/risk/history").then(setHistory).catch(() => {}); };
  useEffect(load, []);

  const predict = async (type) => {
    setPredicting(type);
    try {
      const r = await api("POST", "/risk/predict", { risk_type: type });
      toast(`${type.charAt(0).toUpperCase()+type.slice(1)} risk predicted: ${r.risk_level} (${Math.round(r.score*100)}%)`, r.risk_level === "high" ? "error" : r.risk_level === "moderate" ? "info" : "success");
      load();
    } catch(e) { toast(e.message, "error"); }
    setPredicting(null);
  };

  const grouped = history.reduce((acc, r) => { acc[r.risk_type] = r; return acc; }, {});

  return (
    <div>
      <div className="grid-3" style={{marginBottom:24}}>
        {[["fall","Fall Risk","🚶","XGBoost model, 90-day window"],
          ["cardiac","Cardiac Risk","❤️","Stacking Ensemble, AUC 0.867"],
          ["diabetic","Diabetic Risk","🩸","Predictive monitoring"]
        ].map(([type, label, icon, desc]) => {
          const r = grouped[type];
          return (
            <div key={type} className="card" style={{textAlign:"center"}}>
              <div style={{fontSize:40,marginBottom:8}}>{icon}</div>
              <div style={{fontFamily:"Lora, serif",fontSize:18,fontWeight:700,color:"var(--navy)",marginBottom:4}}>{label}</div>
              <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:16}}>{desc}</div>
              {r && <RiskMeter score={r.score} label="" />}
              {r && <div style={{marginBottom:16}}><span className={`badge badge-${r.risk_level === "high" ? "coral" : r.risk_level === "moderate" ? "gold" : "sage"}`}>{r.risk_level.toUpperCase()}</span></div>}
              <button className="btn btn-primary btn-sm" style={{width:"100%",justifyContent:"center"}} onClick={() => predict(type)} disabled={predicting === type}>
                {predicting === type ? "Running…" : r ? "Re-predict" : "Run Prediction"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-title">Prediction History</div>
        <div className="card-sub">All past risk assessments</div>
        {history.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🔮</div><p>No predictions yet. Run a risk analysis above.</p></div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
              <thead>
                <tr style={{borderBottom:"2px solid var(--border)"}}>
                  {["Date","Type","Score","Level","Model","Window"].map(h => (
                    <th key={h} style={{padding:"10px 12px",textAlign:"left",color:"var(--text-muted)",fontWeight:600,fontSize:12}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(r => (
                  <tr key={r.id} style={{borderBottom:"1px solid var(--border)"}}>
                    <td style={{padding:"12px"}}>{new Date(r.computed_at).toLocaleDateString()}</td>
                    <td style={{padding:"12px",fontWeight:600,color:"var(--navy)",textTransform:"capitalize"}}>{r.risk_type}</td>
                    <td style={{padding:"12px"}}>{Math.round(r.score * 100)}%</td>
                    <td style={{padding:"12px"}}><span className={`badge badge-${r.risk_level === "high" ? "coral" : r.risk_level === "moderate" ? "gold" : "sage"}`}>{r.risk_level}</span></td>
                    <td style={{padding:"12px",fontSize:12,color:"var(--text-muted)"}}>{r.model_used}</td>
                    <td style={{padding:"12px"}}>{r.prediction_window_days}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CHAT ────────────────────────────────────────────────────────────────────
function ChatPage({ user, toast }) {
  const [messages, setMessages] = useState([{ role:"assistant", content:"Hello! I'm CareCompanion, your personal health assistant. How are you feeling today? 😊", timestamp: new Date() }]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role:"user", content: input, timestamp: new Date() };
    setMessages(m => [...m, userMsg]);
    const text = input;
    setInput("");
    setLoading(true);
    try {
      const r = await api("POST", "/chat/message", { message: text, session_id: sessionId });
      setSessionId(r.session_id);
      setMessages(m => [...m, { role:"assistant", content: r.content, timestamp: new Date(r.timestamp) }]);
    } catch(e) {
      setMessages(m => [...m, { role:"assistant", content:"I'm having trouble connecting right now. Please try again.", timestamp: new Date() }]);
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{maxWidth:700}}>
      <div className="card-title">AI Companion</div>
      <div className="card-sub">Your personal health assistant — always here for you</div>
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            <div className="chat-bubble">{m.content}</div>
            <div className="chat-time">{new Date(m.timestamp).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg assistant">
            <div className="chat-bubble" style={{display:"flex",gap:4,alignItems:"center"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"var(--sage)",animation:"spin 1s linear infinite"}} />
              <span style={{color:"var(--text-muted)",fontSize:14}}>Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type your message…"
        />
        <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()}>Send</button>
      </div>
      <div style={{marginTop:12,display:"flex",gap:8,flexWrap:"wrap"}}>
        {["How are my vitals?","Remind my medications","I'm feeling anxious","What exercises can I do?"].map(s => (
          <button key={s} className="pill" style={{cursor:"pointer",background:"rgba(122,158,126,0.1)",color:"var(--sage-dark)"}} onClick={() => { setInput(s); }}>{s}</button>
        ))}
      </div>
    </div>
  );
}

// ── EMERGENCY ──────────────────────────────────────────────────────────────
function EmergencyPage({ toast }) {
  const [contacts, setContacts] = useState([]);
  const [sos, setSos] = useState([]);
  const [showContact, setShowContact] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [form, setForm] = useState({ name:"", relation:"", phone:"", is_primary:false, notify_on_sos:true });

  useEffect(() => {
    api("GET", "/emergency/contacts").then(setContacts).catch(() => {});
    api("GET", "/emergency/history").then(setSos).catch(() => {});
  }, []);

  const set = k => e => setForm(f => ({...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value}));

  const addContact = async () => {
    try {
      await api("POST", "/emergency/contacts", form);
      toast("Emergency contact added! 📞");
      setShowContact(false);
      api("GET", "/emergency/contacts").then(setContacts).catch(() => {});
    } catch(e) { toast(e.message, "error"); }
  };

  const triggerSOS = async () => {
    setSosLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await api("POST", "/emergency/trigger", {
          trigger_method: "button",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        toast("🚨 SOS triggered! Emergency contacts and authorities notified.", "error");
        api("GET", "/emergency/history").then(setSos).catch(() => {});
        setSosLoading(false);
      }, async () => {
        await api("POST", "/emergency/trigger", { trigger_method: "button" });
        toast("🚨 SOS triggered! Emergency contacts notified.", "error");
        setSosLoading(false);
      });
    } catch(e) { toast(e.message, "error"); setSosLoading(false); }
  };

  return (
    <div>
      <div className="card" style={{marginBottom:20,background:"linear-gradient(135deg, #fff5f3, var(--warm-white))"}}>
        <div style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{fontFamily:"Lora, serif",fontSize:22,fontWeight:700,color:"var(--navy)",marginBottom:6}}>Emergency SOS</div>
          <p style={{color:"var(--text-muted)",marginBottom:24,fontSize:14}}>Tap the button below to alert emergency contacts and authorities</p>
          <button
            className={`sos-btn ${!sosLoading ? "sos-pulse" : ""}`}
            style={{width:160,height:160,borderRadius:"50%",fontSize:40,flexDirection:"column",gap:8,margin:"0 auto",display:"flex"}}
            onClick={triggerSOS}
            disabled={sosLoading}
          >
            <span>🚨</span>
            <span style={{fontSize:16}}>{sosLoading ? "Sending…" : "SOS"}</span>
          </button>
          <p style={{color:"var(--text-muted)",fontSize:13,marginTop:20}}>This will notify your emergency contacts via SMS and alert nearby authorities</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header">
            <h3 className="card-title" style={{margin:0}}>Emergency Contacts</h3>
            <button className="btn btn-sm btn-outline" onClick={() => setShowContact(true)}>+ Add</button>
          </div>
          {contacts.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👥</div><p>No emergency contacts yet. Add someone who can help.</p></div>
          ) : contacts.map(c => (
            <div key={c.id} className="contact-item">
              <div className="contact-avatar">{c.name[0]}</div>
              <div className="contact-info">
                <strong>{c.name} {c.is_primary && <span className="badge badge-coral" style={{marginLeft:4}}>Primary</span>}</strong>
                <span>{c.relation} · {c.phone}</span>
              </div>
              <button className="btn btn-sm btn-outline" style={{color:"var(--coral)"}}>Call</button>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">SOS History</div>
          <div className="card-sub">Past emergency events</div>
          {sos.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">✅</div><p>No emergencies recorded. Stay safe!</p></div>
          ) : sos.map(s => (
            <div key={s.id} style={{padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:600,fontSize:14,color:"var(--navy)",textTransform:"capitalize"}}>{s.trigger_method.replace("_"," ")}</span>
                <span className={`badge badge-${s.status === "resolved" ? "sage" : "coral"}`}>{s.status}</span>
              </div>
              <div style={{fontSize:12,color:"var(--text-muted)",marginTop:2}}>{new Date(s.triggered_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {showContact && (
        <div className="modal-overlay" onClick={() => setShowContact(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add Emergency Contact</h3>
            <p className="modal-sub">This person will be notified in case of an emergency</p>
            {[["Name","name","Priya Kumar"],["Relation","relation","Daughter"],["Phone","phone","+919876543210"]].map(([l,k,p]) => (
              <div key={k} className="form-group">
                <label className="form-label">{l}</label>
                <input className="form-input" value={form[k]} onChange={set(k)} placeholder={p} />
              </div>
            ))}
            <label style={{display:"flex",alignItems:"center",gap:8,fontSize:14,cursor:"pointer",marginBottom:10}}>
              <input type="checkbox" checked={form.is_primary} onChange={set("is_primary")} /> Set as primary contact
            </label>
            <label style={{display:"flex",alignItems:"center",gap:8,fontSize:14,cursor:"pointer",marginBottom:16}}>
              <input type="checkbox" checked={form.notify_on_sos} onChange={set("notify_on_sos")} /> Notify on SOS
            </label>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowContact(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addContact}>Add Contact</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DIET ────────────────────────────────────────────────────────────────────
function DietPage({ toast }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], conditions:[], calorie_target:1500 });

  const conditions = ["diabetes","hypertension","arthritis","cardiac"];
  const toggleCond = c => setForm(f => ({ ...f, conditions: f.conditions.includes(c) ? f.conditions.filter(x=>x!==c) : [...f.conditions, c] }));

  const generate = async () => {
    setLoading(true);
    try {
      await api("POST", "/diet/generate", form);
      const data = await api("GET", `/diet/${form.date}`);
      setPlan(data);
      toast("Meal plan generated! 🥗");
    } catch(e) { toast(e.message, "error"); }
    setLoading(false);
  };

  return (
    <div>
      <div className="card" style={{marginBottom:20}}>
        <div className="card-title">Generate Meal Plan</div>
        <div className="card-sub">AI-personalized nutrition based on your health conditions</div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Calorie Target</label>
            <input className="form-input" type="number" value={form.calorie_target} onChange={e => setForm(f=>({...f,calorie_target:parseInt(e.target.value)}))} placeholder="1500" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Health Conditions</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6}}>
            {conditions.map(c => (
              <button key={c} className={`pill ${form.conditions.includes(c) ? "active-pill" : ""}`} style={{cursor:"pointer",textTransform:"capitalize"}} onClick={() => toggleCond(c)}>{c}</button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" onClick={generate} disabled={loading}>
          {loading ? "Generating…" : "✨ Generate Meal Plan"}
        </button>
      </div>

      {plan && (
        <div>
          {Array.isArray(plan) ? plan.map(meal => <MealCard key={meal.id} meal={meal} />) : <MealCard meal={plan} />}
        </div>
      )}
    </div>
  );
}

function MealCard({ meal }) {
  const icons = { breakfast:"🌅", lunch:"☀️", dinner:"🌙", snack:"🍎" };
  return (
    <div className="card" style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <span style={{fontSize:24}}>{icons[meal.meal_type] || "🍽"}</span>
        <div>
          <div style={{fontFamily:"Lora, serif",fontSize:16,fontWeight:700,color:"var(--navy)",textTransform:"capitalize"}}>{meal.meal_type}</div>
          <div style={{fontSize:12,color:"var(--text-muted)"}}>{meal.date}</div>
        </div>
        <div style={{marginLeft:"auto",textAlign:"right"}}>
          <div style={{fontSize:18,fontWeight:700,color:"var(--sage)",fontFamily:"Lora,serif"}}>{Math.round(meal.total_calories)} kcal</div>
          <div style={{fontSize:12,color:"var(--text-muted)"}}>total calories</div>
        </div>
      </div>
      <div style={{display:"flex",gap:12,marginBottom:16}}>
        {[["Protein",meal.total_protein_g,"g","var(--sage)"],["Carbs",meal.total_carbs_g,"g","var(--gold)"],["Fat",meal.total_fat_g,"g","var(--coral)"],["Sodium",meal.sodium_mg,"mg","var(--navy-light)"]].map(([l,v,u,c]) => (
          <div key={l} style={{flex:1,textAlign:"center",padding:"10px",background:"var(--cream)",borderRadius:10}}>
            <div style={{fontSize:15,fontWeight:700,color:c}}>{Math.round(v||0)}{u}</div>
            <div style={{fontSize:11,color:"var(--text-muted)"}}>{l}</div>
          </div>
        ))}
      </div>
      {meal.items && meal.items.map((item, i) => (
        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid var(--border)",fontSize:14}}>
          <span style={{color:"var(--navy)",fontWeight:500}}>{item.name}</span>
          <span style={{color:"var(--text-muted)"}}>{item.quantity} · {item.calories} kcal</span>
        </div>
      ))}
    </div>
  );
}

// ── PROFILE ─────────────────────────────────────────────────────────────────
function ProfilePage({ user, toast }) {
  const [form, setForm] = useState({ full_name: user?.full_name || "", email: user?.email || "", language: user?.language || "en", font_size: user?.font_size || 18 });
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  const save = async () => {
    try {
      await api("PATCH", "/users/me", form);
      toast("Profile updated! ✅");
    } catch(e) { toast(e.message, "error"); }
  };

  return (
    <div className="grid-2-1">
      <div className="card">
        <div className="card-title">Personal Information</div>
        <div className="card-sub">Manage your profile details</div>
        <div className="divider" />
        {[["Full Name","full_name","text"],["Email","email","email"]].map(([l,k,t]) => (
          <div key={k} className="form-group">
            <label className="form-label">{l}</label>
            <input className="form-input" type={t} value={form[k]} onChange={set(k)} />
          </div>
        ))}
        <div className="form-group">
          <label className="form-label">Preferred Language</label>
          <select className="form-input form-select" value={form.language} onChange={set("language")}>
            <option value="en">English</option>
            <option value="te">Telugu</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Font Size: {form.font_size}px</label>
          <input type="range" min="14" max="32" value={form.font_size} onChange={set("font_size")} style={{width:"100%",accentColor:"var(--sage)"}} />
        </div>
        <button className="btn btn-primary" onClick={save}>Save Changes</button>
      </div>

      <div>
        <div className="card" style={{marginBottom:16,textAlign:"center"}}>
          <div className="user-avatar" style={{width:80,height:80,fontSize:32,margin:"0 auto 16px"}}>
            {user?.full_name?.[0] || "U"}
          </div>
          <div style={{fontFamily:"Lora,serif",fontSize:18,fontWeight:700,color:"var(--navy)"}}>{user?.full_name || "User"}</div>
          <div style={{color:"var(--text-muted)",fontSize:14,marginTop:4}}>{user?.phone}</div>
          <div style={{marginTop:12}}><span className={`badge ${user?.biometric_enrolled ? "badge-sage" : "badge-navy"}`}>{user?.biometric_enrolled ? "✓ Biometric enrolled" : "Biometric not set"}</span></div>
        </div>
        <div className="card">
          <div className="card-title" style={{marginBottom:12}}>Account Status</div>
          {[["Status", user?.is_active ? "Active" : "Inactive"],["Member since", user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"],["Mobility", user?.mobility_level || "—"],["Language", user?.language || "en"]].map(([l,v]) => (
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)",fontSize:14}}>
              <span style={{color:"var(--text-muted)"}}>{l}</span>
              <span style={{fontWeight:600,color:"var(--navy)",textTransform:"capitalize"}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── NAV CONFIG ─────────────────────────────────────────────────────────────
const NAV = [
  { section: "Overview", items: [{ id:"dashboard", label:"Dashboard", icon:"🏠" }] },
  { section: "Health", items: [
    { id:"vitals", label:"Vital Signs", icon:"📊" },
    { id:"medications", label:"Medications", icon:"💊" },
    { id:"diet", label:"Diet & Nutrition", icon:"🥗" },
    { id:"risk", label:"Risk Prediction", icon:"🔮" },
  ]},
  { section: "Support", items: [
    { id:"chat", label:"AI Companion", icon:"🤖" },
    { id:"emergency", label:"Emergency SOS", icon:"🚨" },
  ]},
  { section: "Account", items: [
    { id:"profile", label:"My Profile", icon:"👤" },
  ]},
];

// ── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const { toasts, toast } = useToast();

  const loadUser = async () => {
    try { const u = await api("GET", "/users/me"); setUser(u); } catch {}
  };

  const handleLogin = (token) => {
    setToken(token);
    setAuthed(true);
    loadUser();
  };

  const logout = () => {
    setToken("");
    setAuthed(false);
    setUser(null);
  };

  const pageLabels = {
    dashboard:"Good to see you 🌿", vitals:"Vital Signs", medications:"Medications",
    diet:"Diet & Nutrition", risk:"Risk Prediction", chat:"AI Companion",
    emergency:"Emergency SOS", profile:"My Profile",
  };

  const renderPage = () => {
    switch(page) {
      case "dashboard": return <Dashboard user={user} toast={toast} />;
      case "vitals": return <VitalsPage toast={toast} />;
      case "medications": return <MedicationsPage toast={toast} />;
      case "diet": return <DietPage toast={toast} />;
      case "risk": return <RiskPage toast={toast} />;
      case "chat": return <ChatPage user={user} toast={toast} />;
      case "emergency": return <EmergencyPage toast={toast} />;
      case "profile": return <ProfilePage user={user} toast={toast} />;
      default: return <Dashboard user={user} toast={toast} />;
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="toast">
        {toasts.map(t => <div key={t.id} className={`toast-item ${t.type}`}>{t.msg}</div>)}
      </div>
      {!authed ? (
        <AuthPage onLogin={handleLogin} toast={toast} />
      ) : (
        <div className="app">
          <aside className="sidebar">
            <div className="sidebar-logo">
              <h1>Care<em>Companion</em></h1>
              <span>Elderly Health Platform</span>
            </div>
            <div className="sidebar-user">
              <div className="user-avatar">{user?.full_name?.[0] || "U"}</div>
              <div className="user-info">
                <strong>{user?.full_name || "User"}</strong>
                <span>{user?.phone}</span>
              </div>
            </div>
            <nav className="nav">
              {NAV.map(({ section, items }) => (
                <div key={section}>
                  <div className="nav-section">{section}</div>
                  {items.map(item => (
                    <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
                      <span className="nav-icon">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
            <div className="sidebar-sos">
              <button className="sos-btn sos-pulse" onClick={() => setPage("emergency")}>🚨 Emergency SOS</button>
            </div>
          </aside>
          <main className="main">
            <div className="topbar">
              <div className="topbar-title">
                <h2>{pageLabels[page]}</h2>
                <p>{new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
              </div>
              <div className="topbar-actions">
                <button className="btn btn-outline btn-sm" onClick={logout}>Sign Out</button>
              </div>
            </div>
            <div className="content">
              {renderPage()}
            </div>
          </main>
        </div>
      )}
    </>
  );
}
