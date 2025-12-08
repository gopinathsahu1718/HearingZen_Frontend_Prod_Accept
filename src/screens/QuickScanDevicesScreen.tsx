import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    PermissionsAndroid,
    Platform,
    Alert,
    ActivityIndicator,
    ScrollView,
    TextInput,
} from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';

// Initialize BLE Manager
const manager = new BleManager();

interface DeviceInfo extends Device {
    rssi?: number;
}

const QuickScanDevicesScreen: React.FC = () => {
    const [devices, setDevices] = useState<Map<string, DeviceInfo>>(new Map());
    const [scanning, setScanning] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [bleState, setBleState] = useState<State>(State.Unknown);
    const [dataToSend, setDataToSend] = useState('');
    const [receivedData, setReceivedData] = useState<string[]>([]);
    const [connecting, setConnecting] = useState<string | null>(null);

    // Request Bluetooth permissions for Android
    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            if (Platform.Version >= 31) {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ]);
                return (
                    granted['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
                    granted['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
                    granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
                );
            } else {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
        }
        return true;
    };

    // Check Bluetooth state
    useEffect(() => {
        const subscription = manager.onStateChange((state) => {
            setBleState(state);
            if (state === State.PoweredOn) {
                console.log('Bluetooth is powered on');
            }
        }, true);

        return () => {
            subscription.remove();
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scanning) {
                manager.stopDeviceScan();
            }
            if (connectedDevice) {
                connectedDevice.cancelConnection();
            }
        };
    }, [scanning, connectedDevice]);

    // Start scanning for devices
    const startScan = useCallback(async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
            Alert.alert('Error', 'Bluetooth permissions are required');
            return;
        }

        if (bleState !== State.PoweredOn) {
            Alert.alert('Error', 'Please turn on Bluetooth');
            return;
        }

        setDevices(new Map());
        setScanning(true);

        manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.error('Scan error:', error);
                setScanning(false);
                Alert.alert('Scan Error', error.message);
                return;
            }

            if (device && device.name) {
                setDevices((prevDevices) => {
                    const newDevices = new Map(prevDevices);
                    newDevices.set(device.id, {
                        ...device,
                        rssi: device.rssi || undefined,
                    });
                    return newDevices;
                });
            }
        });

        // Stop scanning after 10 seconds
        setTimeout(() => {
            stopScan();
        }, 10000);
    }, [bleState]);

    // Stop scanning
    const stopScan = useCallback(() => {
        manager.stopDeviceScan();
        setScanning(false);
    }, []);

    // Connect to device
    const connectToDevice = useCallback(async (device: DeviceInfo) => {
        try {
            setConnecting(device.id);

            // Stop scanning before connecting
            if (scanning) {
                stopScan();
            }

            const connected = await manager.connectToDevice(device.id, {
                autoConnect: false,
            });

            await connected.discoverAllServicesAndCharacteristics();

            setConnectedDevice(connected);
            setConnecting(null);

            Alert.alert('Success', `Connected to ${device.name || 'Unknown Device'}`);

            // Monitor disconnection
            const subscription = connected.onDisconnected((error, disconnectedDevice) => {
                console.log('Device disconnected:', disconnectedDevice?.id);
                setConnectedDevice(null);
                setReceivedData([]);
                Alert.alert('Disconnected', 'Device has been disconnected');
            });

        } catch (error: any) {
            setConnecting(null);
            console.error('Connection error:', error);
            Alert.alert('Connection Error', error.message || 'Failed to connect');
        }
    }, [scanning, stopScan]);

    // Disconnect from device
    const disconnectDevice = useCallback(async () => {
        if (connectedDevice) {
            try {
                await connectedDevice.cancelConnection();
                setConnectedDevice(null);
                setReceivedData([]);
                Alert.alert('Success', 'Disconnected from device');
            } catch (error: any) {
                console.error('Disconnect error:', error);
                Alert.alert('Error', 'Failed to disconnect');
            }
        }
    }, [connectedDevice]);

    // Send data to connected device
    const sendData = useCallback(async () => {
        if (!connectedDevice || !dataToSend.trim()) {
            Alert.alert('Error', 'No device connected or data is empty');
            return;
        }

        try {
            const services = await connectedDevice.services();

            if (services.length === 0) {
                Alert.alert('Error', 'No services found on device');
                return;
            }

            // Get first writable characteristic
            for (const service of services) {
                const characteristics = await service.characteristics();

                for (const char of characteristics) {
                    if (char.isWritableWithResponse || char.isWritableWithoutResponse) {
                        // Convert string to base64
                        const base64Data = Buffer.from(dataToSend).toString('base64');

                        await char.writeWithResponse(base64Data);

                        Alert.alert('Success', 'Data sent successfully');
                        setDataToSend('');
                        return;
                    }
                }
            }

            Alert.alert('Error', 'No writable characteristic found');
        } catch (error: any) {
            console.error('Send data error:', error);
            Alert.alert('Error', error.message || 'Failed to send data');
        }
    }, [connectedDevice, dataToSend]);

    // Monitor incoming data
    useEffect(() => {
        if (!connectedDevice) return;

        let subscription: any;

        const monitorData = async () => {
            try {
                const services = await connectedDevice.services();

                for (const service of services) {
                    const characteristics = await service.characteristics();

                    for (const char of characteristics) {
                        if (char.isNotifiable) {
                            subscription = char.monitor((error, characteristic) => {
                                if (error) {
                                    console.error('Monitor error:', error);
                                    return;
                                }

                                if (characteristic?.value) {
                                    const data = Buffer.from(characteristic.value, 'base64').toString('utf-8');
                                    setReceivedData((prev) => [...prev, data]);
                                }
                            });
                            return;
                        }
                    }
                }
            } catch (error) {
                console.error('Monitor setup error:', error);
            }
        };

        monitorData();

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, [connectedDevice]);

    // Render device item
    const renderDevice = ({ item }: { item: [string, DeviceInfo] }) => {
        const [id, device] = item;
        const isConnecting = connecting === id;
        const isConnected = connectedDevice?.id === id;

        return (
            <TouchableOpacity
                style={[
                    styles.deviceItem,
                    isConnected && styles.connectedDevice,
                ]}
                onPress={() => !isConnected && !isConnecting && connectToDevice(device)}
                disabled={isConnecting || isConnected}
            >
                <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name || 'Unknown Device'}</Text>
                    <Text style={styles.deviceId}>{device.id}</Text>
                    {device.rssi && (
                        <Text style={styles.deviceRssi}>Signal: {device.rssi} dBm</Text>
                    )}
                </View>
                {isConnecting ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                ) : isConnected ? (
                    <Text style={styles.connectedText}>Connected</Text>
                ) : (
                    <Text style={styles.connectText}>Connect</Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Quick Scan Devices</Text>
                <Text style={styles.subtitle}>
                    Bluetooth: {bleState === State.PoweredOn ? 'ON' : 'OFF'}
                </Text>
            </View>

            {/* Scan Controls */}
            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.button, scanning && styles.buttonDisabled]}
                    onPress={startScan}
                    disabled={scanning || bleState !== State.PoweredOn}
                >
                    {scanning ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Start Scan</Text>
                    )}
                </TouchableOpacity>

                {scanning && (
                    <TouchableOpacity
                        style={[styles.button, styles.stopButton]}
                        onPress={stopScan}
                    >
                        <Text style={styles.buttonText}>Stop Scan</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Devices List */}
            <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>
                    Available Devices ({devices.size})
                </Text>
                {devices.size === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            {scanning ? 'Scanning...' : 'No devices found. Start scanning.'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={Array.from(devices)}
                        renderItem={renderDevice}
                        keyExtractor={(item) => item[0]}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </View>

            {/* Connected Device Panel */}
            {connectedDevice && (
                <View style={styles.connectedPanel}>
                    <Text style={styles.sectionTitle}>Connected Device</Text>
                    <View style={styles.connectedInfo}>
                        <Text style={styles.connectedName}>
                            {connectedDevice.name || 'Unknown Device'}
                        </Text>
                        <TouchableOpacity
                            style={styles.disconnectButton}
                            onPress={disconnectDevice}
                        >
                            <Text style={styles.disconnectText}>Disconnect</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Data Transfer */}
                    <View style={styles.dataTransfer}>
                        <Text style={styles.dataTitle}>Send Data</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={dataToSend}
                                onChangeText={setDataToSend}
                                placeholder="Enter data to send"
                                placeholderTextColor="#999"
                            />
                            <TouchableOpacity
                                style={styles.sendButton}
                                onPress={sendData}
                                disabled={!dataToSend.trim()}
                            >
                                <Text style={styles.sendButtonText}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Received Data */}
                    {receivedData.length > 0 && (
                        <View style={styles.receivedData}>
                            <Text style={styles.dataTitle}>Received Data</Text>
                            <ScrollView style={styles.dataScroll}>
                                {receivedData.map((data, index) => (
                                    <Text key={index} style={styles.dataText}>
                                        {index + 1}. {data}
                                    </Text>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#007AFF',
        padding: 20,
        paddingTop: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    controls: {
        flexDirection: 'row',
        padding: 15,
        gap: 10,
    },
    button: {
        flex: 1,
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    stopButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    listContainer: {
        flex: 1,
        padding: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    listContent: {
        paddingBottom: 20,
    },
    deviceItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    connectedDevice: {
        borderColor: '#34C759',
        borderWidth: 2,
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    deviceId: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    deviceRssi: {
        fontSize: 12,
        color: '#999',
    },
    connectText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
    connectedText: {
        color: '#34C759',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    connectedPanel: {
        backgroundColor: '#fff',
        padding: 15,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    connectedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    connectedName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    disconnectButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 6,
    },
    disconnectText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    dataTransfer: {
        marginBottom: 15,
    },
    dataTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 14,
        color: '#333',
    },
    sendButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    receivedData: {
        maxHeight: 150,
    },
    dataScroll: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 10,
    },
    dataText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
    },
});

export default QuickScanDevicesScreen;