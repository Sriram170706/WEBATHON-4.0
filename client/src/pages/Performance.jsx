import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getMyDomains } from '../api';
import Layout from '../components/Layout';
import { BarChart3, Star, Shield, CheckCircle, Zap, TrendingUp } from 'lucide-react';

const levelConfig = {
    1: { label: 'Explorer', color: '#64748b', bg: '#f1f5f9' },
    2: { label: 'Contributor', color: '#1d4ed8', bg: '#dbeafe' },
    3: { label: 'Trusted', color: '#065f46', bg: '#d1fae5' },
    4: { label: 'Pro', color: '#6d28d9', bg: '#ede9fe' },
};

const ProgressBar = ({ value, max, color }) => (
    <div className="progress-bar" style={{ marginTop: '0.625rem' }}>
        <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (value / max) * 100)}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            style={{ background: color }}
        />
    </div>
);

const DomainCard = ({ domain, index }) => {
    const lvl = levelConfig[domain.level] || levelConfig[1];
    const boostActive = new Date() < new Date(domain.beginnerBoostExpiresAt);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="glass rounded-2xl card-hover"
            style={{ border: `1px solid ${lvl.color}50`, padding: '2rem' }}
        >
            {/* Decorative orb */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-40 blur-2xl pointer-events-none"
                style={{ background: `radial-gradient(circle,${lvl.color},transparent)` }} />

            {/* Header */}
            <div className="flex items-start justify-between gap-3" style={{ marginBottom: '1.75rem' }}>
                <h3 className="text-xl font-bold text-white">{domain.domainName}</h3>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs px-3 py-1.5 rounded-full font-bold"
                        style={{ background: lvl.bg, color: lvl.color }}>
                        Level {domain.level} · {lvl.label}
                    </span>
                    {boostActive && (
                        <span className="text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1"
                            style={{ background: '#fef3c7', color: '#92400e' }}>
                            <Zap size={11} /> Beginner Boost
                        </span>
                    )}
                </div>
            </div>

            {/* Quality + Reliability */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.75rem' }}>
                <div>
                    <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                        <Star size={15} style={{ color: '#f59e0b' }} />
                        <p className="text-sm text-slate-400 font-medium">Quality Score</p>
                    </div>
                    <p className="text-4xl font-black" style={{ color: '#f59e0b' }}>
                        {domain.qualityScore?.toFixed(1)}
                    </p>
                    <ProgressBar value={domain.qualityScore} max={5}
                        color="linear-gradient(90deg,#f59e0b,#fbbf24)" />
                </div>
                <div>
                    <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                        <Shield size={15} style={{ color: '#06b6d4' }} />
                        <p className="text-sm text-slate-400 font-medium">Reliability</p>
                    </div>
                    <p className="text-4xl font-black" style={{ color: '#06b6d4' }}>
                        {domain.reliabilityScore?.toFixed(0)}%
                    </p>
                    <ProgressBar value={domain.reliabilityScore} max={100}
                        color="linear-gradient(90deg,#06b6d4,#22d3ee)" />
                </div>
            </div>

            {/* Footer */}
            <div style={{ paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#059669' }}>
                        <CheckCircle size={14} />
                        <span className="font-medium">{domain.completedTasks}</span>
                        <span style={{ color: '#94a3b8' }}>tasks done</span>
                        {domain.isBeginner && (
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                · {Math.max(0, 3 - domain.completedTasks)} more to exit beginner tier
                            </span>
                        )}
                    </div>
                </div>
                {domain.level < 4 && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500" style={{ marginTop: '0.625rem' }}>
                        <TrendingUp size={11} />
                        {domain.level === 1 && `Complete ${Math.max(0, 5 - domain.completedTasks)} more tasks to reach Level 2`}
                        {domain.level === 2 && 'Need 15 tasks, quality ≥ 4, reliability ≥ 85% for Level 3'}
                        {domain.level === 3 && 'Need 30 tasks, quality ≥ 4.5, reliability ≥ 90% for Level 4'}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const Performance = () => {
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyDomains()
            .then(r => setDomains(r.data.domains || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <Layout>
            <div>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2.5rem' }}>
                    <h1 className="text-4xl font-black text-white flex items-center gap-3"
                        style={{ marginBottom: '0.6rem' }}>
                        <BarChart3 size={32} className="text-indigo-400" /> My Performance
                    </h1>
                    <p className="text-lg text-slate-400">Domain-wise quality, reliability, and level tracking</p>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '1.5rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="shimmer rounded-2xl" style={{ height: '18rem' }} />
                        ))}
                    </div>
                ) : domains.length === 0 ? (
                    <div className="glass rounded-2xl text-center" style={{ padding: '5rem 2rem' }}>
                        <p className="text-2xl" style={{ marginBottom: '0.75rem' }}>📊</p>
                        <p className="text-lg text-slate-400">No domains registered yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '1.5rem' }}>
                        {domains.map((d, i) => (
                            <DomainCard key={d.domainName} domain={d} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Performance;
