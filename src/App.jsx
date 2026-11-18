import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight, Wallet, TrendingUp, Clock3, ReceiptText, Plus, LogOut,
  Instagram, MessageCircle, X, LayoutDashboard, LoaderCircle, CheckCircle2,
  AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from './supabase';

const money = (n) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2
}).format(Number(n || 0));

function clickTone(kind = 'tap') {
  // Tiny synthesized UI sound; no audio file or background music required.
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(kind === 'enter' ? 660 : 520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(kind === 'enter' ? 880 : 390, ctx.currentTime + 0.055);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.055, ctx.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.085);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.09);
    osc.onended = () => ctx.close();
  } catch {}
}

function Brand({ compact = false }) {
  return <div className={`brand ${compact ? 'brand-compact' : ''}`}>
    <div className="brand-mark">E<span>B</span></div>
    <div className="brand-copy"><strong>EARNBOOK</strong><small>BY RUPAK</small></div>
  </div>;
}

function Footer() {
  return <footer className="footer">
    <span>© {new Date().getFullYear()} EarnBook by RUPAK</span>
    <div className="socials">
      <a href="https://instagram.com/rupak_nathh" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17}/><span>Instagram</span></a>
      <a href="https://wa.me/919954169799" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={17}/><span>WhatsApp</span></a>
    </div>
  </footer>;
}

function EnterScreen({ onEnter }) {
  return <main className="entry-screen">
    <div className="entry-glow"/>
    <div className="entry-top"><Brand /></div>
    <button className="enter-button" onClick={() => { clickTone('enter'); onEnter(); }}>
      <span>ENTER</span><ArrowUpRight size={18}/>
    </button>
    <div className="entry-bottom"><span>YOUR MONEY. CLEARLY TRACKED.</span><span>© RUPAK</span></div>
  </main>;
}

function AuthScreen({ onBack, onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(''); setMessage('');
    if (!isSupabaseConfigured) {
      setError('Supabase is not connected yet. Follow SETUP.md to create your new database and add the project keys.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: name.trim() } }
        });
        if (error) throw error;
        if (data.session) onAuth(data.session.user);
        else setMessage('Account created. Check your email to confirm your account, then log in.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      }
    } catch (err) { setError(err.message || 'Something went wrong.'); }
    finally { setBusy(false); }
  }

  return <main className="auth-page">
    <header className="auth-header"><button className="back-link" onClick={() => { clickTone(); onBack(); }}>← Back</button><Brand compact/></header>
    <section className="auth-card">
      <div className="eyebrow">PERSONAL FINANCE WORKSPACE</div>
      <h1>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h1>
      <p className="muted">{mode === 'login' ? 'Sign in to access your earnings dashboard.' : 'Start keeping your earnings organised.'}</p>
      <div className="auth-tabs">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => { clickTone(); setMode('login'); setError(''); }}>Log in</button>
        <button className={mode === 'signup' ? 'active' : ''} onClick={() => { clickTone(); setMode('signup'); setError(''); }}>Sign up</button>
      </div>
      <form onSubmit={submit} className="auth-form">
        {mode === 'signup' && <label>Full name<input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required autoComplete="name"/></label>}
        <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email"/></label>
        <label>Password<div className="password-wrap"><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/><button type="button" className="show-pass" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
        {error && <div className="notice error"><AlertCircle size={16}/>{error}</div>}
        {message && <div className="notice success"><CheckCircle2 size={16}/>{message}</div>}
        <button className="primary-btn full" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18}/> : mode === 'login' ? 'Log in' : 'Create account'}<ArrowUpRight size={17}/></button>
      </form>
      <p className="auth-note">Your account and ledger are private to you.</p>
    </section>
    <Footer/>
  </main>;
}

function StatCard({ title, value, icon: Icon, detail, tone }) {
  return <article className={`stat-card ${tone || ''}`}>
    <div className="stat-top"><span>{title}</span><div className="stat-icon"><Icon size={18}/></div></div>
    <strong>{money(value)}</strong><small>{detail}</small>
  </article>;
}

function Dashboard({ user, onLogout }) {
  const [entries, setEntries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', amount: '', note: '' });

  async function loadData() {
    setLoading(true); setError('');
    const [e, x] = await Promise.all([
      supabase.from('earnings').select('*').order('created_at', { ascending: false }),
      supabase.from('expenses').select('*').order('created_at', { ascending: false })
    ]);
    if (e.error || x.error) setError(e.error?.message || x.error?.message);
    else { setEntries(e.data || []); setExpenses(x.data || []); }
    setLoading(false);
  }
  useEffect(() => { loadData(); }, []);

  const totals = useMemo(() => {
    const earned = entries.reduce((s, x) => s + Number(x.amount), 0);
    const received = entries.reduce((s, x) => s + Number(x.received), 0);
    const expense = expenses.reduce((s, x) => s + Number(x.amount), 0);
    return { earned, received, pending: Math.max(earned - received, 0), expense, after: received - expense };
  }, [entries, expenses]);

  async function saveEntry(e) {
    e.preventDefault(); setSaving(true); setError('');
    const amount = Number(form.amount);
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) { setError('Enter a title and a valid amount.'); setSaving(false); return; }
    let payload;
    if (modal === 'earning') {
      payload = { user_id: user.id, title: form.title.trim(), amount, received: 0, note: form.note.trim() };
      const { error } = await supabase.from('earnings').insert(payload);
      if (error) setError(error.message);
    } else if (modal === 'received') {
      const { data: rows, error: readError } = await supabase.from('earnings').select('id,received,amount').order('created_at', { ascending: true });
      if (readError) setError(readError.message);
      else {
        const pending = (rows || []).reduce((s, r) => s + Number(r.amount) - Number(r.received), 0);
        if (amount > pending) setError(`You can record up to ${money(pending)} as received.`);
        else {
          let left = amount, failed = null;
          for (const r of rows || []) {
            const due = Number(r.amount) - Number(r.received);
            if (due <= 0 || left <= 0) continue;
            const add = Math.min(due, left);
            const { error } = await supabase.from('earnings').update({ received: Number(r.received) + add }).eq('id', r.id);
            if (error) { failed = error; break; }
            left -= add;
          }
          if (failed) setError(failed.message);
        }
      }
    } else {
      if (amount > totals.after) setError(`Available balance is ${money(totals.after)}. Expense cannot exceed it.`);
      else {
        const { error } = await supabase.from('expenses').insert({ user_id: user.id, title: form.title.trim(), amount, note: form.note.trim() });
        if (error) setError(error.message);
      }
    }
    setSaving(false);
    if (!error) { setModal(''); setForm({ title: '', amount: '', note: '' }); await loadData(); }
  }

  async function removeExpense(id) {
    if (!window.confirm('Delete this expense record?')) return;
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) setError(error.message); else loadData();
  }

  return <main className="dashboard-page">
    <header className="dash-header"><Brand compact/><div className="user-tools"><span className="user-email">{user.email}</span><button className="icon-btn" onClick={() => { clickTone(); onLogout(); }} title="Log out"><LogOut size={18}/></button></div></header>
    <section className="dash-main">
      <div className="welcome-row"><div><div className="eyebrow">YOUR OVERVIEW</div><h1>Good to see you.</h1><p className="muted">Here’s where your money stands.</p></div><div className="private-pill"><span/> PRIVATE WORKSPACE</div></div>
      {error && <div className="notice error"><AlertCircle size={16}/>{error}</div>}
      <div className="stats-grid">
        <StatCard title="Total Earned" value={totals.earned} icon={TrendingUp} detail="All earnings recorded"/>
        <StatCard title="Total Received" value={totals.received} icon={Wallet} detail="Payments received"/>
        <StatCard title="Pending" value={totals.pending} icon={Clock3} detail="Still to be received"/>
        <StatCard title="Total After Expenses" value={totals.after} icon={ReceiptText} detail="Received minus expenses" tone="highlight"/>
      </div>
      <section className="panel">
        <div className="panel-heading"><div><h2>Ledger</h2><p className="muted">Record earnings, payments and expenses.</p></div><div className="action-row">
          <button className="secondary-btn" onClick={() => { clickTone(); setModal('received'); setForm({title:'Payment received',amount:'',note:''}); }}><Plus size={16}/> Received</button>
          <button className="primary-btn" onClick={() => { clickTone(); setModal('earning'); setForm({title:'',amount:'',note:''}); }}><Plus size={16}/> Add earning</button>
        </div></div>
        <div className="ledger-list">
          {loading ? <div className="empty-state"><LoaderCircle className="spin" size={22}/>Loading your ledger…</div> :
            entries.length === 0 ? <div className="empty-state"><LayoutDashboard size={25}/><strong>No earnings yet</strong><span>Add your first earning to get started.</span></div> :
            entries.map(item => <div className="ledger-item" key={item.id}><div className="ledger-symbol"><TrendingUp size={18}/></div><div className="ledger-info"><strong>{item.title}</strong><small>{new Date(item.created_at).toLocaleDateString('en-IN')} · {item.note || 'Earning'}</small></div><div className="ledger-amount"><strong>{money(item.amount)}</strong><small>{money(item.received)} received</small></div></div>)
          }
        </div>
      </section>
      <section className="panel expenses-panel">
        <div className="panel-heading"><div><div className="eyebrow">PRIVATE TO YOU</div><h2>Expenses</h2><p className="muted">Only you can see these records.</p></div><button className="secondary-btn" onClick={() => { clickTone(); setModal('expense'); setForm({title:'',amount:'',note:''}); }}><Plus size={16}/> Add expense</button></div>
        <div className="expense-summary"><span>Total expenses</span><strong>{money(totals.expense)}</strong><span>Available after expenses</span><strong>{money(totals.after)}</strong></div>
        {expenses.length > 0 && <div className="ledger-list">{expenses.map(item => <div className="ledger-item" key={item.id}><div className="ledger-symbol expense-symbol"><ReceiptText size={18}/></div><div className="ledger-info"><strong>{item.title}</strong><small>{new Date(item.created_at).toLocaleDateString('en-IN')} · {item.note || 'Expense'}</small></div><div className="ledger-amount"><strong>− {money(item.amount)}</strong><button className="delete-link" onClick={() => removeExpense(item.id)}>Delete</button></div></div>)}</div>}
      </section>
    </section>
    <Footer/>
    {modal && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(''); }}><section className="modal-card"><div className="modal-head"><div><div className="eyebrow">{modal === 'expense' ? 'PRIVATE EXPENSE' : modal === 'received' ? 'PAYMENT UPDATE' : 'NEW RECORD'}</div><h2>{modal === 'expense' ? 'Add an expense' : modal === 'received' ? 'Record received amount' : 'Add an earning'}</h2></div><button className="icon-btn" onClick={() => setModal('')}><X size={19}/></button></div><form className="auth-form" onSubmit={saveEntry}><label>{modal === 'received' ? 'Reference / title' : 'Title'}<input required value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder={modal === 'expense' ? 'e.g. Software subscription' : modal === 'received' ? 'e.g. Client payment' : 'e.g. Video editing project'}/></label><label>Amount (₹)<input type="number" min="0.01" step="0.01" required value={form.amount} onChange={e => setForm({...form,amount:e.target.value})} placeholder="0.00"/></label><label>Note (optional)<input value={form.note} onChange={e => setForm({...form,note:e.target.value})} placeholder="Add a short note"/></label>{error && <div className="notice error"><AlertCircle size={16}/>{error}</div>}<button className="primary-btn full" disabled={saving}>{saving ? <LoaderCircle className="spin" size={18}/> : 'Save record'}<ArrowUpRight size={17}/></button></form></section></div>}
  </main>;
}

export default function App() {
  const [page, setPage] = useState('entry');
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) { setUser(data.session.user); setPage('dashboard'); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) setPage(p => p === 'dashboard' ? 'auth' : p);
    });
    return () => listener.subscription.unsubscribe();
  }, []);
  async function logout() { clickTone(); await supabase.auth.signOut(); setUser(null); setPage('auth'); }
  if (user) return <Dashboard user={user} onLogout={logout}/>;
  if (page === 'entry') return <EnterScreen onEnter={() => setPage('auth')}/>;
  return <AuthScreen onBack={() => setPage('entry')} onAuth={setUser}/>;
}
