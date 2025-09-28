import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

// Navigation params type
type RootStackParamList = {
  SubjectDetailScreen: { categoryName: string };
  LessonsPage: { subjectName: string };
};

type SubjectDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'SubjectDetailScreen'
>;

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  'SubjectDetailScreen'
>;

// Example subjects dataset
const SUBJECTS = [
  // Web Development
  { id: '1', name: 'HTML & CSS', category: 'Web Development', score: 85, icon: '🌐' },
  { id: '2', name: 'JavaScript', category: 'Web Development', score: 78, icon: '📜' },
  { id: '3', name: 'React.js', category: 'Web Development', score: 88, icon: '⚛️' },
  { id: '4', name: 'Node.js', category: 'Web Development', score: 82, icon: '🟢' },

  // App Development
  { id: '5', name: 'Java (Android)', category: 'App Development', score: 80, icon: '📱' },
  { id: '6', name: 'Kotlin', category: 'App Development', score: 74, icon: '🤖' },
  { id: '7', name: 'Swift (iOS)', category: 'App Development', score: 70, icon: '🍎' },
  { id: '8', name: 'React Native', category: 'App Development', score: 90, icon: '⚡' },

  // Machine Learning
  { id: '9', name: 'Python for ML', category: 'Machine Learning', score: 92, icon: '🐍' },
  { id: '10', name: 'Data Preprocessing', category: 'Machine Learning', score: 76, icon: '🧹' },
  { id: '11', name: 'Deep Learning', category: 'Machine Learning', score: 88, icon: '🧠' },
  { id: '12', name: 'NLP', category: 'Machine Learning', score: 81, icon: '💬' },
];

const getScoreGradient = (score?: number) => {
  if (!score) return ['#E5E7EB', '#D1D5DB'];
  if (score >= 90) return ['#10B981', '#059669'];
  if (score >= 80) return ['#3B82F6', '#2563EB'];
  if (score >= 70) return ['#F59E0B', '#D97706'];
  if (score >= 60) return ['#EF4444', '#DC2626'];
  return ['#9CA3AF', '#6B7280'];
};

const getPerformanceLabel = (score?: number) => {
  if (!score) return 'No Score';
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Average';
  if (score >= 60) return 'Below Average';
  return 'Needs Improvement';
};

// Category icons
const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    'Web Development': '🌐',
    'App Development': '📱',
    'Machine Learning': '🤖',
  };
  return icons[category] || '📖';
};

// Category gradients
const getCategoryGradient = (category: string) => {
  const gradients: Record<string, string[]> = {
    'Web Development': ['#06b6d4', '#3b82f6'],   // teal → blue
    'App Development': ['#ec4899', '#8b5cf6'],   // pink → purple
    'Machine Learning': ['#10b981', '#059669'],  // green shades
  };
  return gradients[category] || ['#667eea', '#764ba2'];
};

const SubjectDetailScreen = () => {
  const route = useRoute<SubjectDetailScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { categoryName } = route.params;

  // Filter subjects by selected category
  const filteredSubjects = SUBJECTS.filter(s => s.category === categoryName);

  const calculateAverage = () => {
    if (filteredSubjects.length === 0) return 0;
    const total = filteredSubjects.reduce(
      (sum, subject) => sum + (subject.score || 0),
      0,
    );
    return Math.round(total / filteredSubjects.length);
  };

  const renderSubjectCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate('LessonsPage', { subjectName: item.name })
      }
    >
      <View style={styles.cardContent}>
        <View style={styles.subjectInfo}>
          <View style={styles.iconContainer}>
            <Text style={styles.subjectIcon}>{item.icon}</Text>
          </View>
          <View style={styles.subjectDetails}>
            <Text style={styles.subjectName}>{item.name}</Text>
            <Text style={styles.performanceLabel}>
              {getPerformanceLabel(item.score)}
            </Text>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <LinearGradient
            colors={getScoreGradient(item.score)}
            style={styles.scoreCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.scoreText}>{item.score ?? '--'}</Text>
            <Text style={styles.scoreSymbol}>%</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={getScoreGradient(item.score)}
            style={[styles.progressFill, { width: `${item.score || 0}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={getCategoryGradient(categoryName)}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        
        <Text style={styles.header}>{categoryName} Courses</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{filteredSubjects.length}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          

        </View>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      {renderHeader()}
      <View style={styles.contentContainer}>
        <FlatList
          data={filteredSubjects}
          keyExtractor={item => item.id}
          renderItem={renderSubjectCard}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerGradient: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: { alignItems: 'center' },
  categoryIcon: { fontSize: 32, marginBottom: 8 },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(102, 208, 247, 0.85)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  statLabel: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', marginTop: 2 },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  listContainer: { padding: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subjectIcon: { fontSize: 24 },
  subjectDetails: { flex: 1 },
  subjectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  performanceLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  scoreContainer: { alignItems: 'center' },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  scoreSymbol: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  progressContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  progressTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
});

export default SubjectDetailScreen;
