import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Users,
  Shield,
  Crown,
  KeyRound,
  Copy,
  RefreshCw,
  LogOut,
  Trash2,
  ArrowLeft,
  Check,
} from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { CustomButton } from '../../components/common/CustomButton';
import { teamsAPI } from '../../api/teams';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/client';

export const TeamDetailScreen = ({ route, navigation }) => {
  const { team } = route.params;
  const { user } = useAuth();

  const [teamData, setTeamData] = useState(team);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const isCaptain =
    (teamData.captain?._id || teamData.captain) === user?._id;

  const refreshTeam = async () => {
    try {
      const id = teamData._id || teamData.id;
      const res = await teamsAPI.getById(id);
      if (res.data && res.data.success) {
        setTeamData(res.data.team);
      }
    } catch (err) {
      console.log('Error refreshing team:', err.message);
    }
  };

  useEffect(() => {
    refreshTeam();
  }, []);

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    Alert.alert('Invite Code Copied', `Code ${teamData.inviteCode} copied to clipboard! Share it with your squad.`);
  };

  const handleRegenerateCode = async () => {
    Alert.alert(
      'Regenerate Invite Code',
      'The previous invite code will immediately become invalid. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            setRegenerating(true);
            try {
              const res = await teamsAPI.regenerateCode(teamData._id || teamData.id);
              if (res.data && res.data.success) {
                setTeamData((prev) => ({ ...prev, inviteCode: res.data.inviteCode }));
                Alert.alert('New Code Generated', `Your new invite code is: ${res.data.inviteCode}`);
              }
            } catch (err) {
              Alert.alert('Error', getErrorMessage(err));
            } finally {
              setRegenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveMember = async (memberUserId, memberName) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from this squad?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await teamsAPI.removeMember(teamData._id || teamData.id, memberUserId);
              Alert.alert('Removed', `${memberName} has been removed.`);
              refreshTeam();
            } catch (err) {
              Alert.alert('Error', getErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  const handleLeaveTeam = async () => {
    Alert.alert(
      'Leave Squad',
      'Are you sure you want to leave this team squad?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave Squad',
          style: 'destructive',
          onPress: async () => {
            try {
              await teamsAPI.leaveTeam(teamData._id || teamData.id);
              Alert.alert('Left Squad', 'You have left the squad.');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', getErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {teamData.name}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Squad Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.badgeRow}>
            <View style={styles.logoBadge}>
              <Shield size={36} color={COLORS.primaryLight} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.teamTitleRow}>
                <Text style={styles.teamName}>{teamData.name}</Text>
                {teamData.tag && <Text style={styles.teamTag}>[{teamData.tag}]</Text>}
              </View>
              <Text style={styles.teamGame}>
                {teamData.preferredGame || teamData.game || 'Multi-Game Arena'}
              </Text>
            </View>
          </View>
        </View>

        {/* 6-Digit Squad Invite Code Card */}
        <View style={styles.codeCard}>
          <View style={styles.codeHeader}>
            <View style={styles.codeIcon}>
              <KeyRound size={16} color={COLORS.primaryLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.codeTitle}>SQUAD INVITATION CODE</Text>
              <Text style={styles.codeSub}>Share this 6-character code with players to join your squad roster.</Text>
            </View>
          </View>

          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{teamData.inviteCode || 'N/A'}</Text>
            <View style={styles.codeActions}>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode}>
                {copiedCode ? <Check size={16} color={COLORS.success} /> : <Copy size={16} color={COLORS.primaryLight} />}
                <Text style={[styles.copyBtnText, copiedCode && { color: COLORS.success }]}>
                  {copiedCode ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>

              {isCaptain && (
                <TouchableOpacity
                  style={styles.refreshBtn}
                  onPress={handleRegenerateCode}
                  disabled={regenerating}
                >
                  <RefreshCw size={15} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Squad Roster Section */}
        <View style={styles.rosterSection}>
          <View style={styles.rosterHeader}>
            <Users size={16} color={COLORS.secondary} />
            <Text style={styles.rosterTitle}>
              OFFICIAL SQUAD ROSTER ({teamData.members?.length || 1})
            </Text>
          </View>

          {(teamData.members || []).map((m, idx) => {
            const memberUser = m.user || {};
            const memberId = memberUser._id || memberUser.id || m.user;
            const isMemberCaptain =
              (teamData.captain?._id || teamData.captain) === memberId;
            const memberName = memberUser.name || m.ign || `Player ${idx + 1}`;

            return (
              <View key={memberId || String(idx)} style={styles.memberCard}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberInitial}>
                    {memberName.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.memberNameRow}>
                    <Text style={styles.memberName}>{memberName}</Text>
                    {isMemberCaptain && (
                      <View style={styles.captainPill}>
                        <Crown size={10} color={COLORS.gold} />
                        <Text style={styles.captainPillText}>CAPTAIN</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.memberIgn}>
                    IGN: {m.ign || memberUser.gameProfiles?.bgmiIgn || memberUser.gameProfiles?.freefireIgn || 'Not Set'}
                  </Text>
                </View>

                {isCaptain && !isMemberCaptain && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveMember(memberId, memberName)}
                  >
                    <Trash2 size={16} color={COLORS.danger} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Leave Team Button */}
        {!isCaptain && (
          <CustomButton
            title="Leave Squad Roster"
            variant="danger"
            icon={<LogOut size={16} color="#ffffff" />}
            onPress={handleLeaveTeam}
            style={styles.leaveBtn}
          />
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 12,
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
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  teamTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  teamTag: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
  teamGame: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  codeCard: {
    backgroundColor: '#121424',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    marginBottom: 20,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  codeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeTitle: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  codeSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  codeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  codeText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  codeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  copyBtnText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rosterSection: {
    marginBottom: 20,
  },
  rosterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  rosterTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    gap: 12,
  },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitial: {
    color: COLORS.primaryLight,
    fontSize: 15,
    fontWeight: '800',
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  captainPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  captainPillText: {
    color: COLORS.gold,
    fontSize: 8,
    fontWeight: '800',
  },
  memberIgn: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  removeBtn: {
    padding: 8,
  },
  leaveBtn: {
    marginTop: 10,
  },
});
