import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Star, Shield, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Floating particle (purely decorative) ─────────────────────── */
const Particle = ({ style }) => (
    <motion.div
        className="absolute rounded-full pointer-events-none"
        style={style}
        animate={{ y: [-20, 20, -20], opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
        transition={{ duration: style.duration, repeat: Infinity, ease: 'easeInOut', delay: style.delay }}
    />
);

const particles = [
    { width: 6, height: 6, top: '12%', left: '8%', background: '#6366f1', duration: 4, delay: 0 },
    { width: 10, height: 10, top: '35%', left: '5%', background: '#06b6d4', duration: 5.5, delay: 1 },
    { width: 4, height: 4, top: '65%', left: '12%', background: '#10b981', duration: 3.5, delay: 0.5 },
    { width: 8, height: 8, top: '80%', left: '7%', background: '#8b5cf6', duration: 6, delay: 2 },
    { width: 5, height: 5, top: '20%', left: '92%', background: '#f59e0b', duration: 4.5, delay: 1.5 },
    { width: 12, height: 12, top: '55%', left: '90%', background: '#6366f1', duration: 5, delay: 0.8 },
    { width: 6, height: 6, top: '75%', left: '94%', background: '#06b6d4', duration: 3.8, delay: 2.5 },
    { width: 9, height: 9, top: '90%', left: '30%', background: '#10b981', duration: 4.2, delay: 0.3 },
    { width: 5, height: 5, top: '5%', left: '60%', background: '#a855f7', duration: 5.2, delay: 1.2 },
];

/* ── Left panel feature pill ───────────────────────────────────── */
const FeaturePill = ({ icon: Icon, text, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.6, ease: 'easeOut' }}
        className="flex items-center gap-4 px-5 py-3.5 rounded-xl border"
        style={{
            background: `${color}12`,
            borderColor: `${color}30`,
        }}
    >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}22` }}>
            <Icon size={18} style={{ color }} />
        </div>
        <span className="text-base font-medium" style={{ color: '#000000' }}>{text}</span>
    </motion.div>
);

/* ── Animated grid lines background ────────────────────────────── */
const GridLines = () => (
    <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
            backgroundImage: `
        linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)
      `,
            backgroundSize: '60px 60px',
        }}
    />
);

/* ── Main Login Component ───────────────────────────────────────── */
const Login = () => {
    const navigate = useNavigate();
    const { doLogin } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [focused, setFocused] = useState('');

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const user = await doLogin(form.email, form.password);
            navigate(user.role === 'client' ? '/client/dashboard' : '/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex overflow-hidden" style={{ background: 'var(--color-bg)' }}>
            {particles.map((p, i) => <Particle key={i} style={p} />)}

            {/* ── LEFT PANEL ────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden"
                style={{ padding: '4rem', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(145deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.06) 50%, rgba(16,185,129,0.08) 100%)' }}
            >
                <GridLines />

                {/* Glow blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
                <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />

                {/* Logo */}
                <div className="relative z-10">
                    <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className="inline-flex items-center gap-3 mb-2">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center pulse-glow"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                            <Zap size={22} className="text-white" />
                        </div>
                        <span className="text-3xl font-bold gradient-text">MicroWork</span>
                    </motion.div>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                        className="text-slate-400 text-base ml-1">Domain-Aware Micro Work Platform</motion.p>
                </div>

                {/* Hero text */}
                <div className="relative z-10 my-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-7xl font-black text-white"
                        style={{ lineHeight: 1.18, marginBottom: '4.5rem' }}
                    >
                        Where talent
                        <br />
                        meets{' '}
                        <span className="gradient-text">opportunity</span>
                    </motion.h1>

                    <div className="space-y-5">
                        <FeaturePill icon={Star} text="Domain-wise quality scoring (1–5 stars)" color="#f59e0b" delay={0.6} />
                        <FeaturePill icon={Shield} text="Reliability tracking per domain" color="#06b6d4" delay={0.7} />
                        <FeaturePill icon={TrendingUp} text="Four-level progression system" color="#10b981" delay={0.8} />
                        <FeaturePill icon={Zap} text="7-day Beginner Boost for new freelancers" color="#a855f7" delay={0.9} />
                    </div>
                </div>

                {/* Stats row */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="relative z-10 flex items-center gap-12">
                    {[
                        { val: '4', label: 'Skill Levels' },
                        { val: '70/30', label: 'Rookie Pool' },
                        { val: 'AI', label: 'Fair Pricing' },
                    ].map(s => (
                        <div key={s.label}>
                            <p className="text-4xl font-black gradient-text">{s.val}</p>
                            <p className="text-sm text-slate-400 mt-1">{s.label}</p>
                        </div>
                    ))}
                </motion.div>
            </motion.div>

            {/* ── RIGHT PANEL ───────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="flex-1 flex items-center justify-center relative"
                style={{ padding: '3.5rem' }}
            >
                <div className="w-full max-w-md">

                    {/* Heading */}
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }} className="mb-10">
                        <h2 className="text-4xl font-bold text-white mb-3">Welcome back 👋</h2>
                        <p className="text-slate-400 text-lg">Sign in to your MicroWork account</p>
                    </motion.div>

                    {/* Error banner */}
                    <AnimatePresence>
                        {error && (
                            <motion.div key="err"
                                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-5 px-5 py-4 rounded-xl text-base text-red-300 flex items-center gap-3"
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
                            >
                                <span className="text-lg">⚠️</span> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <motion.form onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }} className="space-y-8">

                        {/* Email */}
                        <div className="relative">
                            <label className="text-base text-slate-300 font-semibold mb-2.5 block">Email Address</label>
                            <div className="relative">
                                <div className="absolute left-4 top-0 bottom-0 flex items-center pointer-events-none" style={{ zIndex: 2 }}>
                                    <Mail size={20} style={{
                                        color: focused === 'email' ? '#818cf8' : '#64748b',
                                        transition: 'color 0.2s ease'
                                    }} />
                                </div>
                                <input
                                    name="email" type="email" value={form.email} onChange={onChange}
                                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                                    placeholder="you@example.com" required
                                    className="input-field text-base py-4"
                                    style={{
                                        paddingLeft: '3rem',
                                        ...(focused === 'email' ? {
                                            borderColor: 'rgba(99,102,241,0.7)',
                                            boxShadow: '0 0 0 3px rgba(99,102,241,0.12), 0 0 20px rgba(99,102,241,0.08)',
                                            background: 'rgba(99,102,241,0.06)',
                                        } : {})
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <div className="flex items-center justify-between mb-2.5">
                                <label className="text-base text-slate-300 font-semibold">Password</label>
                                <span className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors font-medium">
                                    Forgot password?
                                </span>
                            </div>
                            <div className="relative">
                                <div className="absolute left-4 top-0 bottom-0 flex items-center pointer-events-none" style={{ zIndex: 2 }}>
                                    <Lock size={20} style={{
                                        color: focused === 'password' ? '#818cf8' : '#64748b',
                                        transition: 'color 0.2s ease'
                                    }} />
                                </div>
                                <input
                                    name="password" type={showPw ? 'text' : 'password'}
                                    value={form.password} onChange={onChange}
                                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                                    placeholder="Enter your password" required
                                    className="input-field text-base py-4"
                                    style={{
                                        paddingLeft: '3rem',
                                        paddingRight: '3.5rem',
                                        ...(focused === 'password' ? {
                                            borderColor: 'rgba(99,102,241,0.7)',
                                            boxShadow: '0 0 0 3px rgba(99,102,241,0.12), 0 0 20px rgba(99,102,241,0.08)',
                                            background: 'rgba(99,102,241,0.06)',
                                        } : {})
                                    }}
                                />
                                <div className="absolute right-4 top-0 bottom-0 flex items-center" style={{ zIndex: 2 }}>
                                    <button type="button" onClick={() => setShowPw(!showPw)}
                                        className="text-slate-500 hover:text-slate-200 transition-colors">
                                        {showPw ? <EyeOff size={19} /> : <Eye size={19} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.015 }}
                            whileTap={{ scale: 0.97 }}
                            className="relative w-full py-5 rounded-2xl text-white font-bold text-xl overflow-hidden mt-3"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                boxShadow: '0 0 30px rgba(99,102,241,0.4)',
                            }}
                        >
                            {/* Shimmer sweep */}
                            <motion.div
                                className="absolute inset-0"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                            />

                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                        className="inline-block w-5 h-5 border-2 rounded-full"
                                        style={{ borderColor: 'rgba(255,255,255,0.25)', borderTopColor: '#fff' }}
                                    />
                                    Signing in…
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Sign In <ArrowRight size={20} />
                                </span>
                            )}
                        </motion.button>
                    </motion.form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                        <span className="text-sm text-slate-500 font-medium">or</span>
                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    </div>

                    {/* Register CTA */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                        className="text-center">
                        <p className="text-slate-400 text-base mb-4">Don't have an account yet?</p>
                        <Link to="/register">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                className="w-full py-5 rounded-2xl text-lg font-bold text-indigo-300 flex items-center justify-center gap-2 transition-all"
                                style={{
                                    background: 'rgba(99,102,241,0.09)',
                                    border: '1px solid rgba(99,102,241,0.3)',
                                }}>
                                Create a Free Account <ArrowRight size={17} />
                            </motion.div>
                        </Link>
                    </motion.div>

                    {/* Footer note */}
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                        className="text-center text-slate-500 text-base mt-8">
                        By continuing you agree to our Terms &amp; Privacy Policy.
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
