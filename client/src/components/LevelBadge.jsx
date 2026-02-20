import { motion } from 'framer-motion';

const levelMap = {
    1: { label: 'Explorer', cls: 'badge-explorer' },
    2: { label: 'Contributor', cls: 'badge-contributor' },
    3: { label: 'Trusted', cls: 'badge-trusted' },
    4: { label: 'Pro', cls: 'badge-pro' },
};

const LevelBadge = ({ level, size = 'sm' }) => {
    const info = levelMap[level] || levelMap[1];
    const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1', lg: 'text-base px-4 py-1.5' };
    return (
        <motion.span
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${info.cls} ${sizes[size]} rounded-full font-semibold inline-flex items-center gap-1 border border-white/10`}
        >
            ⬡ Level {level} · {info.label}
        </motion.span>
    );
};

export default LevelBadge;
