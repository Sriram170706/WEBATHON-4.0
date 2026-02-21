import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyTasks } from '../api';
import Layout from '../components/Layout';
import {
    ListTodo, Clock, Users, CheckCircle, Circle,
    Play, ExternalLink, ChevronDown, ChevronUp, FileCheck, MessageSquare
} from 'lucide-react';

const statusConfig = {
    Open: { bg: '#d1fae5', text: '#065f46' },
    InProgress: { bg: '#dbeafe', text: '#1d4ed8' },
    Completed: { bg: '#f1f5f9', text: '#475569' },
};

const TaskRow = ({ task, idx }) => {
    const [showSubmission, setShowSubmission] = useState(false);
    const sc = statusConfig[task.status] || statusConfig.Open;
    const hasSubmission = !!task.submissionNote;

    return (
        <motion.div key={task._id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="glass rounded-2xl"
            style={{ padding: '1.5rem', border: hasSubmission && task.status !== 'Completed' ? '1px solid #86efac' : '1px solid #e2e8f0' }}>

            <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Left: info */}
                <div className="flex-1" style={{ minWidth: 0 }}>
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{task.title}</h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                            style={{ background: sc.bg, color: sc.text }}>
                            {task.status}
                        </span>
                        {hasSubmission && task.status === 'InProgress' && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1"
                                style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' }}>
                                <FileCheck size={10} /> Work Submitted
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap" style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                        <span>🏷 {task.domain}</span>
                        <span>{task.segment}</span>
                        <span className="flex items-center gap-1"><Users size={12} /> {task.applicants?.length || 0} applicants</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {task.duration}d</span>
                    </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {task.status === 'Open' && task.applicants?.length > 0 && (
                        <Link to={`/client/task/${task._id}/applicants`}
                            style={{ fontSize: '0.8125rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '10px', background: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', textDecoration: 'none' }}>
                            View Applicants
                        </Link>
                    )}
                    {/* Chat button: visible for InProgress/Completed tasks that have an assigned freelancer */}
                    {task.selectedFreelancerId && (task.status === 'InProgress' || task.status === 'Completed') && (
                        <Link to={`/tasks/${task._id}`}
                            className="flex items-center gap-1"
                            style={{ fontSize: '0.8125rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '10px', background: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', textDecoration: 'none' }}>
                            <MessageSquare size={13} /> Open Chat
                        </Link>
                    )}
                    {hasSubmission && (
                        <button onClick={() => setShowSubmission(v => !v)}
                            className="flex items-center gap-1"
                            style={{ fontSize: '0.8125rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '10px', background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7', cursor: 'pointer' }}>
                            {showSubmission ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {showSubmission ? 'Hide' : 'View'} Submission
                        </button>
                    )}
                    {task.status === 'Completed' && !task.rating && (
                        <Link to={`/client/task/${task._id}/rate`}
                            style={{ fontSize: '0.8125rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '10px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', textDecoration: 'none' }}>
                            ⭐ Rate Work
                        </Link>
                    )}
                    {task.status === 'Completed' && task.rating && (
                        <span style={{ fontSize: '0.875rem' }}>
                            {Array.from({ length: 5 }, (_, i) => i < task.rating ? '⭐' : '☆').join('')}
                        </span>
                    )}
                </div>
            </div>

            {/* Inline submission preview */}
            <AnimatePresence>
                {showSubmission && hasSubmission && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}>
                        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
                            <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <FileCheck size={15} style={{ color: '#059669' }} /> Freelancer's Submission
                                </p>
                                {task.submittedAt && (
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        {new Date(task.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                )}
                            </div>
                            <div className="rounded-xl" style={{ padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: task.submissionUrl ? '0.75rem' : 0 }}>
                                <p style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                    {task.submissionNote}
                                </p>
                            </div>
                            {task.submissionUrl && (
                                <a href={task.submissionUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm font-medium rounded-xl w-fit"
                                    style={{ padding: '0.5rem 1rem', background: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', marginTop: '0.5rem' }}>
                                    <ExternalLink size={13} /> Open Deliverable Link
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const ClientDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyTasks().then(r => setTasks(r.data.tasks ?? [])).finally(() => setLoading(false));
    }, []);

    const open = tasks.filter(t => t.status === 'Open');
    const inProgress = tasks.filter(t => t.status === 'InProgress');
    const completed = tasks.filter(t => t.status === 'Completed');
    const pendingReview = inProgress.filter(t => t.submissionNote);

    return (
        <Layout isClient>
            <div>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.375rem' }}>
                        Client Dashboard
                    </h1>
                    <p style={{ color: '#64748b' }}>Track your posted tasks and review submitted work.</p>
                </motion.div>

                {/* Stat chips */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Open', val: open.length, bg: '#d1fae5', text: '#065f46', icon: '🟢' },
                        { label: 'In Progress', val: inProgress.length, bg: '#dbeafe', text: '#1d4ed8', icon: '🔵' },
                        { label: 'Awaiting Review', val: pendingReview.length, bg: '#fef3c7', text: '#92400e', icon: '📋' },
                        { label: 'Completed', val: completed.length, bg: '#f1f5f9', text: '#475569', icon: '✅' },
                    ].map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="glass card-hover rounded-2xl text-center"
                            style={{ padding: '1.25rem 1rem', border: `1px solid ${s.bg}` }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{s.icon}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: s.text }}>{s.val}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1, 2, 3].map(i => <div key={i} className="shimmer rounded-2xl" style={{ height: '6rem' }} />)}
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="glass rounded-2xl text-center" style={{ padding: '5rem 2rem' }}>
                        <ListTodo size={40} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
                        <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
                            No tasks posted yet
                        </p>
                        <Link to="/client/create-task"
                            style={{ fontSize: '0.9rem', color: '#6366f1', fontWeight: 500 }}>
                            Post your first task →
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {tasks.map((t, i) => <TaskRow key={t._id} task={t} idx={i} />)}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ClientDashboard;
