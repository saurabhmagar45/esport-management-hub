import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Users, Plus, KeyRound, Shield, ArrowRight, Crown } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { CustomButton } from '../../components/common/CustomButton';
import { CustomInput } from '../../components/common/CustomInput';
import { teamsAPI } from '../../api/teams';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/client';

export const TeamsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Join Code Modal
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  const fetchTeams = async () => {
    try {
      const res = await teamsAPI.getMyTeams();
      if (res.data && res.data.success) {
        setTeams(res.data.teams || []);
      }
    } catch (err) {
      console.log('Error fetching teams:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeams();
  };

  const handleJoinSquad = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Required', 'Please enter a 6-character team invitation code.');
      return;
    }

    setJoining(true);
    try {
      await teamsAPI.join(inviteCode.trim().toUpperCase());
      setJoinModalVisible(false);
      setInviteCode('');
      Alert.alert('Squad Joined! 🎉', 'You have successfully joined the team roster.');
      fetchTeams();
    } catch (err) {
      const msg = getErrorMessage(err);
      Alert.alert('Join Failed', msg);
    } finally {
      setJoining(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      {/* Top Action Bar */}
      <View style={styles.topActionRow}>
        <TouchableOpacity
          style={styles.actionBtnPrimary}
          onPress={() => navigation.navigate('CreateTeam')}
        >
          <Plus size={16} color="#ffffff" />
          <Text style={styles.actionBtnText}>Create Squad</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtnSecondary}
          onPress={() => setJoinModalVisible(true)}
        >
          <KeyRound size={16} color={COLORS.primaryLight} />
          <Text style={styles.actionBtnSecondaryText}>Join with Code</Text>
        </TouchableOpacity>
      </View>

      {/* Squads List */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.centerText}>Loading your team squads...</Text>
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item._id || item.id || String(Math.random())}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          renderItem={({ item }) => {
            const isCaptain = (item.captain?._id || item.captain) === user?._id;
            return (
              <TouchableOpacity
                style={styles.teamCard}
                onPress={() => navigation.navigate('TeamDetail', { team: item })}
                activeOpacity={0.85}
              >
                <View style={styles.teamCardHeader}>
                  <View style={styles.teamIconBadge}>
                    <Shield size={20} color={COLORS.primaryLight} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                      <Text style={styles.teamName}>{item.name}</Text>
                      {item.tag && <Text style={styles.teamTag}>[{item.tag}]</Text>}
                    </View>
                    <Text style={styles.teamGame}>
                      {item.preferredGame || item.game || 'Multi-Game Squad'}
                    </Text>
                  </View>
                  {isCaptain && (
                    <View style={styles.captainPill}>
                      <Crown size={12} color={COLORS.gold} />
                      <Text style={styles.captainText}>CAPTAIN</Text>
                    </View>
                  )}
                </View>

                <View style={styles.teamFooterRow}>
                  <View style={styles.memberCountRow}>
                    <Users size={14} color={COLORS.textSecondary} />
                    <Text style={styles.memberCountText}>
                      {item.members?.length || 1} Roster Members
                    </Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewText}>Squad Roster</Text>
                    <ArrowRight size={14} color={COLORS.primaryLight} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Users size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Squads Joined</Text>
              <Text style={styles.emptyDesc}>
                Create your own squad or join an existing team using a 6-digit invite code to enter tournaments.
              </Text>
            </View>
          }
        />
      )}

      {/* Join Squad with Invite Code Modal */}
      <Modal visible={joinModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Squad</Text>
            <Text style={styles.modalSub}>
              Enter the 6-character team invitation code provided by your squad captain.
            </Text>

            <CustomInput
              label="6-Digit Invite Code"
              placeholder="e.g. SQUAD1"
              value={inviteCode}
              onChangeText={(t) => setInviteCode(t.toUpperCase())}
              autoCapitalize="characters"
              icon={<KeyRound size={18} color={COLORS.textMuted} />}
            />

            <View style={styles.modalActionRow}>
              <CustomButton
                title="Cancel"
                variant="secondary"
                onPress={() => setJoinModalVisible(false)}
                style={{ flex: 1 }}
              />
              <CustomButton
                title="Join Squad"
                variant="primary"
                onPress={handleJoinSquad}
                loading={joining}
                style={{ flex: 1.5 }}
              />
            </View>
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
  topActionRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  actionBtnSecondaryText: {
    color: COLORS.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  centerText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  teamCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  teamCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  teamIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  teamTag: {
    color: COLORS.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  teamGame: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  captainPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  captainText: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: '800',
  },
  teamFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  memberCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberCountText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 6,
  },
  emptyDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
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
  modalSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 18,
    lineHeight: 18,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
});
