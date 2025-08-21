import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Button,
    FlatList,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Platform,
    Alert,
} from 'react-native';
import RNBluetoothClassic, { BluetoothDevice as ClassicDevice } from 'react-native-bluetooth-classic';
import { BleManager, Device as BleDevice } from 'react-native-ble-plx';
import { PermissionsAndroid } from 'react-native';
import { Buffer } from 'buffer'; // For base64 encoding

interface UnifiedDevice {
    id: string;
    name: string | null;
    type: 'classic' | 'ble';
    original: ClassicDevice | BleDevice;
}

const QuickScanDevicesScreen: React.FC = () => {
    const [devices, setDevices] = useState<UnifiedDevice[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<UnifiedDevice | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [receivedData, setReceivedData] = useState<string>('');
    const [testData, setTestData] = useState<string>('Test message');
    const [scanning, setScanning] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const bleManager = new BleManager();

    useEffect(() => {
        initializeBluetooth();
        return () => {
            cleanup();
        };
    }, []);

    const cleanup = async () => {
        if (selectedDevice) {
            disconnectDevice();
        }
        bleManager.stopDeviceScan();
        RNBluetoothClassic.cancelDiscovery().catch(() => { });
        bleManager.destroy();
    };

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            const permissions = [
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
            ];
            const granted = await PermissionsAndroid.requestMultiple(permissions);
            const allGranted = Object.values(granted).every(status => status === PermissionsAndroid.RESULTS.GRANTED);
            if (!allGranted) {
                setError('Bluetooth and location permissions are required.');
                Alert.alert('Permissions Denied', 'Please grant all required permissions.');
                return false;
            }
            return true;
        }
        return true;
    };

    const initializeBluetooth = async () => {
        try {
            const enabled = await RNBluetoothClassic.isBluetoothEnabled();
            if (!enabled) {
                const requested = await RNBluetoothClassic.requestBluetoothEnabled();
                if (!requested) {
                    setError('Bluetooth must be enabled.');
                    Alert.alert('Bluetooth Required', 'Please enable Bluetooth.');
                    return;
                }
            }
            await requestPermissions();
        } catch (err) {
            setError('Failed to initialize Bluetooth.');
            console.error(err);
        }
    };

    const scanDevices = async () => {
        setScanning(true);
        setError('');
        setDevices([]);
        try {
            const hasPermissions = await requestPermissions();
            if (!hasPermissions) return;

            // Scan Classic
            await RNBluetoothClassic.cancelDiscovery();
            const paired = await RNBluetoothClassic.getBondedDevices();
            const classicDevices = paired.map(d => ({ id: d.id, name: d.name, type: 'classic' as const, original: d }));
            setDevices(classicDevices);

            const discoveredClassic = await RNBluetoothClassic.startDiscovery();
            const newClassic = discoveredClassic
                .filter(d => !classicDevices.some(existing => existing.id === d.id))
                .map(d => ({ id: d.id, name: d.name, type: 'classic' as const, original: d }));
            setDevices(prev => [...prev, ...newClassic]);

            // Scan BLE
            bleManager.startDeviceScan(null, null, (scanError, device) => {
                if (scanError) {
                    console.error('BLE scan error:', scanError);
                    return;
                }
                if (device) {
                    setDevices(prev => {
                        if (!prev.some(d => d.id === device.id)) {
                            return [...prev, { id: device.id, name: device.name, type: 'ble' as const, original: device }];
                        }
                        return prev;
                    });
                }
            });

            // Stop BLE scan after 10 seconds
            setTimeout(() => {
                bleManager.stopDeviceScan();
                setScanning(false);
                if (devices.length === 0) {
                    setError('No devices found. Ensure devices are discoverable.');
                }
            }, 10000);
        } catch (err) {
            setError('Failed to scan devices.');
            console.error('Scan error:', err);
            Alert.alert('Scan Failed', 'Could not scan for devices.');
            setScanning(false);
        }
    };

    const connectToDevice = async (device: UnifiedDevice) => {
        setError('');
        try {
            if (device.type === 'classic') {
                const classicDev = device.original as ClassicDevice;
                let connection = await classicDev.isConnected();
                if (connection) {
                    await classicDev.disconnect();
                }
                await classicDev.connect();
                setSelectedDevice(device);
                setIsConnected(true);

                const subscription = classicDev.onDataReceived((data) => {
                    setReceivedData(prev => prev + data.data);
                });
                // Cleanup handled in disconnect
            } else if (device.type === 'ble') {
                const bleDev = device.original as BleDevice;
                await bleManager.connectToDevice(bleDev.id);
                await bleDev.discoverAllServicesAndCharacteristics();
                setSelectedDevice(device);
                setIsConnected(true);

                // For receive, need to monitor a characteristic - assuming we find one later
            }
        } catch (err) {
            setError(`Failed to connect to ${device.name || device.id}.`);
            console.error('Connect error:', err);
            Alert.alert('Connection Failed', `Could not connect to ${device.name || device.id}.`);
        }
    };

    const sendTestData = async () => {
        if (!selectedDevice || !isConnected) {
            setError('No device connected.');
            return;
        }
        try {
            if (selectedDevice.type === 'classic') {
                const classicDev = selectedDevice.original as ClassicDevice;
                await classicDev.write(testData + '\n');
                console.log('Test data sent to classic device.');
            } else if (selectedDevice.type === 'ble') {
                const bleDev = selectedDevice.original as BleDevice;
                const services = await bleDev.services();
                let writableCharFound = false;
                for (const service of services) {
                    const chars = await bleDev.characteristicsForService(service.uuid);
                    for (const char of chars) {
                        if (char.isWritableWithResponse || char.isWritableWithoutResponse) {
                            const base64Data = Buffer.from(testData).toString('base64');
                            if (char.isWritableWithResponse) {
                                await bleDev.writeCharacteristicWithResponseForService(service.uuid, char.uuid, base64Data);
                            } else {
                                await bleDev.writeCharacteristicWithoutResponseForService(service.uuid, char.uuid, base64Data);
                            }
                            writableCharFound = true;
                            console.log('Test data sent to BLE device.');
                            break;
                        }
                    }
                    if (writableCharFound) break;
                }
                if (!writableCharFound) {
                    setError('No writable characteristic found on BLE device.');
                }
            }
        } catch (err) {
            setError('Failed to send test data.');
            console.error('Send error:', err);
            Alert.alert('Send Failed', 'Could not send test data.');
        }
    };

    const disconnectDevice = async () => {
        if (selectedDevice) {
            try {
                if (selectedDevice.type === 'classic') {
                    const classicDev = selectedDevice.original as ClassicDevice;
                    await classicDev.disconnect();
                } else if (selectedDevice.type === 'ble') {
                    await bleManager.cancelDeviceConnection(selectedDevice.id);
                }
                setIsConnected(false);
                setSelectedDevice(null);
                setReceivedData('');
                setError('');
            } catch (err) {
                setError('Failed to disconnect.');
                console.error('Disconnect error:', err);
            }
        }
    };

    const renderDevice = ({ item }: { item: UnifiedDevice }) => (
        <TouchableOpacity style={styles.deviceItem} onPress={() => connectToDevice(item)}>
            <Text style={styles.deviceText}>{item.name || item.id} ({item.type.toUpperCase()})</Text>
            {selectedDevice?.id === item.id && isConnected && <Text style={styles.connectedText}>Connected</Text>}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bluetooth Device Scanner (Classic & BLE)</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Button title={scanning ? 'Scanning...' : 'Scan Devices'} onPress={scanDevices} disabled={scanning} />
            {scanning && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
            <FlatList
                data={devices}
                renderItem={renderDevice}
                keyExtractor={item => item.id}
                ListEmptyComponent={<Text style={styles.emptyText}>No devices found</Text>}
            />
            {isConnected && selectedDevice && (
                <View style={styles.connectedContainer}>
                    <Text style={styles.connectedTitle}>Connected to: {selectedDevice.name || selectedDevice.id} ({selectedDevice.type.toUpperCase()})</Text>
                    <TextInput style={styles.input} value={testData} onChangeText={setTestData} placeholder="Enter test data" />
                    <Button title="Send Test Data" onPress={sendTestData} />
                    <Button title="Disconnect" onPress={disconnectDevice} color="red" />
                    {receivedData ? <Text style={styles.receivedText}>Received: {receivedData}</Text> : null}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    deviceItem: { padding: 15, backgroundColor: '#FFFFFF', borderRadius: 8, marginVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
    deviceText: { fontSize: 16, color: '#333' },
    connectedText: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
    connectedContainer: { marginTop: 20, padding: 15, backgroundColor: '#FFFFFF', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
    connectedTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 5, padding: 10, marginBottom: 10, fontSize: 16 },
    receivedText: { fontSize: 14, color: '#333', marginTop: 10 },
    errorText: { fontSize: 14, color: 'red', marginBottom: 10, textAlign: 'center' },
    emptyText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
    loader: { marginVertical: 10 },
});

export default QuickScanDevicesScreen;