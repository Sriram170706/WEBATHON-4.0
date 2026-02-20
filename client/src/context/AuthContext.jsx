import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('mwp_user')); } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('mwp_token'));

    const doLogin = useCallback(async (email, password) => {
        const { data } = await apiLogin({ email, password });
        localStorage.setItem('mwp_token', data.token);
        localStorage.setItem('mwp_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const doRegister = useCallback(async (formData) => {
        const { data } = await apiRegister(formData);
        localStorage.setItem('mwp_token', data.token);
        localStorage.setItem('mwp_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('mwp_token');
        localStorage.removeItem('mwp_user');
        setToken(null);
        setUser(null);
    }, []);

    const isFreelancer = user?.role === 'freelancer' || user?.role === 'both';
    const isClient = user?.role === 'client' || user?.role === 'both';

    return (
        <AuthContext.Provider value={{ user, token, doLogin, doRegister, logout, isFreelancer, isClient }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
