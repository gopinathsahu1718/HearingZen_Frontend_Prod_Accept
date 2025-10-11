import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://13.200.222.176/api/user';

interface User {
    id: string;
    username: string;
    email: string;
    contact?: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, contact: string, email: string, password: string) => Promise<string>;
    verifyEmail: (tempToken: string, code: string) => Promise<void>;
    resendOTP: (tempToken: string) => Promise<string>;
    getVerificationToken: (email: string) => Promise<string>;
    forgotPassword: (email: string) => Promise<string>;
    verifyResetOtp: (otp: string, resetInitToken: string) => Promise<string>;
    resetPassword: (resetToken: string, newPassword: string, confirmPassword: string) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: any) => Promise<void>;
    getUserProfile: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@user_data';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
            const storedUser = await AsyncStorage.getItem(USER_KEY);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading auth data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveAuth = async (newToken: string, newUser: User) => {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, newToken);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
            setToken(newToken);
            setUser(newUser);
        } catch (error) {
            console.error('Error saving auth data:', error);
            throw error;
        }
    };

    const clearAuth = async () => {
        try {
            await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Error clearing auth data:', error);
        }
    };

    const register = async (username: string, contact: string, email: string, password: string): Promise<string> => {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, contact, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            return data.tempToken;
        } catch (error: any) {
            throw new Error(error.message || 'Network error');
        }
    };

    const verifyEmail = async (tempToken: string, code: string): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempToken, code }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Verification failed');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Network error');
        }
    };

    const resendOTP = async (tempToken: string): Promise<string> => {
        try {
            const response = await fetch(`${API_BASE_URL}/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempToken }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend OTP');
            }

            return data.tempToken;
        } catch (error: any) {
            throw new Error(error.message || 'Network error');
        }
    };

    const getVerificationToken = async (email: string): Promise<string> => {
        try {
            const response = await fetch(`${API_BASE_URL}/get-verification-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get verification token');
            }

            return data.tempToken;
        } catch (error: any) {
            throw new Error(error.message || 'Network error');
        }
    };

    const login = async (email: string, password: string): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            await saveAuth(data.token, data.user);
        } catch (error: any) {
            throw new Error(error.message || 'Network error');
        }
    };

    const forgotPassword = async (email: string): Promise<string> => {
        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send reset OTP');
            }

            return data.resetInitToken;
        } catch (error: any) {
            throw new Error(error.message || 'Network error');
        }
    };

    const verifyResetOtp = async (otp: string, resetInitToken: string): Promise<string> => {
        try {
            const response = await fetch(`${API_BASE_URL}/verifyreset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp, resetInitToken }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'OTP verification failed');
            }

            return data.resetToken;
        } catch (error: any) {
            throw new Error(error.message || 'Network error');
        }
    };

    const resetPassword = async (resetToken: string, newPassword: string, confirmPassword: string): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, newPassword, confirmPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Password reset failed');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Network error');
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
        if (!token) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${API_BASE_URL}/change_password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Password change failed');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Network error');
        }
    };

    const updateProfile = async (profileData: any): Promise<void> => {
        if (!token) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Profile update failed');
            }

            setUser(data.data);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.data));
        } catch (error: any) {
            throw new Error(error.message || 'Network error');
        }
    };

    const getUserProfile = async (): Promise<any> => {
        if (!token) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch profile');
            }

            setUser(data.data);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.data));
            return data.data;
        } catch (error: any) {
            throw new Error(error.message || 'Network error');
        }
    };

    const logout = async (): Promise<void> => {
        try {
            if (token) {
                await fetch(`${API_BASE_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            await clearAuth();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token && !!user,
                login,
                register,
                verifyEmail,
                resendOTP,
                getVerificationToken,
                forgotPassword,
                verifyResetOtp,
                resetPassword,
                changePassword,
                logout,
                updateProfile,
                getUserProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};