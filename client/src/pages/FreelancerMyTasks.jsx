import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import CountdownTimer from '../components/CountdownTimer';
import { Briefcase, CheckCircle, Clock, DollarSign, ArrowRight } from 'lucide-react';

const FreelancerMyTasks = () => {
    const [tasks, setTasks] = useState({ inProgress: [], completed: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('../api').then(({ getDashboard }) => {
            getDashboard().then(r => {
                const all = r.data?.activeTasks || [];
                setTasks({
                    inProgress: all.filter(t => t.status === 'InProgress' || t.status === 'Open'),
                    completed: all.filter(t => t.status === 'Completed'),
                });
            }).catch(console.error).finally(() => setLoading(false));
        });
    }, []);

    const TaskRow = ({ task, showTimer }) => (
        <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl card-hover"
            style={{ padding: '1.75rem' }}
        >
            {/* Top row */}
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

            {/* Meta */}
            <div className="flex items-center gap-6 text-sm"
                style={{ padding: '0.75rem 0', color: '#64748b', borderTop: '1px solid #f1f5f9', borderBottom: showTimer ? '1px solid #f1f5f9' : 'none', marginBottom: showTimer ? '1rem' : 0 }}>
                <span className="flex items-center gap-1.5"><DollarSign size={14} />₹{task.budget?.toLocaleString()}</span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1.5"><Clock size={14} />{task.duration} days</span>
            </div>

            {/* Countdown */}
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

    return (
        <Layout>
            <div>
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2.5rem' }}>
                    <h1 className="flex items-center gap-3"
                        style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
                        <Briefcase size={28} style={{ color: '#6366f1' }} /> My Tasks
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Tasks you have been selected for.</p>
                </motion.div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1, 2].map(i => <div key={i} className="shimmer rounded-2xl" style={{ height: '10rem' }} />)}
                    </div>
                ) : (
                    <>
                        {/* In Progress */}
                        <section style={{ marginBottom: '3rem' }}>
                            <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem' }}>
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                                <h2 className="text-xl font-bold" style={{ color: '#0f172a' }}>
                                    In Progress ({tasks.inProgress.length})
                                </h2>
                            </div>
                            {tasks.inProgress.length === 0 ? (
                                <div className="text-center glass rounded-2xl" style={{ padding: '3rem 2rem' }}>
                                    <p className="text-base text-slate-500" style={{ marginBottom: '0.5rem' }}>No active tasks right now.</p>
                                    <Link to="/tasks/individual" className="text-sm text-indigo-400 hover:text-indigo-300">
                                        Browse available tasks →
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {tasks.inProgress.map(t => <TaskRow key={t._id} task={t} showTimer />)}
                                </div>
                            )}
                        </section>

                        {/* Completed */}
                        <section>
                            <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem' }}>
                                <CheckCircle size={18} className="text-emerald-400" />
                                <h2 className="text-xl font-bold" style={{ color: '#0f172a' }}>
                                    Completed ({tasks.completed.length})
                                </h2>
                            </div>
                            {tasks.completed.length === 0 ? (
                                <div className="text-center glass rounded-2xl" style={{ padding: '3rem 2rem' }}>
                                    <p className="text-base text-slate-500">No completed tasks yet.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {tasks.completed.map(t => <TaskRow key={t._id} task={t} showTimer={false} />)}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default FreelancerMyTasks;
