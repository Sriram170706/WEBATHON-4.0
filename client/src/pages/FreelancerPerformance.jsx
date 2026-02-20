import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMyDomains } from '../api';
import Layout from '../components/Layout';
import { BarChart3, Star, Shield, CheckCircle, Zap } from 'lucide-react';

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

const levelConfig = {
    1: { label: 'Explorer', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
    2: { label: 'Contributor', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    3: { label: 'Trusted', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    4: { label: 'Pro', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
};

const DomainCard = ({ domain, index }) => {
    const lvl = levelConfig[domain.level] || levelConfig[1];
    const boostActive = new Date(domain.beginnerBoostExpiresAt) > new Date();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="glass rounded-2xl card-hover"
            style={{ border: `1px solid ${lvl.color}22`, padding: '2rem' }}
        >
            {/* Domain name + badges */}
            <div className="flex items-start justify-between gap-3" style={{ marginBottom: '1.75rem' }}>
                <h3 className="text-xl font-bold text-white">{domain.domainName}</h3>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs px-3 py-1.5 rounded-full font-bold"
                        style={{ background: lvl.bg, color: lvl.color }}>
                        Level {domain.level} · {lvl.label}
                    </span>
                    {boostActive && (
                        <span className="text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
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
                    <ProgressBar value={domain.qualityScore} max={5} color="linear-gradient(90deg,#f59e0b,#fbbf24)" />
                </div>
                <div>
                    <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                        <Shield size={15} style={{ color: '#10b981' }} />
                        <p className="text-sm text-slate-400 font-medium">Reliability</p>
                    </div>
                    <p className="text-4xl font-black" style={{ color: '#10b981' }}>
                        {domain.reliabilityScore}%
                    </p>
                    <ProgressBar value={domain.reliabilityScore} max={100} color="linear-gradient(90deg,#10b981,#34d399)" />
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between"
                style={{ paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <CheckCircle size={14} className="text-indigo-400" />
                    <span>{domain.completedTasks} task{domain.completedTasks !== 1 ? 's' : ''} done</span>
                </div>
                {domain.level < 4 && (
                    <p className="text-xs text-slate-500 text-right">
                        {domain.level === 1 && 'Complete 5 more to reach Level 2'}
                        {domain.level === 2 && 'Need 15 tasks, quality ≥ 4 for Level 3'}
                        {domain.level === 3 && 'Near the top — keep going!'}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

const FreelancerPerformance = () => {
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyDomains().then(r => setDomains(r.data.domains || [])).catch(console.error).finally(() => setLoading(false));
    }, []);

    return (
        <Layout>
            <div>
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2.5rem' }}>
                    <h1 className="text-4xl font-black text-white flex items-center gap-3" style={{ marginBottom: '0.6rem' }}>
                        <BarChart3 size={32} className="text-indigo-400" /> My Performance
                    </h1>
                    <p className="text-slate-400 text-lg">Domain-wise quality, reliability, and level tracking</p>
                </motion.div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
                        {[1, 2].map(i => <div key={i} className="shimmer rounded-2xl" style={{ height: '18rem' }} />)}
                    </div>
                ) : domains.length === 0 ? (
                    <div className="text-center glass rounded-2xl" style={{ padding: '5rem 2rem' }}>
                        <p className="text-2xl" style={{ marginBottom: '0.75rem' }}>📊</p>
                        <p className="text-lg text-slate-400">No domain data yet. Apply to tasks to get started!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '1.5rem' }}>
                        {domains.map((d, i) => <DomainCard key={d.domainName} domain={d} index={i} />)}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default FreelancerPerformance;
