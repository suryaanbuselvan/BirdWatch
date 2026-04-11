import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type MainTabParamList = {
  Home: undefined;
  Collection: undefined;
  Map: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Identify: undefined;
  Details: { birdId: string };
  EditProfile: undefined;
  Badges: undefined;
  IdentificationFailure: { error?: string };
};
