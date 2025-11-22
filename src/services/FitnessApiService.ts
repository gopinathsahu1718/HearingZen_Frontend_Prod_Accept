// services/FitnessApiService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://13.200.222.176/api/fitness';

// Token management
const getToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem('@auth_token');
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

// API Error Handler
export class FitnessApiError extends Error {
    statusCode: number;
    code: string;

    constructor(message: string, statusCode: number, code: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'FitnessApiError';
    }
}

const handleApiResponse = async (response: Response) => {
    const data = await response.json();

    if (!response.ok) {
        throw new FitnessApiError(
            data.message || data.error || 'Request failed',
            response.status,
            data.code || 'UNKNOWN_ERROR'
        );
    }

    return data;
};

// Fitness API Service
const FitnessApiService = {
    /**
     * Get Google Fit link URL
     */
    async getLinkGoogleUrl(): Promise<any> {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/link-google`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return handleApiResponse(response);
    },

    /**
     * Get connection status
     */
    async getConnectionStatus(): Promise<any> {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/connection-status`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return handleApiResponse(response);
    },

    /**
     * Unlink Google Fit
     */
    async unlinkGoogle(): Promise<any> {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/unlink-google`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return handleApiResponse(response);
    },

    /**
     * Get quick dashboard data (today's steps)
     */
    async getQuickDashboard(): Promise<any> {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/dashboard/quick`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return handleApiResponse(response);
    },

    /**
     * Get stats data (distance, calories, active time)
     */
    async getStatsData(): Promise<any> {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return handleApiResponse(response);
    },

    /**
     * Get chart data
     */
    async getChartData(period: 'day' | 'week' | 'month' = 'week'): Promise<any> {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/dashboard/chart?period=${period}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return handleApiResponse(response);
    },

    /**
     * Get step goal
     */
    async getStepGoal(): Promise<any> {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/step-goal`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return handleApiResponse(response);
    },

    /**
     * Set step goal
     */
    async setStepGoal(goalData: { stepGoal?: number; preset?: string; reset?: boolean }): Promise<any> {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/step-goal`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(goalData),
        });

        return handleApiResponse(response);
    },

    /**
     * Get status (circuit breaker, quota)
     */
    async getStatus(): Promise<any> {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/status`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return handleApiResponse(response);
    },

    /**
     * Clear cache
     */
    async clearCache(type: 'quickSteps' | 'stats' | 'chartWeek' | 'chartMonth' | 'chartDay' | 'all'): Promise<any> {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/cache/clear?type=${type}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return handleApiResponse(response);
    },

    /**
     * Get cache status
     */
    async getCacheStatus(): Promise<any> {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/cache/status`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return handleApiResponse(response);
    },

    /**
     * Refresh cache
     */
    async refreshCache(type: 'quickSteps' | 'stats' | 'chart'): Promise<any> {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/cache/refresh`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type }),
        });

        return handleApiResponse(response);
    },

    /**
     * Track app open event
     */
    async trackAppOpen(): Promise<any> {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/app-open`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return handleApiResponse(response);
    },

    /**
     * Track module visit
     */
    async trackModuleVisit(moduleName: string): Promise<any> {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/module-visit`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ moduleName }),
        });

        return handleApiResponse(response);
    },
};

export default FitnessApiService;