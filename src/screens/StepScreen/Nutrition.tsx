import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    ScrollView,
    Alert,
} from 'react-native';

// Types
interface UserProfile {
    age: number;
    sex: 'male' | 'female';
    weight: number; // in kg
    height: number; // in cm
    activityLevel: number; // multiplier
}

interface Macronutrients {
    protein: number; // in grams
    carbohydrates: number; // in grams
    fats: number; // in grams
}

interface NutritionData {
    totalCalories: number;
    consumedCalories: number;
    macros: Macronutrients;
    consumedMacros: Macronutrients;
}

interface FoodItem {
    id: string;
    name: string;
    calories: number; // per 100g
    protein: number; // per 100g
    carbs: number; // per 100g
    fats: number; // per 100g
}

const NutritionTracker: React.FC = () => {
    // State
    const [nutritionData, setNutritionData] = useState<NutritionData>({
        totalCalories: 2200,
        consumedCalories: 0,
        macros: { protein: 0, carbohydrates: 0, fats: 0 },
        consumedMacros: { protein: 0, carbohydrates: 0, fats: 0 },
    });

    const [userProfile, setUserProfile] = useState<UserProfile>({
        age: 25,
        sex: 'male',
        weight: 70,
        height: 175,
        activityLevel: 1.55, // Moderately active
    });

    const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
    const [isFoodModalVisible, setIsFoodModalVisible] = useState(false);
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [foodQuantity, setFoodQuantity] = useState('100');

    // Activity level options
    const activityLevels = [
        { label: 'Sedentary (little/no exercise)', value: 1.2 },
        { label: 'Lightly active (light exercise 1-3 days/week)', value: 1.375 },
        {
            label: 'Moderately active (moderate exercise 3-5 days/week)',
            value: 1.55,
        },
        { label: 'Very active (hard exercise 6-7 days a week)', value: 1.725 },
        { label: 'Extra active (very hard exercise, physical job)', value: 1.9 },
    ];

    // Sample food database
    const foodDatabase: FoodItem[] = [
        {
            id: '1',
            name: 'Chicken Breast',
            calories: 165,
            protein: 31,
            carbs: 0,
            fats: 3.6,
        },
        {
            id: '2',
            name: 'Brown Rice',
            calories: 112,
            protein: 2.6,
            carbs: 22,
            fats: 0.9,
        },
        {
            id: '3',
            name: 'Broccoli',
            calories: 25,
            protein: 3,
            carbs: 5,
            fats: 0.3,
        },
        {
            id: '4',
            name: 'Banana',
            calories: 89,
            protein: 1.1,
            carbs: 23,
            fats: 0.3,
        },
        {
            id: '5',
            name: 'Almonds',
            calories: 579,
            protein: 21,
            carbs: 22,
            fats: 50,
        },
        {
            id: '6',
            name: 'Greek Yogurt',
            calories: 59,
            protein: 10,
            carbs: 3.6,
            fats: 0.4,
        },
        { id: '7', name: 'Salmon', calories: 208, protein: 20, carbs: 0, fats: 13 },
        {
            id: '8',
            name: 'Sweet Potato',
            calories: 86,
            protein: 1.6,
            carbs: 20,
            fats: 0.1,
        },
    ];

    // Calculate BMR using Mifflin-St Jeor Equation
    const calculateBMR = (profile: UserProfile): number => {
        const { age, sex, weight, height } = profile;

        if (sex === 'male') {
            return 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            return 10 * weight + 6.25 * height - 5 * age - 161;
        }
    };

    // Calculate TDEE (Total Daily Energy Expenditure)
    const calculateTDEE = (profile: UserProfile): number => {
        const bmr = calculateBMR(profile);
        return Math.round(bmr * profile.activityLevel);
    };

    // Calculate macro percentages
    const calculateMacroPercentages = (
        consumed: Macronutrients,
        totalCalories: number,
    ) => {
        const proteinCals = consumed.protein * 4;
        const carbCals = consumed.carbohydrates * 4;
        const fatCals = consumed.fats * 9;
        const totalConsumed = proteinCals + carbCals + fatCals;

        if (totalConsumed === 0) {
            return { protein: 0, carbs: 0, fats: 0 };
        }

        return {
            protein: Math.round((proteinCals / totalConsumed) * 100),
            carbs: Math.round((carbCals / totalConsumed) * 100),
            fats: Math.round((fatCals / totalConsumed) * 100),
        };
    };

    // Update nutrition data when user profile changes
    useEffect(() => {
        const newTDEE = calculateTDEE(userProfile);
        setNutritionData(prev => ({
            ...prev,
            totalCalories: newTDEE,
            // Calculate recommended macros (example distribution)
            macros: {
                protein: Math.round((newTDEE * 0.3) / 4), // 30% protein
                carbohydrates: Math.round((newTDEE * 0.4) / 4), // 40% carbs
                fats: Math.round((newTDEE * 0.3) / 9), // 30% fats
            },
        }));
    }, [userProfile]);

    // Add food to daily intake
    const addFood = (food: FoodItem, quantity: number) => {
        const multiplier = quantity / 100; // Convert to per-gram basis

        const addedCalories = food.calories * multiplier;
        const addedProtein = food.protein * multiplier;
        const addedCarbs = food.carbs * multiplier;
        const addedFats = food.fats * multiplier;

        setNutritionData(prev => ({
            ...prev,
            consumedCalories: prev.consumedCalories + addedCalories,
            consumedMacros: {
                protein: prev.consumedMacros.protein + addedProtein,
                carbohydrates: prev.consumedMacros.carbohydrates + addedCarbs,
                fats: prev.consumedMacros.fats + addedFats,
            },
        }));

        setIsFoodModalVisible(false);
        setSelectedFood(null);
        setFoodQuantity('100');
    };

    // Reset daily intake
    const resetIntake = () => {
        setNutritionData(prev => ({
            ...prev,
            consumedCalories: 0,
            consumedMacros: { protein: 0, carbohydrates: 0, fats: 0 },
        }));
    };

    // Calculate percentages for display
    const macroPercentages = calculateMacroPercentages(
        nutritionData.consumedMacros,
        nutritionData.consumedCalories,
    );
    const calorieProgress = Math.min(
        (nutritionData.consumedCalories / nutritionData.totalCalories) * 100,
        100,
    );

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Nutrition Tracker</Text>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => setIsProfileModalVisible(true)}
                >
                    <Text style={styles.profileButtonText}>Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Daily Calorie Goal */}
            <View style={styles.calorieCard}>
                <Text style={styles.cardTitle}>Daily Calories</Text>
                <Text style={styles.calorieText}>
                    {Math.round(nutritionData.consumedCalories)} /{' '}
                    {nutritionData.totalCalories} kcal
                </Text>
                <View style={styles.progressBar}>
                    <View
                        style={[styles.progressFill, { width: `${calorieProgress}%` }]}
                    />
                </View>
                <Text style={styles.remainingText}>
                    {nutritionData.totalCalories -
                        Math.round(nutritionData.consumedCalories)}{' '}
                    kcal remaining
                </Text>
            </View>

            {/* Macronutrients */}
            <View style={styles.macroContainer}>
                <Text style={styles.sectionTitle}>Macronutrients</Text>

                {/* Protein */}
                <View style={styles.macroCard}>
                    <View style={styles.macroHeader}>
                        <Text style={styles.macroTitle}>Protein</Text>
                        <Text style={styles.macroPercentage}>
                            {macroPercentages.protein}%
                        </Text>
                    </View>
                    <Text style={styles.macroAmount}>
                        {Math.round(nutritionData.consumedMacros.protein)}g /{' '}
                        {nutritionData.macros.protein}g
                    </Text>
                    <View style={styles.macroProgressBar}>
                        <View
                            style={[
                                styles.macroProgressFill,
                                {
                                    width: `${Math.min(
                                        (nutritionData.consumedMacros.protein /
                                            nutritionData.macros.protein) *
                                        100,
                                        100,
                                    )}%`,
                                    backgroundColor: '#4CAF50',
                                },
                            ]}
                        />
                    </View>
                </View>

                {/* Carbohydrates */}
                <View style={styles.macroCard}>
                    <View style={styles.macroHeader}>
                        <Text style={styles.macroTitle}>Carbohydrates</Text>
                        <Text style={styles.macroPercentage}>
                            {macroPercentages.carbs}%
                        </Text>
                    </View>
                    <Text style={styles.macroAmount}>
                        {Math.round(nutritionData.consumedMacros.carbohydrates)}g /{' '}
                        {nutritionData.macros.carbohydrates}g
                    </Text>
                    <View style={styles.macroProgressBar}>
                        <View
                            style={[
                                styles.macroProgressFill,
                                {
                                    width: `${Math.min(
                                        (nutritionData.consumedMacros.carbohydrates /
                                            nutritionData.macros.carbohydrates) *
                                        100,
                                        100,
                                    )}%`,
                                    backgroundColor: '#FF9800',
                                },
                            ]}
                        />
                    </View>
                </View>

                {/* Fats */}
                <View style={styles.macroCard}>
                    <View style={styles.macroHeader}>
                        <Text style={styles.macroTitle}>Fats</Text>
                        <Text style={styles.macroPercentage}>{macroPercentages.fats}%</Text>
                    </View>
                    <Text style={styles.macroAmount}>
                        {Math.round(nutritionData.consumedMacros.fats)}g /{' '}
                        {nutritionData.macros.fats}g
                    </Text>
                    <View style={styles.macroProgressBar}>
                        <View
                            style={[
                                styles.macroProgressFill,
                                {
                                    width: `${Math.min(
                                        (nutritionData.consumedMacros.fats /
                                            nutritionData.macros.fats) *
                                        100,
                                        100,
                                    )}%`,
                                    backgroundColor: '#2196F3',
                                },
                            ]}
                        />
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.addFoodButton}
                    onPress={() => setIsFoodModalVisible(true)}
                >
                    <Text style={styles.buttonText}>Add Food</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resetButton} onPress={resetIntake}>
                    <Text style={styles.buttonText}>Reset Today</Text>
                </TouchableOpacity>
            </View>

            {/* Profile Modal */}
            <Modal
                visible={isProfileModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsProfileModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>User Profile</Text>

                        <Text style={styles.inputLabel}>Age</Text>
                        <TextInput
                            style={styles.input}
                            value={userProfile.age.toString()}
                            onChangeText={text =>
                                setUserProfile(prev => ({ ...prev, age: parseInt(text) || 0 }))
                            }
                            keyboardType="numeric"
                            placeholder="Age"
                        />

                        <Text style={styles.inputLabel}>Sex</Text>
                        <View style={styles.radioContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.radioButton,
                                    userProfile.sex === 'male' && styles.radioSelected,
                                ]}
                                onPress={() =>
                                    setUserProfile(prev => ({ ...prev, sex: 'male' }))
                                }
                            >
                                <Text
                                    style={[
                                        styles.radioText,
                                        userProfile.sex === 'male' && styles.radioTextSelected,
                                    ]}
                                >
                                    Male
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.radioButton,
                                    userProfile.sex === 'female' && styles.radioSelected,
                                ]}
                                onPress={() =>
                                    setUserProfile(prev => ({ ...prev, sex: 'female' }))
                                }
                            >
                                <Text
                                    style={[
                                        styles.radioText,
                                        userProfile.sex === 'female' && styles.radioTextSelected,
                                    ]}
                                >
                                    Female
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Weight (kg)</Text>
                        <TextInput
                            style={styles.input}
                            value={userProfile.weight.toString()}
                            onChangeText={text =>
                                setUserProfile(prev => ({
                                    ...prev,
                                    weight: parseFloat(text) || 0,
                                }))
                            }
                            keyboardType="numeric"
                            placeholder="Weight in kg"
                        />

                        <Text style={styles.inputLabel}>Height (cm)</Text>
                        <TextInput
                            style={styles.input}
                            value={userProfile.height.toString()}
                            onChangeText={text =>
                                setUserProfile(prev => ({
                                    ...prev,
                                    height: parseFloat(text) || 0,
                                }))
                            }
                            keyboardType="numeric"
                            placeholder="Height in cm"
                        />

                        <Text style={styles.inputLabel}>Activity Level</Text>
                        <View style={styles.radioContainer}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.radioScroll}
                                contentContainerStyle={{ alignItems: 'center' }}
                            >
                                {activityLevels.map((level, idx) => (
                                    <TouchableOpacity
                                        key={level.value}
                                        style={[
                                            styles.radioButton,
                                            userProfile.activityLevel === level.value &&
                                            styles.radioSelected,
                                        ]}
                                        onPress={() =>
                                            setUserProfile(prev => ({
                                                ...prev,
                                                activityLevel: level.value,
                                            }))
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.radioText,
                                                userProfile.activityLevel === level.value &&
                                                styles.radioTextSelected,
                                            ]}
                                        >
                                            {level.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={() => setIsProfileModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Food Selection Modal */}
            <Modal
                visible={isFoodModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsFoodModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Food</Text>

                        {!selectedFood ? (
                            <ScrollView style={styles.foodList}>
                                {foodDatabase.map(food => (
                                    <TouchableOpacity
                                        key={food.id}
                                        style={styles.foodItem}
                                        onPress={() => setSelectedFood(food)}
                                    >
                                        <Text style={styles.foodName}>{food.name}</Text>
                                        <Text style={styles.foodCalories}>
                                            {food.calories} kcal/100g
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        ) : (
                            <View>
                                <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>

                                <Text style={styles.inputLabel}>Quantity (grams)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={foodQuantity}
                                    onChangeText={setFoodQuantity}
                                    keyboardType="numeric"
                                    placeholder="100"
                                />

                                <View style={styles.nutritionPreview}>
                                    <Text style={styles.previewTitle}>
                                        Nutrition (for {foodQuantity}g):
                                    </Text>
                                    <Text style={styles.previewText}>
                                        Calories:{' '}
                                        {Math.round(
                                            (selectedFood.calories *
                                                (parseFloat(foodQuantity) || 0)) /
                                            100,
                                        )}{' '}
                                        kcal
                                    </Text>
                                    <Text style={styles.previewText}>
                                        Protein:{' '}
                                        {Math.round(
                                            (selectedFood.protein * (parseFloat(foodQuantity) || 0)) /
                                            100,
                                        )}
                                        g
                                    </Text>
                                    <Text style={styles.previewText}>
                                        Carbs:{' '}
                                        {Math.round(
                                            (selectedFood.carbs * (parseFloat(foodQuantity) || 0)) /
                                            100,
                                        )}
                                        g
                                    </Text>
                                    <Text style={styles.previewText}>
                                        Fats:{' '}
                                        {Math.round(
                                            (selectedFood.fats * (parseFloat(foodQuantity) || 0)) /
                                            100,
                                        )}
                                        g
                                    </Text>
                                </View>

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() =>
                                            addFood(selectedFood, parseFloat(foodQuantity) || 0)
                                        }
                                    >
                                        <Text style={styles.buttonText}>Add to Intake</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.backButton}
                                        onPress={() => setSelectedFood(null)}
                                    >
                                        <Text style={styles.buttonText}>Back</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {!selectedFood && (
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setIsFoodModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Close</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0e0e0e',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileButton: {
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    profileButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
    calorieCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 10,
    },
    calorieText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#00BFFF',
        marginBottom: 10,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#333',
        borderRadius: 4,
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#00BFFF',
        borderRadius: 4,
    },
    remainingText: {
        fontSize: 14,
        color: '#888',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    macroContainer: {
        marginBottom: 20,
    },
    macroCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    macroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    macroTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    macroPercentage: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#00BFFF',
    },
    macroAmount: {
        fontSize: 14,
        color: '#888',
        marginBottom: 8,
    },
    macroProgressBar: {
        height: 6,
        backgroundColor: '#333',
        borderRadius: 3,
    },
    macroProgressFill: {
        height: '100%',
        borderRadius: 3,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    addFoodButton: {
        backgroundColor: '#00BFFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        marginRight: 8,
    },
    resetButton: {
        backgroundColor: '#ff4444',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        marginLeft: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 20,
        maxHeight: '85%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputLabel: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#262629',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 16,
    },
    radioContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
        maxHeight: 160,
        overflow: 'scroll',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    radioButton: {
        backgroundColor: '#262629',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        marginRight: 12,
        marginBottom: 12,
    },
    radioSelected: {
        backgroundColor: '#00BFFF',
        borderColor: '#00BFFF',
    },
    radioText: {
        color: '#888',
    },
    radioTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    activityContainer: {
        maxHeight: 200,
        marginBottom: -12,
    },
    activityOption: {
        backgroundColor: '#262629',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 8,
    },
    activitySelected: {
        backgroundColor: '#00BFFF',
        borderColor: '#00BFFF',
    },
    activityText: {
        color: '#888',
        fontSize: 13,
        lineHeight: 18,
        flexWrap: 'wrap',
    },
    activityTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    saveButton: {
        backgroundColor: '#00BFFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
    },
    foodList: {
        maxHeight: 300,
        marginBottom: 16,
    },
    radioScroll: {
        marginBottom: 16,
        height: 90,
    },
    foodItem: {
        backgroundColor: '#262629',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 8,
    },
    foodName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    foodCalories: {
        color: '#888',
        fontSize: 14,
    },
    selectedFoodName: {
        color: '#00BFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    nutritionPreview: {
        backgroundColor: '#262629',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    previewTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    previewText: {
        color: '#888',
        fontSize: 14,
        marginBottom: 4,
    },
    addButton: {
        backgroundColor: '#00BFFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        marginRight: 8,
    },
    backButton: {
        backgroundColor: '#666',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        marginLeft: 8,
    },
    closeButton: {
        backgroundColor: '#666',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
});

export default NutritionTracker;
