import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  Trophy,
  Calendar,
  Users,
  Coins,
  Shield,
  KeyRound,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  FileText,
} from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { GameBadge } from '../../components/common/GameBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CustomButton } from '../../components/common/CustomButton';
import { tournamentsAPI } from '../../api/tournaments';
import { teamsAPI } from '../../api/teams';
import { registrationsAPI } from '../../api/registrations';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/client';

export const TournamentDetailScreen = ({ route, navigation }) => {
  const { tournament } = route.params;
  const { user, coins, deductCoins } = useAuth();

  const [details, setDetails] = useState(tournament);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Registration Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchLatestDetails = async () => {
      try {
        const id = tournament._id || tournament.id;
        const res = await tournamentsAPI.getById(id);
        if (res.data && res.data.success) {
          setDetails(res.data.tournament);
        }
      } catch (err) {
        console.log('Error refreshing tournament details:', err.message);
      }
    };
    fetchLatestDetails();
  }, []);

  const openJoinModal = async () => {
    try {
      setLoading(true);
      const res = await teamsAPI.getMyTeams();
      if (res.data && res.data.success) {
        const teams = res.data.teams || [];
        setMyTeams(teams);
        if (teams.length > 0) {
          setSelectedTeam(teams[0]);
        }
        setModalVisible(true);
      }
    } catch (err) {
      Alert.alert('Squad Required', 'Please create or join a team squad before registering.');
      navigation.navigate('Teams');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!selectedTeam) {
      Alert.alert('Select Squad', 'Please select a team squad to register.');
      return;
    }

    const fee = details.entryFee || 0;
    if (fee > 0 && coins < fee) {
      Alert.alert(
        'Insufficient Coins',
        `This tournament requires ${fee} coins. Your balance is ${coins} coins. Would you like to recharge?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Coins', onPress: () => navigation.navigate('Wallet') },
        ]
      );
      return;
    }

    setJoining(true);
    try {
      const tournId = details._id || details.id;
      const teamId = selectedTeam._id || selectedTeam.id;

      // Prepare roster from selected team members
      const roster = (selectedTeam.members || []).map((m) => ({
        user: m.user?._id || m.user || user._id,
        ign: m.ign || user.gameProfiles?.bgmiIgn || user.name,
      }));

      await registrationsAPI.register(tournId, teamId, roster);

      if (fee > 0) {
        deductCoins(fee);
      }

      setIsRegistered(true);
      setModalVisible(false);
      Alert.alert('Registration Confirmed! 🎉', 'Your squad has been enrolled into the tournament bracket.');
    } catch (err) {
      const msg = getErrorMessage(err);
      Alert.alert('Registration Notice', msg);
    } finally {
      setJoining(false);
    }
  };

  const prizePool = details.prizePool || 0;
  const entryFee = details.entryFee || 0;

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {details.name}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Image */}
        {details.banner ? (
          <Image source={{ uri: details.banner }} style={styles.bannerImage} />
        ) : (
          <View style={styles.bannerPlaceholder} />
        )}

        <View style={styles.mainInfo}>
          <View style={styles.badgeRow}>
            <GameBadge game={details.game} />
            <StatusBadge status={details.status} />
          </View>

          <Text style={styles.title}>{details.name}</Text>

          {/* Quick Metrics */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Trophy size={18} color={COLORS.gold} />
              <Text style={styles.metricLabel}>PRIZE POOL</Text>
              <Text style={styles.prizeValue}>₹{prizePool.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.metricCard}>
              <Coins size={18} color={entryFee === 0 ? COLORS.success : COLORS.primaryLight} />
              <Text style={styles.metricLabel}>ENTRY FEE</Text>
              <Text style={[styles.feeValue, entryFee === 0 && { color: COLORS.success }]}>
                {entryFee === 0 ? 'FREE' : `${entryFee} Coins`}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Users size={18} color={COLORS.secondary} />
              <Text style={styles.metricLabel}>SLOTS</Text>
              <Text style={styles.metricValue}>
                {details.registeredTeamsCount || 0} / {details.maxTeams || 16}
              </Text>
            </View>
          </View>

          {/* Room ID & Password Unlock Button */}
          <TouchableOpacity
            style={[
              styles.roomBox,
              Boolean(user?.role === 'organizer' || user?.role === 'admin') && { borderColor: '#eab308' }
            ]}
            onPress={() => navigation.navigate('RoomCredentials', { tournament: details })}
            activeOpacity={0.85}
          >
            <View style={[
              styles.roomIcon,
              Boolean(user?.role === 'organizer' || user?.role === 'admin') && { backgroundColor: 'rgba(234, 179, 8, 0.15)' }
            ]}>
              <KeyRound size={20} color={Boolean(user?.role === 'organizer' || user?.role === 'admin') ? '#eab308' : COLORS.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.roomTitle}>
                {Boolean(user?.role === 'organizer' || user?.role === 'admin')
                  ? 'Add / Update Room ID & Password'
                  : 'Official Match Room Key & Password'}
              </Text>
              <Text style={styles.roomSub}>
                {Boolean(user?.role === 'organizer' || user?.role === 'admin')
                  ? 'Set or edit in-game custom room credentials for competing teams'
                  : 'Unlocks 5 minutes before kickoff for registered participants.'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Prize Distribution Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Trophy size={16} color={COLORS.gold} />
              <Text style={styles.sectionTitle}>PRIZE DISTRIBUTION</Text>
            </View>
            <View style={styles.prizeRow}>
              <Text style={styles.prizeRank}>🥇 1st Place (Champion)</Text>
              <Text style={styles.prizeAmount}>₹{Math.round(prizePool * 0.6).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.prizeRow}>
              <Text style={styles.prizeRank}>🥈 2nd Place (Runner-up)</Text>
              <Text style={styles.prizeAmount}>₹{Math.round(prizePool * 0.3).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.prizeRow}>
              <Text style={styles.prizeRank}>🥉 3rd Place</Text>
              <Text style={styles.prizeAmount}>₹{Math.round(prizePool * 0.1).toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Tournament Rules Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <FileText size={16} color={COLORS.primaryLight} />
              <Text style={styles.sectionTitle}>RULES & REGULATIONS</Text>
            </View>
            <Text style={styles.ruleText}>
              1. Emulator & Hack Policy: Strict zero-tolerance ban on hacks, scripts, or unapproved emulators.
            </Text>
            <Text style={styles.ruleText}>
              2. Punctuality: Room ID & Password reveal 5 minutes before scheduled match start. All squads must join within 5 minutes.
            </Text>
            <Text style={styles.ruleText}>
              3. Match Disconnects: Matches will proceed if a player disconnects post-kickoff. Re-matches are only authorized for game server failures.
            </Text>
            <Text style={styles.ruleText}>
              4. Proof Submission: Captains must submit final victory/placement screenshots via the support dispute center if a result is contested.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Floating Join Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomFeeLabel}>ENTRY FEE</Text>
          <Text style={styles.bottomFeeValue}>
            {entryFee === 0 ? 'FREE ENTRY' : `${entryFee} COINS`}
          </Text>
        </View>

        <CustomButton
          title={isRegistered ? 'Enrolled in Bracket ✓' : 'Register Squad'}
          onPress={openJoinModal}
          disabled={isRegistered}
          variant={isRegistered ? 'secondary' : 'primary'}
          style={styles.joinBtn}
        />
      </View>

      {/* Registration Squad Selection Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Squad Registration</Text>
            <Text style={styles.modalSubtitle}>
              Select your registered squad to compete in {details.name}
            </Text>

            {myTeams.length === 0 ? (
              <View style={styles.noTeamsBox}>
                <AlertCircle size={32} color={COLORS.accent} />
                <Text style={styles.noTeamsText}>
                  You don't have an active team squad yet.
                </Text>
                <CustomButton
                  title="Create Squad Now"
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('Teams');
                  }}
                  style={{ width: '100%', marginTop: 12 }}
                />
              </View>
            ) : (
              <>
                <Text style={styles.teamSelectLabel}>SELECT YOUR SQUAD:</Text>
                {myTeams.map((team) => (
                  <TouchableOpacity
                    key={team._id || team.id}
                    style={[
                      styles.teamOption,
                      selectedTeam?._id === team._id && styles.teamOptionSelected,
                    ]}
                    onPress={() => setSelectedTeam(team)}
                  >
                    <View style={styles.teamOptionIcon}>
                      <Users size={16} color={COLORS.primaryLight} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.teamOptionName}>{team.name}</Text>
                      <Text style={styles.teamOptionRoster}>
                        {team.members?.length || 1} Registered Members
                      </Text>
                    </View>
                    {selectedTeam?._id === team._id && (
                      <CheckCircle size={18} color={COLORS.primaryLight} />
                    )}
                  </TouchableOpacity>
                ))}

                <View style={styles.modalDivider} />

                <View style={styles.modalFeeRow}>
                  <Text style={styles.modalFeeText}>Entry Fee Deduction:</Text>
                  <Text style={styles.modalFeeAmount}>
                    {entryFee === 0 ? 'FREE' : `${entryFee} Coins`}
                  </Text>
                </View>

                <View style={styles.modalActionRow}>
                  <CustomButton
                    title="Cancel"
                    variant="secondary"
                    onPress={() => setModalVisible(false)}
                    style={{ flex: 1 }}
                  />
                  <CustomButton
                    title="Confirm & Join"
                    variant="primary"
                    onPress={handleConfirmRegistration}
                    loading={joining}
                    style={{ flex: 1.5 }}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  bannerImage: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.surface,
  },
  bannerPlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  mainInfo: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
  },
  prizeValue: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '900',
  },
  feeValue: {
    color: COLORS.primaryLight,
    fontSize: 13,
    fontWeight: '800',
  },
  metricValue: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: '800',
  },
  roomBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1b26',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.35)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  roomIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomTitle: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  roomSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  prizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  prizeRank: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  prizeAmount: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '800',
  },
  ruleText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bottomPriceCol: {
    justifyContent: 'center',
  },
  bottomFeeLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  bottomFeeValue: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '900',
  },
  joinBtn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 18,
  },
  noTeamsBox: {
    alignItems: 'center',
    padding: 24,
  },
  noTeamsText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
  teamSelectLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 10,
  },
  teamOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    gap: 12,
  },
  teamOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  teamOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamOptionName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  teamOptionRoster: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  modalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  modalFeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalFeeText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  modalFeeAmount: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '800',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
