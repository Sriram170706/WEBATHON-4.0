import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const BeginnerBadge = ({ active }) =>
    active ? (
        <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold
                 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30"
        >
            <Zap size={10} /> Beginner Boost
        </motion.span>
    ) : (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full
                     bg-white/5 text-gray-500 border border-white/10">
            Boost Expired
        </span>
    );

export default BeginnerBadge;
