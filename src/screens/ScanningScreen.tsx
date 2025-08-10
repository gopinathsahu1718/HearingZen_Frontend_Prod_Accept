import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    StatusBar,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface BluetoothDevice {
    id: string;
    name: string;
    address: string;
    rssi?: number;
    isConnecting?: boolean;
}

interface ScanningScreenProps {
    navigation?: any;
}

const ScanningScreen: React.FC<ScanningScreenProps> = ({ navigation }) => {
    const { theme } = useTheme();
    const [isScanning, setIsScanning] = useState(true);
    const [availableDevices, setAvailableDevices] = useState<BluetoothDevice[]>([]);
    const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(null);

    // Mock devices that will appear during scanning
    const mockDevices: BluetoothDevice[] = [
        { id: '1', name: 'U-ABCDEFG9', address: '00:1A:2B:3C:4D:5E' },
        { id: '2', name: 'U-ABCDEFG9', address: '00:1A:2B:3C:4D:5F' },
        { id: '3', name: 'Samsung Galaxy', address: '00:1A:2B:3C:4D:60' },
        { id: '4', name: 'iPhone 13', address: '00:1A:2B:3C:4D:61' },
        { id: '5', name: 'Sony WH-1000XM4', address: '00:1A:2B:3C:4D:62' },
    ];

    useEffect(() => {
        // Simulate device discovery
        const scanTimeout = setTimeout(() => {
            setIsScanning(false);
        }, 3000);

        // Add devices gradually
        const deviceTimeouts = mockDevices.map((device, index) => {
            return setTimeout(() => {
                setAvailableDevices(prev => [...prev, device]);
            }, (index + 1) * 800);
        });

        return () => {
            clearTimeout(scanTimeout);
            deviceTimeouts.forEach(timeout => clearTimeout(timeout));
        };
    }, []);

    const handleRefresh = () => {
        setIsScanning(true);
        setAvailableDevices([]);
        setConnectingDeviceId(null);

        // Restart scanning simulation
        setTimeout(() => {
            setIsScanning(false);
            setAvailableDevices(mockDevices);
        }, 2000);
    };

    const handleConnectDevice = (device: BluetoothDevice) => {
        setConnectingDeviceId(device.id);

        // Simulate connection attempt
        setTimeout(() => {
            setConnectingDeviceId(null);
            // Here you would typically show a success message or navigate back
            console.log(`Connected to ${device.name}`);
        }, 2000);
    };

    const renderDeviceItem = ({ item }: { item: BluetoothDevice }) => {
        const isConnecting = connectingDeviceId === item.id;

        return (
            <TouchableOpacity
                style={[styles.deviceItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                onPress={() => handleConnectDevice(item)}
                disabled={isConnecting}
            >
                <View style={styles.deviceInfo}>
                    <View style={[styles.bluetoothIcon, { backgroundColor: theme.primary }]}>
                        <Text style={styles.bluetoothIconText}>📶</Text>
                    </View>
                    <View style={styles.deviceDetails}>
                        <Text style={[styles.deviceName, { color: theme.text }]}>{item.name}</Text>
                        <Text style={[styles.deviceAddress, { color: theme.textSecondary }]}>{item.address}</Text>
                    </View>
                </View>
                <View style={styles.deviceActions}>
                    {isConnecting ? (
                        <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                        <TouchableOpacity
                            style={[styles.pairButton, { backgroundColor: '#ff4444' }]}
                            onPress={() => handleConnectDevice(item)}
                        >
                            <Text style={styles.pairButtonText}>PAIR</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 30,
            paddingBottom: 20,
        },

        headerTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.text,
            flex: 1,
        },
        scanningContainer: {
            alignItems: 'center',
            paddingVertical: 30,
        },
        scanningText: {
            fontSize: 16,
            color: theme.textSecondary,
            marginTop: 10,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 15,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
        },
        refreshButton: {
            padding: 5,
        },
        refreshIcon: {
            fontSize: 18,
            color: theme.primary,
        },
        devicesList: {
            flex: 1,
            paddingHorizontal: 20,
        },
        deviceItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            elevation: 2,
            shadowColor: theme.shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        deviceInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        bluetoothIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 15,
        },
        bluetoothIconText: {
            fontSize: 16,
            color: '#fff',
        },
        deviceDetails: {
            flex: 1,
        },
        deviceName: {
            fontSize: 16,
            fontWeight: '500',
            marginBottom: 4,
        },
        deviceAddress: {
            fontSize: 12,
        },
        deviceActions: {
            alignItems: 'center',
            minWidth: 60,
        },
        pairButton: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 16,
        },
        pairButtonText: {
            color: '#fff',
            fontSize: 12,
            fontWeight: '600',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
        },
        emptyText: {
            fontSize: 16,
            color: theme.textSecondary,
            textAlign: 'center',
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                backgroundColor={theme.background}
                barStyle={theme.background === '#0e0e0e' ? 'light-content' : 'dark-content'}
            />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Scanned Devices</Text>
            </View>

            {/* Scanning Indicator */}
            {isScanning && (
                <View style={styles.scanningContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={styles.scanningText}>Scanning for devices...</Text>
                </View>
            )}

            {/* Available Devices Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Available Devices</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                    <Text style={styles.refreshIcon}>🔄</Text>
                </TouchableOpacity>
            </View>

            {/* Devices List */}
            <View style={styles.devicesList}>
                {availableDevices.length > 0 ? (
                    <FlatList
                        data={availableDevices}
                        keyExtractor={(item) => item.id}
                        renderItem={renderDeviceItem}
                        showsVerticalScrollIndicator={false}
                    />
                ) : !isScanning ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            No devices found. Make sure Bluetooth is enabled and devices are discoverable.
                        </Text>
                    </View>
                ) : null}
            </View>
        </SafeAreaView>
    );
};

export default ScanningScreen;