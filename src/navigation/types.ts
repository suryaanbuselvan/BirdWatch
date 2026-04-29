import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type MainTabParamList = {
  Home: undefined;
  Collection: undefined;
  Map: undefined;
};

export type RootStackParamList = {
  SignIn: undefined;
  MainTabs: undefined;
  Identify: undefined;
  Details: { birdId: string; captureUid?: string };
  EditProfile: undefined;
  Badges: undefined;
  Missions: undefined;
  IdentificationFailure: { error?: string };
};
