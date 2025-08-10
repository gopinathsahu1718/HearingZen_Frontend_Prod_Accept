import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    PermissionsAndroid,
    Platform,
    Alert,
    DeviceEventEmitter,
    NativeEventSubscription,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import BleManager, { Peripheral } from 'react-native-ble-manager';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

const { width } = Dimensions.get('window');

interface CommonDevice {
    id: string;
    name: string | null;
    rssi?: number;
    type: 'BLE' | 'Classic' | 'Dual';
}

type QuickScanDevicesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QuickScanDevices'>;

const QuickScanDevicesScreen = ({ navigation }: { navigation: QuickScanDevicesScreenNavigationProp }) => {
    const { theme } = useTheme();
    const [discoveredDevices, setDiscoveredDevices] = useState<CommonDevice[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [isBluetoothOn, setIsBluetoothOn] = useState(false);

    const styles = useThemedStyles((theme) =>
        StyleSheet.create({
            container: {
                flex: 1,
                backgroundColor: theme.background,
            },
            scrollContainer: {
                flexGrow: 1,
                padding: 15,
            },
            devicesSection: { marginTop: 20 },
            deviceItem: {
                padding: 10,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
            },
            deviceText: { color: theme.text },
            scanButton: {
                marginTop: 10,
                padding: 10,
                backgroundColor: theme.primary,
                borderRadius: 6,
                alignItems: 'center',
            },
            stopScanButton: {
                marginTop: 10,
                padding: 10,
                backgroundColor: '#FF4444',
                borderRadius: 6,
                alignItems: 'center',
            },
            buttonText: {
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '600',
            },
        })
    );

    const checkPermissions = async () => {
        if (Platform.OS !== 'android') return true;
        const permissions = [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        return permissions.every((perm) => granted[perm] === PermissionsAndroid.RESULTS.GRANTED);
    };

    useEffect(() => {
        const initializeBluetooth = async () => {
            try {
                await BleManager.start({ showAlert: false });
                BleManager.checkState().then((state) => {
                    setIsBluetoothOn(state === 'on');
                });
            } catch (error) {
                setScanError('Failed to initialize BLE.');
            }

            if (Platform.OS === 'android') {
                try {
                    const classicEnabled = await RNBluetoothClassic.isBluetoothEnabled();
                    setIsBluetoothOn(classicEnabled);
                } catch (error) {
                    setScanError('Failed to initialize Classic Bluetooth.');
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

        return () => {
            bleStateSubscription.remove();
        };
    }, []);

    const startScan = async () => {
        if (!isBluetoothOn) {
            Alert.alert('Bluetooth Off', 'Enable Bluetooth to scan.');
            return;
        }
        if (isScanning) return;
        if (Platform.OS === 'android' && !(await checkPermissions())) {
            Alert.alert('Permissions Denied', 'Grant permissions to scan.');
            return;
        }

        setIsScanning(true);
        setScanError(null);
        setDiscoveredDevices([]);

        try {
            await BleManager.scan([] as string[], 15, true);
        } catch (error) {
            setScanError('Failed to start BLE scan.');
        }

        if (Platform.OS === 'android') {
            try {
                await RNBluetoothClassic.startDiscovery();
            } catch (error) {
                setScanError('Failed to start Classic scan.');
            }
        }

        setTimeout(stopScan, 15000);
    };

    const stopScan = async () => {
        try {
            await BleManager.stopScan();
            if (Platform.OS === 'android') {
                await RNBluetoothClassic.cancelDiscovery();
            }
            setIsScanning(false);
        } catch (error) {
            setScanError('Failed to stop scan.');
            setIsScanning(false);
        }
    };

    useEffect(() => {
        const bleDiscoverSubscription: NativeEventSubscription = DeviceEventEmitter.addListener(
            'BleManagerDiscoverPeripheral',
            (peripheral: Peripheral) => {
                const device: CommonDevice = {
                    id: peripheral.id,
                    name: peripheral.name || null,
                    rssi: peripheral.rssi,
                    type: 'BLE',
                };
                setDiscoveredDevices((prev) => {
                    if (prev.some((d) => d.id === device.id)) return prev;
                    return [...prev, device].sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
                });
            }
        );

        let classicDiscoverSubscription: NativeEventSubscription | undefined;
        let classicEnabledSub: NativeEventSubscription | undefined;
        let classicDisabledSub: NativeEventSubscription | undefined;
        if (Platform.OS === 'android') {
            classicDiscoverSubscription = RNBluetoothClassic.onDeviceDiscovered((event: any) => {
                const device: CommonDevice = {
                    id: event.address,
                    name: event.name || null,
                    rssi: event.extra?.rssi,
                    type: event.type === 'DUAL' ? 'Dual' : 'Classic',
                };
                setDiscoveredDevices((prev) => {
                    if (prev.some((d) => d.id === device.id)) return prev;
                    return [...prev, device].sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
                });
            });

            classicEnabledSub = RNBluetoothClassic.onBluetoothEnabled(() => setIsBluetoothOn(true));
            classicDisabledSub = RNBluetoothClassic.onBluetoothDisabled(() => setIsBluetoothOn(false));
        }

        return () => {
            bleDiscoverSubscription.remove();
            if (Platform.OS === 'android') {
                classicDiscoverSubscription?.remove();
                classicEnabledSub?.remove();
                classicDisabledSub?.remove();
            }
        };
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.devicesSection}>
                    <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                        Available Devices ({discoveredDevices.length})
                    </Text>
                    {!isScanning ? (
                        <TouchableOpacity style={styles.scanButton} onPress={startScan}>
                            <Text style={styles.buttonText}>Start Scan</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.stopScanButton} onPress={stopScan}>
                            <Text style={styles.buttonText}>Stop Scan</Text>
                        </TouchableOpacity>
                    )}
                    {isScanning && <Text style={{ color: theme.textSecondary }}>Scanning...</Text>}
                    {scanError && <Text style={{ color: theme.textSecondary }}>{scanError}</Text>}
                    {!isScanning && discoveredDevices.length === 0 ? (
                        <Text style={{ color: theme.textSecondary }}>
                            No available devices found. Start a scan to discover nearby devices.
                        </Text>
                    ) : (
                        discoveredDevices.map((device) => (
                            <View key={device.id} style={styles.deviceItem}>
                                <Text style={styles.deviceText}>
                                    {device.name || 'Unknown Device'} ({device.id}) - {device.type}
                                </Text>
                                <Text style={styles.deviceText}>
                                    RSSI: {device.rssi || 'N/A'}
                                </Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default QuickScanDevicesScreen;