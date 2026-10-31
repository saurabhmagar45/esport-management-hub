import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  KeyRound,
  Lock,
  Unlock,
  Copy,
  Clock,
  ShieldAlert,
  ArrowLeft,
  Check,
} from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { tournamentsAPI } from '../../api/tournaments';
import { getErrorMessage } from '../../api/client';

export const RoomCredentialsScreen = ({ route, navigation }) => {
  const { tournament } = route.params;
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        setLoading(true);
        setError(null);
        const tournId = tournament._id || tournament.id;
        const res = await tournamentsAPI.getRoomDetails(tournId);
        if (res.data && res.data.success) {
          setRoomData(res.data.room || res.data);
        }
      } catch (err) {
        const msg = getErrorMessage(err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchCredentials();
  }, [tournament]);

  const copyToClipboard = (text, type) => {
    // In React Native, copy simulation / alert confirmation
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
    Alert.alert('Copied to Clipboard', `${type === 'id' ? 'Room ID' : 'Password'} copied: ${text}`);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Match Room Credentials</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tournament Info Pill */}
        <View style={styles.tournInfoBox}>
          <Text style={styles.tournName}>{tournament.name}</Text>
          <Text style={styles.tournGame}>{tournament.game} • Official Lobby</Text>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
            <Text style={styles.loadingText}>Decrypting verified room credentials...</Text>
          </View>
        ) : error ? (
          <View style={styles.lockedCard}>
            <View style={styles.lockIconBadge}>
              <Lock size={32} color={COLORS.accent} />
            </View>
            <Text style={styles.lockedTitle}>Room Key Locked</Text>
            <Text style={styles.lockedDesc}>{error}</Text>

            <View style={styles.ruleNotice}>
              <Clock size={16} color={COLORS.secondary} />
              <Text style={styles.ruleNoticeText}>
                Credentials unlock automatically 5 minutes before scheduled match start for all verified squad participants.
              </Text>
            </View>
          </View>
        ) : roomData ? (
          <View style={styles.unlockedCard}>
            <View style={styles.unlockedHeader}>
              <Unlock size={24} color={COLORS.success} />
              <Text style={styles.unlockedTitle}>Lobby Credentials Active</Text>
            </View>

            {/* Room ID Box */}
            <View style={styles.credentialBox}>
              <Text style={styles.credLabel}>CUSTOM ROOM ID</Text>
              <View style={styles.credRow}>
                <Text style={styles.credValue}>{roomData.roomId || roomData.id || 'ROOM_TBA'}</Text>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => copyToClipboard(roomData.roomId || roomData.id, 'id')}
                >
                  {copiedId ? (
                    <Check size={16} color={COLORS.success} />
                  ) : (
                    <Copy size={16} color={COLORS.primaryLight} />
                  )}
                  <Text style={[styles.copyBtnText, copiedId && { color: COLORS.success }]}>
                    {copiedId ? 'Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Box */}
            <View style={styles.credentialBox}>
              <Text style={styles.credLabel}>ROOM PASSWORD</Text>
              <View style={styles.credRow}>
                <Text style={styles.credValue}>{roomData.password || 'PASS_TBA'}</Text>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => copyToClipboard(roomData.password, 'pass')}
                >
                  {copiedPass ? (
                    <Check size={16} color={COLORS.success} />
                  ) : (
                    <Copy size={16} color={COLORS.primaryLight} />
                  )}
                  <Text style={[styles.copyBtnText, copiedPass && { color: COLORS.success }]}>
                    {copiedPass ? 'Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Joining Instructions */}
            <View style={styles.instructionsBox}>
              <Text style={styles.instructTitle}>Quick Join Instructions:</Text>
              <Text style={styles.instructStep}>1. Launch {tournament.game} on your mobile device.</Text>
              <Text style={styles.instructStep}>2. Go to Custom Room / Match lobby.</Text>
              <Text style={styles.instructStep}>3. Search Room ID and enter the Password above.</Text>
              <Text style={styles.instructStep}>4. Join your squad's assigned team slot immediately.</Text>
            </View>
          </View>
        ) : (
          <View style={styles.lockedCard}>
            <ShieldAlert size={36} color={COLORS.textMuted} />
            <Text style={styles.lockedTitle}>No Room Assigned Yet</Text>
            <Text style={styles.lockedDesc}>
              The tournament organizer will configure the custom match room closer to start time.
            </Text>
          </View>
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
  },
  scrollContent: {
    padding: 20,
  },
  tournInfoBox: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  tournName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  tournGame: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  centerBox: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  lockedCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lockIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  lockedTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  lockedDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  ruleNotice: {
    flexDirection: 'row',
    backgroundColor: '#0c1b26',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    alignItems: 'center',
  },
  ruleNoticeText: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  unlockedCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  unlockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  unlockedTitle: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: '800',
  },
  credentialBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  credLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  credRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  credValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
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
  instructionsBox: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  instructTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  instructStep: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 18,
    marginBottom: 4,
  },
});
