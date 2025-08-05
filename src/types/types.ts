import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
    Splash: undefined;
    Welcome: undefined;
    SignUp: undefined;
    Login: undefined;
    Home: undefined;
    Profile: undefined;
    HomeTabs: undefined
};

export type ScreenRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;