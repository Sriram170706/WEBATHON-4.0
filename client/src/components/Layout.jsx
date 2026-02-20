import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, ListTodo, Building2, BarChart3,
    LogOut, Zap, Briefcase, PlusCircle, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon: Icon, label, onClick }) => (
    <NavLink to={to} onClick={onClick}
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <Icon size={19} />
        <span className="flex-1 text-base">{label}</span>
    </NavLink>
);

const SectionLabel = ({ text }) => (
    <p className="text-xs uppercase tracking-widest text-slate-600 px-3 pt-3 pb-1 font-bold">
        {text}
    </p>
);

/* ── Sliding sidebar drawer ───────────────────────────────────────── */
const Sidebar = ({ open, onClose, isClient }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => { logout(); navigate('/login'); onClose(); };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        className="fixed inset-0 z-40"
                        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.aside
                        key="drawer"
                        className="fixed top-0 left-0 h-full z-50 flex flex-col"
                        style={{
                            width: '280px',
                            background: '#ffffff',
                            backdropFilter: 'blur(32px)',
                            borderRight: '1px solid #e2e8f0',
                            boxShadow: '8px 0 40px rgba(0,0,0,0.12)',
                        }}
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center pulse-glow shrink-0"
                                    style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                                    <Zap size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold gradient-brand leading-none">MicroWork</p>
                                    <p className="text-xs text-slate-500 capitalize mt-0.5">{user?.role} account</p>
                                </div>
                            </div>
                            <button onClick={onClose}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                style={{ color: '#94a3b8' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Nav */}
                        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                            {isClient ? (
                                <>
                                    <SectionLabel text="Client" />
                                    <NavItem to="/client/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={onClose} />
                                    <NavItem to="/client/create-task" icon={PlusCircle} label="Post a Task" onClick={onClose} />
                                    <NavItem to="/client/my-tasks" icon={ListTodo} label="My Tasks" onClick={onClose} />
                                </>
                            ) : (
                                <>
                                    <SectionLabel text="Freelancer" />
                                    <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={onClose} />
                                    <NavItem to="/tasks/individual" icon={ListTodo} label="Individual Tasks" onClick={onClose} />
                                    <NavItem to="/tasks/company" icon={Building2} label="Company Zone" onClick={onClose} />
                                    <NavItem to="/performance" icon={BarChart3} label="My Performance" onClick={onClose} />
                                    <NavItem to="/my-tasks" icon={Briefcase} label="My Tasks" onClick={onClose} />
                                </>
                            )}
                        </nav>

                        {/* User footer */}
                        <div className="px-4 py-4 space-y-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                            <div className="flex items-center gap-3 px-3 py-3 rounded-xl"
                                style={{ background: '#ede9fe', border: '1px solid #c4b5fd' }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
                                    style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                                    {user?.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>{user?.name}</p>
                                    <p className="text-xs truncate" style={{ color: '#6d28d9' }}>{user?.email}</p>
                                </div>
                            </div>
                            <button onClick={handleLogout}
                                className="sidebar-link w-full text-base"
                                style={{ color: '#dc2626' }}>
                                <LogOut size={17} />
                                <span>Sign out</span>
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};

/* ── Top nav bar ──────────────────────────────────────────────────── */
const Topbar = ({ onMenuClick, isClient }) => {
    const { user } = useAuth();
    return (
        <div className="sticky top-0 z-30 flex items-center gap-4 px-6 py-6"
            style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', paddingRight: '2.5rem' }}>
            <button onClick={onMenuClick}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                <Menu size={22} />
            </button>
            <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                    <Zap size={17} className="text-white" />
                </div>
                <span className="text-lg font-bold gradient-brand">MicroWork</span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                    {user?.name?.[0]?.toUpperCase()}
                </div>
            </div>
        </div>

    );
};

/* ── Main Layout ──────────────────────────────────────────────────── */
const Layout = ({ children, isClient = false }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
            {/* Same ambient layer as Login page */}
            <div className="grid-overlay" />
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} isClient={isClient} />

            <div className="relative z-10 min-h-screen flex flex-col">
                <Topbar onMenuClick={() => setSidebarOpen(true)} isClient={isClient} />
                <main className="flex-1 page-enter layout-content" style={{ padding: '3rem 4rem 4rem' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
