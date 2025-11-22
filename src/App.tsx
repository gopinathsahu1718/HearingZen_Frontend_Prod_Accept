// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import { Alert, Button, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';

// import {
//   GoogleSignin,
//   isSuccessResponse,
//   isErrorWithCode,
//   GoogleSigninButton,
//   statusCodes,
//   isNoSavedCredentialFoundResponse,
// } from '@react-native-google-signin/google-signin';
// import { useState } from 'react';

// GoogleSignin.configure({
//   "webClientId": "1000081878315-tlp813267usjpdq7bi0qvs31kslfivo7.apps.googleusercontent.com",
//   "iosClientId": "1000081878315-g6pkql3f870j3531mnhnc82v221nh8h9.apps.googleusercontent.com",
// });

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';
//   const [userInfo, setUserInfo] = useState<any>(null);

//   const handleGoogleSignIn = async () => {
//     try {
//       await GoogleSignin.hasPlayServices();
//       const response = await GoogleSignin.signIn();
//       if (isSuccessResponse(response)) {
//         setUserInfo(response.data);
//         // setState({ userInfo: response.data });
//       } else {
//         // sign in was cancelled by user
//         console.log("sign in was cancelled by user");


//       }
//     }
//     catch (error) {
//       if (isErrorWithCode(error)) {
//         switch (error.code) {
//           case statusCodes.IN_PROGRESS:
//             Alert.alert("Sign in is in progress");
//             // operation (eg. sign in) already in progress
//             break;
//           case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
//             Alert.alert("Play service is not available");
//             // Android only, play services not available or outdated
//             break;
//           default:
//           // some other error happened
//         }
//       } else {
//         Alert.alert("an error that's not related to google sign in occurred");
//         // an error that's not related to google sign in occurred
//       }
//     }
//   }

//   const handleGoogleSignOut = async () => {
//     try {
//       await GoogleSignin.signOut();
//       setUserInfo(null);
//       Alert.alert("Logged out!", "You have been signed out");
//     } catch (error) {
//       console.log("Log out error", error);
//       Alert.alert("Error", "Failed to logout");

//     }
//   }

//   const getCurrentUser = async () => {
//     try {
//       const respone = await GoogleSignin.signInSilently();
//       if (isSuccessResponse(respone)) {
//         console.log("Current User:", respone);
//         setUserInfo(respone.data.user)
//       } else if (isNoSavedCredentialFoundResponse(respone)) {
//         Alert.alert("No user", "No saved credential found");
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Failed to fetch current user")
//     }
//   }

//   return (
//     <SafeAreaProvider>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <View style={styles.container}>
//         <Text>Index</Text>
//         {
//           userInfo ?
//             (
//               <View>
//                 <Text>{JSON.stringify(userInfo, null, 2)}</Text>
//                 <Button title='Sign out' onPress={handleGoogleSignOut} />
//                 <Button title='Get Current User' onPress={getCurrentUser} />
//               </View>
//             )
//             :
//             (
//               <GoogleSigninButton
//                 style={{ width: 212, height: 48 }}
//                 color={GoogleSigninButton.Color.Dark}
//                 onPress={handleGoogleSignIn}
//               />
//             )
//         }

//       </View>

//     </SafeAreaProvider>
//   );
// }


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center"
//   },
// });

// export default App;

import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { FitnessProvider } from './contexts/FitnessContext';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <FitnessProvider>
              <AppNavigator />
            </FitnessProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </I18nextProvider>
  );
};

export default App;