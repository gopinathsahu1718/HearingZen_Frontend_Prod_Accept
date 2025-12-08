import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Switch,
    Dimensions,
    Platform,
    Alert,
    NativeEventEmitter,
    NativeEventSubscription,
    DeviceEventEmitter,
    ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import BleManager from 'react-native-ble-manager';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: { navigation: HomeScreenNavigationProp }) => {
    const { theme } = useTheme();
    const [isBluetoothOn, setIsBluetoothOn] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    const styles = useThemedStyles((theme) =>
        StyleSheet.create({
            container: {
                flex: 1,
                backgroundColor: theme.background,
            },
            scrollContainer: {
                padding: 15,
                paddingBottom: 40,
            },
            bluetoothSection: {
                alignItems: 'center',
                marginTop: 40,
                marginBottom: 40,
            },
            bluetoothCircle: {
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderWidth: 2,
                borderColor: isBluetoothOn ? 'rgba(33, 150, 243, 0.7)' : 'rgba(244, 67, 54, 0.3)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 15,
            },
            bluetoothIcon: {
                fontSize: 40,
                color: isBluetoothOn ? theme.primary : theme.error,
            },
            bluetoothStatus: {
                fontSize: 16,
                color: theme.textSecondary,
                marginBottom: 15,
            },
            bluetoothToggle: {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
            },
            bluetoothToggleText: {
                color: theme.text,
                fontSize: 16,
                fontWeight: '600',
                marginRight: 15,
            },
            actionsGrid: {
                flex: 1,
            },
            gridRow: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 15,
            },
            actionButton: {
                width: (width - 50) / 2,
                height: 120,
                backgroundColor: theme.background,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: theme.border,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: theme.shadowColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            },
            actionIcon: {
                fontSize: 24,
                marginBottom: 8,
            },
            actionText: {
                fontSize: 14,
                color: theme.text,
                fontWeight: '500',
            },
            quickScanIcon: { color: '#FF6B6B' },
            pairedDevicesIcon: { color: '#4ECDC4' },
            settingsIcon: { color: '#FFB74D' },
            deviceInfoIcon: { color: '#CE93D8' },
            loadingText: {
                color: theme.textSecondary,
                fontSize: 14,
                marginTop: 10,
            },
        })
    );

    useEffect(() => {
        const initializeBluetooth = async () => {
            try {
                setIsInitializing(true);

                // Initialize BLE Manager
                await BleManager.start({ showAlert: false });
                const state = await BleManager.checkState();
                setIsBluetoothOn(state === 'on');

                // Initialize Classic Bluetooth for Android
                if (Platform.OS === 'android') {
                    try {
                        const classicEnabled = await RNBluetoothClassic.isBluetoothEnabled();
                        setIsBluetoothOn(classicEnabled);
                    } catch (error) {
                        console.warn('Classic Bluetooth init warning:', error);
                    }
                }
            } catch (error) {
                console.error('Bluetooth initialization error:', error);
                Alert.alert(
                    'Bluetooth Error',
                    'Failed to initialize Bluetooth. Some features may not work properly.'
                );
            } finally {
                setIsInitializing(false);
            }
        };

        initializeBluetooth();

        // BLE State Listener
        const bleStateSubscription: NativeEventSubscription = DeviceEventEmitter.addListener(
            'BleManagerDidUpdateState',
            (args: { state: string }) => {
                setIsBluetoothOn(args.state === 'on');
            }
        );

        // Classic Bluetooth Listeners for Android
        let classicEnabledSub: NativeEventSubscription | undefined;
        let classicDisabledSub: NativeEventSubscription | undefined;

        if (Platform.OS === 'android') {
            classicEnabledSub = RNBluetoothClassic.onBluetoothEnabled(() => {
                setIsBluetoothOn(true);
                console.log('Classic Bluetooth enabled');
            });

            classicDisabledSub = RNBluetoothClassic.onBluetoothDisabled(() => {
                setIsBluetoothOn(false);
                console.log('Classic Bluetooth disabled');
            });
        }

        return () => {
            bleStateSubscription.remove();
            if (Platform.OS === 'android') {
                classicEnabledSub?.remove();
                classicDisabledSub?.remove();
            }
        };
    }, []);

    const handleBluetoothToggle = async (value: boolean) => {
        if (value) {
            try {
                // Try to enable BLE first
                await BleManager.enableBluetooth();

                // For Android, also request classic Bluetooth
                if (Platform.OS === 'android') {
                    try {
                        await RNBluetoothClassic.requestBluetoothEnabled();
                    } catch (classicError) {
                        console.warn('Classic Bluetooth enable warning:', classicError);
                    }
                }

                setIsBluetoothOn(true);
                Alert.alert('Success', 'Bluetooth has been enabled');
            } catch (error) {
                setIsBluetoothOn(false);
                Alert.alert(
                    'Bluetooth Enable Failed',
                    'Please enable Bluetooth in your device settings.\n\n' +
                    '1. Open Settings\n' +
                    '2. Go to Bluetooth\n' +
                    '3. Turn on Bluetooth'
                );
            }
        } else {
            Alert.alert(
                'Disable Bluetooth',
                'For security reasons, Bluetooth cannot be disabled from this app. Please use your device settings to disable Bluetooth.',
                [{ text: 'OK', onPress: () => setIsBluetoothOn(true) }]
            );
        }
    };

    const ActionButton = ({
        icon,
        text,
        iconColor,
        onPress,
        disabled = false,
    }: {
        icon: string;
        text: string;
        iconColor: any;
        onPress: () => void;
        disabled?: boolean;
    }) => (
        <TouchableOpacity
            style={[
                styles.actionButton,
                disabled && { opacity: 0.6 }
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={[styles.actionIcon, iconColor]}>{icon}</Text>
            <Text style={styles.actionText}>{text}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.bluetoothSection}>
                    <View style={styles.bluetoothCircle}>
                        <Text style={styles.bluetoothIcon}>
                            {isBluetoothOn ? '🔷' : '🔴'}
                        </Text>
                    </View>
                    <Text style={styles.bluetoothStatus}>
                        {isBluetoothOn ? 'Bluetooth Enabled' : 'Bluetooth Disabled'}
                    </Text>

                    {isInitializing && (
                        <Text style={styles.loadingText}>Initializing Bluetooth...</Text>
                    )}

                    <View style={styles.bluetoothToggle}>
                        <Text style={styles.bluetoothToggleText}>
                            {isBluetoothOn ? 'Bluetooth On' : 'Turn On Bluetooth'}
                        </Text>
                        <Switch
                            trackColor={{
                                false: theme.switchTrackFalse,
                                true: theme.switchTrackTrue
                            }}
                            thumbColor={isBluetoothOn ? theme.primary : theme.switchThumb}
                            ios_backgroundColor={theme.switchTrackFalse}
                            onValueChange={handleBluetoothToggle}
                            value={isBluetoothOn}
                            disabled={isInitializing}
                        />
                    </View>
                </View>

                <View style={styles.actionsGrid}>
                    <View style={styles.gridRow}>
                        <ActionButton
                            icon="⚡"
                            text="Quick Scan"
                            iconColor={styles.quickScanIcon}
                            onPress={() => navigation.navigate('QuickScanDevices')}
                            disabled={!isBluetoothOn}
                        />
                        <ActionButton
                            icon="📱"
                            text="Paired Devices"
                            iconColor={styles.pairedDevicesIcon}
                            onPress={() => navigation.navigate('PairedDevices')}
                            disabled={!isBluetoothOn}
                        />
                    </View>
                    <View style={styles.gridRow}>
                        <ActionButton
                            icon="⚙️"
                            text="Settings"
                            iconColor={styles.settingsIcon}
                            onPress={() => navigation.navigate('Settings')}
                        />
                        <ActionButton
                            icon="ℹ️"
                            text="Device Info"
                            iconColor={styles.deviceInfoIcon}
                            onPress={() => navigation.navigate('DeviceInfo')}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;