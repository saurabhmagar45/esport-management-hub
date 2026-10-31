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
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { authAPI } from '../../api/auth';
import { getErrorMessage } from '../../api/client';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) {
      setError('Please provide your registered account email.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      Alert.alert('Request Failed', msg);
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.textSecondary} />
          <Text style={styles.backText}>Back to Sign In</Text>
        </TouchableOpacity>

        {submitted ? (
          <View style={styles.successBox}>
            <CheckCircle size={48} color={COLORS.success} />
            <Text style={styles.successTitle}>Reset Link Dispatched</Text>
            <Text style={styles.successDesc}>
              If an active account is linked to {email}, password recovery instructions have been
              transmitted.
            </Text>
            <CustomButton
              title="Return to Login"
              onPress={() => navigation.navigate('Login')}
              style={{ width: '100%', marginTop: 24 }}
            />
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>RECOVER ACCOUNT</Text>
              <Text style={styles.subtitle}>
                Enter your account email to receive reset instructions
              </Text>
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.form}>
              <CustomInput
                label="Registered Email Address"
                placeholder="player@esporthub.gg"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                icon={<Mail size={18} color={COLORS.textMuted} />}
              />

              <CustomButton
                title="Send Recovery Instructions"
                onPress={handleSubmit}
                loading={loading}
                style={styles.submitBtn}
              />
            </View>
          </>
        )}
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
    marginBottom: 32,
  },
  backText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    marginBottom: 28,
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
  submitBtn: {
    marginTop: 10,
  },
  successBox: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 40,
  },
  successTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  successDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
