import { useState } from "react";
import { Navigate, Link, Route, Routes, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, LayoutDashboard, Plus, LogOut, Search, Pencil, Trash2, CalendarDays, Building2, ArrowUpRight, CircleCheck, X, Filter, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import api from "./api.js";
import { AuthProvider, useAuth } from "./auth.jsx";

const STATUSES = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];
const LABEL = { APPLIED: "Applied", INTERVIEW: "Interview", OFFER: "Offer", REJECTED: "Rejected" };
const COLORS = { APPLIED: "#6366f1", INTERVIEW: "#f59e0b", OFFER: "#10b981", REJECTED: "#f43f5e" };
const today = () => new Date().toISOString().slice(0, 10);
const blankJob = () => ({ companyName: "", role: "", status: "APPLIED", applicationDate: today(), interviewDate: "", notes: "" });

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}
function Guest({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

function Shell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return <div className="app-shell">
    <aside className="sidebar">
      <Link to="/" className="brand"><span className="brand-mark"><BriefcaseBusiness size={20}/></span><span>trackly<span className="brand-dot">.</span></span></Link>
      <div className="side-label">WORKSPACE</div>
      <Link className="side-link active" to="/"><LayoutDashboard size={18}/> Dashboard</Link>
      <Link className="side-link" to="/new"><Plus size={18}/> Add application</Link>
      <div className="sidebar-bottom">
        <div className="avatar">{user?.name?.slice(0,1)?.toUpperCase() || "U"}</div>
        <div className="profile-copy"><strong>{user?.name}</strong><span>{user?.email}</span></div>
        <button className="icon-button logout-button" title="Log out" onClick={() => { logout(); navigate("/login"); }}><LogOut size={17}/></button>
      </div>
    </aside>
    <main className="main-area">{children}</main>
  </div>;
}

function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError("");
    if (isRegister && form.name.trim().length < 2) return setError("Enter your name (at least 2 characters).");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Enter a valid email address.");
    if (form.password.length < 6) return setError("Password must contain at least 6 characters.");
    setBusy(true);
    try {
      if (isRegister) await register(form); else await login({ email: form.email, password: form.password });
      navigate("/", { replace: true });
    } catch (err) { setError(err.response?.data?.message || "Could not connect. Is the backend running?"); }
    finally { setBusy(false); }
  }

  return <div className="auth-layout">
    <div className="auth-promo">
      <Link to="/login" className="brand light"><span className="brand-mark"><BriefcaseBusiness size={20}/></span><span>trackly<span className="brand-dot">.</span></span></Link>
      <div className="promo-copy"><span className="eyebrow">YOUR CAREER, ORGANIZED</span><h1>Make your next move<br/>your best move.</h1><p>One calm, clear space for every application, interview, and opportunity.</p>
        <div className="promo-preview"><div className="preview-top"><span>Application overview</span><span className="preview-pill">This month</span></div><div className="preview-metrics"><div><span>Applications</span><strong>24</strong></div><div><span>Interviews</span><strong>06</strong></div><div><span>Offers</span><strong>02</strong></div></div><div className="preview-line"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div>
      </div>
      <div className="promo-footer">A little more clarity. A lot more momentum.</div>
    </div>
    <div className="auth-side"><div className="auth-card">
      <div className="mobile-brand"><BriefcaseBusiness size={22}/> trackly.</div>
      <span className="eyebrow">{isRegister ? "GET STARTED" : "WELCOME BACK"}</span>
      <h2>{isRegister ? "Create your account" : "Sign in to Trackly"}</h2>
      <p className="muted">{isRegister ? "Start organizing your job search today." : "Pick up where your job search left off."}</p>
      <form onSubmit={submit} className="form-stack">
        {isRegister && <label>Full name<input autoComplete="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" required/></label>}
        <label>Email address<input type="email" autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required/></label>
        <label>Password<input type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters" required minLength={6}/></label>
        {error && <div className="alert-error">{error}</div>}
        <button className="button primary full" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"} <ArrowUpRight size={17}/></button>
      </form>
      <p className="auth-switch">{isRegister ? "Already have an account?" : "New to Trackly?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
      <div className="auth-note"><span/> Your job search data is private to your account.</div>
    </div></div>
  </div>;
}

function Dashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [summary, setSummary] = useState({ total: 0, applied: 0, interview: 0, offer: 0, rejected: 0 });
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const [list, stats] = await Promise.all([
        api.get("/jobs", { params: { status, search } }),
        api.get("/jobs/summary")
      ]);
      setJobs(list.data); setSummary(stats.data);
    } catch (err) { setError(err.response?.data?.message || "Unable to load applications."); }
    finally { setLoading(false); }
  }

  // Load applications when the dashboard opens
  // and whenever the search or status filter changes.
  ReactUseEffect(() => {
    load();
  }, [status, search]);


  async function remove(id) {
    if (!window.confirm("Delete this application? This cannot be undone.")) return;
    try { await api.delete(`/jobs/${id}`); await load(); }
    catch (err) { setError(err.response?.data?.message || "Could not delete application."); }
  }

  const chartData = STATUSES.map(s => ({ name: LABEL[s], value: summary[s.toLowerCase()] || 0, color: COLORS[s] })).filter(x => x.value > 0);
  const cards = [
    { label: "Total applications", value: summary.total, icon: BriefcaseBusiness, color: "violet", note: "All tracked roles" },
    { label: "Interviews", value: summary.interview, icon: CalendarDays, color: "amber", note: "Keep preparing" },
    { label: "Offers received", value: summary.offer, icon: CircleCheck, color: "green", note: "Celebrate progress" },
    { label: "Awaiting response", value: summary.applied, icon: ArrowUpRight, color: "blue", note: "Applications sent" }
  ];

  return <Shell><div className="page-wrap">
    <header className="page-header"><div><span className="eyebrow">YOUR JOB SEARCH</span><h1>Good to see you, {user?.name?.split(" ")[0] || "there"} <span className="wave">✳</span></h1><p>Here’s what’s happening with your applications.</p></div><Link to="/new" className="button primary"><Plus size={18}/> Add application</Link></header>
    {error && <div className="alert-error global-error">{error}</div>}
    <section className="stats-grid">{cards.map(c => <div className="stat-card" key={c.label}><div className="stat-top"><span>{c.label}</span><span className={`stat-icon ${c.color}`}><c.icon size={18}/></span></div><div className="stat-value">{c.value}</div><div className="stat-note">{c.note}</div></div>)}</section>
    <section className="content-grid">
      <div className="panel applications-panel"><div className="panel-heading"><div><h2>Applications</h2><p>Keep every opportunity in view.</p></div><span className="count-badge">{jobs.length} shown</span></div>
        <div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search company or role…"/></div><div className="select-wrap"><Filter size={15}/><select value={status} onChange={e=>setStatus(e.target.value)}><option value="ALL">All statuses</option>{STATUSES.map(s=><option value={s} key={s}>{LABEL[s]}</option>)}</select><ChevronDown size={14}/></div></div>
        {loading ? <div className="state-message">Loading your applications…</div> : jobs.length === 0 ? <div className="empty-state"><div className="empty-icon"><BriefcaseBusiness size={24}/></div><h3>No applications found</h3><p>{search || status !== "ALL" ? "Try changing your search or filter." : "Add your first application to start tracking your progress."}</p>{!search && status === "ALL" && <Link to="/new" className="button primary"><Plus size={16}/> Add your first job</Link>}</div> :
          <div className="job-list">{jobs.map(job=><article className="job-row" key={job.id}><div className="company-icon">{job.companyName.slice(0,1).toUpperCase()}</div><div className="job-main"><div className="job-title-line"><h3>{job.role}</h3><span className={`status status-${job.status.toLowerCase()}`}>{LABEL[job.status]}</span></div><div className="company-name"><Building2 size={14}/>{job.companyName}</div><div className="job-meta"><span><CalendarDays size={13}/> Applied {job.applicationDate || "—"}</span>{job.interviewDate && <span><CalendarDays size={13}/> Interview {job.interviewDate}</span>}</div>{job.notes && <p className="job-notes">{job.notes}</p>}</div><div className="row-actions"><Link to={`/edit/${job.id}`} className="icon-button" title="Edit"><Pencil size={16}/></Link><button className="icon-button danger-hover" title="Delete" onClick={()=>remove(job.id)}><Trash2 size={16}/></button></div></article>)}</div>}
      </div>
      <aside className="panel insight-panel"><div className="panel-heading"><div><h2>Application mix</h2><p>Your current pipeline.</p></div></div>
        {chartData.length ? <><div className="chart-box"><ResponsiveContainer width="100%" height={210}><PieChart><Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={82} paddingAngle={3}>{chartData.map((entry,index)=><Cell key={index} fill={entry.color}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="chart-center"><strong>{summary.total}</strong><span>total</span></div></div><div className="legend-list">{STATUSES.map(s=><div key={s}><span><i style={{background:COLORS[s]}}/>{LABEL[s]}</span><strong>{summary[s.toLowerCase()] || 0}</strong></div>)}</div></> : <div className="chart-empty"><div className="empty-icon"><CircleCheck size={22}/></div><p>Your application breakdown will appear here.</p></div>}
        <div className="tip-box"><span className="tip-spark">✳</span><div><strong>Small steps add up</strong><p>Keep your statuses current so your next step is always clear.</p></div></div>
      </aside>
    </section>
    <footer className="page-footer">Trackly · Built to make the job search feel a little lighter.</footer>
  </div></Shell>;
}

// A tiny wrapper keeps the effect hook explicit and valid in this single-file starter.
import { useEffect as ReactUseEffect } from "react";

function JobForm({ edit = false }) {
  const { id } = useParamsSafe();
  const navigate = useNavigate();
  const [form, setForm] = useState(blankJob());
  const [loading, setLoading] = useState(edit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  ReactUseEffect(() => {
    if (!edit) return;
    api.get(`/jobs/${id}`).then(({data})=>setForm({
      companyName: data.companyName || "", role: data.role || "", status: data.status || "APPLIED",
      applicationDate: data.applicationDate || today(), interviewDate: data.interviewDate || "", notes: data.notes || ""
    })).catch(err=>setError(err.response?.data?.message || "Could not load application."))
      .finally(()=>setLoading(false));
  }, [edit, id]);

  async function submit(e) {
    e.preventDefault(); setError("");
    if (!form.companyName.trim() || !form.role.trim()) return setError("Company and role are required.");
    setBusy(true);
    try {
      const payload = { ...form, companyName: form.companyName.trim(), role: form.role.trim(),
        interviewDate: form.interviewDate || null, applicationDate: form.applicationDate || today(),
        notes: form.notes.trim() };
      if (edit) await api.put(`/jobs/${id}`, payload); else await api.post("/jobs", payload);
      navigate("/");
    } catch (err) { setError(err.response?.data?.message || "Could not save application."); }
    finally { setBusy(false); }
  }

  if (loading) return <Shell><div className="page-wrap"><div className="state-message">Loading application…</div></div></Shell>;
  return <Shell><div className="form-page"><Link to="/" className="back-link">← Back to dashboard</Link><div className="form-heading"><span className="eyebrow">{edit ? "UPDATE DETAILS" : "NEW OPPORTUNITY"}</span><h1>{edit ? "Edit application" : "Add an application"}</h1><p>Capture the details now. You can update the status as you progress.</p></div>
    <form className="panel job-form" onSubmit={submit}>
      {error && <div className="alert-error">{error}</div>}
      <div className="form-section-title">Role details</div>
      <div className="form-grid"><label>Company name *<input value={form.companyName} onChange={e=>setForm({...form,companyName:e.target.value})} placeholder="e.g. Microsoft" required maxLength={120}/></label><label>Job title *<input value={form.role} onChange={e=>setForm({...form,role:e.target.value})} placeholder="e.g. Software Engineer" required maxLength={120}/></label>
        <label>Application status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{STATUSES.map(s=><option key={s} value={s}>{LABEL[s]}</option>)}</select></label><label>Application date<input type="date" value={form.applicationDate} onChange={e=>setForm({...form,applicationDate:e.target.value})} required/></label><label>Interview date (optional)<input type="date" value={form.interviewDate} onChange={e=>setForm({...form,interviewDate:e.target.value})}/></label></div>
      <label className="notes-label">Notes <span>Optional</span><textarea rows="4" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Recruiter contact, interview topics, follow-up reminders…" maxLength={2000}/></label>
      <div className="form-actions"><Link to="/" className="button secondary">Cancel</Link><button className="button primary" disabled={busy}>{busy ? "Saving…" : edit ? "Save changes" : "Save application"} <ArrowUpRight size={16}/></button></div>
    </form></div></Shell>;
}

// Hooks are imported through these aliases for readability.
import { useParams as useParamsRaw } from "react-router-dom";
function useParamsSafe() { return useParamsRaw(); }

function AppRoutes() {
  return <Routes>
    <Route path="/login" element={<Guest><AuthPage mode="login"/></Guest>}/>
    <Route path="/register" element={<Guest><AuthPage mode="register"/></Guest>}/>
    <Route path="/" element={<Protected><Dashboard/></Protected>}/>
    <Route path="/new" element={<Protected><JobForm/></Protected>}/>
    <Route path="/edit/:id" element={<Protected><JobForm edit/></Protected>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}
export default function App() {
  return <AuthProvider><AppRoutes/></AuthProvider>;
}
