import { motion } from 'framer-motion';
import { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ value = 0, onChange, readonly = false }) => {
    const [hovered, setHovered] = useState(0);
    const display = hovered || value;

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
                <motion.span
                    key={s}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.25 }}
                    className={`cursor-${readonly ? 'default' : 'pointer'} transition-colors duration-150`}
                    onMouseEnter={() => !readonly && setHovered(s)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    onClick={() => !readonly && onChange && onChange(s)}
                >
                    <Star
                        size={22}
                        fill={s <= display ? '#f59e0b' : 'none'}
                        stroke={s <= display ? '#f59e0b' : '#475569'}
                    />
                </motion.span>
            ))}
        </div>
    );
};

export default StarRating;
