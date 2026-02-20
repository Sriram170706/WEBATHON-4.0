import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ deadline }) => {
    const calc = () => {
        const diff = new Date(deadline) - new Date();
        if (diff <= 0) return { expired: true };
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return { days, hours, minutes, seconds, expired: false };
    };

    const [time, setTime] = useState(calc);

    useEffect(() => {
        const id = setInterval(() => setTime(calc()), 1000);
        return () => clearInterval(id);
    }, [deadline]);

    if (time.expired)
        return (
            <div className="flex items-center gap-2 text-red-400 text-sm">
                <Clock size={14} /> <span>Deadline Passed</span>
            </div>
        );

    const box = (val, label) => (
        <div className="flex flex-col items-center">
            <div className="w-12 h-12 glass rounded-lg flex items-center justify-center text-xl font-bold text-indigo-400">
                {String(val).padStart(2, '0')}
            </div>
            <span className="text-xs text-slate-500 mt-1">{label}</span>
        </div>
    );

    return (
        <div className="flex items-center gap-2">
            <Clock size={14} className="text-slate-400" />
            <div className="flex items-end gap-1">
                {box(time.days, 'D')}
                <span className="countdown-colon text-indigo-400 font-bold pb-4">:</span>
                {box(time.hours, 'H')}
                <span className="countdown-colon text-indigo-400 font-bold pb-4">:</span>
                {box(time.minutes, 'M')}
                <span className="countdown-colon text-indigo-400 font-bold pb-4">:</span>
                {box(time.seconds, 'S')}
            </div>
        </div>
    );
};

export default CountdownTimer;
