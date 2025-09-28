import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    ScrollView,
    Alert,
    Dimensions,
    FlatList,
} from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => {
    const value = (percentage * screenWidth) / 100;
    return Math.round(value);
};

const hp = (percentage: number) => {
    const value = (percentage * screenHeight) / 100;
    return Math.round(value);
};

const responsiveSize = (size: number) => {
    return screenWidth * (size / 375); // 375 is iPhone X width baseline
};

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
    quantity?: number; // stored grams for this recent item
    times?: number; // how many times added
}

// Circular Progress Component
const CircularProgress = ({ progress = 0, consumed = 0, total = 2500 }) => {
    const size = Math.min(wp(55), 220); // Responsive size with max limit
    const strokeWidth = responsiveSize(12);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const center = size / 2;

    return (
        <View style={styles.circularProgressContainer}>
            <Svg width={size} height={size}>
                {/* Background circle */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="#333"
                    strokeWidth={strokeWidth}
                />

                {/* Progress circle */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={progress >= 100 ? '#4CAF50' : '#ff3503ff'}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${center} ${center})`}
                />
            </Svg>

            {/* Center text */}
            <View style={styles.circularProgressText}>
                <Text style={styles.circularProgressTitle}>Calories</Text>
                <Text style={styles.circularProgressNumbers}>
                    {Math.round(consumed)}/{total}
                </Text>
                <Text style={styles.circularProgressUnit}>kcal</Text>
                <Text style={styles.circularProgressLabel}>Consumed</Text>
            </View>
        </View>
    );
};

const NutritionTracker: React.FC = () => {
    // State
    const [userProfile, setUserProfile] = useState<UserProfile>({
        age: 0,
        sex: 'male',
        weight: 0,
        height: 0,
        activityLevel: 0, // default to 0 until user sets
    });
    const [nutritionData, setNutritionData] = useState<NutritionData>({
        totalCalories: 0,
        consumedCalories: 0,
        macros: { protein: 0, carbohydrates: 0, fats: 0 },
        consumedMacros: { protein: 0, carbohydrates: 0, fats: 0 },
    });

    const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
    const [isFoodModalVisible, setIsFoodModalVisible] = useState(false);
    const [isRecentFoodModalVisible, setIsRecentFoodModalVisible] =
        useState(false);
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [foodQuantity, setFoodQuantity] = useState('100');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [weightInput, setWeightInput] = useState('0');
    const [heightInput, setHeightInput] = useState('0');
    const [ageInput, setAgeInput] = useState(userProfile.age.toString());
    const [sexInput, setSexInput] = useState<UserProfile['sex']>(userProfile.sex);
    const [activityLevelInput, setActivityLevelInput] = useState<number>(
        userProfile.activityLevel || 0,
    );
    // Load search history from storage on mount
    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem('searchHistory');
            if (saved) {
                setSearchHistory(JSON.parse(saved));
            }
        })();
    }, []);

    // Save search history to storage whenever it changes
    useEffect(() => {
        AsyncStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }, [searchHistory]);
    const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);
    // Load recent foods from storage on mount
    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem('recentFoods');
            if (saved) {
                setRecentFoods(JSON.parse(saved));
            }
        })();
    }, []);

    // Load saved user profile (do not overwrite unless user changes and saves)
    useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem('userProfile');
                if (saved) {
                    const parsed = JSON.parse(saved) as UserProfile;
                    setUserProfile(parsed);
                    // populate form inputs from saved profile
                    setAgeInput(parsed.age.toString());
                    setSexInput(parsed.sex);
                    setWeightInput(parsed.weight.toString());
                    setHeightInput(parsed.height.toString());
                    setActivityLevelInput(parsed.activityLevel || 0);
                }
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    // Save recent foods to storage whenever it changes
    useEffect(() => {
        AsyncStorage.setItem('recentFoods', JSON.stringify(recentFoods));
    }, [recentFoods]);

    // Load nutritionData from storage on mount so consumed macros persist across restarts
    useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem('nutritionData');
                if (saved) {
                    setNutritionData(JSON.parse(saved));
                }
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    // Save nutritionData to storage whenever it changes
    useEffect(() => {
        AsyncStorage.setItem('nutritionData', JSON.stringify(nutritionData));
    }, [nutritionData]);

    // Activity level options
    const activityLevels = [
        { label: 'Sedentary', value: 1.2 },
        { label: 'Lightly active', value: 1.375 },
        {
            label: 'Moderately active',
            value: 1.55,
        },
        { label: 'Very active', value: 1.725 },
        { label: 'Extra active', value: 1.9 },
    ];

    // Sample food database
    const foodDatabase: FoodItem[] = [
        {
            id: '308',
            name: 'Chicken Breast',
            calories: 165,
            protein: 31,
            carbs: 0,
            fats: 3.6,
        },
        {
            id: '307',
            name: 'Brown Rice',
            calories: 112,
            protein: 2.6,
            carbs: 22,
            fats: 0.9,
        },
        {
            id: '306',
            name: 'Broccoli',
            calories: 25,
            protein: 3,
            carbs: 5,
            fats: 0.3,
        },
        {
            id: '305',
            name: 'Banana',
            calories: 89,
            protein: 1.1,
            carbs: 23,
            fats: 0.3,
        },
        {
            id: '304',
            name: 'Almonds',
            calories: 579,
            protein: 21,
            carbs: 22,
            fats: 50,
        },
        {
            id: '302',
            name: 'Greek Yogurt',
            calories: 59,
            protein: 10,
            carbs: 3.6,
            fats: 0.4,
        },
        {
            id: '303',
            name: 'Salmon',
            calories: 208,
            protein: 20,
            carbs: 0,
            fats: 13,
        },
        {
            id: '301',
            name: 'Sweet Potato',
            calories: 86,
            protein: 1.6,
            carbs: 20,
            fats: 0.1,
        },
        {
            id: '1',
            name: 'Basmati Rice',
            calories: 130,
            protein: 2.7,
            carbs: 28,
            fats: 0.3,
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
            name: 'White Rice',
            calories: 130,
            protein: 2.7,
            carbs: 28,
            fats: 0.3,
        },
        {
            id: '4',
            name: 'Wheat Flour (Atta)',
            calories: 340,
            protein: 12,
            carbs: 72,
            fats: 1.7,
        },
        {
            id: '5',
            name: 'Maida (Refined Flour)',
            calories: 341,
            protein: 11,
            carbs: 76,
            fats: 1.2,
        },
        {
            id: '6',
            name: 'Semolina (Sooji)',
            calories: 360,
            protein: 12.7,
            carbs: 73,
            fats: 1.1,
        },
        {
            id: '7',
            name: 'Broken Wheat (Dalia)',
            calories: 342,
            protein: 12,
            carbs: 71,
            fats: 1.8,
        },
        {
            id: '8',
            name: 'Barley (Jau)',
            calories: 123,
            protein: 2.3,
            carbs: 28,
            fats: 0.4,
        },
        { id: '9', name: 'Oats', calories: 68, protein: 2.4, carbs: 12, fats: 1.4 },
        {
            id: '10',
            name: 'Quinoa',
            calories: 120,
            protein: 4.4,
            carbs: 22,
            fats: 1.9,
        },

        // Lentils & Pulses (Dal)
        {
            id: '11',
            name: 'Toor Dal (Pigeon Pea)',
            calories: 343,
            protein: 22,
            carbs: 62,
            fats: 1.5,
        },
        {
            id: '12',
            name: 'Moong Dal (Green Gram)',
            calories: 347,
            protein: 24,
            carbs: 59,
            fats: 1.2,
        },
        {
            id: '13',
            name: 'Chana Dal (Bengal Gram)',
            calories: 364,
            protein: 22,
            carbs: 61,
            fats: 6,
        },
        {
            id: '14',
            name: 'Masoor Dal (Red Lentil)',
            calories: 116,
            protein: 9,
            carbs: 20,
            fats: 0.4,
        },
        {
            id: '15',
            name: 'Urad Dal (Black Gram)',
            calories: 341,
            protein: 25,
            carbs: 58,
            fats: 1.6,
        },
        {
            id: '16',
            name: 'Rajma (Kidney Beans)',
            calories: 127,
            protein: 9,
            carbs: 23,
            fats: 0.5,
        },
        {
            id: '17',
            name: 'Chole (Chickpeas)',
            calories: 164,
            protein: 8.9,
            carbs: 27,
            fats: 2.6,
        },
        {
            id: '18',
            name: 'Black Chana',
            calories: 378,
            protein: 20,
            carbs: 63,
            fats: 6,
        },
        {
            id: '19',
            name: 'Moth Dal',
            calories: 343,
            protein: 23,
            carbs: 61,
            fats: 1.6,
        },
        {
            id: '20',
            name: 'Kulthi Dal (Horse Gram)',
            calories: 321,
            protein: 22,
            carbs: 57,
            fats: 0.6,
        },

        // Vegetables
        {
            id: '21',
            name: 'Potato (Aloo)',
            calories: 77,
            protein: 2,
            carbs: 17,
            fats: 0.1,
        },
        {
            id: '22',
            name: 'Onion (Pyaz)',
            calories: 40,
            protein: 1.1,
            carbs: 9,
            fats: 0.1,
        },
        {
            id: '23',
            name: 'Tomato (Tamatar)',
            calories: 18,
            protein: 0.9,
            carbs: 3.9,
            fats: 0.2,
        },
        {
            id: '24',
            name: 'Cauliflower (Gobi)',
            calories: 25,
            protein: 1.9,
            carbs: 5,
            fats: 0.3,
        },
        {
            id: '25',
            name: 'Cabbage (Patta Gobi)',
            calories: 25,
            protein: 1.3,
            carbs: 6,
            fats: 0.1,
        },
        {
            id: '26',
            name: 'Spinach (Palak)',
            calories: 7,
            protein: 0.9,
            carbs: 1.1,
            fats: 0.1,
        },
        {
            id: '27',
            name: 'Brinjal (Baingan)',
            calories: 24,
            protein: 1,
            carbs: 6,
            fats: 0.2,
        },
        {
            id: '28',
            name: 'Okra (Bhindi)',
            calories: 33,
            protein: 1.9,
            carbs: 7,
            fats: 0.2,
        },
        {
            id: '29',
            name: 'Carrot (Gajar)',
            calories: 25,
            protein: 0.5,
            carbs: 6,
            fats: 0.1,
        },
        {
            id: '30',
            name: 'Beetroot (Chukandar)',
            calories: 44,
            protein: 1.6,
            carbs: 10,
            fats: 0.2,
        },
        {
            id: '31',
            name: 'Bottle Gourd (Lauki)',
            calories: 12,
            protein: 0.6,
            carbs: 2.5,
            fats: 0.1,
        },
        {
            id: '32',
            name: 'Ridge Gourd (Turai)',
            calories: 17,
            protein: 0.6,
            carbs: 4,
            fats: 0.2,
        },
        {
            id: '33',
            name: 'Bitter Gourd (Karela)',
            calories: 17,
            protein: 1,
            carbs: 3.7,
            fats: 0.2,
        },
        {
            id: '34',
            name: 'Snake Gourd (Chichinda)',
            calories: 18,
            protein: 0.5,
            carbs: 4,
            fats: 0.3,
        },
        {
            id: '35',
            name: 'Pumpkin (Kaddu)',
            calories: 19,
            protein: 0.7,
            carbs: 4.6,
            fats: 0.1,
        },
        {
            id: '36',
            name: 'Green Beans (Sem)',
            calories: 31,
            protein: 1.8,
            carbs: 7,
            fats: 0.2,
        },
        {
            id: '37',
            name: 'Peas (Matar)',
            calories: 81,
            protein: 5.4,
            carbs: 14,
            fats: 0.4,
        },
        {
            id: '38',
            name: 'Bell Pepper (Shimla Mirch)',
            calories: 20,
            protein: 1,
            carbs: 5,
            fats: 0.2,
        },
        {
            id: '39',
            name: 'Cucumber (Kheera)',
            calories: 8,
            protein: 0.7,
            carbs: 2,
            fats: 0.1,
        },
        {
            id: '40',
            name: 'Radish (Mooli)',
            calories: 16,
            protein: 0.7,
            carbs: 3.4,
            fats: 0.1,
        },

        // Leafy Vegetables
        {
            id: '41',
            name: 'Methi (Fenugreek Leaves)',
            calories: 49,
            protein: 4.4,
            carbs: 6,
            fats: 0.9,
        },
        {
            id: '42',
            name: 'Coriander (Dhania)',
            calories: 23,
            protein: 2.1,
            carbs: 3.7,
            fats: 0.5,
        },
        {
            id: '43',
            name: 'Mint (Pudina)',
            calories: 44,
            protein: 4.8,
            carbs: 5.3,
            fats: 0.6,
        },
        {
            id: '44',
            name: 'Mustard Greens (Sarson)',
            calories: 27,
            protein: 2.9,
            carbs: 4.7,
            fats: 0.4,
        },
        {
            id: '45',
            name: 'Amaranth Leaves (Chaulai)',
            calories: 23,
            protein: 2.5,
            carbs: 4.6,
            fats: 0.3,
        },
        {
            id: '46',
            name: 'Drumstick Leaves (Moringa)',
            calories: 64,
            protein: 9.4,
            carbs: 8.3,
            fats: 1.4,
        },
        {
            id: '47',
            name: 'Curry Leaves',
            calories: 108,
            protein: 6.1,
            carbs: 18.7,
            fats: 1,
        },

        // Fruits
        {
            id: '48',
            name: 'Mango (Aam)',
            calories: 60,
            protein: 0.8,
            carbs: 15,
            fats: 0.4,
        },
        {
            id: '49',
            name: 'Banana (Kela)',
            calories: 89,
            protein: 1.1,
            carbs: 23,
            fats: 0.3,
        },
        {
            id: '50',
            name: 'Apple (Seb)',
            calories: 52,
            protein: 0.3,
            carbs: 14,
            fats: 0.2,
        },
        {
            id: '51',
            name: 'Orange (Santra)',
            calories: 47,
            protein: 0.9,
            carbs: 12,
            fats: 0.1,
        },
        {
            id: '52',
            name: 'Papaya (Papita)',
            calories: 43,
            protein: 0.5,
            carbs: 11,
            fats: 0.3,
        },
        {
            id: '53',
            name: 'Guava (Amrud)',
            calories: 68,
            protein: 2.6,
            carbs: 14,
            fats: 1,
        },
        {
            id: '54',
            name: 'Pomegranate (Anar)',
            calories: 83,
            protein: 1.7,
            carbs: 19,
            fats: 1.2,
        },
        {
            id: '55',
            name: 'Grapes (Angoor)',
            calories: 62,
            protein: 0.6,
            carbs: 16,
            fats: 0.2,
        },
        {
            id: '56',
            name: 'Watermelon (Tarbooz)',
            calories: 30,
            protein: 0.6,
            carbs: 8,
            fats: 0.2,
        },
        {
            id: '57',
            name: 'Muskmelon (Kharbuja)',
            calories: 34,
            protein: 0.8,
            carbs: 8,
            fats: 0.2,
        },
        {
            id: '58',
            name: 'Pineapple (Ananas)',
            calories: 50,
            protein: 0.5,
            carbs: 13,
            fats: 0.1,
        },
        {
            id: '59',
            name: 'Coconut (Nariyal)',
            calories: 354,
            protein: 3.3,
            carbs: 15,
            fats: 33,
        },
        {
            id: '60',
            name: 'Jackfruit (Kathal)',
            calories: 95,
            protein: 1.7,
            carbs: 23,
            fats: 0.6,
        },
        {
            id: '61',
            name: 'Custard Apple (Sitaphal)',
            calories: 94,
            protein: 2.1,
            carbs: 24,
            fats: 0.6,
        },
        {
            id: '62',
            name: 'Sapota (Chiku)',
            calories: 83,
            protein: 0.4,
            carbs: 20,
            fats: 1.1,
        },

        // Dairy Products
        {
            id: '63',
            name: 'Milk (Full Fat)',
            calories: 61,
            protein: 3.2,
            carbs: 4.8,
            fats: 3.3,
        },
        {
            id: '64',
            name: 'Milk (Toned)',
            calories: 50,
            protein: 3.3,
            carbs: 4.8,
            fats: 2,
        },
        {
            id: '65',
            name: 'Yogurt (Dahi)',
            calories: 59,
            protein: 10,
            carbs: 3.6,
            fats: 0.4,
        },
        {
            id: '66',
            name: 'Paneer',
            calories: 265,
            protein: 18,
            carbs: 1.2,
            fats: 20,
        },
        {
            id: '67',
            name: 'Khoya (Mawa)',
            calories: 421,
            protein: 14,
            carbs: 25,
            fats: 31,
        },
        { id: '68', name: 'Ghee', calories: 900, protein: 0, carbs: 0, fats: 100 },
        {
            id: '69',
            name: 'Butter (Makhan)',
            calories: 717,
            protein: 0.9,
            carbs: 0.1,
            fats: 81,
        },
        {
            id: '70',
            name: 'Cream (Malai)',
            calories: 345,
            protein: 2.1,
            carbs: 2.8,
            fats: 37,
        },
        {
            id: '71',
            name: 'Buttermilk (Chaas)',
            calories: 40,
            protein: 3.3,
            carbs: 4.8,
            fats: 0.9,
        },
        {
            id: '72',
            name: 'Lassi',
            calories: 59,
            protein: 3.2,
            carbs: 4.8,
            fats: 3.3,
        },

        // Spices & Condiments
        {
            id: '73',
            name: 'Turmeric (Haldi)',
            calories: 312,
            protein: 9.7,
            carbs: 67,
            fats: 3.2,
        },
        {
            id: '74',
            name: 'Red Chili Powder',
            calories: 282,
            protein: 13,
            carbs: 57,
            fats: 14,
        },
        {
            id: '75',
            name: 'Coriander Powder (Dhania)',
            calories: 298,
            protein: 12,
            carbs: 55,
            fats: 18,
        },
        {
            id: '76',
            name: 'Cumin Powder (Jeera)',
            calories: 375,
            protein: 18,
            carbs: 44,
            fats: 22,
        },
        {
            id: '77',
            name: 'Garam Masala',
            calories: 379,
            protein: 15,
            carbs: 50,
            fats: 15,
        },
        {
            id: '78',
            name: 'Mustard Seeds (Rai)',
            calories: 508,
            protein: 26,
            carbs: 28,
            fats: 36,
        },
        {
            id: '79',
            name: 'Fenugreek Seeds (Methi)',
            calories: 323,
            protein: 23,
            carbs: 58,
            fats: 6.4,
        },
        {
            id: '80',
            name: 'Cardamom (Elaichi)',
            calories: 311,
            protein: 11,
            carbs: 68,
            fats: 6.7,
        },
        {
            id: '81',
            name: 'Cinnamon (Dalchini)',
            calories: 247,
            protein: 4,
            carbs: 81,
            fats: 1.2,
        },
        {
            id: '82',
            name: 'Cloves (Laung)',
            calories: 274,
            protein: 6,
            carbs: 65,
            fats: 13,
        },
        {
            id: '83',
            name: 'Black Pepper (Kali Mirch)',
            calories: 251,
            protein: 10,
            carbs: 64,
            fats: 3.3,
        },
        {
            id: '84',
            name: 'Asafoetida (Hing)',
            calories: 297,
            protein: 4,
            carbs: 68,
            fats: 1.1,
        },
        {
            id: '85',
            name: 'Ginger (Adrak)',
            calories: 80,
            protein: 1.8,
            carbs: 18,
            fats: 0.8,
        },
        {
            id: '86',
            name: 'Garlic (Lahsun)',
            calories: 149,
            protein: 6.4,
            carbs: 33,
            fats: 0.5,
        },
        {
            id: '87',
            name: 'Green Chilies',
            calories: 23,
            protein: 2,
            carbs: 4,
            fats: 0.2,
        },

        // Oils
        {
            id: '88',
            name: 'Mustard Oil',
            calories: 884,
            protein: 0,
            carbs: 0,
            fats: 100,
        },
        {
            id: '89',
            name: 'Coconut Oil',
            calories: 862,
            protein: 0,
            carbs: 0,
            fats: 100,
        },
        {
            id: '90',
            name: 'Sunflower Oil',
            calories: 884,
            protein: 0,
            carbs: 0,
            fats: 100,
        },
        {
            id: '91',
            name: 'Groundnut Oil',
            calories: 884,
            protein: 0,
            carbs: 0,
            fats: 100,
        },
        {
            id: '92',
            name: 'Sesame Oil (Til)',
            calories: 884,
            protein: 0,
            carbs: 0,
            fats: 100,
        },

        // Nuts & Seeds
        {
            id: '93',
            name: 'Almonds (Badam)',
            calories: 579,
            protein: 21,
            carbs: 22,
            fats: 50,
        },
        {
            id: '94',
            name: 'Cashews (Kaju)',
            calories: 553,
            protein: 18,
            carbs: 30,
            fats: 44,
        },
        {
            id: '95',
            name: 'Walnuts (Akhrot)',
            calories: 654,
            protein: 15,
            carbs: 14,
            fats: 65,
        },
        {
            id: '96',
            name: 'Pistachios (Pista)',
            calories: 560,
            protein: 20,
            carbs: 28,
            fats: 45,
        },
        {
            id: '97',
            name: 'Peanuts (Moongphali)',
            calories: 567,
            protein: 26,
            carbs: 16,
            fats: 49,
        },
        {
            id: '98',
            name: 'Sesame Seeds (Til)',
            calories: 573,
            protein: 18,
            carbs: 23,
            fats: 50,
        },
        {
            id: '99',
            name: 'Pumpkin Seeds',
            calories: 559,
            protein: 30,
            carbs: 11,
            fats: 49,
        },
        {
            id: '100',
            name: 'Sunflower Seeds',
            calories: 584,
            protein: 21,
            carbs: 20,
            fats: 51,
        },

        // Traditional Breads
        {
            id: '101',
            name: 'Roti (Chapati)',
            calories: 71,
            protein: 3,
            carbs: 15,
            fats: 0.4,
        },
        { id: '102', name: 'Naan', calories: 262, protein: 9, carbs: 39, fats: 8 },
        {
            id: '103',
            name: 'Paratha (plain)',
            calories: 126,
            protein: 3,
            carbs: 18,
            fats: 4.9,
        },
        { id: '104', name: 'Puri', calories: 347, protein: 6, carbs: 46, fats: 16 },
        {
            id: '105',
            name: 'Kulcha',
            calories: 180,
            protein: 5,
            carbs: 30,
            fats: 5,
        },
        {
            id: '106',
            name: 'Bhatura',
            calories: 287,
            protein: 6,
            carbs: 39,
            fats: 12,
        },
        { id: '107', name: 'Dosa', calories: 133, protein: 4, carbs: 22, fats: 3 },
        { id: '108', name: 'Idli', calories: 58, protein: 2, carbs: 12, fats: 0.3 },
        {
            id: '109',
            name: 'Uttapam',
            calories: 147,
            protein: 4,
            carbs: 25,
            fats: 4,
        },
        { id: '110', name: 'Appam', calories: 120, protein: 2, carbs: 24, fats: 2 },

        // Rice Dishes
        {
            id: '111',
            name: 'Biryani (Chicken)',
            calories: 200,
            protein: 8,
            carbs: 25,
            fats: 8,
        },
        { id: '112', name: 'Pulao', calories: 180, protein: 4, carbs: 35, fats: 3 },
        {
            id: '113',
            name: 'Jeera Rice',
            calories: 150,
            protein: 3,
            carbs: 30,
            fats: 2,
        },
        {
            id: '114',
            name: 'Lemon Rice',
            calories: 165,
            protein: 3,
            carbs: 32,
            fats: 3,
        },
        {
            id: '115',
            name: 'Curd Rice',
            calories: 140,
            protein: 4,
            carbs: 28,
            fats: 1.5,
        },
        {
            id: '116',
            name: 'Khichdi',
            calories: 120,
            protein: 4,
            carbs: 22,
            fats: 2,
        },

        // Dal Preparations
        {
            id: '117',
            name: 'Dal Tadka',
            calories: 104,
            protein: 6,
            carbs: 15,
            fats: 2.5,
        },
        {
            id: '118',
            name: 'Dal Fry',
            calories: 118,
            protein: 6,
            carbs: 15,
            fats: 4,
        },
        {
            id: '119',
            name: 'Sambar',
            calories: 85,
            protein: 4,
            carbs: 12,
            fats: 2.8,
        },
        { id: '120', name: 'Rasam', calories: 45, protein: 2, carbs: 8, fats: 1 },
        {
            id: '121',
            name: 'Dal Makhani',
            calories: 142,
            protein: 6,
            carbs: 15,
            fats: 7,
        },

        // Vegetable Curries
        {
            id: '122',
            name: 'Aloo Gobi',
            calories: 95,
            protein: 3,
            carbs: 15,
            fats: 3,
        },
        {
            id: '123',
            name: 'Palak Paneer',
            calories: 165,
            protein: 8,
            carbs: 8,
            fats: 12,
        },
        {
            id: '124',
            name: 'Baingan Bharta',
            calories: 85,
            protein: 2,
            carbs: 12,
            fats: 4,
        },
        {
            id: '125',
            name: 'Bhindi Masala',
            calories: 75,
            protein: 3,
            carbs: 10,
            fats: 3,
        },
        {
            id: '126',
            name: 'Aloo Sabzi',
            calories: 120,
            protein: 3,
            carbs: 20,
            fats: 4,
        },
        {
            id: '127',
            name: 'Cabbage Sabzi',
            calories: 65,
            protein: 2,
            carbs: 10,
            fats: 2.5,
        },
        {
            id: '128',
            name: 'Gajar Matar',
            calories: 85,
            protein: 3,
            carbs: 12,
            fats: 3,
        },
        {
            id: '129',
            name: 'Mixed Vegetables',
            calories: 90,
            protein: 3,
            carbs: 14,
            fats: 3.5,
        },

        // Non-Vegetarian Dishes
        {
            id: '130',
            name: 'Chicken Curry',
            calories: 180,
            protein: 20,
            carbs: 5,
            fats: 9,
        },
        {
            id: '131',
            name: 'Butter Chicken',
            calories: 220,
            protein: 18,
            carbs: 8,
            fats: 14,
        },
        {
            id: '132',
            name: 'Chicken Tikka',
            calories: 165,
            protein: 31,
            carbs: 0,
            fats: 3.6,
        },
        {
            id: '133',
            name: 'Tandoori Chicken',
            calories: 150,
            protein: 28,
            carbs: 2,
            fats: 3,
        },
        {
            id: '134',
            name: 'Fish Curry',
            calories: 140,
            protein: 20,
            carbs: 5,
            fats: 5,
        },
        {
            id: '135',
            name: 'Mutton Curry',
            calories: 250,
            protein: 22,
            carbs: 3,
            fats: 17,
        },
        {
            id: '136',
            name: 'Egg Curry',
            calories: 155,
            protein: 12,
            carbs: 6,
            fats: 10,
        },
        {
            id: '137',
            name: 'Prawn Curry',
            calories: 120,
            protein: 18,
            carbs: 4,
            fats: 4,
        },

        // Snacks & Street Food
        {
            id: '138',
            name: 'Samosa',
            calories: 308,
            protein: 5,
            carbs: 23,
            fats: 22,
        },
        {
            id: '139',
            name: 'Pakora',
            calories: 280,
            protein: 6,
            carbs: 25,
            fats: 18,
        },
        {
            id: '140',
            name: 'Kachori',
            calories: 340,
            protein: 6,
            carbs: 35,
            fats: 20,
        },
        {
            id: '141',
            name: 'Dhokla',
            calories: 160,
            protein: 5,
            carbs: 24,
            fats: 5,
        },
        { id: '142', name: 'Vada', calories: 285, protein: 6, carbs: 30, fats: 16 },
        {
            id: '143',
            name: 'Panipuri',
            calories: 36,
            protein: 1,
            carbs: 6,
            fats: 1,
        },
        {
            id: '144',
            name: 'Bhel Puri',
            calories: 120,
            protein: 3,
            carbs: 20,
            fats: 4,
        },
        {
            id: '145',
            name: 'Sev Puri',
            calories: 150,
            protein: 4,
            carbs: 18,
            fats: 7,
        },
        {
            id: '146',
            name: 'Dahi Puri',
            calories: 80,
            protein: 2,
            carbs: 12,
            fats: 2.5,
        },
        {
            id: '147',
            name: 'Aloo Tikki',
            calories: 180,
            protein: 4,
            carbs: 25,
            fats: 8,
        },
        {
            id: '148',
            name: 'Chole Bhature',
            calories: 427,
            protein: 12,
            carbs: 58,
            fats: 17,
        },
        {
            id: '149',
            name: 'Pav Bhaji',
            calories: 350,
            protein: 8,
            carbs: 45,
            fats: 16,
        },
        {
            id: '150',
            name: 'Momos',
            calories: 35,
            protein: 1.5,
            carbs: 5,
            fats: 1.2,
        },

        // Sweets & Desserts
        {
            id: '151',
            name: 'Gulab Jamun',
            calories: 387,
            protein: 4,
            carbs: 60,
            fats: 15,
        },
        {
            id: '152',
            name: 'Rasgulla',
            calories: 186,
            protein: 4,
            carbs: 40,
            fats: 1,
        },
        {
            id: '153',
            name: 'Jalebi',
            calories: 150,
            protein: 1,
            carbs: 35,
            fats: 3,
        },
        { id: '154', name: 'Laddu', calories: 186, protein: 3, carbs: 27, fats: 8 },
        {
            id: '155',
            name: 'Barfi',
            calories: 380,
            protein: 8,
            carbs: 45,
            fats: 18,
        },
        {
            id: '156',
            name: 'Kheer',
            calories: 97,
            protein: 2.5,
            carbs: 16,
            fats: 3,
        },
        { id: '157', name: 'Halwa', calories: 186, protein: 2, carbs: 30, fats: 7 },
        { id: '158', name: 'Kulfi', calories: 168, protein: 4, carbs: 22, fats: 8 },
        {
            id: '159',
            name: 'Sandesh',
            calories: 150,
            protein: 6,
            carbs: 20,
            fats: 6,
        },
        {
            id: '160',
            name: 'Mysore Pak',
            calories: 420,
            protein: 6,
            carbs: 45,
            fats: 25,
        },

        // Beverages
        {
            id: '161',
            name: 'Masala Chai',
            calories: 37,
            protein: 1.5,
            carbs: 4,
            fats: 2,
        },
        {
            id: '162',
            name: 'Filter Coffee',
            calories: 5,
            protein: 0.3,
            carbs: 0.7,
            fats: 0.1,
        },
        {
            id: '163',
            name: 'Nimbu Pani',
            calories: 25,
            protein: 0.1,
            carbs: 6,
            fats: 0,
        },
        {
            id: '164',
            name: 'Sugarcane Juice',
            calories: 269,
            protein: 0.2,
            carbs: 73,
            fats: 0.4,
        },
        {
            id: '165',
            name: 'Coconut Water',
            calories: 19,
            protein: 0.7,
            carbs: 3.7,
            fats: 0.2,
        },
        {
            id: '166',
            name: 'Mango Juice',
            calories: 60,
            protein: 0.4,
            carbs: 14.8,
            fats: 0.3,
        },
        {
            id: '167',
            name: 'Thandai',
            calories: 120,
            protein: 3,
            carbs: 15,
            fats: 6,
        },

        // Pickles & Preserves
        {
            id: '168',
            name: 'Mango Pickle (Achaar)',
            calories: 138,
            protein: 0.9,
            carbs: 16,
            fats: 8.5,
        },
        {
            id: '169',
            name: 'Lime Pickle',
            calories: 140,
            protein: 1,
            carbs: 15,
            fats: 9,
        },
        {
            id: '170',
            name: 'Mixed Vegetable Pickle',
            calories: 130,
            protein: 1.2,
            carbs: 14,
            fats: 8,
        },
        {
            id: '171',
            name: 'Garlic Pickle',
            calories: 145,
            protein: 1.5,
            carbs: 16,
            fats: 8.5,
        },

        // Regional Specialties - South Indian
        {
            id: '172',
            name: 'Vada Sambar',
            calories: 320,
            protein: 10,
            carbs: 40,
            fats: 14,
        },
        {
            id: '173',
            name: 'Masala Dosa',
            calories: 168,
            protein: 4,
            carbs: 28,
            fats: 4.5,
        },
        {
            id: '174',
            name: 'Rava Idli',
            calories: 85,
            protein: 2.5,
            carbs: 16,
            fats: 1.5,
        },
        {
            id: '175',
            name: 'Pongal',
            calories: 156,
            protein: 4,
            carbs: 28,
            fats: 3.5,
        },
        { id: '176', name: 'Upma', calories: 85, protein: 2, carbs: 17, fats: 1.5 },
        {
            id: '177',
            name: 'Poha',
            calories: 76,
            protein: 1.8,
            carbs: 15,
            fats: 1.2,
        },
        {
            id: '178',
            name: 'Medu Vada',
            calories: 285,
            protein: 6,
            carbs: 30,
            fats: 16,
        },
        {
            id: '179',
            name: 'Rasam Rice',
            calories: 130,
            protein: 3,
            carbs: 26,
            fats: 1.5,
        },
        {
            id: '180',
            name: 'Bisi Bele Bath',
            calories: 140,
            protein: 4,
            carbs: 26,
            fats: 3,
        },

        // Regional Specialties - North Indian
        {
            id: '181',
            name: 'Rajma Chawal',
            calories: 180,
            protein: 7,
            carbs: 32,
            fats: 3,
        },
        {
            id: '182',
            name: 'Kadhi Chawal',
            calories: 165,
            protein: 5,
            carbs: 30,
            fats: 4,
        },
        {
            id: '183',
            name: 'Sarson ka Saag',
            calories: 85,
            protein: 4,
            carbs: 8,
            fats: 5,
        },
        {
            id: '184',
            name: 'Makki di Roti',
            calories: 97,
            protein: 2.3,
            carbs: 21,
            fats: 1.2,
        },
        {
            id: '185',
            name: 'Aloo Paratha',
            calories: 200,
            protein: 5,
            carbs: 30,
            fats: 7,
        },
        {
            id: '186',
            name: 'Stuffed Kulcha',
            calories: 220,
            protein: 6,
            carbs: 35,
            fats: 7,
        },
        {
            id: '187',
            name: 'Dal Baati Churma',
            calories: 320,
            protein: 8,
            carbs: 50,
            fats: 12,
        },
        {
            id: '188',
            name: 'Gatte ki Sabzi',
            calories: 120,
            protein: 4,
            carbs: 18,
            fats: 4,
        },

        // Regional Specialties - West Indian
        {
            id: '189',
            name: 'Khakhra',
            calories: 414,
            protein: 14,
            carbs: 61,
            fats: 13,
        },
        {
            id: '190',
            name: 'Thepla',
            calories: 100,
            protein: 3,
            carbs: 15,
            fats: 3.5,
        },
        {
            id: '191',
            name: 'Handvo',
            calories: 180,
            protein: 6,
            carbs: 25,
            fats: 7,
        },
        {
            id: '192',
            name: 'Khandvi',
            calories: 85,
            protein: 3,
            carbs: 12,
            fats: 3,
        },
        {
            id: '193',
            name: 'Dabeli',
            calories: 200,
            protein: 5,
            carbs: 30,
            fats: 8,
        },
        {
            id: '194',
            name: 'Vada Pav',
            calories: 286,
            protein: 6,
            carbs: 35,
            fats: 14,
        },
        {
            id: '195',
            name: 'Misal Pav',
            calories: 250,
            protein: 8,
            carbs: 35,
            fats: 10,
        },
        {
            id: '196',
            name: 'Puran Poli',
            calories: 186,
            protein: 4,
            carbs: 32,
            fats: 5,
        },

        // Regional Specialties - East Indian
        {
            id: '197',
            name: 'Fish Rice (Bengali)',
            calories: 220,
            protein: 18,
            carbs: 28,
            fats: 4,
        },
        {
            id: '198',
            name: 'Mishti Doi',
            calories: 150,
            protein: 6,
            carbs: 20,
            fats: 5,
        },
        { id: '199', name: 'Luchi', calories: 156, protein: 4, carbs: 20, fats: 7 },
        {
            id: '200',
            name: 'Aloo Posto',
            calories: 140,
            protein: 4,
            carbs: 18,
            fats: 6,
        },
        {
            id: '201',
            name: 'Begun Bhaja',
            calories: 85,
            protein: 2,
            carbs: 8,
            fats: 5,
        },
        {
            id: '202',
            name: 'Machher Jhol',
            calories: 160,
            protein: 22,
            carbs: 4,
            fats: 6,
        },
        {
            id: '203',
            name: 'Kosha Mangsho',
            calories: 280,
            protein: 24,
            carbs: 3,
            fats: 19,
        },

        // Traditional Fermented Foods
        {
            id: '204',
            name: 'Idli Batter',
            calories: 60,
            protein: 2,
            carbs: 12,
            fats: 0.5,
        },
        {
            id: '205',
            name: 'Dosa Batter',
            calories: 70,
            protein: 2.5,
            carbs: 14,
            fats: 1,
        },
        {
            id: '206',
            name: 'Dhokla Batter',
            calories: 80,
            protein: 3,
            carbs: 15,
            fats: 1.5,
        },
        {
            id: '207',
            name: 'Kanji (Fermented drink)',
            calories: 25,
            protein: 0.5,
            carbs: 6,
            fats: 0.1,
        },

        // More Vegetables
        {
            id: '208',
            name: 'Drumstick (Moringa pods)',
            calories: 26,
            protein: 2.5,
            carbs: 3.7,
            fats: 0.2,
        },
        {
            id: '209',
            name: 'Cluster Beans (Gavar)',
            calories: 16,
            protein: 3.2,
            carbs: 7,
            fats: 0.4,
        },
        {
            id: '210',
            name: 'Ivy Gourd (Tindora)',
            calories: 18,
            protein: 0.5,
            carbs: 4,
            fats: 0.3,
        },
        {
            id: '211',
            name: 'Ash Gourd (Petha)',
            calories: 13,
            protein: 0.4,
            carbs: 3,
            fats: 0.2,
        },
        {
            id: '212',
            name: 'Pointed Gourd (Parwal)',
            calories: 17,
            protein: 0.6,
            carbs: 4,
            fats: 0.2,
        },
        {
            id: '213',
            name: 'Indian Squash (Tinda)',
            calories: 12,
            protein: 0.5,
            carbs: 2.5,
            fats: 0.1,
        },
        {
            id: '214',
            name: 'Colocasia (Arvi)',
            calories: 112,
            protein: 1.5,
            carbs: 26,
            fats: 0.2,
        },
        {
            id: '215',
            name: 'Yam (Jimikand)',
            calories: 118,
            protein: 1.5,
            carbs: 28,
            fats: 0.2,
        },
        {
            id: '216',
            name: 'Raw Banana (Kaccha Kela)',
            calories: 89,
            protein: 1.1,
            carbs: 23,
            fats: 0.3,
        },
        {
            id: '217',
            name: 'Plantain (Kela)',
            calories: 122,
            protein: 1.3,
            carbs: 32,
            fats: 0.4,
        },

        // More Fruits
        {
            id: '218',
            name: 'Indian Gooseberry (Amla)',
            calories: 44,
            protein: 0.9,
            carbs: 10,
            fats: 0.6,
        },
        {
            id: '219',
            name: 'Wood Apple (Bael)',
            calories: 137,
            protein: 1.8,
            carbs: 32,
            fats: 0.3,
        },
        {
            id: '220',
            name: 'Tamarind (Imli)',
            calories: 239,
            protein: 2.8,
            carbs: 63,
            fats: 0.6,
        },
        {
            id: '221',
            name: 'Jamun (Black Plum)',
            calories: 60,
            protein: 0.7,
            carbs: 14,
            fats: 0.2,
        },
        {
            id: '222',
            name: 'Litchi',
            calories: 66,
            protein: 0.8,
            carbs: 17,
            fats: 0.4,
        },
        {
            id: '223',
            name: 'Star Fruit (Kamrakh)',
            calories: 31,
            protein: 1,
            carbs: 7,
            fats: 0.3,
        },
        {
            id: '224',
            name: 'Dragon Fruit',
            calories: 60,
            protein: 1.2,
            carbs: 13,
            fats: 0.4,
        },
        {
            id: '225',
            name: 'Fig (Anjeer)',
            calories: 74,
            protein: 0.8,
            carbs: 19,
            fats: 0.3,
        },

        // More Traditional Sweets
        {
            id: '226',
            name: 'Kaju Katli',
            calories: 380,
            protein: 7,
            carbs: 35,
            fats: 24,
        },
        {
            id: '227',
            name: 'Soan Papdi',
            calories: 480,
            protein: 8,
            carbs: 60,
            fats: 24,
        },
        {
            id: '228',
            name: 'Petha',
            calories: 317,
            protein: 0.4,
            carbs: 79,
            fats: 0.5,
        },
        {
            id: '229',
            name: 'Chikki',
            calories: 500,
            protein: 15,
            carbs: 45,
            fats: 30,
        },
        {
            id: '230',
            name: 'Gur (Jaggery)',
            calories: 383,
            protein: 0.4,
            carbs: 98,
            fats: 0.1,
        },
        {
            id: '231',
            name: 'Khajur (Dates)',
            calories: 277,
            protein: 1.8,
            carbs: 75,
            fats: 0.2,
        },
        {
            id: '232',
            name: 'Til Laddu',
            calories: 450,
            protein: 12,
            carbs: 35,
            fats: 32,
        },
        {
            id: '233',
            name: 'Coconut Laddu',
            calories: 420,
            protein: 4,
            carbs: 40,
            fats: 28,
        },

        // More Breakfast Items
        {
            id: '234',
            name: 'Paratha (Stuffed)',
            calories: 160,
            protein: 4,
            carbs: 22,
            fats: 6,
        },
        {
            id: '235',
            name: 'Besan Cheela',
            calories: 120,
            protein: 6,
            carbs: 12,
            fats: 6,
        },
        {
            id: '236',
            name: 'Moong Dal Cheela',
            calories: 110,
            protein: 8,
            carbs: 10,
            fats: 4,
        },
        {
            id: '237',
            name: 'Rava Uttapam',
            calories: 130,
            protein: 3,
            carbs: 22,
            fats: 3.5,
        },
        {
            id: '238',
            name: 'Bread Pakora',
            calories: 250,
            protein: 6,
            carbs: 25,
            fats: 14,
        },
        {
            id: '239',
            name: 'Aloo Puri',
            calories: 380,
            protein: 8,
            carbs: 50,
            fats: 17,
        },

        // More Snacks
        {
            id: '240',
            name: 'Murukku',
            calories: 520,
            protein: 9,
            carbs: 55,
            fats: 30,
        },
        {
            id: '241',
            name: 'Chakli',
            calories: 480,
            protein: 8,
            carbs: 50,
            fats: 28,
        },
        {
            id: '242',
            name: 'Namak Para',
            calories: 450,
            protein: 8,
            carbs: 60,
            fats: 20,
        },
        {
            id: '243',
            name: 'Mathri',
            calories: 420,
            protein: 7,
            carbs: 45,
            fats: 24,
        },
        {
            id: '244',
            name: 'Khakra',
            calories: 350,
            protein: 12,
            carbs: 50,
            fats: 12,
        },
        { id: '245', name: 'Sev', calories: 500, protein: 14, carbs: 40, fats: 34 },
        {
            id: '246',
            name: 'Bhujia',
            calories: 480,
            protein: 12,
            carbs: 45,
            fats: 30,
        },
        {
            id: '247',
            name: 'Mixture',
            calories: 450,
            protein: 10,
            carbs: 50,
            fats: 25,
        },

        // More Curries & Sabzis
        {
            id: '248',
            name: 'Shahi Paneer',
            calories: 200,
            protein: 10,
            carbs: 8,
            fats: 15,
        },
        {
            id: '249',
            name: 'Paneer Makhani',
            calories: 220,
            protein: 12,
            carbs: 10,
            fats: 16,
        },
        {
            id: '250',
            name: 'Malai Kofta',
            calories: 180,
            protein: 6,
            carbs: 12,
            fats: 13,
        },
        {
            id: '251',
            name: 'Dum Aloo',
            calories: 150,
            protein: 3,
            carbs: 20,
            fats: 7,
        },
        {
            id: '252',
            name: 'Chole Masala',
            calories: 164,
            protein: 8.9,
            carbs: 27,
            fats: 2.6,
        },
        {
            id: '253',
            name: 'Aloo Jeera',
            calories: 110,
            protein: 2.5,
            carbs: 18,
            fats: 4,
        },
        {
            id: '254',
            name: 'Methi Aloo',
            calories: 125,
            protein: 4,
            carbs: 18,
            fats: 4.5,
        },
        {
            id: '255',
            name: 'Gobi Matar',
            calories: 90,
            protein: 4,
            carbs: 12,
            fats: 3.5,
        },

        // More Rice Dishes
        {
            id: '256',
            name: 'Vegetable Biryani',
            calories: 180,
            protein: 5,
            carbs: 32,
            fats: 4,
        },
        {
            id: '257',
            name: 'Mutton Biryani',
            calories: 280,
            protein: 15,
            carbs: 35,
            fats: 10,
        },
        {
            id: '258',
            name: 'Fish Biryani',
            calories: 220,
            protein: 18,
            carbs: 30,
            fats: 6,
        },
        {
            id: '259',
            name: 'Tahiri',
            calories: 160,
            protein: 4,
            carbs: 30,
            fats: 3.5,
        },
        {
            id: '260',
            name: 'Coconut Rice',
            calories: 170,
            protein: 3,
            carbs: 32,
            fats: 4,
        },
        {
            id: '261',
            name: 'Tamarind Rice',
            calories: 155,
            protein: 3,
            carbs: 30,
            fats: 3,
        },

        // Traditional Drinks
        {
            id: '262',
            name: 'Aam Panna',
            calories: 80,
            protein: 0.5,
            carbs: 20,
            fats: 0.2,
        },
        {
            id: '263',
            name: 'Jaljeera',
            calories: 30,
            protein: 0.5,
            carbs: 7,
            fats: 0.1,
        },
        {
            id: '264',
            name: 'Buttermilk Spiced',
            calories: 45,
            protein: 3.5,
            carbs: 5,
            fats: 1,
        },
        {
            id: '265',
            name: 'Kokum Juice',
            calories: 25,
            protein: 0.2,
            carbs: 6,
            fats: 0.1,
        },
        {
            id: '266',
            name: 'Rose Milk',
            calories: 120,
            protein: 4,
            carbs: 18,
            fats: 4,
        },
        {
            id: '267',
            name: 'Badam Milk',
            calories: 150,
            protein: 6,
            carbs: 15,
            fats: 8,
        },

        // More Legumes & Beans
        {
            id: '268',
            name: 'Lima Beans (Sem)',
            calories: 115,
            protein: 7.8,
            carbs: 21,
            fats: 0.4,
        },
        {
            id: '269',
            name: 'Field Beans (Valor)',
            calories: 341,
            protein: 23,
            carbs: 58,
            fats: 1.6,
        },
        {
            id: '270',
            name: 'Cow Pea (Lobiya)',
            calories: 336,
            protein: 24,
            carbs: 60,
            fats: 1.3,
        },
        {
            id: '271',
            name: 'Green Peas (dried)',
            calories: 341,
            protein: 25,
            carbs: 60,
            fats: 2,
        },
        {
            id: '272',
            name: 'Soybean',
            calories: 446,
            protein: 36,
            carbs: 30,
            fats: 20,
        },

        // More Spices & Aromatics
        {
            id: '273',
            name: 'Bay Leaves (Tej Patta)',
            calories: 313,
            protein: 7.6,
            carbs: 75,
            fats: 8.4,
        },
        {
            id: '274',
            name: 'Star Anise',
            calories: 337,
            protein: 18,
            carbs: 50,
            fats: 16,
        },
        {
            id: '275',
            name: 'Nutmeg (Jaiphal)',
            calories: 525,
            protein: 6,
            carbs: 49,
            fats: 36,
        },
        {
            id: '276',
            name: 'Mace (Javitri)',
            calories: 475,
            protein: 7,
            carbs: 50,
            fats: 32,
        },
        {
            id: '277',
            name: 'Carom Seeds (Ajwain)',
            calories: 375,
            protein: 16,
            carbs: 43,
            fats: 25,
        },
        {
            id: '278',
            name: 'Fennel Seeds (Saunf)',
            calories: 345,
            protein: 15,
            carbs: 52,
            fats: 15,
        },
        {
            id: '279',
            name: 'Nigella Seeds (Kalonji)',
            calories: 375,
            protein: 18,
            carbs: 44,
            fats: 22,
        },

        // More Traditional Foods
        {
            id: '280',
            name: 'Til Oil',
            calories: 884,
            protein: 0,
            carbs: 0,
            fats: 100,
        },
        {
            id: '281',
            name: 'Mustard Oil Cake',
            calories: 300,
            protein: 35,
            carbs: 12,
            fats: 12,
        },
        {
            id: '282',
            name: 'Coconut Milk',
            calories: 230,
            protein: 2.3,
            carbs: 6,
            fats: 24,
        },
        {
            id: '283',
            name: 'Tamarind Paste',
            calories: 239,
            protein: 2.8,
            carbs: 63,
            fats: 0.6,
        },
        {
            id: '284',
            name: 'Dry Coconut (Copra)',
            calories: 660,
            protein: 6.9,
            carbs: 24,
            fats: 65,
        },
        {
            id: '285',
            name: 'Palm Jaggery',
            calories: 368,
            protein: 0.4,
            carbs: 94,
            fats: 0.2,
        },

        // Street Food Variations
        {
            id: '286',
            name: 'Raj Kachori',
            calories: 400,
            protein: 8,
            carbs: 45,
            fats: 20,
        },
        {
            id: '287',
            name: 'Papdi Chaat',
            calories: 180,
            protein: 4,
            carbs: 22,
            fats: 8,
        },
        {
            id: '288',
            name: 'Aloo Chaat',
            calories: 150,
            protein: 3,
            carbs: 25,
            fats: 5,
        },
        {
            id: '289',
            name: 'Fruit Chaat',
            calories: 80,
            protein: 1,
            carbs: 18,
            fats: 1,
        },
        {
            id: '290',
            name: 'Churma',
            calories: 420,
            protein: 6,
            carbs: 55,
            fats: 20,
        },

        // Regional Beverages
        {
            id: '291',
            name: 'Masala Milk',
            calories: 100,
            protein: 4,
            carbs: 12,
            fats: 4,
        },
        {
            id: '292',
            name: 'Turmeric Milk',
            calories: 80,
            protein: 4,
            carbs: 8,
            fats: 4,
        },
        {
            id: '293',
            name: 'Ginger Tea',
            calories: 20,
            protein: 0.5,
            carbs: 4,
            fats: 0.2,
        },
        {
            id: '294',
            name: 'Cardamom Tea',
            calories: 25,
            protein: 0.8,
            carbs: 4,
            fats: 0.5,
        },
        {
            id: '295',
            name: 'Cinnamon Tea',
            calories: 15,
            protein: 0.3,
            carbs: 3,
            fats: 0.1,
        },

        // Final Traditional Items
        {
            id: '296',
            name: 'Popcorn (Roasted)',
            calories: 375,
            protein: 12,
            carbs: 74,
            fats: 4.5,
        },
        {
            id: '297',
            name: 'Roasted Chana',
            calories: 364,
            protein: 17,
            carbs: 64,
            fats: 6,
        },
        {
            id: '298',
            name: 'Murmura (Puffed Rice)',
            calories: 325,
            protein: 7,
            carbs: 78,
            fats: 1,
        },
        {
            id: '299',
            name: 'Kheer (Rice Pudding)',
            calories: 130,
            protein: 3.5,
            carbs: 22,
            fats: 3.5,
        },
        {
            id: '300',
            name: 'Sewaiyan (Vermicelli)',
            calories: 220,
            protein: 8,
            carbs: 44,
            fats: 2.5,
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

    // Calculate macro percentages relative to target macros (percent of goal achieved)
    const calculateMacroPercentages = (
        consumed: Macronutrients,
        target: Macronutrients,
    ) => {
        const proteinPercent =
            target.protein > 0
                ? Math.round((consumed.protein / target.protein) * 100)
                : 0;
        const carbsPercent =
            target.carbohydrates > 0
                ? Math.round((consumed.carbohydrates / target.carbohydrates) * 100)
                : 0;
        const fatsPercent =
            target.fats > 0 ? Math.round((consumed.fats / target.fats) * 100) : 0;

        return {
            protein: Math.min(proteinPercent, 100),
            carbs: Math.min(carbsPercent, 100),
            fats: Math.min(fatsPercent, 100),
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

        setNutritionData(prev => {
            const updatedMacros = {
                protein: prev.consumedMacros.protein + addedProtein,
                carbohydrates: prev.consumedMacros.carbohydrates + addedCarbs,
                fats: prev.consumedMacros.fats + addedFats,
            };
            return {
                ...prev,
                consumedCalories: prev.consumedCalories + addedCalories,
                consumedMacros: updatedMacros,
            };
        });

        setRecentFoods(prev => {
            // Store each (food, quantity) pair as a separate entry
            const existing = prev.find(
                f => f.id === food.id && f.quantity === quantity,
            );
            if (existing) {
                // If exists, increment times
                const updatedItem = {
                    ...existing,
                    times: (existing.times || 1) + 1,
                } as FoodItem;
                // Remove old, add updated to front
                return [
                    updatedItem,
                    ...prev.filter(f => !(f.id === food.id && f.quantity === quantity)),
                ].slice(0, 10);
            }
            // If not exists, add new entry to front
            const foodWithQty = { ...food, quantity, times: 1 } as FoodItem;
            return [foodWithQty, ...prev].slice(0, 10);
        });

        // Batch modal and selection resets for performance
        setIsFoodModalVisible(false);
        setSelectedFood(null);

        setSearchQuery(''); // Reset search when modal closes
    };

    // Reset daily intake
    const resetIntake = () => {
        setNutritionData(prev => ({
            ...prev,
            consumedCalories: 0,
            consumedMacros: { protein: 0, carbohydrates: 0, fats: 0 },
        }));
        setRecentFoods([]);
        AsyncStorage.removeItem('nutritionData');
        AsyncStorage.removeItem('recentFoods');
        // store last reset date as today's date string
        const todayStr = new Date().toISOString().split('T')[0];
        AsyncStorage.setItem('lastResetDate', todayStr);
    };

    // Filter foods based on search query
    const filteredFoods = foodDatabase
        .filter(food => food.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    // Calculate percentages for display (percent of target macros)
    const macroPercentages = calculateMacroPercentages(
        nutritionData.consumedMacros,
        nutritionData.macros,
    );
    const calorieProgress = Math.min(
        (nutritionData.consumedCalories /
            Math.max(1, nutritionData.totalCalories)) *
        100,
        100,
    );

    // Safe progress values for bars (guard divide by zero)
    const proteinProgress = Math.min(
        (nutritionData.consumedMacros.protein /
            Math.max(1, nutritionData.macros.protein)) *
        100,
        100,
    );
    const carbsProgress = Math.min(
        (nutritionData.consumedMacros.carbohydrates /
            Math.max(1, nutritionData.macros.carbohydrates)) *
        100,
        100,
    );
    const fatsProgress = Math.min(
        (nutritionData.consumedMacros.fats /
            Math.max(1, nutritionData.macros.fats)) *
        100,
        100,
    );

    // State for reset modal
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);

    // Helper: get YYYY-MM-DD for today
    const getTodayStr = () => new Date().toISOString().split('T')[0];

    // On mount: check last reset date and reset if it's before today
    useEffect(() => {
        let timer: number | null = null;
        (async () => {
            try {
                const lastReset = await AsyncStorage.getItem('lastResetDate');
                const today = getTodayStr();
                if (!lastReset || lastReset < today) {
                    // if never reset or last reset was before today, clear intake
                    resetIntake();
                }

                // schedule a timer to reset at next local midnight
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setDate(now.getDate() + 1);
                tomorrow.setHours(0, 0, 5, 0); // small 5s buffer after midnight
                const msUntilMidnight = tomorrow.getTime() - now.getTime();

                timer = setTimeout(() => {
                    resetIntake();
                }, msUntilMidnight) as unknown as number;
            } catch (e) {
                // ignore
            }
        })();

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, []);

    // Remove most recent item from macronutrients
    const resetRecentItem = () => {
        setRecentFoods(prev => {
            if (prev.length === 0) return prev;
            const updated = prev.slice(1);
            // Update nutritionData by subtracting the most recent item's nutrients
            setNutritionData(nd => {
                if (!nd || prev.length === 0) return nd;
                const item = prev[0];
                const qty = item.quantity || 100;
                const times = item.times || 1;
                const multiplier = (qty / 100) * times;
                return {
                    ...nd,
                    consumedCalories: Math.max(
                        0,
                        nd.consumedCalories - item.calories * multiplier,
                    ),
                    consumedMacros: {
                        protein: Math.max(
                            0,
                            nd.consumedMacros.protein - item.protein * multiplier,
                        ),
                        carbohydrates: Math.max(
                            0,
                            nd.consumedMacros.carbohydrates - item.carbs * multiplier,
                        ),
                        fats: Math.max(0, nd.consumedMacros.fats - item.fats * multiplier),
                    },
                };
            });
            return updated;
        });
        setIsResetModalVisible(false);
    };

    // Reset all items (existing resetIntake)
    const handleResetAll = () => {
        resetIntake();
        setIsResetModalVisible(false);
    };

    // Minus button: decrement 'times' for this food/quantity, remove only when times reaches zero
    const handleMinusRecentFood = (food: FoodItem) => {
        setRecentFoods(prev => {
            const idx = prev.findIndex(
                f => f.id === food.id && f.quantity === food.quantity,
            );
            if (idx === -1) return prev;
            const updated = [...prev];
            if (updated[idx].times && updated[idx].times > 1) {
                updated[idx].times = (updated[idx].times || 1) - 1;
                return updated;
            } else {
                // Remove only when times reaches zero or undefined
                updated.splice(idx, 1);
                return updated;
            }
        });
    };

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

            {/* Circular Calorie Chart */}
            <View>
                <CircularProgress
                    progress={calorieProgress}
                    consumed={nutritionData.consumedCalories}
                    total={nutritionData.totalCalories}
                />
                <Text style={styles.remainingText}>
                    {nutritionData.totalCalories -
                        Math.round(nutritionData.consumedCalories)}{' '}
                    kcal remaining
                </Text>
            </View>

            {/* Macronutrients */}
            <View style={styles.macroContainer}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 8,
                    }}
                >
                    <Text style={styles.sectionTitle}>Macronutrient Breakdown</Text>
                    <TouchableOpacity
                        style={{
                            marginLeft: 16,
                            backgroundColor: '#00BFFF',
                            borderRadius: 6,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                        }}
                        onPress={() => setIsRecentFoodModalVisible(true)}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Food</Text>
                    </TouchableOpacity>
                </View>

                {/* Modal for Recent Foods */}
                <Modal
                    visible={isRecentFoodModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsRecentFoodModalVisible(false)}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: '#222',
                                borderRadius: 12,
                                padding: 10,
                                minWidth: 280,
                                maxWidth: 350,
                                maxHeight: 400,
                                width: '80%',
                                alignSelf: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    color: '#00BFFF',
                                    fontWeight: 'bold',
                                    fontSize: 18,
                                    marginBottom: 12,
                                }}
                            >
                                Recently Added Food
                            </Text>
                            <ScrollView style={{ maxHeight: 320 }}>
                                {recentFoods.length > 0 ? (
                                    recentFoods.map((food: FoodItem, idx: number) => (
                                        <View
                                            key={`${food.id}_${food.quantity || 100}`}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginBottom: 12,
                                                backgroundColor: '#222',
                                                padding: 12,
                                                borderRadius: 12,
                                            }}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ color: '#fff' }}>{food.name}</Text>
                                                <Text
                                                    style={{ color: '#888', fontSize: 12, marginTop: 4 }}
                                                >
                                                    {`${(food.quantity || 100) * (food.times || 1)}g${food.times && food.times > 1
                                                            ? ` (${food.quantity || 100}g x${food.times})`
                                                            : ''
                                                        }`}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    Alert.alert(
                                                        'Confirm Add',
                                                        `Add another instance of "${food.name}" (${food.quantity || 100
                                                        }g) to your intake?`,
                                                        [
                                                            { text: 'Cancel', style: 'cancel' },
                                                            {
                                                                text: 'Add',
                                                                onPress: () => {
                                                                    const qty = food.quantity || 100;
                                                                    setNutritionData(prev => {
                                                                        const addedCalories =
                                                                            (food.calories * qty) / 100;
                                                                        const updatedMacros = {
                                                                            protein:
                                                                                prev.consumedMacros.protein +
                                                                                (food.protein * qty) / 100,
                                                                            carbohydrates:
                                                                                prev.consumedMacros.carbohydrates +
                                                                                (food.carbs * qty) / 100,
                                                                            fats:
                                                                                prev.consumedMacros.fats +
                                                                                (food.fats * qty) / 100,
                                                                        };
                                                                        return {
                                                                            ...prev,
                                                                            consumedCalories:
                                                                                prev.consumedCalories + addedCalories,
                                                                            consumedMacros: updatedMacros,
                                                                        };
                                                                    });
                                                                    setRecentFoods(prev => {
                                                                        const existing = prev.find(
                                                                            f =>
                                                                                f.id === food.id &&
                                                                                f.quantity === food.quantity,
                                                                        );
                                                                        if (!existing) return prev;
                                                                        const updatedItem = {
                                                                            ...existing,
                                                                            times: (existing.times || 1) + 1,
                                                                        };
                                                                        return [
                                                                            updatedItem,
                                                                            ...prev.filter(
                                                                                f =>
                                                                                    !(
                                                                                        f.id === food.id &&
                                                                                        f.quantity === food.quantity
                                                                                    ),
                                                                            ),
                                                                        ].slice(0, 10);
                                                                    });
                                                                },
                                                            },
                                                        ],
                                                    );
                                                }}
                                                style={{
                                                    marginLeft: 20,
                                                    backgroundColor: '#20b041ff',
                                                    borderRadius: 24,
                                                    width: 34,
                                                    height: 34,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    elevation: 2,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color: '#fff',
                                                        fontSize: 22,
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    +
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    Alert.alert(
                                                        'Confirm Remove',
                                                        `Remove one instance of "${food.name}" (${food.quantity || 100
                                                        }g) from your intake?`,
                                                        [
                                                            { text: 'Cancel', style: 'cancel' },
                                                            {
                                                                text: 'Remove',
                                                                style: 'destructive',
                                                                onPress: () => {
                                                                    const qty = food.quantity || 100;
                                                                    setNutritionData(prev => {
                                                                        const updatedMacros = {
                                                                            protein: Math.max(
                                                                                0,
                                                                                prev.consumedMacros.protein -
                                                                                (food.protein * qty) / 100,
                                                                            ),
                                                                            carbohydrates: Math.max(
                                                                                0,
                                                                                prev.consumedMacros.carbohydrates -
                                                                                (food.carbs * qty) / 100,
                                                                            ),
                                                                            fats: Math.max(
                                                                                0,
                                                                                prev.consumedMacros.fats -
                                                                                (food.fats * qty) / 100,
                                                                            ),
                                                                        };
                                                                        return {
                                                                            ...prev,
                                                                            consumedCalories: Math.max(
                                                                                0,
                                                                                prev.consumedCalories -
                                                                                (food.calories * qty) / 100,
                                                                            ),
                                                                            consumedMacros: updatedMacros,
                                                                        };
                                                                    });
                                                                    setRecentFoods(prev => {
                                                                        const idx = prev.findIndex(
                                                                            f =>
                                                                                f.id === food.id &&
                                                                                f.quantity === food.quantity,
                                                                        );
                                                                        if (idx === -1) return prev;
                                                                        const updated = [...prev];
                                                                        if (
                                                                            updated[idx].times &&
                                                                            updated[idx].times > 1
                                                                        ) {
                                                                            updated[idx].times =
                                                                                (updated[idx].times || 1) - 1;
                                                                            return updated;
                                                                        }
                                                                        updated.splice(idx, 1);
                                                                        return updated;
                                                                    });
                                                                },
                                                            },
                                                        ],
                                                    );
                                                }}
                                                style={{
                                                    marginLeft: 20,
                                                    backgroundColor: '#ff3503ff',
                                                    borderRadius: 24,
                                                    width: 34,
                                                    height: 34,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    elevation: 2,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color: '#fff',
                                                        fontSize: 22,
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    -
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={{ color: '#fff' }}>No food added yet.</Text>
                                )}
                            </ScrollView>
                            <TouchableOpacity
                                style={{
                                    marginTop: 1,
                                    alignSelf: 'flex-end',
                                    backgroundColor: '#00BFFF',
                                    justifyContent: 'center',
                                    borderRadius: 6,
                                    paddingHorizontal: 19,
                                    paddingVertical: 4,
                                }}
                                onPress={() => setIsRecentFoodModalVisible(false)}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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
                                    width: `${proteinProgress}%`,
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
                                    width: `${carbsProgress}%`,
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
                                    width: `${fatsProgress}%`,
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

                <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => {
                        Alert.alert(
                            'Confirm Reset',
                            'Are you sure you want to reset today? This will clear all your nutrition data for today.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Reset Today',
                                    style: 'destructive',
                                    onPress: resetIntake,
                                },
                            ],
                        );
                    }}
                >
                    <Text style={styles.buttonText}>Reset Today</Text>
                </TouchableOpacity>
            </View>

            {/* Profile Modal */}
            <Modal
                visible={isProfileModalVisible}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setIsProfileModalVisible(false)}
            >
                <View
                    style={[styles.modalOverlay, { flex: 1, backgroundColor: '#1a1a1a' }]}
                >
                    <View
                        style={[
                            styles.modalContent,
                            {
                                flex: 1,
                                borderRadius: 0,
                                width: '100%',
                                maxWidth: '100%',
                                minHeight: '100%',
                                maxHeight: '100%',
                                justifyContent: 'flex-start',
                                alignSelf: 'stretch',
                            },
                        ]}
                    >
                        <Text style={styles.modalTitle}>User Profile</Text>

                        <Text style={styles.inputLabel}>Age</Text>
                        <TextInput
                            style={styles.input}
                            value={ageInput}
                            onChangeText={text => {
                                if (/^\d*$/.test(text)) setAgeInput(text);
                            }}
                            keyboardType="numeric"
                            placeholder="Age"
                        />

                        <View style={styles.radioContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.radioButton,
                                    sexInput === 'male' && styles.radioSelected,
                                ]}
                                onPress={() => setSexInput('male')}
                            >
                                <Text
                                    style={[
                                        styles.radioText,
                                        sexInput === 'male' && styles.radioTextSelected,
                                    ]}
                                >
                                    Male
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.radioButton,
                                    sexInput === 'female' && styles.radioSelected,
                                ]}
                                onPress={() => setSexInput('female')}
                            >
                                <Text
                                    style={[
                                        styles.radioText,
                                        sexInput === 'female' && styles.radioTextSelected,
                                    ]}
                                >
                                    Female
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.inputLabel}>Weight (kg)</Text>
                        <TextInput
                            style={styles.input}
                            value={weightInput}
                            onChangeText={text => {
                                if (/^\d*\.?\d{0,3}$/.test(text)) setWeightInput(text);
                            }}
                            keyboardType="decimal-pad"
                            placeholder="Weight in kg"
                        />

                        <Text style={styles.inputLabel}>Height (cm)</Text>
                        <TextInput
                            style={styles.input}
                            value={heightInput}
                            onChangeText={text => {
                                if (/^\d*\.?\d{0,2}$/.test(text)) setHeightInput(text);
                            }}
                            keyboardType="decimal-pad"
                            placeholder="Height in cm"
                        />

                        <Text style={styles.inputLabel}>Activity Level</Text>
                        <View style={styles.radioContainer}>
                            {activityLevels.map((level, idx) => (
                                <TouchableOpacity
                                    key={level.value}
                                    style={[
                                        styles.radioButton,
                                        activityLevelInput === level.value && styles.radioSelected,
                                    ]}
                                    onPress={() => setActivityLevelInput(level.value)}
                                >
                                    <Text
                                        style={[
                                            styles.radioText,
                                            activityLevelInput === level.value &&
                                            styles.radioTextSelected,
                                        ]}
                                    >
                                        {level.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={async () => {
                                    const candidate: UserProfile = {
                                        age: parseInt(ageInput) || 0,
                                        sex: sexInput,
                                        weight: parseFloat(weightInput) || 0,
                                        height: parseFloat(heightInput) || 0,
                                        activityLevel: activityLevelInput || 0,
                                    };

                                    let errorMsg = '';
                                    if (!(candidate.age > 0 && candidate.age < 120)) {
                                        errorMsg += 'Age must be between 1 and 119.\n';
                                    }
                                    if (!(candidate.weight > 0 && candidate.weight < 500)) {
                                        errorMsg += 'Weight must be between 1 and 499 kg.\n';
                                    }
                                    if (!(candidate.height > 0 && candidate.height < 300)) {
                                        errorMsg += 'Height must be between 1 and 299 cm.';
                                    }
                                    if (errorMsg) {
                                        Alert.alert('Invalid Profile', errorMsg.trim());
                                        return;
                                    }

                                    setUserProfile(candidate);
                                    await AsyncStorage.setItem(
                                        'userProfile',
                                        JSON.stringify(candidate),
                                    );
                                    setIsProfileModalVisible(false);
                                }}
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
                transparent={false}
                animationType="slide"
                onRequestClose={() => setIsFoodModalVisible(false)}
            >
                <View
                    style={[styles.modalOverlay, { flex: 1, backgroundColor: '#1a1a1a' }]}
                >
                    <View
                        style={[
                            styles.modalContent,
                            {
                                flex: 1,
                                borderRadius: 0,
                                width: '100%',
                                maxWidth: '100%',
                                minHeight: '100%',
                                maxHeight: '100%',
                                justifyContent: 'flex-start',
                                alignSelf: 'stretch',
                            },
                        ]}
                    >
                        <Text style={styles.modalTitle}>Add Food</Text>

                        {!selectedFood ? (
                            <>
                                {/* Search Bar */}
                                <View style={{ backgroundColor: '#1a1a1a', paddingBottom: 8 }}>
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search foods..."
                                        placeholderTextColor="#888"
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        onSubmitEditing={() => {
                                            const phrase = searchQuery.trim();
                                            if (phrase && searchHistory[0] !== phrase) {
                                                setSearchHistory(prev => {
                                                    const updated = [
                                                        phrase,
                                                        ...prev.filter(item => item !== phrase),
                                                    ].slice(0, 5);
                                                    return updated;
                                                });
                                            }
                                        }}
                                        returnKeyType="search"
                                    />
                                    {searchHistory.length > 0 && (
                                        <View style={{ marginBottom: 10 }}>
                                            <Text style={{ color: '#888', marginBottom: 4 }}>
                                                Recent Items Searched:
                                            </Text>
                                            {searchHistory.map((item, idx) => (
                                                <View
                                                    key={idx}
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    <TouchableOpacity
                                                        style={{ flex: 1 }}
                                                        onPress={() => setSearchQuery(item)}
                                                    >
                                                        <Text style={{ color: '#00BFFF' }}>{item}</Text>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            // remove this item from search history
                                                            setSearchHistory(prev =>
                                                                prev.filter((s, i) => i !== idx),
                                                            );
                                                        }}
                                                        style={{
                                                            marginLeft: 10,
                                                            paddingHorizontal: 8,
                                                            paddingVertical: 4,
                                                            backgroundColor: '#333',
                                                            borderRadius: 6,
                                                        }}
                                                    >
                                                        <Text style={{ color: '#fff', fontWeight: '700' }}>
                                                            ✕
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                                <View style={{ flex: 1, minHeight: 300, maxHeight: 500 }}>
                                    {filteredFoods.length > 0 ? (
                                        <FlatList
                                            data={filteredFoods}
                                            keyExtractor={(item: FoodItem) => item.id}
                                            renderItem={({ item }: { item: FoodItem }) => (
                                                <TouchableOpacity
                                                    style={styles.foodItem}
                                                    onPress={() => {
                                                        setSelectedFood(item);
                                                        if (
                                                            item.name &&
                                                            searchQuery.trim() &&
                                                            searchHistory[0] !== item.name
                                                        ) {
                                                            setSearchHistory(prev => {
                                                                const updated = [
                                                                    item.name,
                                                                    ...prev.filter(word => word !== item.name),
                                                                ].slice(0, 5);
                                                                return updated;
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <Text style={styles.foodName}>{item.name}</Text>
                                                    <Text style={styles.foodCalories}>
                                                        {item.calories} kcal/100g
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                            ListEmptyComponent={() => (
                                                <Text style={styles.noResultsText}>
                                                    No foods found matching "{searchQuery}"
                                                </Text>
                                            )}
                                            style={{ flex: 1 }}
                                        />
                                    ) : (
                                        <Text style={styles.noResultsText}>
                                            No foods found matching "{searchQuery}"
                                        </Text>
                                    )}
                                </View>
                            </>
                        ) : (
                            <View>
                                <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>

                                <Text style={styles.inputLabel}>Quantity (grams)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={foodQuantity}
                                    onChangeText={text => {
                                        // Only allow positive numbers up to 4 digits
                                        if (/^\d{0,4}$/.test(text)) {
                                            setFoodQuantity(text);
                                        }
                                    }}
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
                                        onPress={() => {
                                            const qty = parseFloat(foodQuantity);
                                            if (!qty || qty <= 0 || qty > 9999) {
                                                Alert.alert(
                                                    'Invalid Quantity',
                                                    'Please enter a valid quantity (1-9999 grams).',
                                                );
                                                return;
                                            }
                                            addFood(selectedFood, qty);
                                        }}
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
                                onPress={() => {
                                    setIsFoodModalVisible(false);
                                    setSearchQuery(''); // Reset search when closing
                                }}
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
        padding: wp(4),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(2.5),
    },
    title: {
        fontSize: responsiveSize(24),
        fontWeight: 'bold',
        color: '#fff',
    },
    profileButton: {
        backgroundColor: '#1a1a1a',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderRadius: responsiveSize(8),
        borderWidth: 1,
        borderColor: '#333',
    },
    profileButtonText: {
        color: '#fff',
        fontWeight: '500',
        fontSize: responsiveSize(14),
    },
    circularProgressContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    circularProgressText: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    circularProgressTitle: {
        fontSize: responsiveSize(16),
        color: '#fff',
        fontWeight: '600',
        marginBottom: hp(1),
    },
    circularProgressNumbers: {
        fontSize: responsiveSize(28),
        fontWeight: 'bold',
        color: '#00BFFF',
        marginBottom: hp(0.5),
    },
    circularProgressUnit: {
        fontSize: responsiveSize(14),
        color: '#00BFFF',
        marginBottom: hp(1),
    },
    circularProgressLabel: {
        fontSize: responsiveSize(12),
        color: '#888',
    },
    remainingText: {
        fontSize: responsiveSize(14),
        color: '#888',
        marginTop: hp(1),
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: responsiveSize(20),
        fontWeight: '600',
        color: '#fff',
        marginTop: hp(1),
        marginBottom: hp(2),
    },
    macroContainer: {
        marginBottom: hp(2.5),
    },
    macroCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: responsiveSize(8),
        padding: wp(3),
        marginBottom: hp(1.5),
        borderWidth: 1,
        borderColor: '#333',
    },
    macroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(1),
    },
    macroTitle: {
        fontSize: responsiveSize(16),
        fontWeight: '500',
        color: '#fff',
    },
    macroPercentage: {
        fontSize: responsiveSize(16),
        fontWeight: 'bold',
        color: '#00BFFF',
    },
    macroAmount: {
        fontSize: responsiveSize(14),
        color: '#888',
        marginBottom: hp(1),
    },
    macroProgressBar: {
        height: hp(0.8),
        backgroundColor: '#333',
        borderRadius: responsiveSize(3),
    },
    macroProgressFill: {
        height: '100%',
        borderRadius: responsiveSize(3),
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(2.5),
        gap: wp(2),
    },
    addFoodButton: {
        backgroundColor: '#00BFFF',
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.5),
        borderRadius: responsiveSize(8),
        flex: 1,
    },
    resetButton: {
        backgroundColor: '#ff4444',
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.5),
        borderRadius: responsiveSize(8),
        flex: 1,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: responsiveSize(14),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        padding: 0,
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderRadius: responsiveSize(16),
        padding: wp(4),
        width: wp(80),
        maxWidth: 400,
        minHeight: hp(20),
        maxHeight: hp(40),
        alignSelf: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalTitle: {
        fontSize: responsiveSize(20),
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: hp(2.5),
        textAlign: 'center',
    },
    inputLabel: {
        fontSize: responsiveSize(14),
        color: '#fff',
        marginBottom: hp(1),
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#262629',
        borderRadius: responsiveSize(8),
        padding: wp(3),
        color: '#fff',
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: hp(2),
        fontSize: responsiveSize(14),
    },
    radioContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: hp(2),
        maxHeight: hp(20),
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    radioButton: {
        backgroundColor: '#262629',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderRadius: responsiveSize(8),
        borderWidth: 1,
        borderColor: '#333',
        marginRight: wp(3),
        marginBottom: hp(1.5),
    },
    radioSelected: {
        backgroundColor: '#00BFFF',
        borderColor: '#00BFFF',
    },
    radioText: {
        color: '#888',
        fontSize: responsiveSize(13),
    },
    radioTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: wp(2),
    },
    saveButton: {
        backgroundColor: '#34804bff',
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.5),
        borderRadius: responsiveSize(8),
        flex: 1,
    },
    searchInput: {
        backgroundColor: '#262629',
        borderRadius: responsiveSize(8),
        padding: wp(3),
        color: '#fff',
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: hp(2),
        fontSize: responsiveSize(14),
    },
    noResultsText: {
        color: '#888',
        fontSize: responsiveSize(14),
        textAlign: 'center',
        marginTop: hp(3),
        fontStyle: 'italic',
    },
    foodList: {
        maxHeight: hp(40),
        marginBottom: hp(2),
    },
    radioScroll: {
        marginBottom: hp(2),
        height: hp(12),
    },
    foodItem: {
        backgroundColor: '#262629',
        padding: wp(4),
        borderRadius: responsiveSize(8),
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: hp(1),
    },
    foodName: {
        color: '#fff',
        fontSize: responsiveSize(16),
        fontWeight: '500',
        marginBottom: hp(0.5),
    },
    foodCalories: {
        color: '#888',
        fontSize: responsiveSize(14),
    },
    selectedFoodName: {
        color: '#00BFFF',
        fontSize: responsiveSize(18),
        fontWeight: 'bold',
        marginBottom: hp(2),
        textAlign: 'center',
    },
    nutritionPreview: {
        backgroundColor: '#262629',
        padding: wp(4),
        borderRadius: responsiveSize(8),
        marginBottom: hp(2),
    },
    previewTitle: {
        color: '#fff',
        fontSize: responsiveSize(16),
        fontWeight: '600',
        marginBottom: hp(1),
    },
    previewText: {
        color: '#888',
        fontSize: responsiveSize(14),
        marginBottom: hp(0.5),
    },
    addButton: {
        backgroundColor: '#00BFFF',
        paddingHorizontal: wp(5),
        paddingVertical: hp(1.5),
        borderRadius: responsiveSize(8),
        flex: 1,
    },
    backButton: {
        backgroundColor: '#666',
        paddingHorizontal: wp(5),
        paddingVertical: hp(1.5),
        borderRadius: responsiveSize(8),
        flex: 1,
    },
    closeButton: {
        backgroundColor: '#666',
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.5),
        borderRadius: responsiveSize(8),
    },
});

export default NutritionTracker;
