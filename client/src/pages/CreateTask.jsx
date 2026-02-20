import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createTask } from '../api';
import Layout from '../components/Layout';
import {
    PlusCircle, Info, DollarSign, ChevronDown, Check,
    FileText, Globe, Clock, BarChart2, Sparkles, CheckCircle
} from 'lucide-react';

const DOMAINS = [
    'Web Development', 'Mobile Development', 'Graphic Design', 'Content Writing',
    'Video Editing', 'Data Science', 'UI/UX Design', 'Digital Marketing',
    'Copywriting', 'SEO', 'Photography', 'Animation', 'Voice Over', 'Translation',
    'App Development', 'Game Development', 'Cybersecurity', 'Cloud Computing',
];

/* ── Custom dropdown ─────────────────────────────────────────────── */
const DomainSelect = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button type="button" onClick={() => setOpen(o => !o)}
                className="input-field flex items-center justify-between text-left"
                style={{ color: value ? '#0f172a' : '#94a3b8' }}>
                <div className="flex items-center gap-2">
                    <Globe size={15} style={{ color: value ? '#6366f1' : '#94a3b8' }} />
                    <span>{value || 'Select domain…'}</span>
                </div>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={17} className="text-slate-400 shrink-0" />
                </motion.div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 mt-2 rounded-2xl overflow-y-auto"
                        style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
                            zIndex: 200,
                            maxHeight: '220px',
                        }}>
                        {DOMAINS.map(d => (
                            <li key={d}>
                                <button type="button" onClick={() => { onChange(d); setOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-all"
                                    style={{
                                        color: value === d ? '#6366f1' : '#334155',
                                        background: value === d ? '#ede9fe' : 'transparent',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = value === d ? '#ede9fe' : '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.background = value === d ? '#ede9fe' : 'transparent'}>
                                    {value === d && <Check size={13} style={{ color: '#6366f1' }} className="shrink-0" />}
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

/* ── Section header ──────────────────────────────────────────────── */
const SectionHead = ({ icon: Icon, title, color, desc }) => (
    <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}18` }}>
            <Icon size={17} style={{ color }} />
        </div>
        <div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>{title}</p>
            {desc && <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{desc}</p>}
        </div>
    </div>
);

/* ── Main Page ───────────────────────────────────────────────────── */
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
            setTimeout(() => navigate('/client/my-tasks'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create task');
        } finally { setLoading(false); }
    };

    /* Segment button styles */
    const segStyle = (s) => {
        const active = form.segment === s;
        if (!active) return {
            flex: 1, padding: '0.75rem', borderRadius: '12px', fontSize: '0.875rem',
            fontWeight: 600, border: '1px solid #e2e8f0', background: '#f8fafc',
            color: '#64748b', cursor: 'pointer', transition: 'all .2s',
        };
        return {
            flex: 1, padding: '0.75rem', borderRadius: '12px', fontSize: '0.875rem',
            fontWeight: 700, cursor: 'pointer', transition: 'all .2s',
            ...(s === 'Individual'
                ? { background: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46' }
                : { background: '#ede9fe', border: '1px solid #c4b5fd', color: '#6d28d9' }),
        };
    };

    /* Difficulty button styles */
    const diffColors = {
        1: { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46' },
        2: { bg: '#fef3c7', border: '#fde68a', text: '#92400e' },
        3: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
    };
    const diffStyle = (v) => {
        const active = form.difficulty === v;
        const c = diffColors[v];
        return active
            ? { flex: 1, padding: '0.625rem', borderRadius: '10px', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', background: c.bg, border: `1px solid ${c.border}`, color: c.text }
            : { flex: 1, padding: '0.625rem', borderRadius: '10px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' };
    };

    return (
        <Layout isClient>
            <div style={{ maxWidth: '780px', margin: '0 auto' }}>

                {/* Page header */}
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2rem' }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#0891b2)', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>
                            <PlusCircle size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                                Post a New Task
                            </h1>
                            <p style={{ fontSize: '0.9375rem', color: '#64748b', marginTop: '0.2rem' }}>
                                Fill in the details — our AI will suggest a fair budget.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Success banner */}
                <AnimatePresence>
                    {suggestion && (
                        <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="rounded-2xl"
                            style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', background: '#f0fdf4', border: '1px solid #86efac' }}>
                            <div className="flex items-center gap-2" style={{ color: '#059669', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
                                <CheckCircle size={18} /> Task Posted Successfully!
                            </div>
                            <p style={{ color: '#065f46', fontSize: '0.875rem' }}>{suggestion.note}</p>
                            <p style={{ color: '#059669', fontSize: '0.8125rem', marginTop: '0.375rem' }}>
                                AI Suggested Range: ₹{suggestion.recommendedRange?.min?.toLocaleString()} – ₹{suggestion.recommendedRange?.max?.toLocaleString()}
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '0.8125rem', marginTop: '0.5rem' }}>Redirecting to My Tasks…</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="rounded-xl" style={{ padding: '0.875rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                            ⚠️ {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                <motion.form onSubmit={submit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* ── Section 1: Basics ── */}
                    <div className="glass rounded-2xl" style={{ padding: '1.75rem' }}>
                        <SectionHead icon={FileText} title="Task Basics" color="#6366f1"
                            desc="What needs to be done?" />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                                    Task Title <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <input value={form.title} onChange={e => set('title', e.target.value)}
                                    placeholder="e.g. Build a responsive landing page" required
                                    className="input-field" style={{ fontSize: '0.9375rem' }} />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                                    Description <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                                    placeholder="Describe the task requirements, deliverables, and any specific skills needed…"
                                    required rows={4} className="input-field"
                                    style={{ resize: 'vertical', fontSize: '0.9375rem', lineHeight: 1.65 }} />
                            </div>
                        </div>
                    </div>

                    {/* ── Section 2: Domain & Segment ── */}
                    <div className="glass rounded-2xl" style={{ padding: '1.75rem' }}>
                        <SectionHead icon={Globe} title="Domain & Segment" color="#0891b2"
                            desc="Who should work on this?" />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                                    Domain <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <DomainSelect value={form.domain} onChange={v => set('domain', v)} />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                                    Segment <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <div style={{ display: 'flex', gap: '0.625rem' }}>
                                    {['Individual', 'Company'].map(s => (
                                        <button key={s} type="button" onClick={() => set('segment', s)}
                                            style={segStyle(s)}>
                                            {s === 'Company' ? '🏢' : '👤'} {s}
                                        </button>
                                    ))}
                                </div>
                                {form.segment === 'Company' && (
                                    <p style={{ fontSize: '0.75rem', color: '#6366f1', marginTop: '0.5rem' }}>
                                        ⓘ Requires Level 3+ freelancers with Quality ≥ 4.0
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Section 3: Timeline & Difficulty ── */}
                    <div className="glass rounded-2xl" style={{ padding: '1.75rem' }}>
                        <SectionHead icon={Clock} title="Timeline & Difficulty" color="#059669"
                            desc="Set expectations for the freelancer" />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                                    Duration (days) <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <div className="relative">
                                    <Clock size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', zIndex: 1 }} />
                                    <input type="number" min={1} value={form.duration}
                                        onChange={e => set('duration', e.target.value)}
                                        required className="input-field" style={{ paddingLeft: '2.75rem', fontSize: '0.9375rem' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                                    Difficulty
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {[{ v: 1, l: '🟢 Easy' }, { v: 2, l: '🟡 Medium' }, { v: 3, l: '🔴 Hard' }].map(d => (
                                        <button key={d.v} type="button" onClick={() => set('difficulty', d.v)}
                                            style={diffStyle(d.v)}>
                                            {d.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Section 4: Budget ── */}
                    <div className="glass rounded-2xl" style={{ padding: '1.75rem' }}>
                        <SectionHead icon={DollarSign} title="Budget" color="#d97706"
                            desc="AI will validate if it's market-fair" />

                        <div>
                            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                                Your Budget (₹) <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <div className="relative">
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 700, fontSize: '1rem', zIndex: 1, pointerEvents: 'none' }}>₹</span>
                                <input type="number" min={0} value={form.budget}
                                    onChange={e => set('budget', e.target.value)}
                                    placeholder="Enter your budget" required
                                    className="input-field" style={{ paddingLeft: '2.25rem', fontSize: '0.9375rem' }} />
                            </div>
                            <div className="flex items-center gap-1.5" style={{ marginTop: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '10px', background: '#fef3c7', border: '1px solid #fde68a' }}>
                                <Sparkles size={13} style={{ color: '#d97706', shrink: 0 }} />
                                <p style={{ fontSize: '0.8rem', color: '#92400e' }}>
                                    AI pricing suggestion will appear after you post the task.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <motion.button type="submit" whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.97 }}
                        disabled={loading}
                        className="btn-brand flex items-center justify-center gap-2"
                        style={{ padding: '1.125rem', fontSize: '1rem', fontWeight: 700, borderRadius: '14px' }}>
                        {loading ? (
                            <><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                className="inline-block w-5 h-5 border-2 rounded-full"
                                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                                Creating Task…
                            </>
                        ) : (
                            <><PlusCircle size={18} /> Post Task</>
                        )}
                    </motion.button>

                    <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: '#94a3b8', marginTop: '-0.5rem' }}>
                        <BarChart2 size={12} className="inline mr-1" />
                        Budget recommendations are AI-generated based on domain and difficulty.
                    </p>
                </motion.form>
            </div>
        </Layout>
    );
};

export default CreateTask;
