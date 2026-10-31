import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Trophy,
  Users,
  Coins,
  Shield,
  Zap,
  Gamepad2,
  Flame,
  KeyRound,
  ArrowRight,
} from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { TournamentCard } from '../../components/tournaments/TournamentCard';
import { tournamentsAPI } from '../../api/tournaments';
import { useAuth } from '../../context/AuthContext';

export const HomeScreen = ({ navigation }) => {
  const { user, coins, refreshUser } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await tournamentsAPI.list({ limit: 5 });
      if (res.data && res.data.success) {
        setTournaments(res.data.tournaments || []);
      }
    } catch (err) {
      console.log('Error fetching tournaments:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    refreshUser();
    loadData();
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Hero Gaming Welcome Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroBadgeRow}>
            <View style={styles.heroPill}>
              <Flame size={12} color="#f97316" />
              <Text style={styles.heroPillText}>Next-Gen Tournament Arena</Text>
            </View>
          </View>
          <Text style={styles.heroHeadline}>YOUR GAME.{'\n'}YOUR TEAM.{'\n'}YOUR GLORY.</Text>
          <Text style={styles.heroSubtext}>
            Compete in BGMI and Free Fire verified squad championships. Unlock official room keys 5 mins before kickoff.
          </Text>

          <View style={styles.heroActionRow}>
            <TouchableOpacity
              style={styles.heroPrimaryBtn}
              onPress={() => navigation.navigate('Tournaments')}
              activeOpacity={0.8}
            >
              <Trophy size={14} color="#ffffff" />
              <Text style={styles.heroPrimaryBtnText}>Explore Matches</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroSecondaryBtn}
              onPress={() => navigation.navigate('Teams')}
              activeOpacity={0.8}
            >
              <Users size={14} color={COLORS.primaryLight} />
              <Text style={styles.heroSecondaryBtnText}>Squad Manager</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Action Navigation Buttons */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => navigation.navigate('Tournaments')}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(234, 88, 12, 0.15)' }]}>
              <Gamepad2 size={20} color="#ea580c" />
            </View>
            <Text style={styles.actionTitle}>BGMI / FF</Text>
            <Text style={styles.actionSub}>Tournaments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => navigation.navigate('Teams')}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Users size={20} color={COLORS.primaryLight} />
            </View>
            <Text style={styles.actionTitle}>My Squads</Text>
            <Text style={styles.actionSub}>Team Roster</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => navigation.navigate('Wallet')}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
              <Coins size={20} color={COLORS.gold} />
            </View>
            <Text style={styles.actionTitle}>Wallet</Text>
            <Text style={styles.actionSub}>{coins} Coins</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => navigation.navigate('Support')}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
              <Shield size={20} color={COLORS.secondary} />
            </View>
            <Text style={styles.actionTitle}>Support</Text>
            <Text style={styles.actionSub}>Help & Rules</Text>
          </TouchableOpacity>
        </View>

        {/* 5-Min Secure Room Credentials Banner */}
        <TouchableOpacity
          style={styles.roomBanner}
          onPress={() => {
            if (tournaments.length > 0) {
              navigation.navigate('RoomCredentials', { tournament: tournaments[0] });
            } else {
              navigation.navigate('Tournaments');
            }
          }}
          activeOpacity={0.85}
        >
          <View style={styles.roomIconBadge}>
            <KeyRound size={20} color={COLORS.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.roomBannerTitle}>Match Room Credentials</Text>
            <Text style={styles.roomBannerSub}>
              Official Room ID & Password release automatically 5 mins before kickoff
            </Text>
          </View>
          <ArrowRight size={16} color={COLORS.secondary} />
        </TouchableOpacity>

        {/* Featured Tournaments Section */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleRow}>
            <Trophy size={16} color={COLORS.gold} />
            <Text style={styles.sectionTitle}>FEATURED TOURNAMENTS</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Tournaments')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading live tournament matches...</Text>
          </View>
        ) : tournaments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Gamepad2 size={36} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Live Tournaments</Text>
            <Text style={styles.emptyText}>
              Check back soon or create a tournament from the organizer dashboard.
            </Text>
          </View>
        ) : (
          tournaments.map((t) => (
            <TournamentCard
              key={t._id || t.id}
              tournament={t}
              onPress={(selected) => navigation.navigate('TournamentDetail', { tournament: selected })}
            />
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
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#121528',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  heroPillText: {
    color: '#fb923c',
    fontSize: 11,
    fontWeight: '700',
  },
  heroHeadline: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  heroSubtext: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 18,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  heroPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  heroSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  heroSecondaryBtnText: {
    color: COLORS.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionTile: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionSub: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  roomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1b26',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    gap: 12,
  },
  roomIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomBannerTitle: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  roomBannerSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  seeAllText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '600',
  },
  loaderContainer: {
    padding: 30,
    alignItems: 'center',
    gap: 10,
  },
  loaderText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
