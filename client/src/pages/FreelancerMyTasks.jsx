import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import CountdownTimer from '../components/CountdownTimer';
import { getDashboard, getMyApplications } from '../api';
import {
    Briefcase, CheckCircle, Clock, DollarSign, ArrowRight,
    ClipboardList, Hourglass, XCircle, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── helpers ─────────────────────────────────────────────────────── */
const getApplicationStatus = (task, userId) => {
    if (task.status === 'Open') {
        return { label: 'Under Review', icon: Hourglass, bg: '#fef3c7', color: '#92400e', border: '#fde68a', dot: '#d97706' };
    }
    if (task.selectedFreelancerId && String(task.selectedFreelancerId) === String(userId)) {
        return { label: 'You were selected!', icon: CheckCircle, bg: '#d1fae5', color: '#065f46', border: '#6ee7b7', dot: '#059669' };
    }
    return { label: 'Assigned to someone else', icon: XCircle, bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', dot: '#dc2626' };
};

/* ── Active task row ─────────────────────────────────────────────── */
const TaskRow = ({ task, showTimer }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl card-hover"
        style={{ padding: '1.75rem' }}
    >
        <div className="flex items-start justify-between gap-4" style={{ marginBottom: '1rem' }}>
            <div className="flex-1">
                <div className="flex items-center gap-2" style={{ marginBottom: '0.65rem' }}>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: '#ede9fe', color: '#6d28d9' }}>
                        {task.domain}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{
                            background: showTimer ? '#ede9fe' : '#d1fae5',
                            color: showTimer ? '#6d28d9' : '#065f46'
                        }}>
                        {showTimer ? 'In Progress' : 'Completed'}
                    </span>
                    {!showTimer && task.rating && (
                        <span style={{ fontSize: '0.875rem' }}>
                            {Array.from({ length: 5 }, (_, i) => i < task.rating ? '⭐' : '☆').join('')}
                        </span>
                    )}
                </div>
                <h3 className="text-lg font-bold" style={{ color: '#0f172a' }}>{task.title}</h3>
            </div>
            <Link to={`/tasks/${task._id}`}
                className="flex items-center gap-1 text-sm font-medium transition-colors shrink-0"
                style={{ marginTop: '0.25rem', color: '#6366f1' }}>
                View Details <ArrowRight size={14} />
            </Link>
        </div>

        <div className="flex items-center gap-6 text-sm"
            style={{ padding: '0.75rem 0', color: '#64748b', borderTop: '1px solid #f1f5f9', borderBottom: showTimer ? '1px solid #f1f5f9' : 'none', marginBottom: showTimer ? '1rem' : 0 }}>
            <span className="flex items-center gap-1.5"><DollarSign size={14} />₹{task.budget?.toLocaleString()}</span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5"><Clock size={14} />{task.duration} days</span>
        </div>

        {showTimer && task.deadline && (
            <div>
                <p className="text-sm text-slate-500 flex items-center gap-1.5" style={{ marginBottom: '0.75rem' }}>
                    <Clock size={13} /> Time remaining
                </p>
                <CountdownTimer deadline={task.deadline} />
            </div>
        )}
    </motion.div>
);

/* ── Application status card ─────────────────────────────────────── */
const ApplicationCard = ({ task, userId, index }) => {
    const status = getApplicationStatus(task, userId);
    const StatusIcon = status.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            style={{
                background: '#ffffff',
                border: `1.5px solid ${status.border}`,
                borderRadius: '18px',
                padding: '1.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Left accent bar */}
            <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px',
                background: status.dot, borderRadius: '18px 0 0 18px',
            }} />

            <div style={{ paddingLeft: '0.5rem' }}>
                {/* Title + status pill */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.875rem' }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
                        {task.title}
                    </h3>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.75rem',
                        borderRadius: '99px', background: status.bg,
                        color: status.color, border: `1px solid ${status.border}`,
                        whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                        <StatusIcon size={11} />
                        {status.label}
                    </span>
                </div>

                {/* Meta chips */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.625rem',
                        borderRadius: '99px', background: '#ede9fe', color: '#6d28d9',
                    }}>
                        <Globe size={10} /> {task.domain}
                    </span>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.625rem',
                        borderRadius: '99px', background: '#f1f5f9', color: '#475569',
                    }}>
                        <DollarSign size={10} /> ₹{task.budget?.toLocaleString()}
                    </span>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.625rem',
                        borderRadius: '99px', background: '#f1f5f9', color: '#475569',
                    }}>
                        Applied {new Date(task.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

/* ── Section header ──────────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, iconColor, label, count, pulse }) => (
    <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem' }}>
        {pulse
            ? <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: iconColor }} />
            : <Icon size={18} style={{ color: iconColor }} />}
        <h2 className="text-xl font-bold" style={{ color: '#0f172a' }}>
            {label} <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '1rem' }}>({count})</span>
        </h2>
    </div>
);

/* ── Empty state ─────────────────────────────────────────────────── */
const EmptyState = ({ message, sub, action }) => (
    <div className="text-center glass rounded-2xl" style={{ padding: '3rem 2rem' }}>
        <p className="text-base font-medium text-slate-500" style={{ marginBottom: '0.5rem' }}>{message}</p>
        {sub && <p className="text-sm text-slate-400">{sub}</p>}
        {action}
    </div>
);

/* ── Main page ───────────────────────────────────────────────────── */
const FreelancerMyTasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState({ inProgress: [], completed: [] });
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [appsLoading, setAppsLoading] = useState(true);

    useEffect(() => {
        getDashboard()
            .then(r => {
                const all = r.data?.activeTasks || [];
                setTasks({
                    inProgress: all.filter(t => t.status === 'InProgress' || t.status === 'Open'),
                    completed: all.filter(t => t.status === 'Completed'),
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));

        getMyApplications()
            .then(r => setApplications(r.data?.applications || []))
            .catch(console.error)
            .finally(() => setAppsLoading(false));
    }, []);

    return (
        <Layout>
            <div>
                {/* Page header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2.5rem' }}>
                    <h1 className="flex items-center gap-3"
                        style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
                        <Briefcase size={28} style={{ color: '#6366f1' }} /> My Tasks
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>
                        Track your active work and application outcomes.
                    </p>
                </motion.div>

                {/* ── In Progress ── */}
                <section style={{ marginBottom: '3rem' }}>
                    <SectionHeader icon={null} iconColor="#6366f1" label="In Progress" count={tasks.inProgress.length} pulse />
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[1, 2].map(i => <div key={i} className="shimmer rounded-2xl" style={{ height: '10rem' }} />)}
                        </div>
                    ) : tasks.inProgress.length === 0 ? (
                        <EmptyState message="No active tasks right now."
                            action={<Link to="/tasks/individual" className="text-sm font-medium" style={{ color: '#6366f1' }}>Browse available tasks →</Link>} />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {tasks.inProgress.map(t => <TaskRow key={t._id} task={t} showTimer />)}
                        </div>
                    )}
                </section>

                {/* ── Completed ── */}
                <section style={{ marginBottom: '3rem' }}>
                    <SectionHeader icon={CheckCircle} iconColor="#059669" label="Completed" count={tasks.completed.length} />
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[1].map(i => <div key={i} className="shimmer rounded-2xl" style={{ height: '8rem' }} />)}
                        </div>
                    ) : tasks.completed.length === 0 ? (
                        <EmptyState message="No completed tasks yet." sub="Finish your first task to see it here." />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {tasks.completed.map(t => <TaskRow key={t._id} task={t} showTimer={false} />)}
                        </div>
                    )}
                </section>

                {/* ── My Applications ── */}
                <section>
                    <SectionHeader icon={ClipboardList} iconColor="#0891b2" label="My Applications" count={applications.length} />
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.25rem', marginTop: '-0.75rem' }}>
                        Tasks you applied to — see whether you were selected, still pending, or if it went to someone else.
                    </p>
                    {appsLoading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
                            {[1, 2, 3].map(i => <div key={i} className="shimmer rounded-2xl" style={{ height: '7rem' }} />)}
                        </div>
                    ) : applications.length === 0 ? (
                        <EmptyState message="You haven't applied to any tasks yet."
                            action={<Link to="/tasks/individual" className="text-sm font-medium" style={{ color: '#6366f1' }}>Find tasks to apply →</Link>} />
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
                            {applications.map((app, i) => (
                                <ApplicationCard key={app._id} task={app} userId={user?._id} index={i} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
};

export default FreelancerMyTasks;
