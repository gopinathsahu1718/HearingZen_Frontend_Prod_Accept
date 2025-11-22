// contexts/FitnessContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Alert } from 'react-native';
import FitnessApiService from '../services/FitnessApiService';
import { useAuth } from './AuthContext';

interface QuickDashboardData {
    steps: number;
    goal: number;
    percentage: number;
    dateStr: string;
    isGoalAchieved: boolean;
    timezone?: string;
}

interface StatsData {
    distance: { value: number; unit: string };
    calories: { value: number; unit: string };
    activeTime: { value: number; unit: string };
    timezone?: string;
}

interface ChartDataPoint {
    date?: string;
    dayName?: string;
    dayShort?: string;
    steps: number;
    goalAchieved?: boolean;
    goalPercentage?: number;
    isToday?: boolean;
    hour?: number;
    label?: string;
    isCurrentHour?: boolean;
    dayOfMonth?: number;
    weekOfMonth?: number;
}

interface ConnectionStatus {
    userId: string;
    email: string;
    loginMethod: string;
    providers: string[];
    googleFitConnected: boolean;
    googleFit?: {
        email: string;
        linkedAt: string;
        scopes: string[];
        isConnected: boolean;
        lastSyncedAt: string | null;
        autoSync: boolean;
    };
}

interface QuotaStatus {
    date: string;
    callsUsed: number;
    limit: number;
    remaining: number;
    isExceeded: boolean;
    percentUsed: number;
    breakdown: {
        quickSteps: number;
        stats: number;
        chart: number;
    };
    isToday: boolean;
    resetTime: string | null;
}

interface FitnessContextType {
    isConnected: boolean;
    connectionStatus: ConnectionStatus | null;
    checkConnectionStatus: () => Promise<void>;
    linkGoogle: () => Promise<string | null>;
    unlinkGoogle: () => Promise<void>;
    quickData: QuickDashboardData | null;
    statsData: StatsData | null;
    chartData: ChartDataPoint[] | null;
    isLoadingQuick: boolean;
    isLoadingStats: boolean;
    isLoadingChart: boolean;
    isLoadingConnection: boolean;
    quickDataSource: string | null;
    statsDataSource: string | null;
    chartDataSource: string | null;
    fetchQuickData: () => Promise<void>;
    fetchStatsData: () => Promise<void>;
    fetchChartData: (period?: 'day' | 'week' | 'month') => Promise<void>;
    refreshQuickData: () => Promise<void>;
    refreshStatsData: () => Promise<void>;
    refreshChartData: (period?: 'day' | 'week' | 'month') => Promise<void>;
    refreshAllData: () => Promise<void>;
    stepGoal: number;
    fetchStepGoal: () => Promise<void>;
    updateStepGoal: (goalData: { stepGoal?: number; preset?: string; reset?: boolean }) => Promise<void>;
    quotaStatus: QuotaStatus | null;
    fetchQuotaStatus: () => Promise<void>;
    clearCache: (type: 'quickSteps' | 'stats' | 'chartWeek' | 'chartMonth' | 'chartDay' | 'all') => Promise<void>;
    error: string | null;
    clearError: () => void;
    selectedPeriod: 'day' | 'week' | 'month';
    setSelectedPeriod: (period: 'day' | 'week' | 'month') => void;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

export const FitnessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated, token } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
    const [isLoadingConnection, setIsLoadingConnection] = useState(true);
    const [quickData, setQuickData] = useState<QuickDashboardData | null>(null);
    const [statsData, setStatsData] = useState<StatsData | null>(null);
    const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
    const [stepGoal, setStepGoal] = useState<number>(10000);
    const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
    const [isLoadingQuick, setIsLoadingQuick] = useState(false);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [isLoadingChart, setIsLoadingChart] = useState(false);
    const [quickDataSource, setQuickDataSource] = useState<string | null>(null);
    const [statsDataSource, setStatsDataSource] = useState<string | null>(null);
    const [chartDataSource, setChartDataSource] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const handleError = useCallback((err: any, context: string) => {
        console.error(`${context} error:`, err);
        const errorMessage = err.message || 'An unexpected error occurred';
        setError(errorMessage);
        return errorMessage;
    }, []);

    const checkConnectionStatus = useCallback(async () => {
        if (!isAuthenticated || !token) {
            setIsConnected(false);
            setIsLoadingConnection(false);
            return;
        }

        setIsLoadingConnection(true);
        try {
            const response = await FitnessApiService.getConnectionStatus();
            if (response.success) {
                const status = response.data;
                setConnectionStatus(status);
                setIsConnected(status.googleFitConnected);
            } else {
                setIsConnected(false);
            }
        } catch (err: any) {
            handleError(err, 'Check connection status');
            setIsConnected(false);
        } finally {
            setIsLoadingConnection(false);
        }
    }, [isAuthenticated, token, handleError]);

    const linkGoogle = useCallback(async (): Promise<string | null> => {
        try {
            const response = await FitnessApiService.getLinkGoogleUrl();
            if (response.success && response.linkUrl) {
                return response.linkUrl;
            } else {
                Alert.alert('Error', response.error || 'Failed to get Google Fit link URL');
                return null;
            }
        } catch (err: any) {
            const errorMsg = handleError(err, 'Link Google Fit');
            Alert.alert('Error', errorMsg);
            return null;
        }
    }, [handleError]);

    const unlinkGoogle = useCallback(async () => {
        try {
            const response = await FitnessApiService.unlinkGoogle();
            if (response.success) {
                setIsConnected(false);
                setConnectionStatus(null);
                setQuickData(null);
                setStatsData(null);
                setChartData(null);
                Alert.alert('Success', 'Google Fit unlinked successfully');
            }
        } catch (err: any) {
            const errorMsg = handleError(err, 'Unlink Google Fit');
            Alert.alert('Error', errorMsg);
        }
    }, [handleError]);

    const fetchQuickData = useCallback(async () => {
        if (!isConnected) return;
        setIsLoadingQuick(true);
        try {
            const response = await FitnessApiService.getQuickDashboard();
            if (response.success) {
                setQuickData(response.data);
                setQuickDataSource(response.source || 'cache');
            }
        } catch (err: any) {
            handleError(err, 'Fetch quick data');
        } finally {
            setIsLoadingQuick(false);
        }
    }, [isConnected, handleError]);

    const fetchStatsData = useCallback(async () => {
        if (!isConnected) return;
        setIsLoadingStats(true);
        try {
            const response = await FitnessApiService.getStatsData();
            if (response.success) {
                setStatsData(response.data);
                setStatsDataSource(response.source || 'cache');
            }
        } catch (err: any) {
            handleError(err, 'Fetch stats data');
        } finally {
            setIsLoadingStats(false);
        }
    }, [isConnected, handleError]);

    const fetchChartData = useCallback(async (period: 'day' | 'week' | 'month' = 'week') => {
        if (!isConnected) return;
        setIsLoadingChart(true);
        try {
            const response = await FitnessApiService.getChartData(period);
            if (response.success) {
                setChartData(response.data);
                setChartDataSource(response.source || 'cache');
            }
        } catch (err: any) {
            handleError(err, 'Fetch chart data');
        } finally {
            setIsLoadingChart(false);
        }
    }, [isConnected, handleError]);

    const refreshQuickData = useCallback(async () => {
        if (!isConnected) return;
        setIsLoadingQuick(true);
        try {
            await FitnessApiService.clearCache('quickSteps');
            await fetchQuickData();
            Alert.alert('Success', 'Quick data refreshed');
        } catch (err: any) {
            const errorMsg = handleError(err, 'Refresh quick data');
            Alert.alert('Error', errorMsg);
        } finally {
            setIsLoadingQuick(false);
        }
    }, [isConnected, fetchQuickData, handleError]);

    const refreshStatsData = useCallback(async () => {
        if (!isConnected) return;
        setIsLoadingStats(true);
        try {
            await FitnessApiService.clearCache('stats');
            await fetchStatsData();
            Alert.alert('Success', 'Stats data refreshed');
        } catch (err: any) {
            const errorMsg = handleError(err, 'Refresh stats data');
            Alert.alert('Error', errorMsg);
        } finally {
            setIsLoadingStats(false);
        }
    }, [isConnected, fetchStatsData, handleError]);

    const refreshChartData = useCallback(async (period: 'day' | 'week' | 'month' = 'week') => {
        if (!isConnected) return;
        setIsLoadingChart(true);
        try {
            const cacheType = period === 'day' ? 'chartDay' : period === 'week' ? 'chartWeek' : 'chartMonth';
            await FitnessApiService.clearCache(cacheType as any);
            await fetchChartData(period);
            Alert.alert('Success', 'Chart data refreshed');
        } catch (err: any) {
            const errorMsg = handleError(err, 'Refresh chart data');
            Alert.alert('Error', errorMsg);
        } finally {
            setIsLoadingChart(false);
        }
    }, [isConnected, fetchChartData, handleError]);

    const refreshAllData = useCallback(async () => {
        if (!isConnected) return;
        try {
            await Promise.all([
                refreshQuickData(),
                refreshStatsData(),
                refreshChartData(selectedPeriod),
            ]);
        } catch (err: any) {
            handleError(err, 'Refresh all data');
        }
    }, [isConnected, refreshQuickData, refreshStatsData, refreshChartData, selectedPeriod, handleError]);

    const fetchStepGoal = useCallback(async () => {
        try {
            const response = await FitnessApiService.getStepGoal();
            if (response.success) {
                setStepGoal(response.data.currentGoal);
            }
        } catch (err: any) {
            handleError(err, 'Fetch step goal');
        }
    }, [handleError]);

    const updateStepGoal = useCallback(async (goalData: { stepGoal?: number; preset?: string; reset?: boolean }) => {
        try {
            const response = await FitnessApiService.setStepGoal(goalData);
            if (response.success) {
                setStepGoal(response.data.stepGoal);
                Alert.alert('Success', response.message);
                await fetchQuickData();
            }
        } catch (err: any) {
            const errorMsg = handleError(err, 'Update step goal');
            Alert.alert('Error', errorMsg);
        }
    }, [handleError, fetchQuickData]);

    const fetchQuotaStatus = useCallback(async () => {
        try {
            const response = await FitnessApiService.getStatus();
            if (response.success) {
                setQuotaStatus(response.data.quota);
            }
        } catch (err: any) {
            handleError(err, 'Fetch quota status');
        }
    }, [handleError]);

    const clearCache = useCallback(async (type: 'quickSteps' | 'stats' | 'chartWeek' | 'chartMonth' | 'chartDay' | 'all') => {
        try {
            await FitnessApiService.clearCache(type);
            Alert.alert('Success', `Cache cleared: ${type}`);
        } catch (err: any) {
            const errorMsg = handleError(err, 'Clear cache');
            Alert.alert('Error', errorMsg);
        }
    }, [handleError]);

    useEffect(() => {
        if (isAuthenticated && token) {
            checkConnectionStatus();
        }
    }, [isAuthenticated, token]);

    useEffect(() => {
        if (isConnected) {
            fetchQuickData();
            fetchStatsData();
            fetchChartData(selectedPeriod);
            fetchStepGoal();
            fetchQuotaStatus();
        }
    }, [isConnected]);

    useEffect(() => {
        if (isConnected) {
            fetchChartData(selectedPeriod);
        }
    }, [selectedPeriod, isConnected]);

    return (
        <FitnessContext.Provider
            value={{
                isConnected,
                connectionStatus,
                checkConnectionStatus,
                linkGoogle,
                unlinkGoogle,
                quickData,
                statsData,
                chartData,
                isLoadingQuick,
                isLoadingStats,
                isLoadingChart,
                isLoadingConnection,
                quickDataSource,
                statsDataSource,
                chartDataSource,
                fetchQuickData,
                fetchStatsData,
                fetchChartData,
                refreshQuickData,
                refreshStatsData,
                refreshChartData,
                refreshAllData,
                stepGoal,
                fetchStepGoal,
                updateStepGoal,
                quotaStatus,
                fetchQuotaStatus,
                clearCache,
                error,
                clearError,
                selectedPeriod,
                setSelectedPeriod,
            }}
        >
            {children}
        </FitnessContext.Provider>
    );
};

export const useFitness = (): FitnessContextType => {
    const context = useContext(FitnessContext);
    if (!context) {
        throw new Error('useFitness must be used within a FitnessProvider');
    }
    return context;
};