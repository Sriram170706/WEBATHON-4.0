import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getDashboard } from '../api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import {
    CheckCircle, Star, Globe, Briefcase, ArrowRight, Clock, TrendingUp
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sub, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="glass rounded-2xl card-hover"
        style={{ border: `1px solid ${color}30`, padding: '2rem' }}
    >
        <div style={{ marginBottom: '1.25rem' }}>
            <div className="rounded-xl flex items-center justify-center"
                style={{ background: `${color}15`, width: '52px', height: '52px' }}>
                <Icon size={24} style={{ color }} />
            </div>
        </div>
        <p className="font-black" style={{ fontSize: '2.75rem', color: '#0f172a', marginBottom: '0.35rem', lineHeight: 1 }}>{value}</p>
        <p className="font-semibold" style={{ color: '#334155', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{label}</p>
        {sub && <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>{sub}</p>}
    </motion.div>
);

const FreelancerDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);

    useEffect(() => {
        getDashboard().then(r => setData(r.data)).catch(console.error);
    }, []);

    const domains = data?.domains ?? [];
    const activeTasks = data?.activeTasks ?? [];

    const totalCompleted = domains.reduce((s, d) => s + (d.completedTasks || 0), 0);
    const avgQuality = domains.length
        ? (domains.reduce((s, d) => s + (d.qualityScore || 0), 0) / domains.length).toFixed(1)
        : '0.0';

    const stats = data ? [
        { icon: CheckCircle, label: 'Tasks Completed', value: totalCompleted, color: '#059669', delay: 0.1 },
        { icon: Star, label: 'Avg Quality Score', value: avgQuality, sub: 'across all domains', color: '#d97706', delay: 0.2 },
        { icon: Globe, label: 'Active Domains', value: domains.length, color: '#0891b2', delay: 0.3 },
        { icon: Briefcase, label: 'Active Tasks', value: activeTasks.length, color: '#7c3aed', delay: 0.4 },
    ] : [];

    return (
        <Layout>
            <div>
                {/* Welcome */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
                        Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.0625rem' }}>Here's your performance snapshot across all domains.</p>
                </motion.div>

                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    {stats.map(s => <StatCard key={s.label} {...s} />)}
                </div>

                {/* Active Tasks */}
                {activeTasks.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                        className="glass rounded-2xl" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                            <Clock size={20} style={{ color: '#6366f1' }} /> Active Tasks
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            {activeTasks.map(t => (
                                <div key={t._id} className="flex items-center justify-between rounded-xl"
                                    style={{ padding: '1rem 1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <div>
                                        <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.375rem' }}>{t.title}</p>
                                        <div className="flex items-center gap-3">
                                            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>{t.domain}</span>
                                            <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.625rem', borderRadius: '99px', fontWeight: 600, background: '#ede9fe', color: '#6d28d9' }}>
                                                In Progress
                                            </span>
                                        </div>
                                    </div>
                                    <Link to={`/tasks/${t._id}`}
                                        style={{ fontSize: '0.875rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
                                        View <ArrowRight size={14} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Domain Overview */}
                {domains.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                            <TrendingUp size={20} style={{ color: '#0891b2' }} /> Domain Overview
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {domains.map(d => (
                                <div key={d.domainName} className="glass rounded-2xl card-hover"
                                    style={{ padding: '1.75rem' }}>
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <p style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{d.domainName}</p>
                                        <div className="flex items-center gap-2">
                                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.625rem', borderRadius: '99px', fontWeight: 600, background: '#ede9fe', color: '#6d28d9' }}>
                                                Level {d.level}
                                            </span>
                                            {new Date(d.beginnerBoostExpiresAt) > new Date() && (
                                                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.625rem', borderRadius: '99px', fontWeight: 600, background: '#fef3c7', color: '#92400e' }}>
                                                    ⚡ Beginner Boost
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.35rem' }}>Quality Score</p>
                                            <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#d97706' }}>{d.qualityScore?.toFixed(1)}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.35rem' }}>Reliability</p>
                                            <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#059669' }}>{d.reliabilityScore}%</p>
                                        </div>
                                    </div>
                                    <div style={{ paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                        <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                                            {d.completedTasks} task{d.completedTasks !== 1 ? 's' : ''} done
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </Layout>
    );
};

export default FreelancerDashboard;
