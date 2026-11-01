import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
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
  Edit3,
} from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { tournamentsAPI } from '../../api/tournaments';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const RoomCredentialsScreen = ({ route, navigation }) => {
  const { tournament } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Organizer Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editRoomId, setEditRoomId] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  const isOrganizer = Boolean(
    user && (
      user.role === 'admin' ||
      user._id === tournament.organizer?._id ||
      user._id === tournament.organizer ||
      user.role === 'organizer'
    )
  );

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

  useEffect(() => {
    fetchCredentials();
  }, [tournament]);

  const handleOpenEdit = () => {
    setEditRoomId(roomData?.roomId || '');
    setEditPassword(roomData?.password || '');
    setEditInstructions(roomData?.instructions || 'Join designated lobby slot. Mobile only.');
    setModalVisible(true);
  };

  const handleSaveCredentials = async () => {
    if (!editRoomId.trim() || !editPassword.trim()) {
      Alert.alert('Missing Fields', 'Please enter both Room ID and Room Password.');
      return;
    }
    try {
      setSaving(true);
      const tournId = tournament._id || tournament.id;
      const payload = {
        roomId: editRoomId.trim(),
        password: editPassword.trim(),
        instructions: editInstructions.trim(),
      };
      await tournamentsAPI.setRoomDetails(tournId, payload);
      setRoomData({
        roomId: editRoomId.trim(),
        password: editPassword.trim(),
        instructions: editInstructions.trim(),
        isReleased: true,
      });
      setError(null);
      setModalVisible(false);
      Alert.alert('Success 🎉', 'Room ID and Password updated successfully.');
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

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

        {/* Organizer Quick Action Button */}
        {isOrganizer && (
          <TouchableOpacity
            style={styles.organizerBtn}
            onPress={handleOpenEdit}
            activeOpacity={0.85}
          >
            <Edit3 size={16} color="#000000" />
            <Text style={styles.organizerBtnText}>
              {roomData?.roomId ? 'Update Room ID & Password' : '+ Add Room ID & Password'}
            </Text>
          </TouchableOpacity>
        )}

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

      {/* Organizer Room Credentials Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeaderTitle}>
              {roomData?.roomId ? 'Update Match Room Key' : 'Add Custom Room Key'}
            </Text>
            <Text style={styles.modalHeaderSub}>
              Enter the custom game Room ID & Password created from {tournament.game}.
            </Text>

            <Text style={styles.fieldLabel}>Custom Room ID *</Text>
            <TextInput
              style={styles.textInput}
              value={editRoomId}
              onChangeText={setEditRoomId}
              placeholder="e.g. 7482910"
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.fieldLabel}>Room Password *</Text>
            <TextInput
              style={styles.textInput}
              value={editPassword}
              onChangeText={setEditPassword}
              placeholder="e.g. BATTLE#2026"
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.fieldLabel}>Lobby Instructions</Text>
            <TextInput
              style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
              value={editInstructions}
              onChangeText={setEditInstructions}
              placeholder="Slot assignments, mobile rules, etc."
              placeholderTextColor={COLORS.textMuted}
              multiline
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveCredentials}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Text style={styles.saveBtnText}>Save & Publish</Text>
                )}
              </TouchableOpacity>
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
  organizerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eab308',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    shadowColor: '#eab308',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  organizerBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeaderTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalHeaderSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 16,
  },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#eab308',
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
});
