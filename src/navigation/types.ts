import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EditorLang } from '../data/editor';

export type TabParamList = {
  Home: undefined;
  Courses: undefined;
  Practice: { tab?: 'languages' | 'dashboard' | 'certificates' } | undefined;
  Progress: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  SignIn: { mode?: 'signin' | 'signup' } | undefined;
  Goals: undefined;
  EditGoal: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  CourseDetail: { courseId: string };
  Lesson: { courseId: string; lesson?: number }; // lesson = 1-based number, defaults to the next one
  QuizSession: {
    courseId: string;
    module: number; // module -1 = Master Quiz covering the whole course
    kind?: 'topic' | 'master';
    topics?: string[]; // topic practice: only these module titles
    count?: number; // topic practice: how many questions
  };
  PracticeLanguage: { courseId: string };
  Certificate: { courseId: string };
  Flashcards: undefined;
  FlashcardDeck: { courseId: string };
  FlashcardViewer: { courseId: string; ids: string[]; start: number };
  CodeEditor: { lang?: EditorLang; code?: string } | undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
