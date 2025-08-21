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
                borderColor: 'rgba(33, 150, 243, 0.3)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 15,
            },
            bluetoothIcon: {
                fontSize: 40,
                color: theme.primary,
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
        })
    );

    useEffect(() => {
        const initializeBluetooth = async () => {
            try {
                await BleManager.start({ showAlert: false });
                const state = await BleManager.checkState();
                setIsBluetoothOn(state === 'on');
            } catch (error) {
                Alert.alert('Error', 'Failed to initialize BLE: ' + (error as Error).message);
            }

            if (Platform.OS === 'android') {
                try {
                    const classicEnabled = await RNBluetoothClassic.isBluetoothEnabled();
                    setIsBluetoothOn(classicEnabled);
                } catch (error) {
                    Alert.alert('Error', 'Failed to initialize Classic Bluetooth: ' + (error as Error).message);
                }
            }
        };

        initializeBluetooth();

        const bleStateSubscription: NativeEventSubscription = DeviceEventEmitter.addListener(
            'BleManagerDidUpdateState',
            (args: { state: string }) => {
                setIsBluetoothOn(args.state === 'on');
            }
        );

        let classicEnabledSub: NativeEventSubscription | undefined;
        let classicDisabledSub: NativeEventSubscription | undefined;
        if (Platform.OS === 'android') {
            classicEnabledSub = RNBluetoothClassic.onBluetoothEnabled(() => setIsBluetoothOn(true));
            classicDisabledSub = RNBluetoothClassic.onBluetoothDisabled(() => setIsBluetoothOn(false));
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
                await BleManager.enableBluetooth();
                if (Platform.OS === 'android') {
                    await RNBluetoothClassic.requestBluetoothEnabled();
                }
                setIsBluetoothOn(true);
            } catch (error) {
                setIsBluetoothOn(false);
                Alert.alert('Bluetooth Enable Failed', 'Please enable Bluetooth in system settings.');
            }
        } else {
            Alert.alert(
                'Disable Bluetooth',
                'Cannot disable from app. Use system settings.',
                [{ text: 'OK', onPress: () => setIsBluetoothOn(true) }]
            );
        }
    };

    const ActionButton = ({
        icon,
        text,
        iconColor,
        onPress,
    }: {
        icon: string;
        text: string;
        iconColor: any;
        onPress: () => void;
    }) => (
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
            <Text style={[styles.actionIcon, iconColor]}>{icon}</Text>
            <Text style={styles.actionText}>{text}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.bluetoothSection}>
                    <View style={styles.bluetoothCircle}>
                        <Text style={styles.bluetoothIcon}>🔷</Text>
                    </View>
                    <Text style={styles.bluetoothStatus}>
                        {isBluetoothOn ? 'Bluetooth Enabled' : 'Bluetooth Disabled'}
                    </Text>
                    <View style={styles.bluetoothToggle}>
                        <Text style={styles.bluetoothToggleText}>
                            {isBluetoothOn ? 'Bluetooth On' : 'Turn On Bluetooth'}
                        </Text>
                        <Switch
                            trackColor={{ false: theme.switchTrackFalse, true: theme.switchTrackTrue }}
                            thumbColor={theme.switchThumb}
                            ios_backgroundColor={theme.switchTrackFalse}
                            onValueChange={handleBluetoothToggle}
                            value={isBluetoothOn}
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
                        />
                        <ActionButton
                            icon="📱"
                            text="Paired Devices"
                            iconColor={styles.pairedDevicesIcon}
                            onPress={() => console.log('Paired devices pressed')}
                        />
                    </View>
                    <View style={styles.gridRow}>
                        <ActionButton
                            icon="⚙️"
                            text="Settings"
                            iconColor={styles.settingsIcon}
                            onPress={() => console.log('Settings pressed')}
                        />
                        <ActionButton
                            icon="ℹ️"
                            text="Device Info"
                            iconColor={styles.deviceInfoIcon}
                            onPress={() => console.log('Device Info pressed')}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;