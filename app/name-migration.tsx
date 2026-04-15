import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/providers/auth-provider';
import { useAppTheme } from '@/providers/theme-provider';

const MIGRATION_KEY = '@degrow_name_migration_done';

export default function NameMigrationScreen() {
  const router = useRouter();
  const { colors, resolvedTheme } = useAppTheme();
  const { user, updateProfile, isLoading: isUpdating } = useAuth();
  const [name, setName] = useState(user?.name ?? '');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a name to continue.');
      return;
    }

    try {
      await updateProfile({ name: name.trim() });
      await AsyncStorage.setItem(MIGRATION_KEY, 'true');
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Could not update your name. Please try again.');
    }
  };

  const handleSkip = async () => {
    void Haptics.selectionAsync();
    await AsyncStorage.setItem(MIGRATION_KEY, 'true');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.headerArea}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="person-outline" size={40} color={colors.tint} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Update your name</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              We noticed your display name might not be correct. Please confirm or update it below.
            </Text>
          </View>

          <View style={styles.formArea}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Your name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSoft}
                autoCapitalize="words"
                autoCorrect={false}
                value={name}
                onChangeText={setName}
              />
            </View>

            <Pressable
              onPress={handleSave}
              disabled={isUpdating}
              style={[
                styles.primaryButton,
                { backgroundColor: colors.tint },
                isUpdating && { opacity: 0.5 }
              ]}>
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                {isUpdating ? 'Saving...' : 'Save name'}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSkip}
              style={styles.skipButton}>
              <Text style={[styles.skipButtonText, { color: colors.textMuted }]}>
                Skip for now
              </Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  headerArea: {
    marginBottom: 40,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    textAlign: 'center',
  },
  formArea: {
    gap: 20,
    marginBottom: 40,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
