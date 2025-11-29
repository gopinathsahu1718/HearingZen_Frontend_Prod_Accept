// Updated Frontend: ProfileScreen.tsx - Provider feature removed, Change Password always shown if authenticated, Step Goal and Reminder removed

import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Switch,
    ScrollView,
    Modal,
    FlatList,
    Alert,
} from 'react-native';
import VersionInfo from 'react-native-version-info';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useTranslation } from 'react-i18next';

type ProfileScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Profile'
>;

const ProfileScreen = ({
    navigation,
}: {
    navigation: ProfileScreenNavigationProp;
}) => {
    const { theme, isDarkMode, setDarkMode } = useTheme();
    const { language, setLanguage } = useLanguage();
    const { isAuthenticated, user, logout, linkGoogle, unlinkGoogle } = useAuth();
    const { t } = useTranslation();
    const [showLanguagePicker, setShowLanguagePicker] = React.useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const version = VersionInfo.appVersion;

    const languageOptions = [
        { code: 'bho', label: 'language.bho' },
        { code: 'zh', label: 'language.zh' },
        { code: 'en', label: 'language.en' },
        { code: 'hi', label: 'language.hi' },
        { code: 'ja', label: 'language.ja' },
        { code: 'kn', label: 'language.kn' },
        { code: 'ko', label: 'language.ko' },
        { code: 'ml', label: 'language.ml' },
        { code: 'mr', label: 'language.mr' },
        { code: 'or', label: 'language.or' },
        { code: 'ru', label: 'language.ru' },
        { code: 'sa', label: 'language.sa' },
        { code: 'es', label: 'language.es' },
        { code: 'ta', label: 'language.ta' },
        { code: 'te', label: 'language.te' },
        { code: 'th', label: 'language.th' },
    ];

    const isGoogleLinked = !!user?.googleId;

    const styles = useThemedStyles(theme =>
        StyleSheet.create({
            container: {
                flex: 1,
                backgroundColor: theme.background,
            },
            scrollView: {
                flex: 1,
            },
            content: {
                paddingHorizontal: 20,
                paddingBottom: 25,
            },
            headerText: {
                fontSize: 24,
                fontWeight: 'bold',
                color: theme.text,
                textAlign: 'left',
                marginBottom: 20,
                marginTop: 10,
                marginHorizontal: 20,
                letterSpacing: 1,
            },
            sectionGroup: {
                backgroundColor: theme.cardBackground,
                borderRadius: 12,
                marginBottom: 20,
                overflow: 'hidden',
                shadowColor: theme.shadowColor,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
            },
            section: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 16,
                minHeight: 60,
                borderBottomWidth: 0.5,
                borderBottomColor: theme.border,
            },
            firstSection: {
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
            },
            lastSection: {
                borderBottomWidth: 0,
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
            },
            icon: {
                width: 24,
                height: 24,
                marginRight: 16,
                tintColor: theme.iconTint,
            },
            sectionContent: {
                flex: 1,
            },
            sectionTitle: {
                fontSize: 16,
                color: theme.text,
                fontWeight: '500',
                marginBottom: 2,
            },
            sectionSubtext: {
                fontSize: 14,
                color: theme.textSecondary,
                marginTop: 2,
            },
            valueText: {
                fontSize: 16,
                color: theme.primary,
                fontWeight: '500',
            },
            deleteText: {
                color: theme.deleteText,
            },
            modalOverlay: {
                flex: 1,
                backgroundColor: theme.modalOverlay,
                justifyContent: 'center',
                alignItems: 'center',
            },
            modalContent: {
                backgroundColor: theme.cardBackground,
                borderRadius: 12,
                padding: 20,
                margin: 40,
                maxHeight: '70%',
                width: '80%',
            },
            modalTitle: {
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 20,
                color: theme.text,
            },
            optionItem: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 15,
                paddingHorizontal: 16,
                borderBottomWidth: 0.5,
                borderBottomColor: theme.border,
            },
            selectedOption: {
                backgroundColor: theme.primary + '20',
            },
            optionText: {
                fontSize: 16,
                color: theme.text,
            },
            selectedOptionText: {
                color: theme.primary,
                fontWeight: '500',
            },
            checkmark: {
                fontSize: 18,
                color: theme.primary,
                fontWeight: 'bold',
            },
            versionContainer: {
                paddingBottom: 10,
                alignItems: 'center',
            },
            versionText: {
                fontSize: 14,
                color: theme.textSecondary,
                fontWeight: '400',
            },
            userInfoSection: {
                backgroundColor: theme.cardBackground,
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                shadowColor: theme.shadowColor,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
            },
            userName: {
                fontSize: 20,
                fontWeight: 'bold',
                color: theme.text,
                marginBottom: 4,
            },
            userEmail: {
                fontSize: 14,
                color: theme.textSecondary,
            },
            googleSection: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            },
            googleStatus: {
                color: isGoogleLinked ? theme.primary : theme.textSecondary,
                fontWeight: '500',
            },
            googleActionButton: {
                backgroundColor: isGoogleLinked ? theme.danger : theme.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 4,
            },
            googleActionText: {
                color: '#fff',
                fontSize: 12,
                fontWeight: '600',
            },

            menuArrow: {
                fontSize: 24,
                color: '#9CA3AF',
                fontWeight: '300',
            },

            // Badge Styles (Optional)
            badge: {
                backgroundColor: '#3B82F6',
                borderRadius: 10,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginLeft: 8,
                minWidth: 24,
                alignItems: 'center',
                justifyContent: 'center',
            },

            badgeText: {
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 'bold',
            },
        }),
    );

    const handleLanguageSelect = async (code: string) => {
        await setLanguage(code);
        setShowLanguagePicker(false);
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    Alert.alert('Success', 'Logged out successfully');
                },
            },
        ]);
    };

    const handleGoogleAction = async () => {
        if (isGoogleLinked) {
            Alert.alert(
                'Unlink Google',
                'Are you sure you want to unlink your Google account?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Unlink',
                        style: 'destructive',
                        onPress: async () => {
                            setGoogleLoading(true);
                            try {
                                await unlinkGoogle();
                                Alert.alert('Success', 'Google account unlinked');
                            } catch (error: any) {
                                Alert.alert('Error', error.message);
                            } finally {
                                setGoogleLoading(false);
                            }
                        },
                    },
                ],
            );
        } else {
            setGoogleLoading(true);
            try {
                await linkGoogle();
                Alert.alert('Success', 'Google account linked');
            } catch (error: any) {
                Alert.alert('Error', error.message);
            } finally {
                setGoogleLoading(false);
            }
        }
    };

    const LanguageModal = () => (
        <Modal
            visible={showLanguagePicker}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowLanguagePicker(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowLanguagePicker(false)}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{t('Select Language')}</Text>
                    <FlatList
                        data={languageOptions}
                        keyExtractor={item => item.code}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.optionItem,
                                    language === item.code && styles.selectedOption,
                                ]}
                                onPress={() => handleLanguageSelect(item.code)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        language === item.code && styles.selectedOptionText,
                                    ]}
                                >
                                    {t(item.label)}
                                </Text>
                                {language === item.code && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerText}>{t('PROFILE')}</Text>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {/* User Info Section - Only show when authenticated */}
                    {isAuthenticated && user && (
                        <View style={styles.userInfoSection}>
                            <Text style={styles.userName}>{user.username}</Text>
                            <Text style={styles.userEmail}>{user.email}</Text>
                        </View>
                    )}

                    {/* Account Section */}
                    <View style={styles.sectionGroup}>
                        {/* Conditional rendering based on authentication */}
                        {!isAuthenticated ? (
                            <>
                                <TouchableOpacity
                                    style={styles.section}
                                    onPress={() => navigation.navigate('Login')}
                                >
                                    <Image
                                        source={require('../assets/images/user.png')}
                                        style={styles.icon}
                                    />
                                    <View style={styles.sectionContent}>
                                        <Text style={styles.sectionTitle}>{t('Login')}</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.section, styles.lastSection]}
                                    onPress={() => navigation.navigate('SignUp')}
                                >
                                    <Image
                                        source={require('../assets/images/user.png')}
                                        style={styles.icon}
                                    />
                                    <View style={styles.sectionContent}>
                                        <Text style={styles.sectionTitle}>{t('Signup')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={[styles.section, styles.firstSection]}
                                    onPress={() => navigation.navigate('MyEnrollments')}
                                    activeOpacity={0.7}
                                >
                                    <Image
                                        source={require('../assets/icons/LMS.png')}
                                        style={[styles.icon, { tintColor: theme.primary }]}
                                    />
                                    <View style={styles.sectionContent}>
                                        <Text style={styles.sectionTitle}>My Enrollments</Text>
                                    </View>
                                    <Text style={styles.menuArrow}>›</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.section, styles.lastSection]}
                                    onPress={handleLogout}
                                >
                                    <Image
                                        source={require('../assets/images/user.png')}
                                        style={styles.icon}
                                    />
                                    <View style={styles.sectionContent}>
                                        <Text style={styles.sectionTitle}>{t('Logout')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Personal Settings Section - Added Google link/unlink */}
                    <View style={styles.sectionGroup}>
                        <TouchableOpacity
                            style={[styles.section, styles.firstSection]}
                            onPress={() => {
                                if (isAuthenticated) {
                                    navigation.navigate('PersonalInfo');
                                } else {
                                    Alert.alert(
                                        'Authentication Required',
                                        'Please login to access this feature',
                                    );
                                }
                            }}
                        >
                            <Image
                                source={require('../assets/images/user.png')}
                                style={styles.icon}
                            />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>
                                    {t('Personal information')}
                                </Text>
                                <Text style={styles.sectionSubtext}>
                                    {t('Metric & Imperial Units, Step length, Gender')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        {isAuthenticated && (
                            <View style={styles.section}>
                                <Image
                                    source={require('../assets/images/google-icon.png')}
                                    style={styles.icon}
                                />
                                <View style={styles.sectionContent}>
                                    <Text style={styles.sectionTitle}>Google Account</Text>
                                    <Text style={styles.sectionSubtext}>
                                        Link your Google account for easier sign-in
                                    </Text>
                                </View>
                                <View style={styles.googleSection}>
                                    <Text style={styles.googleStatus}>
                                        {isGoogleLinked ? 'Linked' : 'Not linked'}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.googleActionButton}
                                        onPress={handleGoogleAction}
                                        disabled={googleLoading}
                                    >
                                        <Text style={styles.googleActionText}>
                                            {googleLoading
                                                ? '...'
                                                : isGoogleLinked
                                                    ? 'Unlink'
                                                    : 'Link'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Data Section - Change Password always shown if authenticated */}
                    <View style={styles.sectionGroup}>
                        {isAuthenticated && (
                            <TouchableOpacity
                                style={[styles.section, styles.firstSection]}
                                onPress={() => navigation.navigate('ChangePassword')}
                            >
                                <Image
                                    source={require('../assets/images/password.png')}
                                    style={styles.icon}
                                />
                                <View style={styles.sectionContent}>
                                    <Text style={styles.sectionTitle}>
                                        {t('Change Password')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* App Settings Section */}
                    <View style={styles.sectionGroup}>
                        <View style={[styles.section, styles.firstSection]}>
                            <Image
                                source={require('../assets/images/darkmode.png')}
                                style={styles.icon}
                            />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Dark Mode')}</Text>
                            </View>
                            <Switch
                                value={isDarkMode}
                                onValueChange={setDarkMode}
                                trackColor={{
                                    false: theme.switchTrackFalse,
                                    true: theme.switchTrackTrue,
                                }}
                                thumbColor={theme.switchThumb}
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.section, styles.lastSection]}
                            onPress={() => setShowLanguagePicker(true)}
                        >
                            <Image
                                source={require('../assets/images/language.png')}
                                style={styles.icon}
                            />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Language options')}</Text>
                            </View>
                            <Text style={styles.valueText}>
                                {t(`language.${language}`)} ▼
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Support Section */}
                    <View style={styles.sectionGroup}>
                        <TouchableOpacity
                            style={[styles.section, styles.firstSection]}
                            onPress={() => navigation.navigate('Instructions')}
                        >
                            <Image
                                source={require('../assets/images/help.png')}
                                style={styles.icon}
                            />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Instructions')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.section}
                            onPress={() => navigation.navigate('Feedback')}
                        >
                            <Image
                                source={require('../assets/images/feedback.png')}
                                style={styles.icon}
                            />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Feedback')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.section}
                            onPress={() => navigation.navigate('PrivacyPolicy')}
                        >
                            <Image
                                source={require('../assets/images/privacy.png')}
                                style={styles.icon}
                            />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Privacy policy')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.section}
                            onPress={() => navigation.navigate('Help')}
                        >
                            <Image
                                source={require('../assets/images/help.png')}
                                style={styles.icon}
                            />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Help')}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.section]}
                            onPress={() => navigation.navigate('AboutUsScreen')}
                        >
                            <Image
                                source={require('../assets/images/info.png')}
                                style={styles.icon}
                            />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('About Us')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.section, styles.lastSection]}
                            onPress={() => navigation.navigate('TermsAndConditionsScreen')}
                        >
                            <Image
                                source={require('../assets/images/info.png')}
                                style={styles.icon}
                            />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>
                                    {t('Terms and Conditions')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Version Information */}
                    <View style={styles.versionContainer}>
                        <Text style={styles.versionText}>
                            {t('Version')} {version}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <LanguageModal />
        </SafeAreaView>
    );
};

export default ProfileScreen;