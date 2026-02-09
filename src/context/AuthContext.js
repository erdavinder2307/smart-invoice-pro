import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored user/token on mount
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user from local storage', e);
                // If parsing fails, clear storage to prevent inconsistent state
                authService.logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const token = await authService.login(credentials);
            // After successful login, authService sets localStorage. 
            // We explicitly set state here to update UI immediately.
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
            return token;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const register = async (credentials) => {
        return authService.register(credentials);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        loading
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
