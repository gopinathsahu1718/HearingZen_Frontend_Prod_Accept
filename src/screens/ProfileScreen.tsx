import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, Switch, ScrollView, Modal, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useTranslation } from 'react-i18next';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = ({ navigation }: { navigation: ProfileScreenNavigationProp }) => {
    const { theme, isDarkMode, setDarkMode } = useTheme();
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();
    const [selectedStepGoal, setSelectedStepGoal] = React.useState(6000);
    const [reminderTime, setReminderTime] = React.useState(new Date());
    const [showStepGoalPicker, setShowStepGoalPicker] = React.useState(false);
    const [showLanguagePicker, setShowLanguagePicker] = React.useState(false);
    const [showTimePicker, setShowTimePicker] = React.useState(false);

    const stepGoalOptions = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];
    const languageOptions = [
        { code: 'en', label: 'language.en' },
        { code: 'es', label: 'language.es' },
    ];

    const styles = useThemedStyles((theme) => StyleSheet.create({
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
        refreshIcon: {
            width: 20,
            height: 20,
            tintColor: theme.refreshIconTint,
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
        achievementBadge: {
            backgroundColor: theme.achievementBackground,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            minWidth: 30,
            alignItems: 'center',
        },
        achievementText: {
            color: theme.achievementText,
            fontSize: 12,
            fontWeight: 'bold',
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
    }));

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString(language, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const handleStepGoalSelect = (goal: number) => {
        setSelectedStepGoal(goal);
        setShowStepGoalPicker(false);
    };

    const handleLanguageSelect = async (code: string) => {
        await setLanguage(code);
        setShowLanguagePicker(false);
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        if (selectedTime) {
            setReminderTime(selectedTime);
        }
        setShowTimePicker(false);
    };

    const StepGoalModal = () => (
        <Modal
            visible={showStepGoalPicker}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowStepGoalPicker(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowStepGoalPicker(false)}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{t('Select Step Goal')}</Text>
                    <FlatList
                        data={stepGoalOptions}
                        keyExtractor={(item) => item.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.optionItem, selectedStepGoal === item && styles.selectedOption]}
                                onPress={() => handleStepGoalSelect(item)}
                            >
                                <Text style={[styles.optionText, selectedStepGoal === item && styles.selectedOptionText]}>
                                    {item.toLocaleString()} {t('steps')}
                                </Text>
                                {selectedStepGoal === item && <Text style={styles.checkmark}>✓</Text>}
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    );

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
                        keyExtractor={(item) => item.code}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.optionItem, language === item.code && styles.selectedOption]}
                                onPress={() => handleLanguageSelect(item.code)}
                            >
                                <Text style={[styles.optionText, language === item.code && styles.selectedOptionText]}>
                                    {t(item.label)}
                                </Text>
                                {language === item.code && <Text style={styles.checkmark}>✓</Text>}
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
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Account Section */}
                    <View style={styles.sectionGroup}>
                        <View style={[styles.section, styles.firstSection]}>
                            <Image source={require('../assets/images/trophy.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Achievements')}</Text>
                            </View>
                            <View style={styles.achievementBadge}>
                                <Text style={styles.achievementText}>1K</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.section} onPress={() => navigation.navigate('Login')}>
                            <Image source={require('../assets/images/user.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Login')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.section, styles.lastSection]} onPress={() => navigation.navigate('SignUp')}>
                            <Image source={require('../assets/images/user.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Signup')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Personal Settings Section */}
                    <View style={styles.sectionGroup}>
                        <TouchableOpacity style={[styles.section, styles.firstSection]}>
                            <Image source={require('../assets/images/user.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Personal information')}</Text>
                                <Text style={styles.sectionSubtext}>{t('Metric & Imperial Units, Step length, Gender')}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={[styles.section, styles.lastSection]}>
                            <Image source={require('../assets/images/goal.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Step Goal')}</Text>
                                <Text style={styles.sectionSubtext}>{t('Daily step target')}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowStepGoalPicker(true)}>
                                <Text style={styles.valueText}>{selectedStepGoal.toLocaleString()} ▼</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Data & Backup Section */}
                    <View style={styles.sectionGroup}>
                        <TouchableOpacity style={[styles.section, styles.firstSection]}>
                            <Image source={require('../assets/images/backup.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Backup & Restore')}</Text>
                            </View>
                            <Image source={require('../assets/images/refresh.png')} style={styles.refreshIcon} />
                        </TouchableOpacity>
                        <View style={[styles.section, styles.lastSection]}>
                            <Image source={require('../assets/images/reminder.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Reminder')}</Text>
                                <Text style={styles.sectionSubtext}>{t('Every day')}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                                <Text style={styles.valueText}>{formatTime(reminderTime)} ▼</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* App Settings Section */}
                    <View style={styles.sectionGroup}>
                        <View style={[styles.section, styles.firstSection]}>
                            <Image source={require('../assets/images/darkmode.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Dark Mode')}</Text>
                            </View>
                            <Switch
                                value={isDarkMode}
                                onValueChange={setDarkMode}
                                trackColor={{ false: theme.switchTrackFalse, true: theme.switchTrackTrue }}
                                thumbColor={theme.switchThumb}
                            />
                        </View>
                        <TouchableOpacity style={[styles.section, styles.lastSection]} onPress={() => setShowLanguagePicker(true)}>
                            <Image source={require('../assets/images/language.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Language options')}</Text>
                            </View>
                            <Text style={styles.valueText}>{t(`language.${language}`)} ▼</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Support Section */}
                    <View style={styles.sectionGroup}>
                        <TouchableOpacity style={[styles.section, styles.firstSection]}>
                            <Image source={require('../assets/images/help.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Instructions')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.section}>
                            <Image source={require('../assets/images/feedback.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Feedback')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.section}>
                            <Image source={require('../assets/images/privacy.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Privacy policy')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.section}>
                            <Image source={require('../assets/images/help.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('Help')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.section, styles.lastSection]}>
                            <Image source={require('../assets/images/info.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>{t('About Us')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Danger Zone */}
                    <View style={styles.sectionGroup}>
                        <TouchableOpacity style={[styles.section, styles.firstSection, styles.lastSection]}>
                            <Image source={require('../assets/images/delete.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={[styles.sectionTitle, styles.deleteText]}>{t('Delete all data')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Version Information */}
                    <View style={styles.versionContainer}>
                        <Text style={styles.versionText}>{t('Version 1.0.0')}</Text>
                    </View>
                </View>
            </ScrollView>

            <StepGoalModal />
            <LanguageModal />

            {showTimePicker && (
                <DateTimePicker
                    value={reminderTime}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={handleTimeChange}
                />
            )}
        </SafeAreaView>
    );
};

export default ProfileScreen;