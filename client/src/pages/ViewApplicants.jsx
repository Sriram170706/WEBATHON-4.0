import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTaskApplicants, selectFreelancer } from '../api';
import Layout from '../components/Layout';
import LevelBadge from '../components/LevelBadge';
import BeginnerBadge from '../components/BeginnerBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { Star, Shield, CheckCircle2, UserCheck, Trophy, Sparkles } from 'lucide-react';

const ApplicantCard = ({ applicant, rank, onSelect, selected }) => {
    const d = applicant.domainProfile;
    const isRookie = applicant.isRookie;
    const boostActive = new Date() < new Date(d?.beginnerBoostExpiresAt);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank * 0.07 }}
            className={`glass card-hover rounded-2xl p-5 relative overflow-hidden ${selected ? 'border border-emerald-500/50' : ''}`}
        >
            {/* Rank badge */}
            <div className="absolute top-3 right-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${rank < 3
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-white/5 text-slate-500 border border-white/10'}`}>
                    #{rank + 1}
                </div>
            </div>

            {/* Rookie indicator */}
            {isRookie && (
                <div className="absolute top-3 left-14 text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/25 px-1.5 py-0.5 rounded-full">
                    Rookie Pool
                </div>
            )}

            <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                    {applicant.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">{applicant.name}</p>
                    <p className="text-slate-500 text-xs truncate">{applicant.email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <LevelBadge level={d?.level || 1} size="sm" />
                        {boostActive && <BeginnerBadge active />}
                    </div>
                </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                    <Star size={12} className="text-yellow-400 mx-auto mb-0.5" />
                    <p className="text-sm font-bold text-yellow-400">{d?.qualityScore?.toFixed(1)}</p>
                    <p className="text-[10px] text-slate-500">Quality</p>
                </div>
                <div className="text-center p-2 rounded-xl" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}>
                    <Shield size={12} className="text-cyan-400 mx-auto mb-0.5" />
                    <p className="text-sm font-bold text-cyan-400">{d?.reliabilityScore?.toFixed(0)}%</p>
                    <p className="text-[10px] text-slate-500">Reliability</p>
                </div>
                <div className="text-center p-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <CheckCircle2 size={12} className="text-emerald-400 mx-auto mb-0.5" />
                    <p className="text-sm font-bold text-emerald-400">{d?.completedTasks}</p>
                    <p className="text-[10px] text-slate-500">Done</p>
                </div>
            </div>

            {/* Final Score */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Trophy size={11} className="text-amber-400" />
                    <span>Match Score:</span>
                    <span className="font-semibold text-white">{applicant.finalScore?.toFixed(1)}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${applicant.availabilityStatus === 'available'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-amber-500/15 text-amber-400'}`}>
                    {applicant.availabilityStatus}
                </span>
            </div>

            {selected ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <UserCheck size={15} /> Selected!
                </div>
            ) : (
                <motion.button whileTap={{ scale: .95 }} onClick={() => onSelect(applicant.freelancerId)}
                    className="btn-brand w-full py-2 rounded-xl text-white font-semibold text-sm">
                    ✓ Select Freelancer
                </motion.button>
            )}
        </motion.div>
    );
};

const ViewApplicants = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [err, setErr] = useState('');

    useEffect(() => {
        getTaskApplicants(id).then(r => setData(r.data)).finally(() => setLoading(false));
    }, [id]);

    const handleSelect = async (freelancerId) => {
        try {
            await selectFreelancer(id, freelancerId);
            setSelected(freelancerId);
        } catch (e) {
            setErr(e.response?.data?.message || 'Failed to select');
        }
    };

    const experienced = data?.applicants?.filter(a => !a.isRookie) || [];
    const rookies = data?.applicants?.filter(a => a.isRookie) || [];

    return (
        <Layout isClient>
            <div className="p-8">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <h1 className="text-2xl font-bold text-white">Top Applicants</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Showing top {data?.returnedCount || 0} of {data?.totalApplicants || 0} total applicants · Domain: <span className="text-indigo-400">{data?.domain}</span>
                    </p>
                    <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                        <Sparkles size={11} className="text-indigo-400" />
                        Ranked by quality (40%) + reliability (30%) + skill match (20%) + availability (10%)
                    </div>
                </motion.div>

                {err && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-5">{err}</div>}

                {loading ? <LoadingSpinner message="Scoring & filtering applicants…" /> : (
                    data?.applicants?.length === 0
                        ? <div className="text-center py-20 text-slate-400">No applicants yet.</div>
                        : (
                            <div className="space-y-8">
                                {/* Experienced pool */}
                                {experienced.length > 0 && (
                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                                            Experienced Pool ({experienced.length}/7)
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {experienced.map((a, i) => (
                                                <ApplicantCard key={a.freelancerId} applicant={a} rank={i}
                                                    selected={selected?.toString() === a.freelancerId?.toString()}
                                                    onSelect={handleSelect} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Rookie pool */}
                                {rookies.length > 0 && (
                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                                            Rookie Pool ({rookies.length}/3) · 30% fairness allocation
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {rookies.map((a, i) => (
                                                <ApplicantCard key={a.freelancerId} applicant={a} rank={experienced.length + i}
                                                    selected={selected?.toString() === a.freelancerId?.toString()}
                                                    onSelect={handleSelect} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                )}
            </div>
        </Layout>
    );
};

export default ViewApplicants;
