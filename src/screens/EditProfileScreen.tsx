import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/types';
import { useUser, DEFAULT_AVATAR } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
  const { userName, userAvatar, updateProfile, signOut } = useUser();
  const { colors } = useTheme();
  
  const [nameInput, setNameInput] = useState(userName);
  const [avatarInput, setAvatarInput] = useState(userAvatar);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarInput(result.assets[0].uri);
    }
  };

  const clearImage = () => {
    setAvatarInput(DEFAULT_AVATAR);
  };

  const handleSave = () => {
    const finalName = nameInput.trim() === '' ? 'User' : nameInput.trim();
    updateProfile(finalName, avatarInput);
    navigation.goBack();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? 40 : 0 }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.textMuted, fontSize: 16 }}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: avatarInput }} style={styles.avatarDisplay} />
            </View>
            
            <View style={styles.avatarControls}>
              <TouchableOpacity onPress={pickImage} style={[styles.pickButton, { backgroundColor: colors.surface }]}>
                <Text style={[styles.pickButtonText, { color: colors.primary }]}>Change Photo</Text>
              </TouchableOpacity>
              
              {avatarInput !== DEFAULT_AVATAR && (
                <TouchableOpacity onPress={clearImage} style={styles.clearButton}>
                  <Text style={[styles.clearButtonText, { color: colors.textMuted }]}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>DISPLAY NAME</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
              maxLength={20}
              autoCorrect={false}
            />
          </View>
        </View>

        <TouchableOpacity onPress={handleSave} style={styles.saveContainer}>
          <LinearGradient
            colors={colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 20,
  },
  avatarDisplay: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  pickButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  clearButton: {
    marginLeft: 16,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  textInput: {
    height: 60,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
  },
  saveContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  saveButton: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  signOutButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
