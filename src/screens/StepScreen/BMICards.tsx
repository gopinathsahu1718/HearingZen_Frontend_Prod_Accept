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
import { useTheme } from '../../contexts/ThemeContext';

type RootStackParamList = {
    BMIResult: { bmi: string };
    Nutrition: undefined;
    // add other screens if needed
};

const screenWidth = Dimensions.get('window').width;

export default function BMICards() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { theme, isDarkMode } = useTheme();
    const [bmi, setBmi] = useState<string | null>(null);
    const [status, setStatus] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male');

    // Validation error states
    const [errors, setErrors] = useState({
        age: '',
        weight: '',
        height: '',
    });

    // Handle back button press
    useEffect(() => {
        const backAction = () => {
            if (modalVisible) {
                closeModal();
                return true; // Prevent default back action
            }
            return false; // Allow default back action
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, [modalVisible]);

    // Clear all errors
    const clearErrors = () => {
        setErrors({
            age: '',
            weight: '',
            height: '',
        });
    };

    // Validate individual fields
    const validateAge = ageValue => {
        const ageNum = parseFloat(ageValue);
        if (!ageValue.trim()) {
            return 'Age is required';
        }
        if (isNaN(ageNum)) {
            return 'Please enter a valid age';
        }
        if (ageNum < 2) {
            return 'Age must be at least 2 years';
        }
        if (ageNum > 120) {
            return 'Age must be less than 120 years';
        }
        return '';
    };

    const validateWeight = weightValue => {
        const weightNum = parseFloat(weightValue);
        if (!weightValue.trim()) {
            return 'Weight is required';
        }
        if (isNaN(weightNum)) {
            return 'Please enter a valid weight';
        }
        if (weightNum < 10) {
            return 'Weight must be at least 10 kg';
        }
        if (weightNum > 500) {
            return 'Weight must be less than 500 kg';
        }
        return '';
    };

    const validateHeight = heightValue => {
        const heightNum = parseFloat(heightValue);
        if (!heightValue.trim()) {
            return 'Height is required';
        }
        if (isNaN(heightNum)) {
            return 'Please enter a valid height';
        }
        if (heightNum < 50) {
            return 'Height must be at least 50 cm';
        }
        if (heightNum > 250) {
            return 'Height must be less than 250 cm';
        }
        return '';
    };

    // Handle input changes with real-time validation
    const handleAgeChange = value => {
        setAge(value);
        const error = validateAge(value);
        setErrors(prev => ({ ...prev, age: error }));
    };

    const handleWeightChange = value => {
        setWeight(value);
        const error = validateWeight(value);
        setErrors(prev => ({ ...prev, weight: error }));
    };

    const handleHeightChange = value => {
        setHeight(value);
        const error = validateHeight(value);
        setErrors(prev => ({ ...prev, height: error }));
    };

    const calculateBMI = () => {
        // Clear previous errors
        clearErrors();

        // Validate all fields
        const ageError = validateAge(age);
        const weightError = validateWeight(weight);
        const heightError = validateHeight(height);

        // Update errors state
        const newErrors = {
            age: ageError,
            weight: weightError,
            height: heightError,
        };
        setErrors(newErrors);

        // Check if there are any errors
        const hasErrors = ageError || weightError || heightError;

        if (hasErrors) {
            // Show generic validation alert prompting the user to fill required fields
            Alert.alert(
                'Validation Error',
                'Please fill out all the mandatory fields',
                [{ text: 'OK' }],
            );
            return;
        }

        // Additional BMI calculation validation
        const heightInMeters = parseFloat(height) / 100;
        const weightNum = parseFloat(weight);
        const bmiValue = weightNum / (heightInMeters * heightInMeters);

        // Check for unrealistic BMI values
        if (bmiValue < 10 || bmiValue > 100) {
            Alert.alert(
                'Unrealistic BMI',
                'The calculated BMI seems unrealistic. Please check your height and weight values.',
                [{ text: 'OK' }],
            );
            return;
        }

        const rounded = bmiValue.toFixed(2);
        setBmi(rounded);

        // Determine BMI status
        let statusText = '';
        if (bmiValue < 18.5) {
            statusText = 'Underweight';
        } else if (bmiValue >= 18.5 && bmiValue < 24.9) {
            statusText = 'Normal';
        } else if (bmiValue >= 25 && bmiValue < 29.9) {
            statusText = 'Overweight';
        } else {
            statusText = 'Obese';
        }
        setStatus(statusText);

        setModalVisible(false);
        navigation.navigate('BMIResult', { bmi: rounded });

        // Clear form after successful calculation
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
            {/* BMI Report Card */}
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.cardBackground }]}
                onPress={() => setModalVisible(true)}
            >
                <View style={styles.cardContent}>
                    <Image
                        source={require('../../assets/icons/man.png')}
                        style={styles.icon}
                    />
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>BMI</Text>
                    </View>
                </View>
                <Image
                    source={require('../../assets/icons/arrow-right.png')}
                    style={[styles.arrow, { tintColor: theme.iconTint }]}
                />
            </TouchableOpacity>

            {/* Balanced Nutrition Card */}
            <TouchableOpacity
                onPress={() => navigation.navigate('Nutrition')}
                style={[styles.card, { backgroundColor: theme.cardBackground }]}
            >
                <View style={styles.cardContent}>
                    <Image
                        source={require('../../assets/icons/diet.png')}
                        style={styles.icon}
                    />
                    <Text style={[styles.title, { color: theme.text }]}>Nutrition</Text>
                </View>
                <Image
                    source={require('../../assets/icons/arrow-right.png')}
                    style={[styles.arrow, { tintColor: theme.iconTint }]}
                />
            </TouchableOpacity>

            {/* BMI Modal with Validation */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View
                    style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}
                >
                    <View
                        style={[
                            styles.metricBox,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={[styles.metricTitle, { color: theme.text }]}>
                                BMI Calculator
                            </Text>
                            <TouchableOpacity
                                onPress={closeModal}
                                style={[
                                    styles.closeButton,
                                    { backgroundColor: theme.deleteText },
                                ]}
                            >
                                <Text
                                    style={[styles.closeButtonText, { color: theme.surface }]}
                                >
                                    ✕
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Age */}
                        <View style={styles.fieldRow}>
                            <Text style={[styles.label, { color: theme.text }]}>Age *</Text>
                            <TextInput
                                style={[
                                    styles.fieldInput,
                                    {
                                        backgroundColor: theme.cardBackground,
                                        color: theme.text,
                                        borderColor: errors.age ? theme.deleteText : theme.border,
                                    },
                                    errors.age && styles.fieldError,
                                ]}
                                placeholder="25"
                                placeholderTextColor={theme.textSecondary}
                                keyboardType="numeric"
                                value={age}
                                onChangeText={handleAgeChange}
                                maxLength={3}
                            />
                            <Text style={styles.unitText}>years</Text>
                        </View>
                        {errors.age ? (
                            <Text style={styles.errorText}>{errors.age}</Text>
                        ) : null}

                        {/* Gender */}
                        <View style={styles.fieldRow}>
                            <Text style={[styles.label, { color: theme.text }]}>Gender</Text>
                            <View style={styles.radioRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.radioButton,
                                        {
                                            backgroundColor: theme.cardBackground,
                                            borderColor: theme.border,
                                        },
                                        gender === 'male' && styles.radioSelected,
                                    ]}
                                    onPress={() => setGender('male')}
                                >
                                    <Text
                                        style={[
                                            styles.radioText,
                                            { color: theme.text },
                                            gender === 'male' && styles.radioTextSelected,
                                            gender === 'male' && { color: theme.surface },
                                        ]}
                                    >
                                        Male
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.radioButton,
                                        {
                                            backgroundColor: theme.cardBackground,
                                            borderColor: theme.border,
                                        },
                                        gender === 'female' && styles.radioSelected,
                                    ]}
                                    onPress={() => setGender('female')}
                                >
                                    <Text
                                        style={[
                                            styles.radioText,
                                            { color: theme.text },
                                            gender === 'female' && styles.radioTextSelected,
                                            gender === 'female' && { color: theme.surface },
                                        ]}
                                    >
                                        Female
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Height */}
                        <View style={styles.fieldRow}>
                            <Text style={[styles.label, { color: theme.text }]}>
                                Height *
                            </Text>
                            <TextInput
                                style={[
                                    styles.fieldInput,
                                    {
                                        backgroundColor: theme.cardBackground,
                                        color: theme.text,
                                        borderColor: errors.height
                                            ? theme.deleteText
                                            : theme.border,
                                    },
                                    errors.height && styles.fieldError,
                                ]}
                                placeholder="180.5"
                                placeholderTextColor={theme.textSecondary}
                                keyboardType="decimal-pad"
                                value={height}
                                onChangeText={handleHeightChange}
                                maxLength={6}
                            />
                            <Text style={styles.unitText}>cm</Text>
                        </View>
                        {errors.height ? (
                            <Text style={styles.errorText}>{errors.height}</Text>
                        ) : null}

                        {/* Weight */}
                        <View style={styles.fieldRow}>
                            <Text style={[styles.label, { color: theme.text }]}>
                                Weight *
                            </Text>
                            <TextInput
                                style={[
                                    styles.fieldInput,
                                    {
                                        backgroundColor: theme.cardBackground,
                                        color: theme.text,
                                        borderColor: errors.weight
                                            ? theme.deleteText
                                            : theme.border,
                                    },
                                    errors.weight && styles.fieldError,
                                ]}
                                placeholder="65.2"
                                placeholderTextColor={theme.textSecondary}
                                keyboardType="decimal-pad"
                                value={weight}
                                onChangeText={handleWeightChange}
                                maxLength={6}
                            />
                            <Text style={styles.unitText}>kg</Text>
                        </View>
                        {errors.weight ? (
                            <Text style={styles.errorText}>{errors.weight}</Text>
                        ) : null}

                        {/* Helper Text */}
                        <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                            * Required fields. BMI = Weight (kg) / Height² (m)
                        </Text>

                        {/* Buttons */}
                        <View style={styles.btnRow}>
                            <TouchableOpacity
                                style={[styles.calcBtn, { backgroundColor: theme.primary }]}
                                onPress={calculateBMI}
                            >
                                <Text style={[styles.btnText, { color: theme.surface }]}>
                                    Calculate BMI
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.clearBtn,
                                    {
                                        backgroundColor: isDarkMode ? '#444' : theme.cardBackground,
                                    },
                                ]}
                                onPress={clearForm}
                            >
                                <Text style={[styles.clearText, { color: theme.text }]}>
                                    Clear All
                                </Text>
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
        marginTop: 10,
        flexWrap: 'nowrap', // ensure buttons stay side by side
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
        backgroundColor: '#d30f0fff',
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
