
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem('cpms_token');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get('/auth/profile');
                const profile = response.data.user || response.data.profile || response.data;

                setUser(profile);
            } catch (error) {
                localStorage.removeItem('cpms_token');
                localStorage.removeItem('cpms_user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', {
            email,
            password
        });

        const { token } = response.data;

        if (!token) {
            throw new Error('Login response did not contain a token.');
        }

        localStorage.setItem('cpms_token', token);

        let profile = response.data.user;

        if (!profile) {
            const profileResponse = await api.get('/auth/profile');
            profile = profileResponse.data.user ||
                profileResponse.data.profile ||
                profileResponse.data;
        }

        setUser(profile);
        localStorage.setItem('cpms_user', JSON.stringify(profile));

        return profile;
    };

    const logout = () => {
        localStorage.removeItem('cpms_token');
        localStorage.removeItem('cpms_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }

    return context;
};
