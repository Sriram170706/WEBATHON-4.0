import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvailableTasks, getMyDomains, applyToTask } from '../api';
import Layout from '../components/Layout';
import { Search, Clock, DollarSign, Lock, CheckCircle, XCircle, Zap } from 'lucide-react';

const TaskCard = ({ task, onApply, applying, segment }) => {
    const eligible = task.isEligible;
    const inDomain = task.isInDomain;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl card-hover flex flex-col"
            style={{
                border: eligible ? '1px solid #a5b4fc' : '1px solid #e2e8f0',
                padding: '1.75rem',
                gap: '1.25rem',
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2" style={{ marginBottom: '0.65rem' }}>
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                            style={{ background: '#ede9fe', color: '#6d28d9' }}>
                            {task.domain}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                            style={{ background: '#f1f5f9', color: '#64748b' }}>
                            {task.segment}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-white leading-snug" style={{ marginBottom: '0.5rem' }}>{task.title}</h3>
                    {task.description && (
                        <p className="text-sm text-slate-400 line-clamp-2" style={{ lineHeight: '1.6' }}>{task.description}</p>
                    )}
                </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-6 text-sm"
                style={{ padding: '0.75rem 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                <span className="flex items-center gap-1.5"><Clock size={14} />{task.duration} days</span>
                <span className="flex items-center gap-1.5"><DollarSign size={14} />₹{task.budget?.toLocaleString()}</span>
            </div>

            {/* Suggested range */}
            {task.recommendedBudgetRange && (
                <p className="text-sm text-slate-500">
                    AI Suggested: <span className="text-slate-300 font-medium">
                        ₹{task.recommendedBudgetRange.min?.toLocaleString()} – ₹{task.recommendedBudgetRange.max?.toLocaleString()}
                    </span>
                </p>
            )}

            {/* Eligibility */}
            {segment === 'Company' && (
                <div className="rounded-xl px-4 py-2.5 text-sm"
                    style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
                    <p className="font-semibold text-xs" style={{ color: '#92400e', marginBottom: '0.25rem' }}>Company Zone Requirements</p>
                    <p className="text-xs" style={{ color: '#78350f' }}>Level ≥3 · Quality ≥4.0 · Reliability ≥85%</p>
                </div>
            )}

            {!inDomain && (
                <div className="flex items-center gap-2 text-sm rounded-xl px-4 py-2.5"
                    style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b' }}>
                    <XCircle size={15} /> Not registered in "{task.domain}"
                </div>
            )}

            {/* Action */}
            {eligible ? (
                <motion.button
                    onClick={() => onApply(task._id)}
                    disabled={applying === task._id}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="btn-brand w-full text-base"
                    style={{ padding: '1rem', marginTop: 'auto' }}
                >
                    {applying === task._id ? 'Applying…' : '⚡ Apply Now'}
                </motion.button>
            ) : (
                <div className="w-full rounded-xl text-center text-sm font-semibold"
                    style={{
                        padding: '1rem',
                        marginTop: 'auto',
                        background: '#f1f5f9', color: '#94a3b8',
                        border: '1px solid #e2e8f0'
                    }}>
                    <Lock size={14} className="inline mr-2" />
                    {!inDomain ? 'Not your domain' : 'Locked'}
                </div>
            )}
        </motion.div>
    );
};

const AvailableTasks = ({ segment = 'Individual' }) => {
    const [tasks, setTasks] = useState([]);
    const [myDomains, setMyDomains] = useState([]); // user's registered domain profiles
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(null);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Fetch both lists in parallel
        setLoading(true);
        Promise.all([
            getAvailableTasks({ segment }),
            getMyDomains(),
        ])
            .then(([tasksRes, domainsRes]) => {
                setTasks(tasksRes.data.tasks || []);
                setMyDomains(domainsRes.data.domains || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [segment]);

    // Compute eligibility per task from the user's actual domain profiles
    const enriched = tasks.map(task => {
        const userDomain = myDomains.find(
            d => d.domainName.toLowerCase() === task.domain?.toLowerCase()
        );
        const isInDomain = Boolean(userDomain);

        let isEligible = false;
        if (isInDomain) {
            if (segment === 'Individual') {
                isEligible = true; // Any level can apply to Individual tasks
            } else {
                // Company Zone: Level ≥3, Quality ≥4.0, Reliability ≥85%
                isEligible =
                    userDomain.level >= 3 &&
                    userDomain.qualityScore >= 4.0 &&
                    userDomain.reliabilityScore >= 85;
            }
        }
        return { ...task, isInDomain, isEligible, userDomain };
    });

    const filtered = enriched.filter(t =>
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.domain?.toLowerCase().includes(search.toLowerCase())
    );

    const handleApply = async (taskId) => {
        setApplying(taskId);
        try {
            await applyToTask(taskId, {});
            setSuccess('Application submitted!');
            setTimeout(() => setSuccess(''), 3000);
            setTasks(prev => prev.filter(t => t._id !== taskId));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to apply');
        } finally { setApplying(null); }
    };

    return (
        <Layout>
            <div>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2.5rem' }}>
                    <h1 className="text-4xl font-black text-white" style={{ marginBottom: '0.5rem' }}>
                        {segment === 'Company' ? '🏢 Company Zone' : '📋 Individual Tasks'}
                    </h1>
                    <p className="text-slate-400 text-lg">
                        {segment === 'Company'
                            ? 'High-value tasks for Level 3+ freelancers with proven domain track records.'
                            : 'Open marketplace for all freelancers. Apply and grow your domain profile!'}
                    </p>
                    {segment === 'Company' && (
                        <div className="flex items-center gap-2 text-sm text-amber-400 rounded-xl w-fit"
                            style={{ marginTop: '0.875rem', padding: '0.625rem 1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                            <Lock size={14} /> Requirements per domain: Level ≥3 · Quality ≥4.0 · Reliability ≥85%
                        </div>
                    )}
                </motion.div>

                {/* Search */}
                <div className="relative" style={{ marginBottom: '2rem' }}>
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by title or domain…"
                        className="input-field pl-12 text-base"
                        style={{ maxWidth: '28rem', padding: '1rem 1rem 1rem 3rem' }}
                    />
                </div>

                {/* Success */}
                <AnimatePresence>
                    {success && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 rounded-xl px-4 py-3 mb-6 text-sm font-semibold"
                            style={{ border: '1px solid rgba(16,185,129,0.25)' }}>
                            <CheckCircle size={16} /> {success}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grid */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="shimmer rounded-2xl" style={{ height: '18rem' }} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 text-slate-500">
                        <p className="text-2xl mb-2">🔍</p>
                        <p className="text-lg font-semibold">No tasks found</p>
                        <p className="text-sm mt-1">Try a different search term</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {filtered.map((task, i) => (
                            <motion.div key={task._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}>
                                <TaskCard task={task} onApply={handleApply} applying={applying} segment={segment} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AvailableTasks;
