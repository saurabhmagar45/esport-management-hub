import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Trophy, Users, Calendar, ArrowRight, Coins } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { GameBadge } from '../common/GameBadge';
import { StatusBadge } from '../common/StatusBadge';

export const TournamentCard = ({ tournament, onPress, onJoinPress }) => {
  const prizePool = tournament.prizePool || 0;
  const entryFee = tournament.entryFee || 0;
  const maxTeams = tournament.maxTeams || 16;
  const filledTeams = tournament.registeredTeamsCount || tournament.teamsCount || 0;
  const progress = Math.min(1, filledTeams / maxTeams);

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(tournament)}
      activeOpacity={0.85}
    >
      {/* Banner / Header Image Area */}
      {tournament.banner ? (
        <Image source={{ uri: tournament.banner }} style={styles.bannerImage} />
      ) : (
        <View style={styles.bannerPlaceholder} />
      )}

      {/* Top Floating Badges */}
      <View style={styles.badgeRow}>
        <GameBadge game={tournament.game} />
        <StatusBadge status={tournament.status} />
      </View>

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {tournament.name}
        </Text>

        {/* Schedule & Format */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={13} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{formatDate(tournament.startDate)}</Text>
          </View>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.formatText}>{tournament.teamSize || 'Squad'} Mode</Text>
        </View>

        {/* Financial Highlights */}
        <View style={styles.metricsBox}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>PRIZE POOL</Text>
            <View style={styles.metricValueRow}>
              <Trophy size={14} color={COLORS.gold} />
              <Text style={styles.prizeValue}>₹{prizePool.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>ENTRY FEE</Text>
            <View style={styles.metricValueRow}>
              <Coins size={14} color={entryFee === 0 ? COLORS.success : COLORS.primaryLight} />
              <Text style={[styles.feeValue, entryFee === 0 && { color: COLORS.success }]}>
                {entryFee === 0 ? 'FREE' : `${entryFee} Coins`}
              </Text>
            </View>
          </View>
        </View>

        {/* Slots Progress Bar */}
        <View style={styles.slotsContainer}>
          <View style={styles.slotsLabelRow}>
            <View style={styles.slotsIconRow}>
              <Users size={12} color={COLORS.textSecondary} />
              <Text style={styles.slotsText}>
                {filledTeams} / {maxTeams} Teams
              </Text>
            </View>
            <Text style={styles.percentText}>{Math.round(progress * 100)}% Full</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.max(5, progress * 100)}%` },
                progress >= 1 && { backgroundColor: COLORS.danger },
              ]}
            />
          </View>
        </View>

        {/* Bottom CTA Row */}
        <View style={styles.footerRow}>
          <Text style={styles.viewDetailsText}>View Tournament Info</Text>
          <View style={styles.circleArrow}>
            <ArrowRight size={14} color={COLORS.primaryLight} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.surface,
  },
  bannerPlaceholder: {
    width: '100%',
    height: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  badgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  bullet: {
    color: COLORS.textMuted,
    marginHorizontal: 6,
  },
  formatText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  metricsBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  prizeValue: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '800',
  },
  feeValue: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  slotsContainer: {
    marginBottom: 14,
  },
  slotsLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  slotsIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  slotsText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  percentText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  viewDetailsText: {
    color: COLORS.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  circleArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
