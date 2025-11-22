// screens/GoogleFitSettingsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    TextInput,
    Linking,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useFitness } from '../contexts/FitnessContext';
import { useNavigation } from '@react-navigation/native';

const GoogleFitSettingsScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const {
        isConnected,
        connectionStatus,
        quotaStatus,
        stepGoal,
        isLoadingConnection,
        linkGoogle,
        unlinkGoogle,
        updateStepGoal,
        fetchQuotaStatus,
        fetchStepGoal,
        checkConnectionStatus,
        clearCache,
    } = useFitness();

    const [customGoal, setCustomGoal] = useState<string>('');
    const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);

    useEffect(() => {
        fetchQuotaStatus();
        fetchStepGoal();
        checkConnectionStatus();
    }, []);

    useEffect(() => {
        setCustomGoal(stepGoal.toString());
    }, [stepGoal]);

    const handleLinkGoogle = async () => {
        const linkUrl = await linkGoogle();
        if (linkUrl) {
            const canOpen = await Linking.canOpenURL(linkUrl);
            if (canOpen) {
                await Linking.openURL(linkUrl);
                Alert.alert(
                    'Link Google Fit',
                    'Please complete the linking process in your browser. Once completed, return to the app and refresh.',
                    [
                        {
                            text: 'Refresh',
                            onPress: checkConnectionStatus,
                        },
                    ]
                );
            }
        }
    };

    const handleUnlinkGoogle = () => {
        Alert.alert(
            'Unlink Google Fit',
            'Are you sure you want to unlink your Google Fit account? This will remove all synced data.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Unlink',
                    style: 'destructive',
                    onPress: unlinkGoogle,
                },
            ]
        );
    };

    const handleUpdateGoal = async (goalData: { stepGoal?: number; preset?: string; reset?: boolean }) => {
        setIsUpdatingGoal(true);
        try {
            await updateStepGoal(goalData);
        } finally {
            setIsUpdatingGoal(false);
        }
    };

    const handleCustomGoalSubmit = () => {
        const goal = parseInt(customGoal);
        if (isNaN(goal) || goal < 1000 || goal > 50000) {
            Alert.alert('Invalid Goal', 'Step goal must be between 1,000 and 50,000');
            return;
        }
        handleUpdateGoal({ stepGoal: goal });
    };

    const handleClearCache = (type: 'quickSteps' | 'stats' | 'chartWeek' | 'chartMonth' | 'chartDay' | 'all') => {
        Alert.alert(
            'Clear Cache',
            `Are you sure you want to clear ${type === 'all' ? 'all caches' : type + ' cache'}? This will force a fresh data fetch.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Clear',
                    onPress: () => clearCache(type),
                },
            ]
        );
    };

    if (isLoadingConnection) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                        Loading settings...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const presets = [
        { key: 'sedentary', label: 'Sedentary', steps: '5,000', description: 'Minimal activity' },
        { key: 'light', label: 'Light', steps: '7,500', description: 'Light exercise 1-3 days/week' },
        { key: 'moderate', label: 'Moderate', steps: '10,000', description: 'WHO recommended' },
        { key: 'active', label: 'Active', steps: '12,500', description: 'Hard exercise 6-7 days/week' },
        { key: 'veryActive', label: 'Very Active', steps: '15,000', description: 'Very hard exercise' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={[styles.backButtonText, { color: theme.primary }]}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Google Fit Settings</Text>
                </View>

                {/* Connection Status Section */}
                <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Connection Status</Text>

                    {isConnected ? (
                        <View>
                            <View style={styles.statusRow}>
                                <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Status:</Text>
                                <Text style={[styles.statusValue, { color: '#00FF7F' }]}>Connected</Text>
                            </View>

                            {connectionStatus?.googleFit?.email && (
                                <View style={styles.statusRow}>
                                    <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Account:</Text>
                                    <Text style={[styles.statusValue, { color: theme.text }]}>
                                        {connectionStatus.googleFit.email}
                                    </Text>
                                </View>
                            )}

                            {connectionStatus?.googleFit?.linkedAt && (
                                <View style={styles.statusRow}>
                                    <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Linked:</Text>
                                    <Text style={[styles.statusValue, { color: theme.text }]}>
                                        {new Date(connectionStatus.googleFit.linkedAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.unlinkButton, { backgroundColor: '#ff4444' }]}
                                onPress={handleUnlinkGoogle}
                            >
                                <Text style={styles.unlinkButtonText}>Unlink Google Fit</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <Text style={[styles.statusValue, { color: '#ff4444', marginBottom: 15 }]}>
                                Not Connected
                            </Text>
                            <TouchableOpacity
                                style={[styles.linkButton, { backgroundColor: theme.primary }]}
                                onPress={handleLinkGoogle}
                            >
                                <Text style={styles.linkButtonText}>Link Google Fit</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Quota Status Section */}
                {isConnected && quotaStatus && (
                    <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Quota</Text>

                        <View style={styles.quotaInfo}>
                            <View style={styles.quotaRow}>
                                <Text style={[styles.quotaLabel, { color: theme.textSecondary }]}>Calls Used:</Text>
                                <Text style={[styles.quotaValue, { color: theme.text }]}>
                                    {quotaStatus.callsUsed} / {quotaStatus.limit}
                                </Text>
                            </View>

                            <View style={styles.quotaRow}>
                                <Text style={[styles.quotaLabel, { color: theme.textSecondary }]}>Remaining:</Text>
                                <Text style={[styles.quotaValue, { color: quotaStatus.remaining < 5 ? '#ff4444' : '#00FF7F' }]}>
                                    {quotaStatus.remaining}
                                </Text>
                            </View>

                            <View style={styles.quotaRow}>
                                <Text style={[styles.quotaLabel, { color: theme.textSecondary }]}>Usage:</Text>
                                <Text style={[styles.quotaValue, { color: theme.text }]}>
                                    {quotaStatus.percentUsed}%
                                </Text>
                            </View>

                            {quotaStatus.isExceeded && (
                                <Text style={[styles.quotaWarning, { color: '#ff4444' }]}>
                                    Daily quota exceeded! Data will be served from cache.
                                </Text>
                            )}
                        </View>

                        <View style={styles.quotaBreakdown}>
                            <Text style={[styles.breakdownTitle, { color: theme.textSecondary }]}>Breakdown:</Text>
                            <Text style={[styles.breakdownItem, { color: theme.text }]}>
                                • Quick Steps: {quotaStatus.breakdown.quickSteps}
                            </Text>
                            <Text style={[styles.breakdownItem, { color: theme.text }]}>
                                • Stats: {quotaStatus.breakdown.stats}
                            </Text>
                            <Text style={[styles.breakdownItem, { color: theme.text }]}>
                                • Chart: {quotaStatus.breakdown.chart}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Step Goal Section */}
                {isConnected && (
                    <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Step Goal</Text>

                        <View style={styles.currentGoal}>
                            <Text style={[styles.currentGoalLabel, { color: theme.textSecondary }]}>
                                Current Goal:
                            </Text>
                            <Text style={[styles.currentGoalValue, { color: theme.primary }]}>
                                {stepGoal.toLocaleString()} steps
                            </Text>
                        </View>

                        <Text style={[styles.presetsTitle, { color: theme.textSecondary }]}>Preset Goals:</Text>

                        {presets.map((preset) => (
                            <TouchableOpacity
                                key={preset.key}
                                style={[styles.presetButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                onPress={() => handleUpdateGoal({ preset: preset.key })}
                                disabled={isUpdatingGoal}
                            >
                                <View style={styles.presetContent}>
                                    <Text style={[styles.presetLabel, { color: theme.text }]}>{preset.label}</Text>
                                    <Text style={[styles.presetSteps, { color: theme.primary }]}>{preset.steps}</Text>
                                </View>
                                <Text style={[styles.presetDescription, { color: theme.textSecondary }]}>
                                    {preset.description}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <Text style={[styles.customGoalTitle, { color: theme.textSecondary }]}>Custom Goal:</Text>

                        <View style={styles.customGoalContainer}>
                            <TextInput
                                style={[styles.customGoalInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
                                value={customGoal}
                                onChangeText={setCustomGoal}
                                keyboardType="numeric"
                                placeholder="Enter goal (1,000 - 50,000)"
                                placeholderTextColor={theme.textSecondary}
                            />
                            <TouchableOpacity
                                style={[styles.setGoalButton, { backgroundColor: theme.primary }]}
                                onPress={handleCustomGoalSubmit}
                                disabled={isUpdatingGoal}
                            >
                                {isUpdatingGoal ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.setGoalButtonText}>Set</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.resetButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onPress={() => handleUpdateGoal({ reset: true })}
                            disabled={isUpdatingGoal}
                        >
                            <Text style={[styles.resetButtonText, { color: theme.text }]}>Reset to Default (10,000)</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Cache Management Section */}
                {isConnected && (
                    <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Cache Management</Text>

                        <Text style={[styles.cacheDescription, { color: theme.textSecondary }]}>
                            Clearing cache will force fresh data from Google Fit on next fetch.
                        </Text>

                        <TouchableOpacity
                            style={[styles.cacheButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onPress={() => handleClearCache('quickSteps')}
                        >
                            <Text style={[styles.cacheButtonText, { color: theme.text }]}>Clear Quick Steps Cache</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.cacheButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onPress={() => handleClearCache('stats')}
                        >
                            <Text style={[styles.cacheButtonText, { color: theme.text }]}>Clear Stats Cache</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.cacheButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onPress={() => handleClearCache('chartWeek')}
                        >
                            <Text style={[styles.cacheButtonText, { color: theme.text }]}>Clear Week Chart Cache</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.cacheButton, { backgroundColor: '#ff4444' }]}
                            onPress={() => handleClearCache('all')}
                        >
                            <Text style={[styles.cacheButtonText, { color: '#fff' }]}>Clear All Caches</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        marginBottom: 10,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    section: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    statusLabel: {
        fontSize: 14,
    },
    statusValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    linkButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    linkButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    unlinkButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
    },
    unlinkButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    quotaInfo: {
        marginBottom: 15,
    },
    quotaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    quotaLabel: {
        fontSize: 14,
    },
    quotaValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    quotaWarning: {
        marginTop: 10,
        fontSize: 13,
        fontStyle: 'italic',
    },
    quotaBreakdown: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    breakdownTitle: {
        fontSize: 13,
        marginBottom: 5,
        fontWeight: '600',
    },
    breakdownItem: {
        fontSize: 12,
        marginVertical: 2,
    },
    currentGoal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 191, 255, 0.1)',
    },
    currentGoalLabel: {
        fontSize: 16,
    },
    currentGoalValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    presetsTitle: {
        fontSize: 14,
        marginBottom: 10,
        fontWeight: '600',
    },
    presetButton: {
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 10,
    },
    presetContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    presetLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    presetSteps: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    presetDescription: {
        fontSize: 12,
    },
    customGoalTitle: {
        fontSize: 14,
        marginTop: 15,
        marginBottom: 10,
        fontWeight: '600',
    },
    customGoalContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    customGoalInput: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        marginRight: 10,
        fontSize: 14,
    },
    setGoalButton: {
        paddingHorizontal: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 70,
    },
    setGoalButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    resetButton: {
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
    },
    resetButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    cacheDescription: {
        fontSize: 13,
        marginBottom: 15,
        lineHeight: 18,
    },
    cacheButton: {
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 10,
    },
    cacheButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default GoogleFitSettingsScreen;