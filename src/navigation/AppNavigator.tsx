import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import DummyScreen1 from '../screens/DummyScreen1';
import DummyScreen2 from '../screens/DummyScreen2';
import DummyScreen3 from '../screens/DummyScreen3';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeTabs = () => {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconSource;

                    switch (route.name) {
                        case 'Home':
                            iconSource = require('../assets/icons/home.png');
                            break;
                        case 'Dummy1':
                            iconSource = require('../assets/icons/home1.png');
                            break;
                        case 'Dummy2':
                            iconSource = require('../assets/icons/user.png');
                            break;
                        case 'Dummy3':
                            iconSource = require('../assets/icons/user1.png');
                            break;
                        case 'Profile':
                            iconSource = require('../assets/icons/user.png');
                            break;
                        default:
                            iconSource = require('../assets/icons/home.png');
                    }

                    return (
                        <Image
                            source={iconSource}
                            style={{
                                width: size,
                                height: size,
                                tintColor: color,
                                resizeMode: 'contain',
                            }}
                        />
                    );
                },
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
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    paddingBottom: 2,
                },
                tabBarItemStyle: {
                    paddingVertical: 2,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Dummy1" component={DummyScreen1} />
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
                    cardStyle: { backgroundColor: theme.background }
                }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="HomeTabs" component={HomeTabs} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;