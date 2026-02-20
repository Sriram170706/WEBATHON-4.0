import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createTask } from '../api';
import Layout from '../components/Layout';
import { PlusCircle, Info, DollarSign, ChevronDown, Check } from 'lucide-react';

const DOMAINS = [
    'Web Development', 'Mobile Development', 'Graphic Design', 'Content Writing',
    'Video Editing', 'Data Science', 'UI/UX Design', 'Digital Marketing',
    'Copywriting', 'SEO', 'Photography', 'Animation', 'Voice Over', 'Translation',
    'App Development', 'Game Development', 'Cybersecurity', 'Cloud Computing',
];

/* ── Custom dropdown — avoids native select z-index overlap with sidebar ── */
const DomainSelect = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="input-field flex items-center justify-between text-left"
                style={{ color: value ? '#e2e8f0' : 'rgba(148,163,184,0.45)' }}
            >
                <span>{value || 'Select domain…'}</span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={17} className="text-slate-500 shrink-0" />
                </motion.div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute left-0 right-0 mt-2 rounded-2xl overflow-y-auto"
                        style={{
                            background: 'rgba(15,15,28,0.98)',
                            backdropFilter: 'blur(28px)',
                            border: '1px solid rgba(99,102,241,0.25)',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1)',
                            zIndex: 200,          /* well above sidebar z-30 */
                            maxHeight: '220px',
                        }}
                    >
                        {DOMAINS.map(d => (
                            <li key={d}>
                                <button
                                    type="button"
                                    onClick={() => { onChange(d); setOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-all"
                                    style={{
                                        color: value === d ? '#a5b4fc' : '#94a3b8',
                                        background: value === d ? 'rgba(99,102,241,0.12)' : 'transparent',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                                    onMouseLeave={e => e.currentTarget.style.background = value === d ? 'rgba(99,102,241,0.12)' : 'transparent'}
                                >
                                    {value === d && <Check size={13} className="text-indigo-400 shrink-0" />}
                                    <span className={value === d ? '' : 'pl-[18px]'}>{d}</span>
                                </button>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ── Field label ─────────────────────────────────────────────────────────── */
const Label = ({ children }) => (
    <label className="text-sm text-slate-400 font-semibold block mb-2">{children}</label>
);

/* ── Main Page ───────────────────────────────────────────────────────────── */
const CreateTask = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '', description: '', domain: '', segment: 'Individual',
        duration: 7, budget: '', difficulty: 1,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [suggestion, setSugg] = useState(null);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const { data } = await createTask({ ...form, duration: Number(form.duration), budget: Number(form.budget) });
            setSugg(data.pricingAdvice);
            setTimeout(() => navigate('/client/my-tasks'), 2800);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create task');
        } finally { setLoading(false); }
    };

    const segmentBtn = (s) => {
        const active = form.segment === s;
        const colors = s === 'Company'
            ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300'
            : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400';
        return `flex-1 py-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${active ? colors : 'bg-white/3 border-white/10 text-slate-500 hover:border-white/25 hover:text-slate-300'}`;
    };

    const diffBtn = (v) => {
        const colors = { 1: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300', 2: 'bg-amber-500/15 border-amber-500/40 text-amber-300', 3: 'bg-red-500/15 border-red-500/40 text-red-300' };
        return `flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${form.difficulty === v ? colors[v] : 'bg-white/3 border-white/10 text-slate-500 hover:border-white/25 hover:text-slate-300'}`;
    };

    return (
        <Layout isClient>
            <div className="p-8 max-w-2xl">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                        <span className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                            <PlusCircle size={20} className="text-white" />
                        </span>
                        Post a New Task
                    </h1>
                    <p className="text-slate-400 text-base ml-[52px]">
                        Fill in the details — our AI will suggest a fair budget.
                    </p>
                </motion.div>

                {/* Success banner */}
                <AnimatePresence>
                    {suggestion && (
                        <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="glass rounded-2xl p-5 mb-6 border border-emerald-500/25">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base mb-2">
                                <DollarSign size={18} /> Task Created!
                            </div>
                            <p className="text-slate-300 text-sm">{suggestion.note}</p>
                            <p className="text-slate-400 text-sm mt-1">
                                Recommended: ₹{suggestion.recommendedRange?.min?.toLocaleString()} – ₹{suggestion.recommendedRange?.max?.toLocaleString()}
                            </p>
                            <p className="text-slate-500 text-sm mt-2">Redirecting to My Tasks…</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-5">
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                <motion.form onSubmit={submit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }} className="glass-strong rounded-2xl p-7 space-y-6">

                    {/* Title */}
                    <div>
                        <Label>Task Title *</Label>
                        <input value={form.title} onChange={e => set('title', e.target.value)}
                            placeholder="e.g. Build a responsive landing page" required className="input-field text-base" />
                    </div>

                    {/* Description */}
                    <div>
                        <Label>Description *</Label>
                        <textarea value={form.description} onChange={e => set('description', e.target.value)}
                            placeholder="Describe the task requirements in detail…" required rows={4}
                            className="input-field resize-none text-base" />
                    </div>

                    {/* Domain + Segment */}
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <Label>Domain *</Label>
                            <DomainSelect value={form.domain} onChange={v => set('domain', v)} />
                        </div>
                        <div>
                            <Label>Segment *</Label>
                            <div className="flex gap-2 mt-1">
                                {['Individual', 'Company'].map(s => (
                                    <button key={s} type="button" onClick={() => set('segment', s)} className={segmentBtn(s)}>
                                        {s === 'Company' ? '🏢' : '👤'} {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Duration + Difficulty */}
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <Label>Duration (days) *</Label>
                            <input type="number" min={1} value={form.duration}
                                onChange={e => set('duration', e.target.value)}
                                required className="input-field text-base" />
                        </div>
                        <div>
                            <Label>Difficulty</Label>
                            <div className="flex gap-2">
                                {[{ v: 1, l: 'Easy' }, { v: 2, l: 'Medium' }, { v: 3, l: 'Hard' }].map(d => (
                                    <button key={d.v} type="button" onClick={() => set('difficulty', d.v)} className={diffBtn(d.v)}>
                                        {d.l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Budget */}
                    <div>
                        <Label>Your Budget (₹) *</Label>
                        <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 flex items-center pointer-events-none">
                                <span className="text-slate-400 font-semibold text-base">₹</span>
                            </div>
                            <input type="number" min={0} value={form.budget}
                                onChange={e => set('budget', e.target.value)}
                                placeholder="Enter your budget" required className="input-field pl-9 text-base" />
                        </div>
                        <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5">
                            <Info size={13} /> AI pricing suggestion will appear after you submit.
                        </p>
                    </div>

                    {/* Submit */}
                    <motion.button type="submit" whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.97 }}
                        disabled={loading}
                        className="btn-brand w-full py-4 text-base">
                        {loading ? 'Creating task…' : '🚀 Post Task'}
                    </motion.button>
                </motion.form>
            </div>
        </Layout>
    );
};

export default CreateTask;
