import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, Switch, ScrollView, Modal, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = ({ navigation }: { navigation: ProfileScreenNavigationProp }) => {
    const [isDarkMode, setIsDarkMode] = React.useState(false);
    const [selectedStepGoal, setSelectedStepGoal] = React.useState(6000);
    const [reminderTime, setReminderTime] = React.useState(new Date());
    const [showStepGoalPicker, setShowStepGoalPicker] = React.useState(false);
    const [showTimePicker, setShowTimePicker] = React.useState(false);

    const stepGoalOptions = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleStepGoalSelect = (goal: number) => {
        setSelectedStepGoal(goal);
        setShowStepGoalPicker(false);
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
                    <Text style={styles.modalTitle}>Select Step Goal</Text>
                    <FlatList
                        data={stepGoalOptions}
                        keyExtractor={(item) => item.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.optionItem,
                                    selectedStepGoal === item && styles.selectedOption
                                ]}
                                onPress={() => handleStepGoalSelect(item)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    selectedStepGoal === item && styles.selectedOptionText
                                ]}>
                                    {item.toLocaleString()} steps
                                </Text>
                                {selectedStepGoal === item && (
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
            <Text style={styles.headerText}>PROFILE</Text>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>

                    {/* Account Section */}
                    <View style={styles.sectionGroup}>
                        {/* Achievements */}
                        <View style={[styles.section, styles.firstSection]}>
                            <Image source={require('../assets/images/trophy.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>Achievements</Text>
                            </View>
                            <View style={styles.achievementBadge}>
                                <Text style={styles.achievementText}>1K</Text>
                            </View>
                        </View>

                        {/* Login */}
                        <TouchableOpacity style={styles.section} onPress={() => navigation.navigate('Login')}>
                            <Image source={require('../assets/images/user.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>Login</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Signup */}
                        <TouchableOpacity style={[styles.section, styles.lastSection]} onPress={() => navigation.navigate('SignUp')}>
                            <Image source={require('../assets/images/user.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>Signup</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Personal Settings Section */}
                    <View style={styles.sectionGroup}>
                        {/* Personal information */}
                        <TouchableOpacity style={[styles.section, styles.firstSection]}>
                            <Image source={require('../assets/images/user.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>Personal information</Text>
                                <Text style={styles.sectionSubtext}>Metric & Imperial Units, Step length, Gender</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Step Goal */}
                        <View style={[styles.section, styles.lastSection]}>
                            <Image source={require('../assets/images/goal.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>Step Goal</Text>
                                <Text style={styles.sectionSubtext}>
                                    Daily step target
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowStepGoalPicker(true)}>
                                <Text style={styles.valueText}>{selectedStepGoal.toLocaleString()} ▼</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Data & Backup Section */}
                    <View style={styles.sectionGroup}>
                        {/* Backup & Restore */}
                        <TouchableOpacity style={[styles.section, styles.firstSection]}>
                            <Image source={require('../assets/images/backup.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>Backup & Restore</Text>
                            </View>
                            <Image source={require('../assets/images/refresh.png')} style={styles.refreshIcon} />
                        </TouchableOpacity>

                        {/* Reminder */}
                        <View style={[styles.section, styles.lastSection]}>
                            <Image source={require('../assets/images/reminder.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>Reminder</Text>
                                <Text style={styles.sectionSubtext}>Every day</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                                <Text style={styles.valueText}>{formatTime(reminderTime)} ▼</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* App Settings Section */}
                    <View style={styles.sectionGroup}>
                        {/* Dark Mode */}
                        <View style={[styles.section, styles.firstSection]}>
                            <Image source={require('../assets/images/darkmode.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>Dark Mode</Text>
                            </View>
                            <Switch
                                value={isDarkMode}
                                onValueChange={setIsDarkMode}
                                trackColor={{ false: '#d3d3d3', true: '#007BFF' }}
                                thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
                            />
                        </View>

                        {/* Language options */}
                        <TouchableOpacity style={[styles.section, styles.lastSection]}>
                            <Image source={require('../assets/images/language.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>Language options</Text>
                            </View>
                            <Text style={styles.valueText}>English ▼</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Support Section */}
                    <View style={styles.sectionGroup}>
                        {/* Instructions */}
                        <TouchableOpacity style={[styles.section, styles.firstSection]}>
                            <Image source={require('../assets/images/help.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>Instructions</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Feedback */}
                        <TouchableOpacity style={styles.section}>
                            <Image source={require('../assets/images/feedback.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>Feedback</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Privacy policy */}
                        <TouchableOpacity style={styles.section}>
                            <Image source={require('../assets/images/privacy.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>Privacy policy</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Help */}
                        <TouchableOpacity style={styles.section}>
                            <Image source={require('../assets/images/help.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>Help</Text>
                            </View>
                        </TouchableOpacity>

                        {/* About Us */}
                        <TouchableOpacity style={[styles.section, styles.lastSection]}>
                            <Image source={require('../assets/images/info.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionTitle}>About Us</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Danger Zone */}
                    <View style={styles.sectionGroup}>
                        {/* Delete all data */}
                        <TouchableOpacity style={[styles.section, styles.firstSection, styles.lastSection]}>
                            <Image source={require('../assets/images/delete.png')} style={styles.icon} />
                            <View style={styles.sectionContent}>
                                <Text style={[styles.sectionTitle, styles.deleteText]}>Delete all data</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Version Information */}
                    <View style={styles.versionContainer}>
                        <Text style={styles.versionText}>Version 1.0.0</Text>
                    </View>
                </View>
            </ScrollView>


            {/* Step Goal Picker Modal */}
            <StepGoalModal />

            {/* Time Picker */}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
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
        color: '#000',
        textAlign: 'left',
        marginBottom: 20,
        marginTop: 10,
        marginHorizontal: 20,
        letterSpacing: 1,
    },
    sectionGroup: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
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
        borderBottomColor: '#f0f0f0',
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
        tintColor: '#666',
    },
    refreshIcon: {
        width: 20,
        height: 20,
        tintColor: '#007BFF',
    },
    sectionContent: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
        marginBottom: 2,
    },
    sectionSubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 2,
    },
    sectionDescription: {
        fontSize: 13,
        color: '#999',
        marginTop: 2,
        lineHeight: 18,
    },
    valueText: {
        fontSize: 16,
        color: '#007BFF',
        fontWeight: '500',
    },
    achievementBadge: {
        backgroundColor: '#333',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 30,
        alignItems: 'center',
    },
    achievementText: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: 'bold',
    },
    deleteText: {
        color: '#FF4444',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
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
        color: '#000',
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0f0f0',
    },
    selectedOption: {
        backgroundColor: '#f0f8ff',
    },
    optionText: {
        fontSize: 16,
        color: '#000',
    },
    selectedOptionText: {
        color: '#007BFF',
        fontWeight: '500',
    },
    checkmark: {
        fontSize: 18,
        color: '#007BFF',
        fontWeight: 'bold',
    },
    // Version styles
    versionContainer: {
        paddingBottom: 10,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '400',
    },
});

export default ProfileScreen;