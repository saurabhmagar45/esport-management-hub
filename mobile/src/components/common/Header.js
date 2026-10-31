import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, Coins, Shield } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ title, showBack = false, showWallet = true, showNotif = true }) => {
  const navigation = useNavigation();
  const { user, coins } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Shield size={16} color={COLORS.primaryLight} />
            </View>
            <View>
              <Text style={styles.brandTitle}>ESPORT HUB</Text>
              <Text style={styles.greetingText}>
                {user ? `Hey, ${user.name?.split(' ')[0]}` : 'Tournament Arena'}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.right}>
        {showWallet && (
          <TouchableOpacity
            style={styles.coinPill}
            onPress={() => navigation.navigate('Wallet')}
            activeOpacity={0.8}
          >
            <Coins size={15} color={COLORS.gold} />
            <Text style={styles.coinCount}>{coins}</Text>
          </TouchableOpacity>
        )}

        {showNotif && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Bell size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  brandTitle: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  greetingText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  backBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backText: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1b29',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    gap: 5,
  },
  coinCount: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: 'bold',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
