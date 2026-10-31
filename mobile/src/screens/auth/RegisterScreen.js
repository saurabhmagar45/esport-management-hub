import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { User, Mail, Lock, Gamepad2, ArrowLeft } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/client';

export const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bgmiIgn, setBgmiIgn] = useState('');
  const [freefireIgn, setFreefireIgn] = useState('');
  const [role, setRole] = useState('player'); // 'player' or 'organizer'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please provide your name, email, and a secure password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        bgmiIgn: bgmiIgn.trim(),
        freefireIgn: freefireIgn.trim(),
      });
      navigation.replace('MainTabs');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Top Back Nav */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.textSecondary} />
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>JOIN ESPORT HUB</Text>
          <Text style={styles.subtitle}>Create your official competitive esports player passport</Text>
        </View>

        {/* Role Selector Tabs */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleTab, role === 'player' && styles.roleTabActive]}
            onPress={() => setRole('player')}
          >
            <Text style={[styles.roleTabText, role === 'player' && styles.roleTabTextActive]}>
              Player
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleTab, role === 'organizer' && styles.roleTabActive]}
            onPress={() => setRole('organizer')}
          >
            <Text style={[styles.roleTabText, role === 'organizer' && styles.roleTabTextActive]}>
              Tournament Host
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Alert Box */}
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.form}>
          <CustomInput
            label="Full Name"
            placeholder="e.g. Alex Hunter"
            value={name}
            onChangeText={setName}
            icon={<User size={18} color={COLORS.textMuted} />}
          />

          <CustomInput
            label="Email Address"
            placeholder="player@esporthub.gg"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={18} color={COLORS.textMuted} />}
          />

          <CustomInput
            label="Password (min 6 characters)"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<Lock size={18} color={COLORS.textMuted} />}
          />

          <View style={styles.divider} />
          <Text style={styles.sectionHeader}>IN-GAME IDENTIFIERS (OPTIONAL)</Text>

          <CustomInput
            label="BGMI In-Game Name (IGN)"
            placeholder="e.g. SOUL_Mortal"
            value={bgmiIgn}
            onChangeText={setBgmiIgn}
            icon={<Gamepad2 size={18} color="#ea580c" />}
          />

          <CustomInput
            label="Free Fire In-Game Name (IGN)"
            placeholder="e.g. TOTAL_GAMING"
            value={freefireIgn}
            onChangeText={setFreefireIgn}
            icon={<Gamepad2 size={18} color="#ef4444" />}
          />

          <CustomButton
            title="Create Profile & Enter Hub"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 50,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  backText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  roleTabActive: {
    backgroundColor: COLORS.primary,
  },
  roleTabText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  roleTabTextActive: {
    color: '#ffffff',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  sectionHeader: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 14,
  },
  submitBtn: {
    marginTop: 10,
  },
});
