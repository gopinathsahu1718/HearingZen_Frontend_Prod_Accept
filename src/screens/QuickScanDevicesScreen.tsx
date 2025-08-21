import React, { useEffect, useState, useRef } from 'react';
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
import { Buffer } from 'buffer';

interface UnifiedDevice {
    id: string;
    name: string | null;
    type: 'classic' | 'ble';
    original: ClassicDevice | BleDevice;
}

const CHUNK_SIZE = 256; // Reduced to 256 bytes
const CHUNK_DELAY = 200; // Increased to 200ms
const LARGE_DATA_SIZE = 50 * 1024; // 50KB for testing
const MAX_RETRIES = 3; // Retry failed chunks up to 3 times

const QuickScanDevicesScreen: React.FC = () => {
    const [devices, setDevices] = useState<UnifiedDevice[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<UnifiedDevice | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [receivedData, setReceivedData] = useState<string>('');
    const [testData, setTestData] = useState<string>('Test message');
    const [scanning, setScanning] = useState<boolean>(false);
    const [sending, setSending] = useState<boolean>(false);
    const [sendProgress, setSendProgress] = useState<number>(0);
    const [error, setError] = useState<string>('');
    const bleManager = new BleManager();
    const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const connectionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const readIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        initializeBluetooth();
        return () => {
            cleanup();
        };
    }, []);

    const cleanup = async () => {
        if (selectedDevice) {
            await disconnectDevice();
        }
        bleManager.stopDeviceScan();
        RNBluetoothClassic.cancelDiscovery().catch(() => { });
        bleManager.destroy();
        if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
        if (connectionCheckIntervalRef.current) clearInterval(connectionCheckIntervalRef.current);
        if (readIntervalRef.current) clearInterval(readIntervalRef.current);
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
            console.error('Bluetooth init error:', err);
        }
    };

    const startKeepAlive = (device: UnifiedDevice) => {
        if (device.type === 'classic') {
            keepAliveIntervalRef.current = setInterval(async () => {
                if (sending) return; // Pause keep-alive during data transfer
                try {
                    const classicDev = device.original as ClassicDevice;
                    if (await classicDev.isConnected()) {
                        await classicDev.write('\0');
                        console.log(`Keep-alive sent at ${new Date().toISOString()}`);
                    } else {
                        console.log(`Keep-alive stopped: device disconnected at ${new Date().toISOString()}`);
                        clearInterval(keepAliveIntervalRef.current!);
                        handleUnexpectedDisconnect(device);
                    }
                } catch (err) {
                    console.error(`Keep-alive error at ${new Date().toISOString()}:`, err);
                }
            }, 5000);
        }
    };

    const startConnectionCheck = (device: UnifiedDevice) => {
        connectionCheckIntervalRef.current = setInterval(async () => {
            try {
                if (device.type === 'classic') {
                    const classicDev = device.original as ClassicDevice;
                    const connected = await classicDev.isConnected();
                    if (!connected && isConnected) {
                        console.log(`Connection check: Classic device disconnected at ${new Date().toISOString()}`);
                        clearInterval(connectionCheckIntervalRef.current!);
                        handleUnexpectedDisconnect(device);
                    }
                }
            } catch (err) {
                console.error(`Connection check error at ${new Date().toISOString()}:`, err);
            }
        }, 3000);
    };

    const startReadLoop = (device: UnifiedDevice) => {
        if (device.type === 'classic') {
            readIntervalRef.current = setInterval(async () => {
                try {
                    const classicDev = device.original as ClassicDevice;
                    if (await classicDev.isConnected()) {
                        const data = await classicDev.read();
                        if (data) {
                            console.log(`Read data at ${new Date().toISOString()}:`, data);
                            setReceivedData(prev => prev + data);
                        }
                    } else {
                        clearInterval(readIntervalRef.current!);
                    }
                } catch (err) {
                    console.error(`Read error at ${new Date().toISOString()}:`, err);
                }
            }, 5000); // Read every 5 seconds to keep socket active
        }
    };

    const handleUnexpectedDisconnect = async (device: UnifiedDevice) => {
        setIsConnected(false);
        setSelectedDevice(null);
        setReceivedData('');
        setSending(false);
        setSendProgress(0);
        setError(`Unexpected disconnect from ${device.name || device.id}. Attempting to reconnect...`);
        console.log(`Attempting reconnection to ${device.name || device.id} at ${new Date().toISOString()}`);
        try {
            await connectToDevice(device);
            Alert.alert('Reconnected', `Reconnected to ${device.name || device.id}.`);
        } catch (err) {
            setError(`Failed to reconnect to ${device.name || device.id}.`);
            console.error(`Reconnection error at ${new Date().toISOString()}:`, err);
            Alert.alert('Reconnection Failed', `Could not reconnect to ${device.name || device.id}.`);
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

            setTimeout(() => {
                bleManager.stopDeviceScan();
                setScanning(false);
                if (devices.length === 0) {
                    setError('No devices found. Ensure devices are discoverable.');
                }
            }, 10000);
        } catch (err) {
            setError('Failed to scan devices.');
            console.error(`Scan error at ${new Date().toISOString()}:`, err);
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
                await classicDev.connect({ timeout: 0 });
                setSelectedDevice(device);
                setIsConnected(true);
                startKeepAlive(device);
                startConnectionCheck(device);
                startReadLoop(device); // Start read loop to keep socket active

                const subscription = classicDev.onDataReceived((data) => {
                    setReceivedData(prev => prev + data.data);
                    console.log(`Data received at ${new Date().toISOString()}:`, data.data);
                });
            } else if (device.type === 'ble') {
                const bleDev = device.original as BleDevice;
                await bleManager.connectToDevice(bleDev.id, { autoConnect: true, timeout: 60000 });
                await bleDev.discoverAllServicesAndCharacteristics();
                setSelectedDevice(device);
                setIsConnected(true);

                bleDev.onDisconnected((err, disconnectedDevice) => {
                    if (isConnected) {
                        console.log(`BLE device disconnected at ${new Date().toISOString()}:`, err);
                        handleUnexpectedDisconnect(device);
                    }
                });

                const services = await bleDev.services();
                for (const service of services) {
                    const chars = await bleDev.characteristicsForService(service.uuid);
                    for (const char of chars) {
                        if (char.isNotifiable) {
                            await bleDev.monitorCharacteristicForService(service.uuid, char.uuid, (error, characteristic) => {
                                if (error) {
                                    console.error(`Monitor error at ${new Date().toISOString()}:`, error);
                                    return;
                                }
                                if (characteristic?.value) {
                                    const data = Buffer.from(characteristic.value, 'base64').toString();
                                    setReceivedData(prev => prev + data);
                                    console.log(`BLE data received at ${new Date().toISOString()}:`, data);
                                }
                            });
                            break;
                        }
                    }
                }
            }
        } catch (err) {
            setError(`Failed to connect to ${device.name || device.id}.`);
            console.error(`Connect error at ${new Date().toISOString()}:`, err);
            Alert.alert('Connection Failed', `Could not connect to ${device.name || device.id}.`);
        }
    };

    const sendTestData = async (isLarge: boolean = false) => {
        if (!selectedDevice || !isConnected) {
            setError('No device connected.');
            return;
        }
        setSending(true);
        setSendProgress(0);
        const startTime = Date.now();
        try {
            // Generate large data if requested
            const data = isLarge ? 'A'.repeat(LARGE_DATA_SIZE) : testData;
            const dataBuffer = Buffer.from(data);
            const totalBytes = dataBuffer.length;
            let bytesSent = 0;

            console.log(`Starting transfer: ${totalBytes} bytes at ${new Date().toISOString()}`);

            if (selectedDevice.type === 'classic') {
                const classicDev = selectedDevice.original as ClassicDevice;
                for (let i = 0; i < totalBytes; i += CHUNK_SIZE) {
                    let retries = 0;
                    let success = false;
                    while (retries < MAX_RETRIES && !success) {
                        try {
                            if (!(await classicDev.isConnected())) {
                                throw new Error('Device disconnected during transfer');
                            }
                            const chunk = dataBuffer.subarray(i, Math.min(i + CHUNK_SIZE, totalBytes));
                            await classicDev.write(chunk.toString() + (i + CHUNK_SIZE >= totalBytes ? '\n' : ''));
                            bytesSent += chunk.length;
                            setSendProgress(bytesSent / totalBytes);
                            console.log(`Classic chunk sent: ${bytesSent}/${totalBytes} at ${new Date().toISOString()}`);
                            success = true;
                        } catch (err) {
                            retries++;
                            console.error(`Chunk send error at ${bytesSent}/${totalBytes}, retry ${retries}/${MAX_RETRIES}:`, err);
                            if (retries === MAX_RETRIES) {
                                throw err;
                            }
                            // Attempt to reconnect before retrying
                            try {
                                await connectToDevice(selectedDevice);
                                console.log(`Reconnected for retry at ${new Date().toISOString()}`);
                            } catch (reconnectErr) {
                                if (reconnectErr.message.includes('Already attempting connection')) {
                                    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms and try again
                                } else {
                                    throw reconnectErr;
                                }
                            }
                        }
                    }
                    await new Promise(resolve => setTimeout(resolve, CHUNK_DELAY));
                }
                console.log(`Test data sent to classic device. Duration: ${(Date.now() - startTime) / 1000}s` + testData);
            } else if (selectedDevice.type === 'ble') {
                const bleDev = selectedDevice.original as BleDevice;
                const services = await bleDev.services();
                let writableCharFound = false;
                for (const service of services) {
                    const chars = await bleDev.characteristicsForService(service.uuid);
                    for (const char of chars) {
                        if (char.isWritableWithResponse || char.isWritableWithoutResponse) {
                            for (let i = 0; i < totalBytes; i += CHUNK_SIZE) {
                                let retries = 0;
                                let success = false;
                                while (retries < MAX_RETRIES && !success) {
                                    try {
                                        if (!(await bleDev.isConnected())) {
                                            throw new Error('Device disconnected during transfer');
                                        }
                                        const chunk = dataBuffer.subarray(i, Math.min(i + CHUNK_SIZE, totalBytes));
                                        const base64Data = chunk.toString('base64');
                                        if (char.isWritableWithResponse) {
                                            await bleDev.writeCharacteristicWithResponseForService(service.uuid, char.uuid, base64Data);
                                        } else {
                                            await bleDev.writeCharacteristicWithoutResponseForService(service.uuid, char.uuid, base64Data);
                                        }
                                        bytesSent += chunk.length;
                                        setSendProgress(bytesSent / totalBytes);
                                        console.log(`BLE chunk sent: ${bytesSent}/${totalBytes} at ${new Date().toISOString()}`);
                                        success = true;
                                    } catch (err) {
                                        retries++;
                                        console.error(`BLE chunk send error at ${bytesSent}/${totalBytes}, retry ${retries}/${MAX_RETRIES}:`, err);
                                        if (retries === MAX_RETRIES) {
                                            throw err;
                                        }
                                        try {
                                            await connectToDevice(selectedDevice);
                                            console.log(`Reconnected for retry at ${new Date().toISOString()}`);
                                        } catch (reconnectErr) {
                                            if (reconnectErr.message.includes('Already attempting connection')) {
                                                await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms and try again
                                            } else {
                                                throw reconnectErr;
                                            }
                                        }
                                    }
                                }
                                await new Promise(resolve => setTimeout(resolve, CHUNK_DELAY));
                            }
                            writableCharFound = true;
                            console.log(`Test data sent to BLE device. Duration: ${(Date.now() - startTime) / 1000}s`);
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
            console.error(`Send error at ${new Date().toISOString()}:`, err);
            Alert.alert('Send Failed', 'Could not send test data.');
        } finally {
            setSending(false);
            setSendProgress(0);
            console.log(`Transfer ended at ${new Date().toISOString()}. Duration: ${(Date.now() - startTime) / 1000}s`);
        }
    };

    const sendLargeTestData = () => sendTestData(true);

    const disconnectDevice = async () => {
        if (selectedDevice) {
            try {
                if (selectedDevice.type === 'classic') {
                    const classicDev = selectedDevice.original as ClassicDevice;
                    await classicDev.disconnect();
                    if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
                    if (connectionCheckIntervalRef.current) clearInterval(connectionCheckIntervalRef.current);
                    if (readIntervalRef.current) clearInterval(readIntervalRef.current);
                } else if (selectedDevice.type === 'ble') {
                    await bleManager.cancelDeviceConnection(selectedDevice.id);
                }
                setIsConnected(false);
                setSelectedDevice(null);
                setReceivedData('');
                setSending(false);
                setSendProgress(0);
                setError('');
                console.log(`Disconnected at ${new Date().toISOString()}`);
            } catch (err) {
                setError('Failed to disconnect.');
                console.error(`Disconnect error at ${new Date().toISOString()}:`, err);
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
                    <Text style={styles.connectedTitle}>
                        Connected to: {selectedDevice.name || selectedDevice.id} ({selectedDevice.type.toUpperCase()})
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={testData}
                        onChangeText={setTestData}
                        placeholder="Enter test data"
                        multiline
                    />
                    <Button title={sending ? 'Sending...' : 'Send Test Data'} onPress={() => sendTestData(false)} disabled={sending} />
                    <Button title={sending ? 'Sending...' : 'Send Large Data (50KB)'} onPress={sendLargeTestData} disabled={sending} />
                    {sending && (
                        <View style={styles.progressContainer}>
                            <View style={[styles.progressBar, { width: `${sendProgress * 100}%` }]} />
                            <Text style={styles.progressText}>{Math.round(sendProgress * 100)}%</Text>
                        </View>
                    )}
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
    deviceItem: {
        padding: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginVertical: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    deviceText: { fontSize: 16, color: '#333' },
    connectedText: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
    connectedContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    connectedTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 5, padding: 10, marginBottom: 10, fontSize: 16, minHeight: 60 },
    receivedText: { fontSize: 14, color: '#333', marginTop: 10 },
    errorText: { fontSize: 14, color: 'red', marginBottom: 10, textAlign: 'center' },
    emptyText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
    loader: { marginVertical: 10 },
    progressContainer: {
        marginVertical: 10,
        height: 20,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#007AFF',
    },
    progressText: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        marginTop: 5,
    },
});

export default QuickScanDevicesScreen;