import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTaskById, completeTask } from '../api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import CountdownTimer from '../components/CountdownTimer';
import TaskChat from '../components/TaskChat';
import {
    Tag, Clock, DollarSign, User, CheckCircle,
    AlertCircle, Building2, ArrowLeft, Zap, FileCheck,
    BarChart3, ExternalLink, Send
} from 'lucide-react';

const InfoRow = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-3" style={{ padding: '0.875rem 0', borderBottom: '1px solid #f1f5f9' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}14` }}>
            <Icon size={16} style={{ color }} />
        </div>
        <div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.1rem' }}>{label}</p>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>{value}</p>
        </div>
    </div>
);

const statusColors = {
    Open: { bg: '#d1fae5', text: '#065f46' },
    InProgress: { bg: '#dbeafe', text: '#1d4ed8' },
    Completed: { bg: '#f1f5f9', text: '#475569' },
};

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [err, setErr] = useState('');
    const [note, setNote] = useState('');
    const [url, setUrl] = useState('');

    useEffect(() => {
        getTaskById(id)
            .then(r => setTask(r.data.task))
            .catch(e => {
                if (e.response?.status !== 401) setErr('Task not found or you do not have access.');
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async () => {
        if (!note.trim()) { setErr('Please describe your work before submitting.'); return; }
        setSubmitting(true); setErr('');
        try {
            await completeTask(id, { submissionNote: note.trim(), submissionUrl: url.trim() || undefined });
            setDone(true);
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (e) {
            setErr(e.response?.data?.message || 'Failed to submit. Please try again.');
        } finally { setSubmitting(false); }
    };

    /* ── Loading ── */
    if (loading) return (
        <Layout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1, 2].map(i => <div key={i} className="shimmer rounded-2xl" style={{ height: '8rem' }} />)}
            </div>
        </Layout>
    );

    /* ── Error / not found ── */
    if (!task || (err && !task)) return (
        <Layout>
            <div className="glass rounded-2xl text-center" style={{ padding: '5rem 2rem' }}>
                <AlertCircle size={40} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
                <p style={{ fontSize: '1.125rem', color: '#0f172a', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Task not found
                </p>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{err || "You don't have access to this task."}</p>
                <Link to="/dashboard" className="btn-brand" style={{ display: 'inline-flex', padding: '0.75rem 1.5rem' }}>
                    Back to Dashboard
                </Link>
            </div>
        </Layout>
    );

    const uid = user?._id?.toString();
    const isSelected = task.selectedFreelancerId?._id?.toString() === uid ||
        task.selectedFreelancerId?.toString() === uid;
    const isClient = task.clientId?._id?.toString() === uid ||
        task.clientId?.toString() === uid;
    const statusColor = statusColors[task.status] || statusColors.Open;

    return (
        <Layout>
            <div>
                {/* Breadcrumb */}
                <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium"
                    style={{ color: '#6366f1', marginBottom: '1.75rem', width: 'fit-content' }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                {/* Page header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2rem' }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                            style={{ background: '#ede9fe', color: '#6d28d9' }}>
                            {task.segment === 'Company' ? <><Building2 size={11} className="inline mr-1" />Company Zone</> : 'Individual'}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                            style={{ background: statusColor.bg, color: statusColor.text }}>
                            {task.status}
                        </span>
                        {isSelected && task.status === 'InProgress' && (
                            <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"
                                style={{ background: '#fef3c7', color: '#92400e' }}>
                                <Zap size={10} /> Assigned to you
                            </span>
                        )}
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>{task.title}</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.7, maxWidth: '700px' }}>{task.description}</p>
                </motion.div>

                {/* Body grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

                    {/* ── Left Column ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Task details */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }} className="glass rounded-2xl" style={{ padding: '1.75rem' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Task Details</h2>
                            <InfoRow icon={Tag} label="Domain" value={task.domain} color="#6366f1" />
                            <InfoRow icon={Clock} label="Duration" value={`${task.duration} days`} color="#0891b2" />
                            <InfoRow icon={DollarSign} label="Budget" value={`₹${task.budget?.toLocaleString()}`} color="#059669" />
                            {task.recommendedBudgetRange?.min > 0 && (
                                <div style={{ marginTop: '1rem', padding: '0.875rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                                        <BarChart3 size={13} className="inline mr-1.5" />
                                        AI Suggested: <strong style={{ color: '#0f172a' }}>₹{task.recommendedBudgetRange.min.toLocaleString()} – ₹{task.recommendedBudgetRange.max.toLocaleString()}</strong>
                                    </p>
                                </div>
                            )}
                        </motion.div>

                        {/* Deadline */}
                        {task.status === 'InProgress' && task.deadline && (
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }} className="glass rounded-2xl" style={{ padding: '1.75rem' }}>
                                <h2 className="flex items-center gap-2" style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
                                    <Clock size={18} style={{ color: '#d97706' }} /> Deadline Countdown
                                </h2>
                                <CountdownTimer deadline={task.deadline} />
                            </motion.div>
                        )}

                        {/* ── SUBMIT WORK (freelancer, InProgress) ── */}
                        {isSelected && task.status === 'InProgress' && (
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }} className="glass rounded-2xl"
                                style={{ padding: '1.75rem', border: '1px solid #a5b4fc' }}>
                                <h2 className="flex items-center gap-2" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                                    <FileCheck size={20} style={{ color: '#6366f1' }} /> Submit Your Work
                                </h2>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                                    Describe what you've delivered for this task. Optionally add a link (GitHub, Google Drive, live URL, etc.).
                                    The client will be notified once you submit.
                                </p>

                                <AnimatePresence>
                                    {err && (
                                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="flex items-center gap-2 rounded-xl text-sm"
                                            style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', marginBottom: '1rem' }}>
                                            <AlertCircle size={15} /> {err}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {done ? (
                                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                        className="flex items-center gap-3 rounded-xl"
                                        style={{ padding: '1rem 1.25rem', background: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46' }}>
                                        <CheckCircle size={22} />
                                        <div>
                                            <p style={{ fontWeight: 700 }}>Work submitted successfully!</p>
                                            <p style={{ fontSize: '0.8125rem' }}>The client has been notified. Redirecting to dashboard…</p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {/* Submission note */}
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                                                Work Description <span style={{ color: '#dc2626' }}>*</span>
                                            </label>
                                            <textarea
                                                value={note}
                                                onChange={e => { setNote(e.target.value); setErr(''); }}
                                                placeholder="Describe what you've built / delivered. Include any relevant details for the client to review..."
                                                rows={5}
                                                className="input-field"
                                                style={{ resize: 'vertical', lineHeight: 1.65 }}
                                            />
                                        </div>

                                        {/* Submission URL */}
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                                                Work URL <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                                            </label>
                                            <div className="relative">
                                                <ExternalLink size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                                                <input
                                                    type="url"
                                                    value={url}
                                                    onChange={e => setUrl(e.target.value)}
                                                    placeholder="https://github.com/yourrepo or Google Drive link…"
                                                    className="input-field"
                                                    style={{ paddingLeft: '2.75rem' }}
                                                />
                                            </div>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                            onClick={handleSubmit} disabled={submitting}
                                            className="btn-brand flex items-center justify-center gap-2"
                                            style={{ padding: '1rem' }}>
                                            <Send size={16} />
                                            {submitting ? 'Submitting…' : 'Submit Work & Mark as Completed'}
                                        </motion.button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ── SUBMITTED WORK (client view / completed) ── */}
                        {task.submissionNote && (
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }} className="glass rounded-2xl"
                                style={{ padding: '1.75rem', border: '1px solid #86efac' }}>
                                <h2 className="flex items-center gap-2" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#065f46', marginBottom: '1.25rem' }}>
                                    <CheckCircle size={20} style={{ color: '#059669' }} /> Submitted Work
                                    {task.submittedAt && (
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400, marginLeft: 'auto' }}>
                                            {new Date(task.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </h2>
                                <div className="rounded-xl" style={{ padding: '1.125rem', background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: task.submissionUrl ? '1rem' : '0' }}>
                                    <p style={{ fontSize: '0.9375rem', color: '#1e293b', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                        {task.submissionNote}
                                    </p>
                                </div>
                                {task.submissionUrl && (
                                    <a href={task.submissionUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-medium rounded-xl w-fit"
                                        style={{ padding: '0.625rem 1rem', background: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd' }}>
                                        <ExternalLink size={14} /> View Deliverable Link
                                    </a>
                                )}
                            </motion.div>
                        )}

                        {/* Completed state */}
                        {task.status === 'Completed' && !task.submissionNote && (
                            <div className="glass rounded-2xl flex items-center gap-3"
                                style={{ padding: '1.25rem 1.75rem', border: '1px solid #86efac', background: '#f0fdf4' }}>
                                <CheckCircle size={22} style={{ color: '#059669' }} />
                                <div>
                                    <p style={{ fontWeight: 700, color: '#065f46' }}>Task Completed</p>
                                    <p style={{ fontSize: '0.8125rem', color: '#059669' }}>
                                        {task.completedOnTime ? 'Submitted on time ✓' : 'Submitted late'}
                                    </p>
                                </div>
                                {task.rating && (
                                    <div className="ml-auto flex items-center gap-1">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <span key={i} style={{ fontSize: '1.1rem' }}>{i < task.rating ? '⭐' : '☆'}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Right Sidebar ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* Posted by */}
                        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }} className="glass rounded-2xl" style={{ padding: '1.5rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Posted by</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                                    style={{ background: 'linear-gradient(135deg,#6366f1,#0891b2)' }}>
                                    <User size={17} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}>{task.clientId?.name || 'Client'}</p>
                                    <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>{task.clientId?.email}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Assigned freelancer */}
                        {task.selectedFreelancerId && (
                            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }} className="glass rounded-2xl" style={{ padding: '1.5rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Assigned Freelancer</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                                        style={{ background: 'linear-gradient(135deg,#059669,#34d399)' }}>
                                        {(task.selectedFreelancerId?.name || 'F')[0]}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}>{task.selectedFreelancerId?.name}</p>
                                        <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>{task.selectedFreelancerId?.email}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Quick stats */}
                        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }} className="glass rounded-2xl" style={{ padding: '1.5rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Quick Info</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div className="flex items-center justify-between">
                                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Difficulty</span>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
                                        {task.difficulty === 1 ? '🟢 Easy' : task.difficulty === 2 ? '🟡 Medium' : '🔴 Hard'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Applicants</span>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>{task.applicants?.length ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Posted</span>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
                                        {new Date(task.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                {task.status === 'Completed' && task.rating && (
                                    <div className="flex items-center justify-between">
                                        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Client Rating</span>
                                        <span style={{ fontSize: '0.9rem' }}>
                                            {Array.from({ length: 5 }, (_, i) => i < task.rating ? '⭐' : '☆').join('')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {task.selectedFreelancerId && (isSelected || isClient) && (
                <TaskChat taskId={id} />
            )}
        </Layout>
    );
};

export default TaskDetail;
