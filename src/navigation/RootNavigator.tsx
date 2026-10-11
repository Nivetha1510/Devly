import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconName } from '../components/ui';
import { useApp } from '../context/AppContext';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import CoursesScreen from '../screens/CoursesScreen';
import FlashcardDeckScreen from '../screens/FlashcardDeckScreen';
import FlashcardsScreen from '../screens/FlashcardsScreen';
import FlashcardViewerScreen from '../screens/FlashcardViewerScreen';
import GoalsScreen from '../screens/GoalsScreen';
import HomeScreen from '../screens/HomeScreen';
import LessonScreen from '../screens/LessonScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SignInScreen from '../screens/SignInScreen';
import ProgressScreen from '../screens/ProgressScreen';
import CertificateScreen from '../screens/CertificateScreen';
import CodeEditorScreen from '../screens/CodeEditorScreen';
import PracticeLanguageScreen from '../screens/PracticeLanguageScreen';
import PracticeScreen from '../screens/PracticeScreen';
import QuizScreen from '../screens/QuizScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { F } from '../theme/fonts';
import { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, [IconName, IconName]> = {
  Home: ['home', 'home-outline'],
  Courses: ['book', 'book-outline'],
  Practice: ['help-circle', 'help-circle-outline'],
  Progress: ['stats-chart', 'stats-chart-outline'],
  Profile: ['person', 'person-outline'],
};

function Tabs() {
  const { colors: c } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: c.primaryText,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: {
          backgroundColor: c.nav,
          borderTopColor: c.border,
          height: 76 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 12),
        },
        tabBarLabelStyle: { fontFamily: F.bold, fontSize: 11, lineHeight: 15 },
        tabBarIconStyle: { width: 56, height: 30 },
        tabBarItemStyle: { gap: 4 },
        tabBarIcon: ({ focused, color }) => (
          <View
            style={{
              width: 56,
              height: 30,
              borderRadius: 15,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? c.primarySoft : 'transparent',
            }}
          >
            <Ionicons name={TAB_ICONS[route.name][focused ? 0 : 1]} size={21} color={color} />
          </View>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Courses" component={CoursesScreen} />
      <Tab.Screen name="Practice" component={PracticeScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Screens are chosen by whether onboarding is finished, so finishing it
// (or signing out) switches flows automatically.
export default function RootNavigator() {
  const { prefs, colors } = useApp();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }}>
      {prefs.onboarded ? (
        <>
          <Stack.Screen name="Main" component={Tabs} />
          <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
          <Stack.Screen name="Lesson" component={LessonScreen} />
          <Stack.Screen name="PracticeLanguage" component={PracticeLanguageScreen} />
          <Stack.Screen name="Certificate" component={CertificateScreen} />
          <Stack.Screen name="Flashcards" component={FlashcardsScreen} />
          <Stack.Screen name="FlashcardDeck" component={FlashcardDeckScreen} />
          <Stack.Screen name="FlashcardViewer" component={FlashcardViewerScreen} />
          <Stack.Screen name="CodeEditor" component={CodeEditorScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="QuizSession" component={QuizScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="EditGoal" component={GoalsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="Goals" component={GoalsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
