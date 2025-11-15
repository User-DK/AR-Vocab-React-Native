export type RootStackParamList = {
  Home: undefined;
  Categories: undefined;
  Learning: { category: string };
  Assessment: undefined;
  SpeechAssessment: { category: string; itemIndex?: number };
  Progress: undefined;
  Settings: undefined;
  Help: undefined;
};

export interface NavigationProps {
  navigation: any;
  route?: any;
}