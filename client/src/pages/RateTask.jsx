import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import StarRating from '../components/StarRating';
import { rateTask } from '../api';
import { getMyTasks } from '../api';
import { CheckCircle, Star } from 'lucide-react';

const RateTask = () => {
    const { id } = useParams();
    const [rating, setRating] = useState(0);
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [err, setErr] = useState('');

    useEffect(() => {
        getMyTasks().then(r => {
            const t = r.data.tasks.find(t => t._id === id);
            setTask(t);
        });
    }, [id]);

    const submit = async () => {
        if (!rating) return;
        setLoading(true); setErr('');
        try {
            await rateTask(id, { rating });
            setDone(true);
        } catch (e) {
            setErr(e.response?.data?.message || 'Failed to submit rating');
        } finally { setLoading(false); }
    };

    return (
        <Layout isClient>
            <div className="p-8 max-w-lg">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Star className="text-yellow-400" size={22} /> Rate Task
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">{task?.title}</p>
                </motion.div>

                {done ? (
                    <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-2xl p-8 text-center">
                        <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Thank you!</h2>
                        <p className="text-slate-400 text-sm">Your {rating}-star rating has been submitted. The freelancer's domain profile has been updated.</p>
                    </motion.div>
                ) : (
                    <div className="glass rounded-2xl p-7 space-y-6">
                        {err && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{err}</div>}
                        <div>
                            <label className="text-sm text-slate-300 font-medium block mb-3">How would you rate the quality of work?</label>
                            <div className="flex items-center gap-3">
                                <StarRating value={rating} onChange={setRating} />
                                {rating > 0 && <span className="text-sm text-slate-400">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</span>}
                            </div>
                        </div>
                        <motion.button whileTap={{ scale: .97 }} onClick={submit}
                            disabled={!rating || loading}
                            className="btn-brand w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-40">
                            {loading ? 'Submitting…' : 'Submit Rating'}
                        </motion.button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default RateTask;
