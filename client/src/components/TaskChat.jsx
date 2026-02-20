import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, RefreshCw } from 'lucide-react';
import { getMessages, sendMessage } from '../api';
import { useAuth } from '../context/AuthContext';

const POLL_INTERVAL = 5000; // poll every 5 seconds

/* ── Individual message bubble ────────────────────────────────────── */
const Bubble = ({ msg, isOwn }) => {
    const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isOwn ? 'flex-end' : 'flex-start',
                marginBottom: '0.75rem',
            }}
        >
            {/* Sender label */}
            <div style={{
                fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.25rem',
                color: isOwn ? '#6366f1' : '#059669',
                textTransform: 'capitalize',
            }}>
                {isOwn ? 'You' : msg.senderName} · {msg.senderRole}
            </div>

            {/* Bubble */}
            <div style={{
                maxWidth: '75%',
                padding: '0.625rem 0.875rem',
                borderRadius: isOwn ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: isOwn
                    ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                    : '#f1f5f9',
                color: isOwn ? '#ffffff' : '#0f172a',
                fontSize: '0.875rem',
                lineHeight: 1.55,
                boxShadow: isOwn
                    ? '0 2px 12px rgba(99,102,241,0.25)'
                    : '0 1px 4px rgba(0,0,0,0.06)',
            }}>
                {msg.text}
            </div>

            {/* Timestamp */}
            <div style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: '0.25rem' }}>{time}</div>
        </motion.div>
    );
};

/* ── TaskChat main component ──────────────────────────────────────── */
const TaskChat = ({ taskId }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [loadErr, setLoadErr] = useState('');
    const bottomRef = useRef(null);
    const pollRef = useRef(null);

    const fetchMessages = useCallback(async (showErr = false) => {
        try {
            const { data } = await getMessages(taskId);
            setMessages(data.messages ?? []);
            setLoadErr('');
        } catch (e) {
            if (showErr) setLoadErr('Could not load messages.');
        }
    }, [taskId]);

    // Initial load + polling
    useEffect(() => {
        fetchMessages(true);
        pollRef.current = setInterval(() => fetchMessages(), POLL_INTERVAL);
        return () => clearInterval(pollRef.current);
    }, [fetchMessages]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!text.trim() || sending) return;
        setSending(true);
        try {
            const { data } = await sendMessage(taskId, text.trim());
            setMessages(prev => [...prev, data.message]);
            setText('');
        } catch {
            // silently ignore — next poll will catch up
        } finally {
            setSending(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    return (
        <div className="glass rounded-2xl" style={{ overflow: 'hidden', marginTop: '2rem' }}>
            {/* Header */}
            <div style={{
                padding: '1.125rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#f8fafc',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <MessageSquare size={18} style={{ color: '#6366f1' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>Task Messages</span>
                    {messages.length > 0 && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '99px', background: '#ede9fe', color: '#6d28d9' }}>
                            {messages.length}
                        </span>
                    )}
                </div>
                <button onClick={() => fetchMessages(true)} title="Refresh"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.25rem' }}>
                    <RefreshCw size={15} />
                </button>
            </div>

            {/* Message list */}
            <div style={{
                padding: '1.25rem 1.5rem',
                minHeight: '220px', maxHeight: '380px',
                overflowY: 'auto',
                background: '#ffffff',
            }}>
                {loadErr && (
                    <p style={{ color: '#dc2626', fontSize: '0.8125rem', textAlign: 'center', paddingTop: '2rem' }}>{loadErr}</p>
                )}

                {!loadErr && messages.length === 0 && (
                    <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
                        <MessageSquare size={32} style={{ color: '#cbd5e1', margin: '0 auto 0.75rem' }} />
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No messages yet. Start the conversation!</p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map(msg => (
                        <Bubble
                            key={msg._id}
                            msg={msg}
                            isOwn={msg.senderId === user?._id || msg.senderName === user?.name}
                        />
                    ))}
                </AnimatePresence>
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '0.875rem 1.25rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex', gap: '0.625rem', alignItems: 'flex-end',
                background: '#f8fafc',
            }}>
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Type a message… (Enter to send)"
                    rows={1}
                    style={{
                        flex: 1, resize: 'none', borderRadius: '12px',
                        border: '1.5px solid #e2e8f0', padding: '0.625rem 0.875rem',
                        fontSize: '0.875rem', color: '#0f172a', outline: 'none',
                        background: '#ffffff', lineHeight: 1.5, maxHeight: '120px',
                        transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#a5b4fc'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <motion.button
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        width: '42px', height: '42px', borderRadius: '12px', border: 'none',
                        background: text.trim() ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : '#e2e8f0',
                        color: text.trim() ? '#ffffff' : '#94a3b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: text.trim() ? 'pointer' : 'default',
                        transition: 'all 0.2s', flexShrink: 0,
                    }}
                >
                    <Send size={17} />
                </motion.button>
            </div>
        </div>
    );
};

export default TaskChat;
