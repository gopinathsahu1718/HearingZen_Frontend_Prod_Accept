// navigation/AppNavigator.tsx - Updated

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Text, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

// Import new screens
import VideoSplashScreen from '../screens/VideoSplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import OnboardingCheckScreen from '../screens/OnboardingCheckScreen';

import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import StepsScreen from '../screens/StepsScreen';
import HomeWeatherScreen from '../screens/HomeWeatherScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import OTPScreen from '../screens/OTPScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordOTPScreen from '../screens/ResetPasswordOTPScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen';
import PairedDevicesScreen from '../screens/PairedDevicesScreen';
import QuickScanDevicesScreen from '../screens/QuickScanDevicesScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

import BMICards from '../screens/StepScreen/BMICards';
import BMIResultScreen from "../screens/StepScreen/BMIResultScreen";
import NutritionScreen from '../screens/StepScreen/Nutrition';

// Import LMS Screens
import CourseCategoriesScreen from '../screens/CourseCategoriesScreen';
import CourseListScreen from '../screens/CourseListScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen ';

// Import New Enrollment Screens
import MyEnrollmentsScreen from '../screens/MyEnrollmentsScreen';
import EnrolledCourseScreen from '../screens/EnrolledCourseScreen';
import LessonPlayerScreen from '../screens/LessonPlayerScreen';

import AboutApp from '../screens/ProfileScreenPages/AboutAppScreen';
import TermsAndConditions from '../screens/ProfileScreenPages/TermsAndConditionsScreen';

import GoogleFitSettingsScreen from '../screens/GoogleFitSettingsScreen';

import type { RootStackParamList } from '../types/types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const tabIcons: Record<string, any> = {
    Home: require('../assets/icons/home.png'),
    Steps: require('../assets/icons/steps.png'),
    Weather: require('../assets/icons/cloudy.png'),
    LMS: require('../assets/icons/LMS.png'),
    Profile: require('../assets/icons/user.png'),
};

const HomeTabs = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                    <Image
                        source={tabIcons[route.name] || tabIcons.Home}
                        style={{
                            width: size,
                            height: size,
                            tintColor: color,
                            resizeMode: 'contain',
                        }}
                    />
                ),
                tabBarLabel: ({ color }) => (
                    <Text style={{ color, fontSize: 12, fontWeight: '500', paddingBottom: 2 }}>
                        {t(route.name)}
                    </Text>
                ),
                tabBarActiveTintColor: theme.tabBarActiveTint,
                tabBarInactiveTintColor: theme.tabBarInactiveTint,
                tabBarStyle: {
                    backgroundColor: theme.tabBarBackground,
                    borderTopWidth: 1,
                    borderTopColor: theme.border,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 65,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Steps" component={StepsScreen} />
            <Tab.Screen name="Weather" component={HomeWeatherScreen} />
            <Tab.Screen name="LMS" component={CourseCategoriesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    const { theme } = useTheme();
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="VideoSplash"
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: theme.background },
                }}
            >
                {/* New Screens */}
                <Stack.Screen
                    name="VideoSplash"
                    component={VideoSplashScreen}
                    options={{ gestureEnabled: false }}
                />
                <Stack.Screen
                    name="OnboardingCheck"
                    component={OnboardingCheckScreen}
                    options={{ gestureEnabled: false }}
                />
                <Stack.Screen
                    name="Onboarding"
                    component={OnboardingScreen}
                    options={{ gestureEnabled: false }}
                />

                {/* Existing Screens */}
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen
                    name="HomeTabs"
                    component={HomeTabs}
                    options={{ gestureEnabled: false }}
                />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen
                    name="OTPScreen"
                    component={OTPScreen}
                    options={{ gestureEnabled: false }}
                />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen
                    name="ResetPasswordOTP"
                    component={ResetPasswordOTPScreen}
                    options={{ gestureEnabled: false }}
                />
                <Stack.Screen
                    name="NewPassword"
                    component={NewPasswordScreen}
                    options={{ gestureEnabled: false }}
                />
                <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                <Stack.Screen name="QuickScanDevices" component={QuickScanDevicesScreen} />
                <Stack.Screen name="PairedDevices" component={PairedDevicesScreen} />

                <Stack.Screen name="BMIResult" component={BMIResultScreen} options={{ title: "BMI Result" }} />
                <Stack.Screen name="BMI" component={BMICards} />
                <Stack.Screen name="Nutrition" component={NutritionScreen} />

                {/* LMS Screens */}
                <Stack.Screen name="CourseCategories" component={CourseCategoriesScreen} />
                <Stack.Screen name="CourseList" component={CourseListScreen} />
                <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />

                {/* Enrollment Screens */}
                <Stack.Screen
                    name="MyEnrollments"
                    component={MyEnrollmentsScreen}
                    options={{ title: "My Enrollments" }}
                />
                <Stack.Screen
                    name="EnrolledCourse"
                    component={EnrolledCourseScreen}
                    options={{ title: "Course Content" }}
                />
                <Stack.Screen
                    name="LessonPlayer"
                    component={LessonPlayerScreen}
                    options={{ title: "Lesson" }}
                />


                <Stack.Screen name="AboutUsScreen" component={AboutApp} />
                <Stack.Screen name="TermsAndConditionsScreen" component={TermsAndConditions} />
                <Stack.Screen name="GoogleFitSettings" component={GoogleFitSettingsScreen} options={{ title: "Google Fit Settings" }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;