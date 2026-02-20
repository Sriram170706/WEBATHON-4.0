import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMyTasks } from '../api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { ListTodo, Clock, Users, CheckCircle2, Circle, Play } from 'lucide-react';

const statusStyle = {
    Open: { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', icon: Circle },
    InProgress: { cls: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25', icon: Play },
    Completed: { cls: 'bg-slate-600/30 text-slate-400 border-slate-500/20', icon: CheckCircle2 },
};

const ClientDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyTasks().then(r => setTasks(r.data.tasks)).finally(() => setLoading(false));
    }, []);

    const open = tasks.filter(t => t.status === 'Open');
    const inProgress = tasks.filter(t => t.status === 'InProgress');
    const completed = tasks.filter(t => t.status === 'Completed');

    return (
        <Layout isClient>
            <div className="p-8">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Client Dashboard</h1>
                    <p className="text-slate-400 text-sm mt-1">Track all your posted tasks and manage applicants.</p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Open', val: open.length, color: '#10b981', icon: '🟢' },
                        { label: 'In Progress', val: inProgress.length, color: '#06b6d4', icon: '🔵' },
                        { label: 'Completed', val: completed.length, color: '#6b7280', icon: '✅' },
                    ].map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="glass card-hover rounded-2xl p-5 text-center">
                            <div className="text-2xl mb-1">{s.icon}</div>
                            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {loading ? <LoadingSpinner /> : (
                    <>
                        {tasks.length === 0 && (
                            <div className="text-center py-20">
                                <ListTodo size={40} className="text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400">No tasks yet.</p>
                                <Link to="/client/create-task" className="text-indigo-400 text-sm hover:text-indigo-300 mt-2 inline-block">
                                    Post your first task →
                                </Link>
                            </div>
                        )}
                        <div className="space-y-3">
                            {tasks.map((t, i) => {
                                const s = statusStyle[t.status] || statusStyle.Open;
                                const Icon = s.icon;
                                return (
                                    <motion.div key={t._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        className="glass card-hover rounded-xl p-5 flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-semibold text-white text-sm">{t.title}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full border ${s.cls} flex items-center gap-1`}>
                                                    <Icon size={10} /> {t.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span>🏷 {t.domain}</span>
                                                <span>{t.segment}</span>
                                                <span className="flex items-center gap-1"><Users size={11} /> {t.applicants?.length || 0} applicants</span>
                                                <span className="flex items-center gap-1"><Clock size={11} /> {t.duration}d</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 ml-4">
                                            {t.status === 'Open' && t.applicants?.length > 0 && (
                                                <Link to={`/client/task/${t._id}/applicants`}
                                                    className="text-xs bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg hover:bg-indigo-500/25 transition-colors">
                                                    View Applicants
                                                </Link>
                                            )}
                                            {t.status === 'Completed' && !t.rating && (
                                                <Link to={`/client/task/${t._id}/rate`}
                                                    className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500/25 transition-colors">
                                                    ⭐ Rate Task
                                                </Link>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default ClientDashboard;
