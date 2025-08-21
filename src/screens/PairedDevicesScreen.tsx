import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform,
    NativeEventSubscription,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
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

type PairedDevicesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PairedDevices'>;

const PairedDevicesScreen = ({ navigation }: { navigation: PairedDevicesScreenNavigationProp }) => {
    const { theme } = useTheme();
    const [pairedDevices, setPairedDevices] = useState<CommonDevice[]>([]);
    const [isLoadingPaired, setIsLoadingPaired] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            refreshButton: {
                marginTop: 10,
                padding: 10,
                backgroundColor: theme.primary,
                borderRadius: 6,
                alignItems: 'center',
            },
            refreshText: {
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '600',
            },
        })
    );

    const loadPairedDevices = async () => {
        if (Platform.OS !== 'android') {
            setPairedDevices([]);
            setIsLoadingPaired(false);
            setError('Paired devices not supported on iOS.');
            return;
        }
        setIsLoadingPaired(true);
        setError(null);
        setPairedDevices([]);
        try {
            const bondedDevices = await RNBluetoothClassic.getBondedDevices();
            const formattedDevices: CommonDevice[] = bondedDevices
                .filter((d: BluetoothDevice) => d.bonded)
                .map((d: BluetoothDevice) => ({
                    id: d.address,
                    name: d.name || null,
                    rssi: undefined,
                    type: d.type === 'LOW_ENERGY' ? 'BLE' : d.type === 'DUAL' ? 'Dual' : 'Classic',
                } as CommonDevice))
                .sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
            setPairedDevices(formattedDevices);
        } catch (error) {
            setError('Failed to load paired devices.');
        } finally {
            setIsLoadingPaired(false);
        }
    };

    useEffect(() => {
        loadPairedDevices();

        let pairedSubscription: NativeEventSubscription | undefined;
        let unpairedSubscription: NativeEventSubscription | undefined;
        if (Platform.OS === 'android') {
            pairedSubscription = RNBluetoothClassic.onDevicePaired(() => loadPairedDevices());
            unpairedSubscription = RNBluetoothClassic.onDeviceUnpaired(() => loadPairedDevices());
        }

        return () => {
            if (Platform.OS === 'android') {
                pairedSubscription?.remove();
                unpairedSubscription?.remove();
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
                        Paired Devices ({pairedDevices.length})
                    </Text>
                    <TouchableOpacity style={styles.refreshButton} onPress={loadPairedDevices}>
                        <Text style={styles.refreshText}>Refresh</Text>
                    </TouchableOpacity>
                    {isLoadingPaired && <Text style={{ color: theme.textSecondary }}>Loading paired devices...</Text>}
                    {!isLoadingPaired && pairedDevices.length === 0 ? (
                        <Text style={{ color: theme.textSecondary }}>
                            {Platform.OS === 'ios' ? 'Paired devices not supported on iOS.' : 'No paired devices found.'}
                        </Text>
                    ) : (
                        !isLoadingPaired &&
                        pairedDevices.map((device) => (
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
                    {error && <Text style={{ color: theme.textSecondary }}>{error}</Text>}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PairedDevicesScreen;