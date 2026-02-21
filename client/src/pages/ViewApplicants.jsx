import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTaskApplicants, selectFreelancer } from '../api';
import Layout from '../components/Layout';
import { Star, Shield, CheckCircle2, UserCheck, Trophy, Sparkles, ArrowLeft, Users, Zap } from 'lucide-react';

/* ── Level label helper ──────────────────────────────────────────── */
const LEVEL_NAMES = { 1: 'Rookie', 2: 'Explorer', 3: 'Pro', 4: 'Expert' };
const LEVEL_COLORS = {
    1: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
    2: { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' },
    3: { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
    4: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
};

/* ── Stat pill ───────────────────────────────────────────────────── */
const StatPill = ({ icon: Icon, value, label, color, bg }) => (
    <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '0.75rem 0.5rem', borderRadius: '14px',
        background: bg, border: `1px solid ${color}30`,
        flex: 1,
    }}>
        <Icon size={14} style={{ color, marginBottom: '0.3rem' }} />
        <p style={{ fontSize: '1.05rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.2rem', fontWeight: 500 }}>{label}</p>
    </div>
);

/* ── Single applicant card ───────────────────────────────────────── */
const ApplicantCard = ({ applicant, rank, onSelect, selected, selecting }) => {
    const d = applicant.domainProfile;
    const isRookie = applicant.isRookie;
    const boostActive = new Date() < new Date(d?.beginnerBoostExpiresAt);
    const lv = d?.level || 1;
    const lvColor = LEVEL_COLORS[lv] || LEVEL_COLORS[1];
    const isTop3 = rank < 3;
    const rankColors = ['#f59e0b', '#94a3b8', '#cd7c2f'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank * 0.06, duration: 0.4 }}
            style={{
                background: selected ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : '#ffffff',
                border: `1.5px solid ${selected ? '#6ee7b7' : '#e2e8f0'}`,
                borderRadius: '20px',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: selected
                    ? '0 8px 32px rgba(5,150,105,0.12)'
                    : '0 2px 12px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.2s, border-color 0.2s',
            }}
        >
            {/* Top accent line */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: isRookie
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(90deg, #6366f1, #0891b2)',
                borderRadius: '20px 20px 0 0',
            }} />

            {/* Rank badge */}
            <div style={{
                position: 'absolute', top: '1rem', right: '1rem',
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 800,
                background: isTop3 ? `${rankColors[rank]}18` : '#f1f5f9',
                color: isTop3 ? rankColors[rank] : '#94a3b8',
                border: `1.5px solid ${isTop3 ? `${rankColors[rank]}40` : '#e2e8f0'}`,
            }}>
                #{rank + 1}
            </div>

            {/* Avatar + info */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1.125rem' }}>
                <div style={{
                    width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.125rem', fontWeight: 800, color: '#fff',
                    background: isRookie
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : 'linear-gradient(135deg, #6366f1, #0891b2)',
                    boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                }}>
                    {applicant.name?.[0]?.toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0, paddingRight: '2rem' }}>
                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem', marginBottom: '0.125rem' }}>
                        {applicant.name}
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {applicant.email}
                    </p>

                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        <span style={{
                            fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.625rem',
                            borderRadius: '99px', background: lvColor.bg,
                            color: lvColor.text, border: `1px solid ${lvColor.border}`,
                        }}>
                            Lv {lv} · {LEVEL_NAMES[lv]}
                        </span>
                        {boostActive && (
                            <span style={{
                                fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.625rem',
                                borderRadius: '99px', background: '#fef3c7',
                                color: '#92400e', border: '1px solid #fde68a',
                                display: 'flex', alignItems: 'center', gap: '0.2rem',
                            }}>
                                <Zap size={9} /> Boost Active
                            </span>
                        )}
                        {isRookie && (
                            <span style={{
                                fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.625rem',
                                borderRadius: '99px', background: '#fff7ed',
                                color: '#c2410c', border: '1px solid #fed7aa',
                            }}>
                                Rookie Pool
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <StatPill icon={Star} value={d?.qualityScore?.toFixed(1)} label="Quality" color="#d97706" bg="#fffbeb" />
                <StatPill icon={Shield} value={`${d?.reliabilityScore?.toFixed(0)}%`} label="Reliability" color="#0891b2" bg="#ecfeff" />
                <StatPill icon={CheckCircle2} value={d?.completedTasks} label="Done" color="#059669" bg="#f0fdf4" />
            </div>

            {/* Match score + availability */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.625rem 0.875rem', borderRadius: '12px',
                background: '#f8fafc', border: '1px solid #e2e8f0',
                marginBottom: '1rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Trophy size={13} style={{ color: '#d97706' }} />
                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Match Score</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                        {applicant.finalScore?.toFixed(1)}
                    </span>
                </div>
                <span style={{
                    fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.75rem',
                    borderRadius: '99px',
                    background: applicant.availabilityStatus === 'available' ? '#d1fae5' : '#fef3c7',
                    color: applicant.availabilityStatus === 'available' ? '#065f46' : '#92400e',
                    border: `1px solid ${applicant.availabilityStatus === 'available' ? '#6ee7b7' : '#fde68a'}`,
                }}>
                    {applicant.availabilityStatus === 'available' ? '✓ Available' : '· Busy'}
                </span>
            </div>

            {/* Action */}
            {selected ? (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        padding: '0.75rem', borderRadius: '14px',
                        background: '#d1fae5', border: '1px solid #6ee7b7',
                        color: '#065f46', fontWeight: 700, fontSize: '0.9rem',
                    }}>
                    <UserCheck size={18} /> Freelancer Selected!
                </motion.div>
            ) : (
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => onSelect(applicant.freelancerId)}
                    disabled={selecting}
                    style={{
                        width: '100%', padding: '0.75rem', borderRadius: '14px', border: 'none',
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    }}>
                    <UserCheck size={16} /> Select Freelancer
                </motion.button>
            )}
        </motion.div>
    );
};

/* ── Pool section header ─────────────────────────────────────────── */
const PoolHeader = ({ label, count, max, color, bg }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.625rem 1rem', borderRadius: '12px',
        background: bg, border: `1px solid ${color}30`,
        marginBottom: '1rem', width: 'fit-content',
    }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color }}>{label}</span>
        <span style={{
            fontSize: '0.75rem', fontWeight: 600, padding: '0.1rem 0.5rem',
            borderRadius: '99px', background: `${color}20`, color,
        }}>{count}/{max}</span>
    </div>
);

/* ── Main page ───────────────────────────────────────────────────── */
const ViewApplicants = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [selecting, setSelecting] = useState(false);
    const [err, setErr] = useState('');

    useEffect(() => {
        getTaskApplicants(id).then(r => setData(r.data)).finally(() => setLoading(false));
    }, [id]);

    const handleSelect = async (freelancerId) => {
        setSelecting(true);
        try {
            await selectFreelancer(id, freelancerId);
            setSelected(freelancerId);
        } catch (e) {
            setErr(e.response?.data?.message || 'Failed to select freelancer.');
        } finally { setSelecting(false); }
    };

    const experienced = data?.applicants?.filter(a => !a.isRookie) || [];
    const rookies = data?.applicants?.filter(a => a.isRookie) || [];

    return (
        <Layout isClient>
            <div>
                {/* Back */}
                <Link to="/client/dashboard" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    color: '#6366f1', fontWeight: 600, fontSize: '0.875rem',
                    marginBottom: '2rem', textDecoration: 'none',
                }}>
                    <ArrowLeft size={15} /> Back to Dashboard
                </Link>

                {/* Page header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '16px', flexShrink: 0,
                            background: 'linear-gradient(135deg, #6366f1, #0891b2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                        }}>
                            <Users size={24} style={{ color: '#fff' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem', lineHeight: 1.1 }}>
                                Top Applicants
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
                                Showing <strong style={{ color: '#0f172a' }}>{data?.returnedCount || 0}</strong> of{' '}
                                <strong style={{ color: '#0f172a' }}>{data?.totalApplicants || 0}</strong> applicants · Domain:{' '}
                                <span style={{ color: '#6366f1', fontWeight: 700 }}>{data?.domain}</span>
                            </p>
                        </div>
                    </div>

                    {/* Ranking formula chip */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', borderRadius: '99px',
                        background: '#f1f5f9', border: '1px solid #e2e8f0',
                        fontSize: '0.8125rem', color: '#64748b',
                    }}>
                        <Sparkles size={13} style={{ color: '#6366f1' }} />
                        Ranked by quality (40%) · reliability (30%) · skill match (20%) · availability (10%)
                    </div>
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                    {err && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            style={{
                                padding: '0.875rem 1rem', borderRadius: '12px', marginBottom: '1.5rem',
                                background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: '0.875rem',
                            }}>
                            ⚠️ {err}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Content */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="shimmer rounded-2xl" style={{ height: '200px' }} />
                        ))}
                    </div>
                ) : data?.applicants?.length === 0 ? (
                    <div className="glass rounded-2xl" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                        <Users size={40} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                        <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>No applicants yet</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Share your task to attract freelancers.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                        {/* Experienced Pool */}
                        {experienced.length > 0 && (
                            <div>
                                <PoolHeader label="Experienced Pool" count={experienced.length} max={7} color="#6366f1" bg="#ede9fe" />
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                                    {experienced.map((a, i) => (
                                        <ApplicantCard key={a.freelancerId} applicant={a} rank={i}
                                            selected={selected?.toString() === a.freelancerId?.toString()}
                                            onSelect={handleSelect} selecting={selecting} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Rookie Pool */}
                        {rookies.length > 0 && (
                            <div>
                                <PoolHeader label="Rookie Pool" count={rookies.length} max={3} color="#d97706" bg="#fef3c7" />
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                                    {rookies.map((a, i) => (
                                        <ApplicantCard key={a.freelancerId} applicant={a} rank={experienced.length + i}
                                            selected={selected?.toString() === a.freelancerId?.toString()}
                                            onSelect={handleSelect} selecting={selecting} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ViewApplicants;
