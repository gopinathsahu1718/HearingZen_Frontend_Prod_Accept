import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import DummyScreen1 from '../screens/DummyScreen1';
import DummyScreen2 from '../screens/DummyScreen2';
import DummyScreen3 from '../screens/DummyScreen3';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import PairedDevicesScreen from '../screens/PairedDevicesScreen';
import QuickScanDevicesScreen from '../screens/QuickScanDevicesScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons: Record<string, any> = {
    Home: require('../assets/icons/home.png'),
    Steps: require('../assets/icons/steps.png'),
    Dummy2: require('../assets/icons/user.png'),
    Dummy3: require('../assets/icons/user1.png'),
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
            <Tab.Screen name="Steps" component={DummyScreen1} />
            <Tab.Screen name="Dummy2" component={DummyScreen2} />
            <Tab.Screen name="Dummy3" component={DummyScreen3} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    const { theme } = useTheme();

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: theme.background },
                }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="HomeTabs" component={HomeTabs} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                <Stack.Screen name="QuickScanDevices" component={QuickScanDevicesScreen} />
                <Stack.Screen name="PairedDevices" component={PairedDevicesScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;