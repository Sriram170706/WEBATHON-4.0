import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { addDomain, getDashboard } from '../api';
import Layout from '../components/Layout';
import {
    Globe, ChevronDown, Check, ArrowLeft, Sparkles, CheckCircle, AlertCircle, Plus
} from 'lucide-react';

const ALL_DOMAINS = [
    'Web Development', 'Mobile Development', 'Graphic Design', 'Content Writing',
    'Video Editing', 'Data Science', 'UI/UX Design', 'Digital Marketing',
    'Copywriting', 'SEO', 'Photography', 'Animation', 'Voice Over', 'Translation',
    'App Development', 'Game Development', 'Cybersecurity', 'Cloud Computing',
];

/* ── Custom Dropdown ───────────────────────────────────────────── */
const DomainDropdown = ({ value, onChange, options }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.875rem 1rem', borderRadius: '14px',
                    border: `2px solid ${open ? '#a5b4fc' : '#e2e8f0'}`,
                    background: '#fff', cursor: 'pointer', fontSize: '0.9375rem',
                    color: value ? '#0f172a' : '#94a3b8',
                    boxShadow: open ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
                    transition: 'all 0.2s',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Globe size={17} style={{ color: value ? '#6366f1' : '#94a3b8', flexShrink: 0 }} />
                    {value || 'Select a domain…'}
                </span>
                <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} style={{ color: '#94a3b8' }} />
                </motion.span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute', left: 0, right: 0, top: 'calc(100% + 6px)',
                            background: '#fff', border: '1px solid #e2e8f0',
                            borderRadius: '14px', overflow: 'auto', maxHeight: '260px',
                            boxShadow: '0 16px 40px rgba(0,0,0,0.12)', zIndex: 300,
                            listStyle: 'none', margin: 0, padding: '0.375rem 0',
                        }}
                    >
                        {options.length === 0 ? (
                            <li style={{ padding: '1.25rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                                🎉 You have added all available domains!
                            </li>
                        ) : (
                            options.map(d => (
                                <li key={d}>
                                    <button
                                        type="button"
                                        onClick={() => { onChange(d); setOpen(false); }}
                                        style={{
                                            width: '100%', textAlign: 'left',
                                            padding: '0.625rem 1rem', fontSize: '0.9rem',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            background: d === value ? '#ede9fe' : 'transparent',
                                            color: d === value ? '#6d28d9' : '#334155',
                                            border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                                            fontWeight: d === value ? 600 : 400,
                                        }}
                                        onMouseEnter={e => { if (d !== value) e.currentTarget.style.background = '#f8fafc'; }}
                                        onMouseLeave={e => { if (d !== value) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        {d === value
                                            ? <Check size={14} style={{ color: '#6d28d9', flexShrink: 0 }} />
                                            : <span style={{ width: 14, flexShrink: 0 }} />
                                        }
                                        {d}
                                    </button>
                                </li>
                            ))
                        )}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ── Main Page ─────────────────────────────────────────────────── */
const AddDomain = () => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState('');
    const [existingDomains, setExistingDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Load existing domains to exclude from dropdown
    useEffect(() => {
        getDashboard()
            .then(r => setExistingDomains((r.data.domains ?? []).map(d => d.domainName)))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const availableOptions = ALL_DOMAINS.filter(d => !existingDomains.includes(d));

    const handleAdd = async () => {
        if (!selected || submitting) return;
        setSubmitting(true);
        setError('');
        try {
            await addDomain(selected);
            setSuccess(`"${selected}" has been added to your profile! 🎉`);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (e) {
            setError(e?.response?.data?.message || 'Something went wrong. Please try again.');
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: '540px', margin: '0 auto' }}>

                {/* Breadcrumb */}
                <Link to="/dashboard" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    color: '#6366f1', fontWeight: 600, fontSize: '0.875rem',
                    marginBottom: '2rem', textDecoration: 'none',
                }}>
                    <ArrowLeft size={15} /> Back to Dashboard
                </Link>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '56px', height: '56px', borderRadius: '18px', marginBottom: '1.25rem',
                        background: 'linear-gradient(135deg, #6366f1, #0891b2)',
                        boxShadow: '0 6px 24px rgba(99,102,241,0.35)',
                    }}>
                        <Plus size={26} style={{ color: '#fff' }} />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.375rem' }}>
                        Expand Your Skills
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6 }}>
                        Add a new domain to your profile. You'll start at{' '}
                        <strong style={{ color: '#6366f1' }}>Level 1</strong> with a{' '}
                        <span style={{ color: '#d97706', fontWeight: 600 }}>⚡ 7-day Beginner Boost</span> to help you stand out.
                    </p>
                </motion.div>

                {/* Card */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl" style={{ padding: '2rem' }}>

                    {/* Success state */}
                    <AnimatePresence>
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '1rem 1.25rem', borderRadius: '14px',
                                    background: '#d1fae5', border: '1px solid #6ee7b7',
                                    color: '#065f46', marginBottom: '1.25rem',
                                }}>
                                <CheckCircle size={22} style={{ flexShrink: 0 }} />
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{success}</p>
                                    <p style={{ fontSize: '0.8125rem', opacity: 0.8, marginTop: '0.1rem' }}>
                                        Redirecting to dashboard…
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error state */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                                    padding: '0.875rem 1rem', borderRadius: '12px',
                                    background: '#fee2e2', border: '1px solid #fca5a5',
                                    color: '#991b1b', fontSize: '0.875rem', marginBottom: '1.25rem',
                                }}>
                                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Dropdown label */}
                    <label style={{
                        display: 'block', fontSize: '0.8125rem', fontWeight: 700,
                        color: '#334155', marginBottom: '0.625rem',
                    }}>
                        Choose a Domain <span style={{ color: '#dc2626' }}>*</span>
                    </label>

                    {loading ? (
                        <div className="shimmer rounded-xl" style={{ height: '52px' }} />
                    ) : (
                        <DomainDropdown
                            value={selected}
                            onChange={setSelected}
                            options={availableOptions}
                        />
                    )}

                    {/* Info pill */}
                    {!loading && availableOptions.length > 0 && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            marginTop: '0.875rem', padding: '0.625rem 0.875rem',
                            borderRadius: '10px', background: '#fef3c7', border: '1px solid #fde68a',
                        }}>
                            <Sparkles size={13} style={{ color: '#d97706', flexShrink: 0 }} />
                            <p style={{ fontSize: '0.8rem', color: '#92400e' }}>
                                {availableOptions.length} domain{availableOptions.length !== 1 ? 's' : ''} available to add.
                                Existing ones are excluded.
                            </p>
                        </div>
                    )}

                    {/* Submit button */}
                    <motion.button
                        whileHover={{ scale: selected ? 1.02 : 1 }}
                        whileTap={{ scale: selected ? 0.97 : 1 }}
                        onClick={handleAdd}
                        disabled={!selected || submitting || !!success}
                        style={{
                            width: '100%', marginTop: '1.5rem',
                            padding: '1rem', borderRadius: '14px', border: 'none',
                            background: selected && !success
                                ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                                : '#e2e8f0',
                            color: selected && !success ? '#fff' : '#94a3b8',
                            fontSize: '1rem', fontWeight: 700,
                            cursor: selected && !success ? 'pointer' : 'default',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            boxShadow: selected && !success ? '0 4px 20px rgba(99,102,241,0.35)' : 'none',
                            transition: 'all 0.2s',
                        }}>
                        {submitting ? (
                            <>
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                    style={{
                                        display: 'inline-block', width: '18px', height: '18px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: '#fff', borderRadius: '50%',
                                    }}
                                />
                                Adding…
                            </>
                        ) : (
                            <><Plus size={18} /> Add Domain to Profile</>
                        )}
                    </motion.button>
                </motion.div>

                {/* What to expect */}
                {!loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        className="glass rounded-2xl" style={{ padding: '1.5rem', marginTop: '1.25rem' }}>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>
                            What you get
                        </p>
                        {[
                            { icon: '🎯', text: 'Level 1 start — compete for fresh tasks immediately' },
                            { icon: '⚡', text: '7-day Beginner Boost — priority in matching for one week' },
                            { icon: '📈', text: 'Independent quality & reliability scoring per domain' },
                        ].map(item => (
                            <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', marginBottom: '0.625rem' }}>
                                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                                <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.55 }}>{item.text}</p>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>
        </Layout>
    );
};

export default AddDomain;
