import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Lock, Eye, EyeOff, Zap, ArrowRight,
    Sparkles, CheckCircle, Star, Shield, TrendingUp, Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DOMAINS = [
    'Web Development', 'Mobile Development', 'Graphic Design', 'Content Writing',
    'Video Editing', 'Data Science', 'UI/UX Design', 'Digital Marketing',
    'Copywriting', 'SEO', 'Photography', 'Animation', 'Voice Over', 'Translation',
    'App Development', 'Game Development', 'Cybersecurity', 'Cloud Computing',
];

const ROLES = [
    { value: 'freelancer', emoji: '🧑‍💻', label: 'Freelancer', desc: 'Find tasks & grow your portfolio', bg: '#d1fae5', border: '#6ee7b7', text: '#065f46' },
    { value: 'client', emoji: '🏢', label: 'Client', desc: 'Post tasks & hire top talent', bg: '#ede9fe', border: '#c4b5fd', text: '#6d28d9' },
];


/* ── Floating particle ───────────────────────────── */
const Particle = ({ style }) => (
    <motion.div className="absolute rounded-full pointer-events-none" style={style}
        animate={{ y: [-20, 20, -20], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: style.duration, repeat: Infinity, ease: 'easeInOut', delay: style.delay }} />
);
const particles = [
    { width: 6, height: 6, top: '10%', left: '6%', background: '#6366f1', duration: 4, delay: 0 },
    { width: 10, height: 10, top: '40%', left: '4%', background: '#06b6d4', duration: 5.5, delay: 1 },
    { width: 4, height: 4, top: '70%', left: '10%', background: '#10b981', duration: 3.8, delay: 0.5 },
    { width: 8, height: 8, top: '85%', left: '8%', background: '#a855f7', duration: 6, delay: 2 },
    { width: 5, height: 5, top: '15%', left: '91%', background: '#f59e0b', duration: 4.5, delay: 1.5 },
    { width: 11, height: 11, top: '55%', left: '92%', background: '#6366f1', duration: 5, delay: 0.8 },
    { width: 6, height: 6, top: '78%', left: '94%', background: '#06b6d4', duration: 3.5, delay: 2.5 },
];

/* ── Input with icon ─────────────────────────────── */
const IconInput = ({ icon: Icon, iconColor = '#94a3b8', focused, ...props }) => (
    <div className="relative">
        <Icon size={17} style={{
            position: 'absolute', left: '1rem', top: '50%',
            transform: 'translateY(-50%)', color: focused ? '#6366f1' : iconColor,
            zIndex: 2, pointerEvents: 'none', transition: 'color 0.2s'
        }} />
        <input {...props} className="input-field" style={{ paddingLeft: '2.75rem', fontSize: '0.9375rem', ...props.style }} />
    </div>
);

const Register = () => {
    const navigate = useNavigate();
    const { doRegister } = useAuth();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'freelancer', domains: [] });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [focused, setFocused] = useState('');

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const toggleDomain = (d) =>
        set('domains', form.domains.includes(d) ? form.domains.filter(x => x !== d) : [...form.domains, d]);

    const step1Valid = form.name && form.email && form.password.length >= 6;

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const user = await doRegister(form);
            navigate(user.role === 'client' ? '/client/dashboard' : '/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex overflow-hidden" style={{ background: 'var(--color-bg)' }}>
            {particles.map((p, i) => <Particle key={i} style={p} />)}

            {/* ── LEFT PANEL ── */}
            <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex flex-col justify-between w-[48%] relative overflow-hidden"
                style={{ padding: '4rem', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(145deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.06) 50%, rgba(16,185,129,0.08) 100%)' }}>

                {/* Glow blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
                <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />

                {/* Logo */}
                <div className="relative z-10">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className="inline-flex items-center gap-3 mb-1">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center pulse-glow"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                            <Zap size={22} className="text-white" />
                        </div>
                        <span className="text-3xl font-bold gradient-text">MicroWork</span>
                    </motion.div>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                        className="text-slate-400 text-sm ml-1">Domain-Aware Micro Work Platform</motion.p>
                </div>

                {/* Hero */}
                <div className="relative z-10 my-auto">
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="font-black text-white"
                        style={{ fontSize: '4.25rem', lineHeight: 1.12, marginBottom: '3.5rem' }}>
                        Your talent<br />
                        deserves{' '}
                        <span className="gradient-text">recognition</span>
                    </motion.h1>

                    <div className="space-y-4">
                        {[
                            { icon: Star, text: 'Domain-specific quality scoring', color: '#f59e0b', delay: 0.55 },
                            { icon: Shield, text: '7-day Beginner Boost for new members', color: '#06b6d4', delay: 0.65 },
                            { icon: TrendingUp, text: 'Four-level career progression system', color: '#10b981', delay: 0.75 },
                            { icon: Sparkles, text: 'AI-powered fair pricing on every task', color: '#a855f7', delay: 0.85 },
                        ].map(({ icon: Icon, text, color, delay }) => (
                            <motion.div key={text} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay, duration: 0.5 }}
                                className="flex items-center gap-4 px-5 py-3.5 rounded-xl border"
                                style={{ background: `${color}12`, borderColor: `${color}30` }}>
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: `${color}22` }}>
                                    <Icon size={17} style={{ color }} />
                                </div>
                                <span className="text-base font-medium" style={{ color: '#000' }}>{text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                    className="relative z-10 flex items-center gap-12">
                    {[{ val: '4', label: 'Skill Levels' }, { val: '70/30', label: 'Rookie Pool' }, { val: 'AI', label: 'Fair Pricing' }].map(s => (
                        <div key={s.label}>
                            <p className="text-4xl font-black gradient-text">{s.val}</p>
                            <p className="text-sm text-slate-400 mt-1">{s.label}</p>
                        </div>
                    ))}
                </motion.div>
            </motion.div>

            {/* ── RIGHT PANEL ── */}
            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex-1 flex items-center justify-center relative"
                style={{ padding: '3rem' }}>

                <div className="w-full" style={{ maxWidth: '460px' }}>

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }} style={{ marginBottom: '2rem' }}>
                        <h2 className="font-bold text-white" style={{ fontSize: '2rem', marginBottom: '0.375rem' }}>
                            {step === 1 ? 'Create your account 🎉' : (form.role === 'client' ? '🏢 Almost done!' : '🎯 Pick your domains')}
                        </h2>
                        <p className="text-slate-400" style={{ fontSize: '0.9375rem' }}>
                            {step === 1 ? 'Step 1 of 2 — Your details' : 'Step 2 of 2 — Choose what you work on'}
                        </p>

                        {/* Progress bar */}
                        <div className="rounded-full mt-4" style={{ height: '4px', background: '#e2e8f0' }}>
                            <motion.div animate={{ width: step === 1 ? '50%' : '100%' }}
                                className="h-full rounded-full"
                                style={{ background: 'linear-gradient(90deg,#6366f1,#06b6d4)' }} />
                        </div>
                    </motion.div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="rounded-xl" style={{ padding: '0.875rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                                ⚠️ {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Card */}
                    <AnimatePresence mode="wait">

                        {/* ── Step 1 ── */}
                        {step === 1 && (
                            <motion.div key="step1"
                                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                {/* Name */}
                                <div>
                                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                                        Full Name <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <IconInput icon={User} focused={focused === 'name'}
                                        name="name" value={form.name} onChange={e => set('name', e.target.value)}
                                        onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                                        placeholder="Your full name" required
                                        style={focused === 'name' ? { borderColor: 'rgba(99,102,241,0.6)', boxShadow: '0 0 0 3px rgba(99,102,241,0.1)' } : {}} />
                                </div>

                                {/* Email */}
                                <div>
                                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                                        Email Address <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <IconInput icon={Mail} focused={focused === 'email'}
                                        name="email" type="email" value={form.email} onChange={e => set('email', e.target.value)}
                                        onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                                        placeholder="you@example.com" required
                                        style={focused === 'email' ? { borderColor: 'rgba(99,102,241,0.6)', boxShadow: '0 0 0 3px rgba(99,102,241,0.1)' } : {}} />
                                </div>

                                {/* Password */}
                                <div>
                                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                                        Password <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock size={17} style={{
                                            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                                            color: focused === 'pw' ? '#6366f1' : '#94a3b8', zIndex: 2, pointerEvents: 'none', transition: 'color 0.2s'
                                        }} />
                                        <input name="password" type={showPw ? 'text' : 'password'} value={form.password}
                                            onChange={e => set('password', e.target.value)}
                                            onFocus={() => setFocused('pw')} onBlur={() => setFocused('')}
                                            placeholder="Min. 6 characters" required className="input-field"
                                            style={{
                                                paddingLeft: '2.75rem', paddingRight: '3rem', fontSize: '0.9375rem',
                                                ...(focused === 'pw' ? { borderColor: 'rgba(99,102,241,0.6)', boxShadow: '0 0 0 3px rgba(99,102,241,0.1)' } : {})
                                            }} />
                                        <button type="button" onClick={() => setShowPw(!showPw)}
                                            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 2, background: 'none', border: 'none', cursor: 'pointer' }}>
                                            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                    {form.password.length > 0 && form.password.length < 6 && (
                                        <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.375rem' }}>At least 6 characters required</p>
                                    )}
                                </div>

                                {/* Role selector */}
                                <div>
                                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.75rem' }}>
                                        I want to… <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem' }}>
                                        {ROLES.map(r => {
                                            const active = form.role === r.value;
                                            return (
                                                <motion.button key={r.value} type="button" whileTap={{ scale: 0.95 }}
                                                    onClick={() => set('role', r.value)}
                                                    style={{
                                                        padding: '1rem 0.5rem', borderRadius: '14px', textAlign: 'center',
                                                        border: `2px solid ${active ? r.border : '#e2e8f0'}`,
                                                        background: active ? r.bg : '#f8fafc',
                                                        cursor: 'pointer', transition: 'all .2s',
                                                    }}>
                                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{r.emoji}</div>
                                                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: active ? r.text : '#334155' }}>{r.label}</div>
                                                    <div style={{ fontSize: '0.6875rem', color: active ? r.text : '#94a3b8', marginTop: '0.25rem', lineHeight: 1.3 }}>{r.desc}</div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <motion.button type="button" whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => setStep(2)} disabled={!step1Valid}
                                    className="btn-brand flex items-center justify-center gap-2"
                                    style={{ padding: '1rem', fontSize: '1rem', fontWeight: 700, borderRadius: '14px', marginTop: '0.25rem', opacity: step1Valid ? 1 : 0.45 }}>
                                    Continue <ArrowRight size={18} />
                                </motion.button>

                                <p className="text-center text-slate-400" style={{ fontSize: '0.875rem' }}>
                                    Already have an account?{' '}
                                    <Link to="/login" className="font-semibold" style={{ color: '#6366f1' }}>Sign in →</Link>
                                </p>
                            </motion.div>
                        )}

                        {/* ── Step 2 ── */}
                        {step === 2 && (
                            <motion.form key="step2" onSubmit={submit}
                                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                {(form.role === 'freelancer' || form.role === 'both') && (
                                    <div>
                                        <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                                            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>
                                                <Tag size={13} className="inline mr-1.5" style={{ color: '#6366f1' }} />
                                                Select your expertise domains
                                            </label>
                                            {form.domains.length > 0 && (
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '999px', background: '#ede9fe', color: '#6d28d9' }}>
                                                    {form.domains.length} selected
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.6 }}>
                                            Each domain starts at Level 1 with a 7-day Beginner Boost. You earn quality scores per domain independently.
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '14rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
                                            {DOMAINS.map(d => {
                                                const active = form.domains.includes(d);
                                                return (
                                                    <motion.button key={d} type="button" whileTap={{ scale: 0.93 }}
                                                        onClick={() => toggleDomain(d)}
                                                        style={{
                                                            fontSize: '0.8125rem', fontWeight: 600,
                                                            padding: '0.375rem 0.875rem', borderRadius: '999px',
                                                            border: `1.5px solid ${active ? '#c4b5fd' : '#e2e8f0'}`,
                                                            background: active ? '#ede9fe' : '#f8fafc',
                                                            color: active ? '#6d28d9' : '#475569',
                                                            cursor: 'pointer', transition: 'all .15s',
                                                            display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                        }}>
                                                        {active && <CheckCircle size={11} style={{ color: '#6d28d9' }} />}
                                                        {d}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {form.role === 'client' && (
                                    <div className="text-center rounded-2xl" style={{ padding: '3rem 2rem', background: '#f0fdf4', border: '1px solid #86efac' }}>
                                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🚀</div>
                                        <p style={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                                            You're all set as a Client!
                                        </p>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                            Post tasks, review applicants, and hire from our talent pool.
                                        </p>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button type="button" onClick={() => setStep(1)}
                                        style={{ flex: 1, padding: '1rem', borderRadius: '14px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer' }}>
                                        ← Back
                                    </button>
                                    <motion.button type="submit" whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.97 }}
                                        disabled={loading || ((form.role === 'freelancer' || form.role === 'both') && form.domains.length === 0)}
                                        className="btn-brand flex items-center justify-center gap-2"
                                        style={{
                                            flex: 2, padding: '1rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 700,
                                            opacity: (loading || ((form.role === 'freelancer' || form.role === 'both') && form.domains.length === 0)) ? 0.45 : 1
                                        }}>
                                        {loading ? (
                                            <><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                                className="inline-block w-5 h-5 border-2 rounded-full"
                                                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                                                Creating…
                                            </>
                                        ) : <>Create Account 🎉</>}
                                    </motion.button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
