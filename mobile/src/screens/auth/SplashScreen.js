import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Shield, Sparkles } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export const SplashScreen = ({ navigation }) => {
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Login');
      }
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      {/* Ambient background aura */}
      <View style={styles.glowAura} />

      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <Shield size={48} color={COLORS.primaryLight} />
        </View>
        <Text style={styles.title}>ESPORT HUB</Text>
        <View style={styles.taglineRow}>
          <Sparkles size={14} color={COLORS.gold} />
          <Text style={styles.subtitle}>COMPETITIVE TOURNAMENT PLATFORM</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.primaryLight} />
        <Text style={styles.loadingText}>Syncing tournament arena...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  glowAura: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    filter: 'blur(40px)',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
