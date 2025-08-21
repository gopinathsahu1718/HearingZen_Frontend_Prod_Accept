import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    TextInput,
    Alert,
    BackHandler,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    BMIResult: { bmi: string };
    Nutrition: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const screenWidth = Dimensions.get('window').width;

export default function BMICards() {
    const navigation = useNavigation<NavigationProp>();

    const [bmi, setBmi] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [weight, setWeight] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [gender, setGender] = useState<'male' | 'female'>('male');

    const [errors, setErrors] = useState<{
        age: string;
        weight: string;
        height: string;
    }>({
        age: '',
        weight: '',
        height: '',
    });

    useEffect(() => {
        const backAction = () => {
            if (modalVisible) {
                closeModal();
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [modalVisible]);

    const clearErrors = () => {
        setErrors({
            age: '',
            weight: '',
            height: '',
        });
    };

    const validateAge = (ageValue: string): string => {
        const ageNum = parseFloat(ageValue);
        if (!ageValue.trim()) return 'Age is required';
        if (isNaN(ageNum)) return 'Please enter a valid age';
        if (ageNum < 2) return 'Age must be at least 2 years';
        if (ageNum > 120) return 'Age must be less than 120 years';
        return '';
    };

    const validateWeight = (weightValue: string): string => {
        const weightNum = parseFloat(weightValue);
        if (!weightValue.trim()) return 'Weight is required';
        if (isNaN(weightNum)) return 'Please enter a valid weight';
        if (weightNum < 10) return 'Weight must be at least 10 kg';
        if (weightNum > 500) return 'Weight must be less than 500 kg';
        return '';
    };

    const validateHeight = (heightValue: string): string => {
        const heightNum = parseFloat(heightValue);
        if (!heightValue.trim()) return 'Height is required';
        if (isNaN(heightNum)) return 'Please enter a valid height';
        if (heightNum < 50) return 'Height must be at least 50 cm';
        if (heightNum > 250) return 'Height must be less than 250 cm';
        return '';
    };

    const handleAgeChange = (value: string) => {
        setAge(value);
        const error = validateAge(value);
        setErrors(prev => ({ ...prev, age: error }));
    };

    const handleWeightChange = (value: string) => {
        setWeight(value);
        const error = validateWeight(value);
        setErrors(prev => ({ ...prev, weight: error }));
    };

    const handleHeightChange = (value: string) => {
        setHeight(value);
        const error = validateHeight(value);
        setErrors(prev => ({ ...prev, height: error }));
    };

    const calculateBMI = () => {
        clearErrors();

        const ageError = validateAge(age);
        const weightError = validateWeight(weight);
        const heightError = validateHeight(height);

        const newErrors = {
            age: ageError,
            weight: weightError,
            height: heightError,
        };
        setErrors(newErrors);

        if (ageError || weightError || heightError) {
            const firstError = ageError || weightError || heightError;
            Alert.alert('Validation Error', firstError, [{ text: 'OK' }]);
            return;
        }

        const heightInMeters = parseFloat(height) / 100;
        const weightNum = parseFloat(weight);
        const bmiValue = weightNum / (heightInMeters * heightInMeters);

        if (bmiValue < 10 || bmiValue > 100) {
            Alert.alert(
                'Unrealistic BMI',
                'The calculated BMI seems unrealistic. Please check your height and weight values.',
                [{ text: 'OK' }]
            );
            return;
        }

        const rounded = bmiValue.toFixed(2);
        setBmi(rounded);

        let statusText = '';
        if (bmiValue < 18.5) statusText = 'Underweight';
        else if (bmiValue < 24.9) statusText = 'Normal';
        else if (bmiValue < 29.9) statusText = 'Overweight';
        else statusText = 'Obese';

        setStatus(statusText);
        setModalVisible(false);
        navigation.navigate('BMIResult', { bmi: rounded });
        clearForm();
    };

    const clearForm = () => {
        setWeight('');
        setHeight('');
        setAge('');
        setGender('male');
        clearErrors();
    };

    const closeModal = () => {
        setModalVisible(false);
        clearErrors();
    };

    return (
        <View style={styles.container}>
            {/* BMI Card */}
            <TouchableOpacity style={styles.card} onPress={() => setModalVisible(true)}>
                <View style={styles.cardContent}>
                    <Image
                        source={require('../../assets/stepIcons/man.png')}
                        style={styles.icon}
                    />
                    <View>
                        <Text style={styles.title}>BMI</Text>
                        {bmi && (
                            <Text
                                style={[
                                    styles.bmiValue,
                                    status === 'Normal' && styles.greenText,
                                ]}
                            >
                                {bmi} ({status})
                            </Text>
                        )}
                    </View>
                </View>
                <Image
                    source={require('../../assets/stepIcons/arrow-right.png')}
                    style={styles.arrow}
                />
            </TouchableOpacity>

            {/* Nutrition Card */}
            <TouchableOpacity onPress={() => navigation.navigate('Nutrition')} style={styles.card}>
                <View style={styles.cardContent}>
                    <Image
                        source={require('../../assets/stepIcons/diet.png')}
                        style={styles.icon}
                    />
                    <Text style={styles.title}>Nutrition</Text>
                </View>
                <Image
                    source={require('../../assets/stepIcons/arrow-right.png')}
                    style={styles.arrow}
                />
            </TouchableOpacity>

            {/* Modal for BMI input */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.metricBox}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.metricTitle}>BMI Calculator</Text>
                            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Age Input */}
                        <View style={styles.fieldRow}>
                            <Text style={styles.label}>Age *</Text>
                            <TextInput
                                style={[styles.fieldInput, errors.age && styles.fieldError]}
                                placeholder="25"
                                placeholderTextColor="#888"
                                keyboardType="numeric"
                                value={age}
                                onChangeText={handleAgeChange}
                                maxLength={3}
                            />
                            <Text style={styles.unitText}>years</Text>
                        </View>
                        {errors.age ? <Text style={styles.errorText}>{errors.age}</Text> : null}

                        {/* Gender Selector */}
                        <View style={styles.fieldRow}>
                            <Text style={styles.label}>Gender</Text>
                            <View style={styles.radioRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.radioButton,
                                        gender === 'male' && styles.radioSelected,
                                    ]}
                                    onPress={() => setGender('male')}
                                >
                                    <Text
                                        style={[
                                            styles.radioText,
                                            gender === 'male' && styles.radioTextSelected,
                                        ]}
                                    >
                                        Male
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.radioButton,
                                        gender === 'female' && styles.radioSelected,
                                    ]}
                                    onPress={() => setGender('female')}
                                >
                                    <Text
                                        style={[
                                            styles.radioText,
                                            gender === 'female' && styles.radioTextSelected,
                                        ]}
                                    >
                                        Female
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Height Input */}
                        <View style={styles.fieldRow}>
                            <Text style={styles.label}>Height *</Text>
                            <TextInput
                                style={[styles.fieldInput, errors.height && styles.fieldError]}
                                placeholder="180"
                                placeholderTextColor="#888"
                                keyboardType="numeric"
                                value={height}
                                onChangeText={handleHeightChange}
                                maxLength={3}
                            />
                            <Text style={styles.unitText}>cm</Text>
                        </View>
                        {errors.height ? <Text style={styles.errorText}>{errors.height}</Text> : null}

                        {/* Weight Input */}
                        <View style={styles.fieldRow}>
                            <Text style={styles.label}>Weight *</Text>
                            <TextInput
                                style={[styles.fieldInput, errors.weight && styles.fieldError]}
                                placeholder="65"
                                placeholderTextColor="#888"
                                keyboardType="numeric"
                                value={weight}
                                onChangeText={handleWeightChange}
                                maxLength={3}
                            />
                            <Text style={styles.unitText}>kg</Text>
                        </View>
                        {errors.weight ? <Text style={styles.errorText}>{errors.weight}</Text> : null}

                        <Text style={styles.helperText}>
                            * Required fields. BMI = Weight (kg) / Height² (m)
                        </Text>

                        <View style={styles.btnRow}>
                            <TouchableOpacity style={styles.calcBtn} onPress={calculateBMI}>
                                <Text style={styles.btnText}>Calculate BMI</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.clearBtn} onPress={clearForm}>
                                <Text style={styles.clearText}>Clear All</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginTop: 20,
        flexWrap: 'nowrap',
        width: '100%',
        maxWidth: screenWidth,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#262629',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        flex: 1,
        marginHorizontal: 5,
        marginBottom: 0,
        minWidth: 150,
        maxWidth: screenWidth / 2 - 20,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
    },
    title: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        flexWrap: 'wrap',
        maxWidth: 80,
    },
    icon: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
        marginRight: 8,
    },
    arrow: {
        width: 18,
        height: 18,
        tintColor: '#ccc',
    },
    bmiValue: {
        fontSize: 12,
        color: '#ff4d4d',
        marginTop: 4,
        flexShrink: 1,
    },
    greenText: {
        color: '#4CAF50',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    metricBox: {
        backgroundColor: '#1e1e2d',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    metricTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#d30f0f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        flex: 1,
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    fieldInput: {
        flex: 2,
        backgroundColor: '#262629',
        borderRadius: 5,
        paddingHorizontal: 8,
        height: 40,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#333',
    },
    fieldError: {
        borderColor: '#ff4d4d',
        borderWidth: 1.5,
    },
    errorText: {
        color: '#ff4d4d',
        fontSize: 12,
        marginLeft: 0,
        marginBottom: 8,
        marginTop: -4,
    },
    unitText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#bbb',
        minWidth: 35,
    },
    radioRow: {
        flexDirection: 'row',
        gap: 10,
        flex: 2,
    },
    radioButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#555',
        borderRadius: 5,
        backgroundColor: '#262629',
    },
    radioSelected: {
        backgroundColor: '#00BFFF',
        borderColor: '#00BFFF',
    },
    radioText: {
        color: '#ccc',
        fontSize: 13,
    },
    radioTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    helperText: {
        color: '#888',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 15,
        fontStyle: 'italic',
    },
    btnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    calcBtn: {
        backgroundColor: '#00BFFF',
        padding: 12,
        borderRadius: 5,
        flex: 1,
        marginRight: 8,
    },
    btnText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 14,
    },
    clearBtn: {
        backgroundColor: '#444',
        padding: 12,
        borderRadius: 5,
        flex: 1,
        marginLeft: 8,
    },
    clearText: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#ccc',
        fontSize: 14,
    },
});
