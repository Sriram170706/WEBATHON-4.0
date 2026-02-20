import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMyTasks, completeTask } from '../api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import CountdownTimer from '../components/CountdownTimer';
import LevelBadge from '../components/LevelBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    Tag, Clock, DollarSign, User, CheckCircle2,
    MessageSquare, Send, AlertCircle, Building2
} from 'lucide-react';

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isClient } = useAuth();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [done, setDone] = useState(false);
    const [err, setErr] = useState('');
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        { from: 'system', text: 'Task workspace opened. Use this space to communicate.' }
    ]);

    // Fetch task from the my-tasks list (shared for both roles)
    useEffect(() => {
        getMyTasks().then(r => {
            const found = r.data.tasks?.find(t => t._id === id);
            setTask(found || null);
        }).finally(() => setLoading(false));
    }, [id]);

    const handleComplete = async () => {
        setCompleting(true); setErr('');
        try {
            await completeTask(id);
            setDone(true);
            setTimeout(() => navigate('/dashboard'), 2500);
        } catch (e) {
            setErr(e.response?.data?.message || 'Failed to mark complete');
        } finally { setCompleting(false); }
    };

    const sendMessage = () => {
        if (!message.trim()) return;
        setChat(prev => [...prev, { from: user?.name || 'You', text: message.trim() }]);
        setMessage('');
    };

    if (loading) return <Layout><div className="p-8"><LoadingSpinner /></div></Layout>;

    if (!task) return (
        <Layout>
            <div className="p-8 text-center py-20">
                <AlertCircle size={40} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Task not found or you don't have access.</p>
            </div>
        </Layout>
    );

    const isSelected = task.selectedFreelancerId === user?._id ||
        task.selectedFreelancerId?.toString() === user?._id?.toString();

    return (
        <Layout isClient={isClient && !isSelected}>
            <div className="p-8 max-w-4xl">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${task.segment === 'Company'
                                        ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25'
                                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'}`}>
                                    {task.segment === 'Company' ? <Building2 className="inline mr-1" size={10} /> : null}
                                    {task.segment}
                                </span>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${task.status === 'Open' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' :
                                        task.status === 'InProgress' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' :
                                            'bg-slate-600/30 text-slate-400 border-slate-500/20'}`}>
                                    {task.status}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">{task.title}</h1>
                            <p className="text-slate-400 text-sm mt-1">{task.description}</p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Left: Task Info + Actions */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Info grid */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="glass rounded-2xl p-5 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Tag size={14} className="text-indigo-400" />
                                <span className="text-slate-400">Domain:</span>
                                <span className="text-white font-medium">{task.domain}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock size={14} className="text-cyan-400" />
                                <span className="text-slate-400">Duration:</span>
                                <span className="text-white font-medium">{task.duration} days</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <DollarSign size={14} className="text-emerald-400" />
                                <span className="text-slate-400">Budget:</span>
                                <span className="text-white font-medium">₹{task.budget?.toLocaleString()}</span>
                            </div>
                            {task.recommendedBudgetRange?.min > 0 && (
                                <div className="text-xs text-slate-500">
                                    Suggested: ₹{task.recommendedBudgetRange.min.toLocaleString()} – ₹{task.recommendedBudgetRange.max.toLocaleString()}
                                </div>
                            )}
                        </motion.div>

                        {/* Deadline Countdown */}
                        {task.status === 'InProgress' && task.deadline && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="glass rounded-2xl p-5">
                                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                    <Clock size={14} className="text-amber-400" /> Deadline Countdown
                                </h3>
                                <CountdownTimer deadline={task.deadline} />
                            </motion.div>
                        )}

                        {/* Complete Task (freelancer only) */}
                        {isSelected && task.status === 'InProgress' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="glass rounded-2xl p-5">
                                <h3 className="text-sm font-semibold text-slate-300 mb-3">Submit Work</h3>
                                {err && <p className="text-red-400 text-xs mb-3">{err}</p>}
                                {done ? (
                                    <div className="flex items-center gap-2 text-emerald-400 font-medium">
                                        <CheckCircle2 size={18} /> Task marked complete! Redirecting…
                                    </div>
                                ) : (
                                    <motion.button whileTap={{ scale: .96 }} onClick={handleComplete}
                                        disabled={completing}
                                        className="btn-brand w-full py-3 rounded-xl text-white font-semibold text-sm">
                                        {completing ? 'Submitting…' : '✅ Mark as Completed'}
                                    </motion.button>
                                )}
                            </motion.div>
                        )}

                        {/* Chat section */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="glass rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                <MessageSquare size={14} className="text-indigo-400" /> Task Chat
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto mb-3 pr-1">
                                {chat.map((m, i) => (
                                    <div key={i} className={`text-xs p-2.5 rounded-lg ${m.from === 'system'
                                            ? 'bg-white/3 text-slate-500 text-center italic'
                                            : 'bg-indigo-500/10 border border-indigo-500/20 text-slate-300'}`}>
                                        {m.from !== 'system' && <span className="font-medium text-indigo-300">{m.from}: </span>}
                                        {m.text}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input value={message} onChange={e => setMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message…" className="input-field flex-1 text-sm" />
                                <motion.button whileTap={{ scale: .9 }} onClick={sendMessage}
                                    className="btn-accent px-4 rounded-xl text-white">
                                    <Send size={15} />
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-4">
                        {/* Client info */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            className="glass rounded-2xl p-5">
                            <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">Posted by</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                                    style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                                    <User size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">{task.clientId?.name || 'Client'}</p>
                                    <p className="text-slate-500 text-xs">{task.clientId?.email}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Rating result */}
                        {task.rating && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                className="glass rounded-2xl p-5">
                                <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Rating Given</h3>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <span key={i} className="text-lg">{i < task.rating ? '⭐' : '☆'}</span>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TaskDetail;
