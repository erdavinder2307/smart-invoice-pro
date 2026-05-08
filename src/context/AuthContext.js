import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import analyticsService from '../services/analyticsService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);

    const clearSession = useCallback(() => {
        setUser(null);
    }, []);

    useEffect(() => {
        // App-load validation: check stored token; attempt refresh if present
        const initSession = async () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refresh_token');

            if (storedUser && token) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh_token');
                }
            } else if (refreshToken) {
                // No access token but have a refresh token — try to restore session
                try {
                    await authService.refreshAccessToken();
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) setUser(JSON.parse(savedUser));
                } catch {
                    localStorage.removeItem('refresh_token');
                }
            }
            setLoading(false);
        };

        initSession();
    }, []);

    useEffect(() => {
        // Listen for session-expired events dispatched by the Axios interceptor
        const handleSessionExpired = () => {
            clearSession();
            setSessionExpired(true);
        };
        window.addEventListener('auth:session-expired', handleSessionExpired);
        return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
    }, [clearSession]);

    const login = async (credentials) => {
        setSessionExpired(false);
        const token = await authService.login(credentials);
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            // Track login event
            analyticsService.trackLogin(userData.username || credentials.username, 'email');
        }
        return token;
    };

    const logout = () => {
        const username = user?.username;
        authService.logout();
        setUser(null);
        setSessionExpired(false);
        // Track logout event
        if (username) {
            analyticsService.trackLogout(username);
        }
    };

    const register = async (credentials) => {
        return authService.register(credentials);
    };

    /** Convenience role helpers — safe to call even if user is null */
    const userRole = user?.role ?? null;
    const isAdmin = userRole === 'Admin';
    const isManager = userRole === 'Manager' || isAdmin;
    const canApprove = ['Admin', 'Manager', 'Accountant'].includes(userRole);

    const value = {
        user,
        isAuthenticated: !!user,
        userRole,
        isAdmin,
        isManager,
        canApprove,
        login,
        logout,
        register,
        loading,
        sessionExpired,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
