import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Coins,
  CreditCard,
  History,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
} from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { CustomButton } from '../../components/common/CustomButton';
import { paymentsAPI } from '../../api/payments';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/client';

const PACKAGES = [
  { id: 'p1', coins: 100, price: 100, bonus: null },
  { id: 'p2', coins: 300, price: 300, bonus: '+50 BONUS' },
  { id: 'p3', coins: 500, price: 500, bonus: '+100 BONUS', popular: true },
  { id: 'p4', coins: 1000, price: 1000, bonus: '+250 BONUS' },
];

export const WalletScreen = ({ navigation }) => {
  const { coins, addCoins } = useAuth();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPaymentHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await paymentsAPI.getHistory();
      if (res.data && res.data.success) {
        setHistory(res.data.payments || []);
      }
    } catch (err) {
      console.log('Error fetching payment history:', err.message);
    } finally {
      setLoadingHistory(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const handleBuyPackage = async (pkg) => {
    Alert.alert(
      'Recharge Coins',
      `Add ${pkg.coins} coins to your wallet for ₹${pkg.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Recharge',
          onPress: async () => {
            setPurchasing(true);
            try {
              // Simulated instant credit with audit record
              addCoins(pkg.coins);
              Alert.alert('Recharge Successful! 🪙', `${pkg.coins} coins have been credited to your wallet.`);
              fetchPaymentHistory();
            } catch (err) {
              Alert.alert('Payment Error', getErrorMessage(err));
            } finally {
              setPurchasing(false);
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPaymentHistory();
  };

  return (
    <View style={styles.container}>
      <Header title="My Wallet" showWallet={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Glow Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletGlow} />
          <View style={styles.walletHeader}>
            <View style={styles.walletIcon}>
              <Coins size={24} color={COLORS.gold} />
            </View>
            <View>
              <Text style={styles.walletLabel}>ESPORT HUB COINS</Text>
              <Text style={styles.walletSub}>Official Entry Fee Currency</Text>
            </View>
          </View>

          <View style={styles.balanceContainer}>
            <Text style={styles.balanceNumber}>{coins}</Text>
            <Text style={styles.balanceCoinTag}>COINS</Text>
          </View>

          <View style={styles.walletFooter}>
            <Text style={styles.rateText}>1 Coin = ₹1.00 INR</Text>
            <View style={styles.instantPill}>
              <Sparkles size={11} color={COLORS.secondary} />
              <Text style={styles.instantText}>Instant Match Entry</Text>
            </View>
          </View>
        </View>

        {/* Coin Recharge Packages */}
        <View style={styles.sectionHeader}>
          <CreditCard size={16} color={COLORS.primaryLight} />
          <Text style={styles.sectionTitle}>RECHARGE COIN PACKAGES</Text>
        </View>

        <View style={styles.packagesGrid}>
          {PACKAGES.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={[styles.packageCard, pkg.popular && styles.packageCardPopular]}
              onPress={() => handleBuyPackage(pkg)}
              activeOpacity={0.85}
              disabled={purchasing}
            >
              {pkg.bonus && (
                <View style={styles.bonusBadge}>
                  <Text style={styles.bonusText}>{pkg.bonus}</Text>
                </View>
              )}
              <View style={styles.coinIconWrap}>
                <Coins size={22} color={COLORS.gold} />
              </View>
              <Text style={styles.packageCoins}>{pkg.coins} Coins</Text>
              <Text style={styles.packagePrice}>₹{pkg.price}</Text>
              <View style={styles.buyBtn}>
                <Text style={styles.buyBtnText}>Get Coins</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction History Section */}
        <View style={styles.sectionHeader}>
          <History size={16} color={COLORS.secondary} />
          <Text style={styles.sectionTitle}>RECENT TRANSACTIONS</Text>
        </View>

        {loadingHistory ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading transaction history...</Text>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyHistoryBox}>
            <Text style={styles.emptyHistoryText}>No past transaction records.</Text>
            <Text style={styles.emptyHistorySub}>
              Entry fee receipts and wallet recharges will appear here.
            </Text>
          </View>
        ) : (
          history.map((item) => (
            <View key={item._id || item.id} style={styles.historyRow}>
              <View style={styles.historyIcon}>
                <ArrowUpRight size={18} color={COLORS.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyTitle} numberOfLines={1}>
                  {item.tournament?.name || 'Tournament Entry Fee'}
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.historyAmount}>-₹{item.amount}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  walletCard: {
    backgroundColor: '#131526',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    marginBottom: 24,
    overflow: 'hidden',
  },
  walletGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  walletIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  walletLabel: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  walletSub: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  balanceNumber: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
  },
  balanceCoinTag: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '800',
  },
  walletFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  rateText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  instantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  instantText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  packageCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  packageCardPopular: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  bonusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bonusText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: '800',
  },
  coinIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  packageCoins: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  packagePrice: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  buyBtn: {
    width: '100%',
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buyBtnText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  loaderBox: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  loaderText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  emptyHistoryBox: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyHistoryText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyHistorySub: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    gap: 12,
  },
  historyIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  historyDate: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  historyAmount: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '800',
  },
});
