import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = 'Loading...' }) => (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <motion.div
            className="w-12 h-12 rounded-full border-2 border-transparent"
            style={{ borderTopColor: '#6366f1', borderRightColor: 'rgba(99,102,241,0.3)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-slate-400 text-sm animate-pulse">{message}</p>
    </div>
);

export default LoadingSpinner;
