import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Briefcase, Tags, Eye, EyeOff, Zap, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DOMAINS = [
    'Web Development', 'Mobile Development', 'Graphic Design', 'Content Writing',
    'Video Editing', 'Data Science', 'UI/UX Design', 'Digital Marketing',
    'Copywriting', 'SEO', 'Photography', 'Animation', 'Voice Over', 'Translation',
    'App Development', 'Game Development', 'Cybersecurity', 'Cloud Computing',
];

const ROLES = [
    { value: 'freelancer', label: 'Freelancer', icon: '🧑‍💻', desc: 'Find micro-tasks & grow your portfolio' },
    { value: 'client', label: 'Client', icon: '🏢', desc: 'Post tasks & hire top talent' },
    { value: 'both', label: 'Both', icon: '⚡', desc: 'Do it all – hire and work' },
];

const Register = () => {
    const navigate = useNavigate();
    const { doRegister } = useAuth();
    const [step, setStep] = useState(1); // 2-step wizard
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'freelancer', domains: [] });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        <div className="min-h-screen flex items-center justify-center py-10 relative overflow-hidden" style={{ background: 'var(--color-bg)' }}>
            <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}
                className="relative z-10 w-full max-w-lg px-4">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 pulse-glow"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                        <Zap size={24} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold gradient-text">Join MicroWork</h1>
                    <p className="text-slate-400 text-sm mt-1">Step {step} of 2</p>
                </div>

                {/* Progress */}
                <div className="progress-bar mb-6 mx-4">
                    <motion.div className="progress-fill" animate={{ width: step === 1 ? '50%' : '100%' }}
                        style={{ background: 'linear-gradient(90deg,#6366f1,#06b6d4)' }} />
                </div>

                <div className="glass-strong rounded-2xl p-8" style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-5">
                            {error}
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1"
                                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                                className="space-y-4">
                                <h2 className="text-lg font-semibold text-white mb-4">Your Details</h2>

                                {/* Name */}
                                <div className="relative">
                                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input name="name" value={form.name} onChange={e => set('name', e.target.value)}
                                        placeholder="Full name" required className="input-field pl-10" />
                                </div>
                                {/* Email */}
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input name="email" type="email" value={form.email} onChange={e => set('email', e.target.value)}
                                        placeholder="Email address" required className="input-field pl-10" />
                                </div>
                                {/* Password */}
                                <div className="relative">
                                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                                        placeholder="Password (min. 6 chars)" required className="input-field pl-10 pr-10" />
                                    <button type="button" onClick={() => setShowPw(!showPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Select your role</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {ROLES.map(r => (
                                            <motion.button key={r.value} type="button" whileTap={{ scale: 0.95 }}
                                                onClick={() => set('role', r.value)}
                                                className={`p-3 rounded-xl border text-center transition-all duration-200 ${form.role === r.value
                                                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                                                        : 'border-white/10 bg-white/3 text-slate-400 hover:border-white/20'
                                                    }`}>
                                                <div className="text-xl mb-1">{r.icon}</div>
                                                <div className="text-xs font-semibold">{r.label}</div>
                                                <div className="text-[10px] mt-0.5 opacity-70">{r.desc}</div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <motion.button type="button" whileTap={{ scale: .97 }} onClick={() => setStep(2)}
                                    disabled={!step1Valid}
                                    className="btn-brand w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-40">
                                    Continue →
                                </motion.button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.form key="step2" onSubmit={submit}
                                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                                className="space-y-4">
                                <h2 className="text-lg font-semibold text-white mb-2">
                                    {form.role === 'client' ? '🏢 Almost done!' : '🎯 Select your domains'}
                                </h2>

                                {(form.role === 'freelancer' || form.role === 'both') && (
                                    <div>
                                        <p className="text-slate-400 text-xs mb-3">
                                            Pick domains you want to work in. Each starts at Level 1 with a 7-day beginner boost!
                                        </p>
                                        <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
                                            {DOMAINS.map(d => (
                                                <motion.button key={d} type="button" whileTap={{ scale: .9 }}
                                                    onClick={() => toggleDomain(d)}
                                                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-200 ${form.domains.includes(d)
                                                            ? 'bg-indigo-500/20 border-indigo-500/60 text-indigo-300'
                                                            : 'bg-white/3 border-white/10 text-slate-400 hover:border-white/25'
                                                        }`}>
                                                    {form.domains.includes(d) ? '✓ ' : ''}{d}
                                                </motion.button>
                                            ))}
                                        </div>
                                        {form.domains.length > 0 && (
                                            <p className="text-xs text-indigo-400 mt-2">
                                                {form.domains.length} domain{form.domains.length > 1 ? 's' : ''} selected
                                            </p>
                                        )}
                                    </div>
                                )}

                                {form.role === 'client' && (
                                    <div className="py-6 text-center">
                                        <div className="text-5xl mb-3">🚀</div>
                                        <p className="text-slate-300 text-sm">You're set! As a client you can post tasks and hire from our talent pool.</p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setStep(1)}
                                        className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 text-sm hover:border-white/20 hover:text-slate-200 transition-all">
                                        ← Back
                                    </button>
                                    <motion.button type="submit" whileTap={{ scale: .97 }} disabled={loading ||
                                        ((form.role === 'freelancer' || form.role === 'both') && form.domains.length === 0)}
                                        className="flex-[2] btn-brand py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-40">
                                        {loading ? 'Creating account...' : 'Create Account 🎉'}
                                    </motion.button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <p className="text-center text-slate-400 text-sm mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Sign in →
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
