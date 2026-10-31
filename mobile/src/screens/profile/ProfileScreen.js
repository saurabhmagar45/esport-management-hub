import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import {
  User,
  Mail,
  Gamepad2,
  Shield,
  Coins,
  Edit3,
  HelpCircle,
  LogOut,
  ExternalLink,
  CheckCircle,
} from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { CustomButton } from '../../components/common/CustomButton';
import { CustomInput } from '../../components/common/CustomInput';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';
import { getErrorMessage } from '../../api/client';

export const ProfileScreen = ({ navigation }) => {
  const { user, coins, logout, refreshUser } = useAuth();

  // Edit Game Profiles Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [bgmiId, setBgmiId] = useState(user?.gameProfiles?.bgmiId || '');
  const [bgmiIgn, setBgmiIgn] = useState(user?.gameProfiles?.bgmiIgn || '');
  const [freefireUid, setFreefireUid] = useState(user?.gameProfiles?.freefireUid || '');
  const [freefireIgn, setFreefireIgn] = useState(user?.gameProfiles?.freefireIgn || '');
  const [saving, setSaving] = useState(false);

  const handleSaveProfiles = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile({
        gameProfiles: {
          bgmiId: bgmiId.trim(),
          bgmiIgn: bgmiIgn.trim(),
          freefireUid: freefireUid.trim(),
          freefireIgn: freefireIgn.trim(),
        },
      });
      await refreshUser();
      setModalVisible(false);
      Alert.alert('Profile Updated', 'Your gaming identifiers have been saved.');
    } catch (err) {
      Alert.alert('Update Failed', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of Esport Hub?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Auth');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {(user?.name || 'P').charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.userName}>{user?.name || 'Player'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.rolePill}>
            <Shield size={12} color={COLORS.primaryLight} />
            <Text style={styles.roleText}>
              {(user?.role || 'player').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* In-Game Identifiers Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Gamepad2 size={16} color={COLORS.secondary} />
              <Text style={styles.sectionTitle}>IN-GAME IDENTIFIERS</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setModalVisible(true)}
            >
              <Edit3 size={14} color={COLORS.primaryLight} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gameIdRow}>
            <View style={[styles.gameIconBadge, { backgroundColor: 'rgba(234, 88, 12, 0.15)' }]}>
              <Text style={styles.gameIconText}>BGMI</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.gameIdLabel}>Battlegrounds Mobile India</Text>
              <Text style={styles.gameIdVal}>
                IGN: {user?.gameProfiles?.bgmiIgn || 'Not Linked'}
              </Text>
              {user?.gameProfiles?.bgmiId && (
                <Text style={styles.gameSubVal}>UID: {user?.gameProfiles?.bgmiId}</Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.gameIdRow}>
            <View style={[styles.gameIconBadge, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Text style={[styles.gameIconText, { color: '#ef4444' }]}>FF</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.gameIdLabel}>Free Fire (MAX)</Text>
              <Text style={styles.gameIdVal}>
                IGN: {user?.gameProfiles?.freefireIgn || 'Not Linked'}
              </Text>
              {user?.gameProfiles?.freefireUid && (
                <Text style={styles.gameSubVal}>UID: {user?.gameProfiles?.freefireUid}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Wallet')}
          >
            <View style={styles.menuIconWrap}>
              <Coins size={18} color={COLORS.gold} />
            </View>
            <Text style={styles.menuTitle}>Coin Balance & Recharge</Text>
            <Text style={styles.menuValue}>{coins} 🪙</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Support')}
          >
            <View style={styles.menuIconWrap}>
              <HelpCircle size={18} color={COLORS.secondary} />
            </View>
            <Text style={styles.menuTitle}>Help, Rules & Dispute Center</Text>
            <ExternalLink size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Log Out Button */}
        <CustomButton
          title="Sign Out of Esport Hub"
          variant="danger"
          icon={<LogOut size={16} color="#ffffff" />}
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
      </ScrollView>

      {/* Edit Game Profiles Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Game Profiles</Text>
            <Text style={styles.modalSub}>
              Ensure your In-Game Names (IGN) match exactly with your mobile game accounts.
            </Text>

            <CustomInput
              label="BGMI Character ID (Numeric)"
              placeholder="e.g. 5123456789"
              value={bgmiId}
              onChangeText={setBgmiId}
              keyboardType="numeric"
            />

            <CustomInput
              label="BGMI In-Game Name (IGN)"
              placeholder="e.g. SOUL_Mortal"
              value={bgmiIgn}
              onChangeText={setBgmiIgn}
            />

            <CustomInput
              label="Free Fire UID (Numeric)"
              placeholder="e.g. 192837465"
              value={freefireUid}
              onChangeText={setFreefireUid}
              keyboardType="numeric"
            />

            <CustomInput
              label="Free Fire In-Game Name (IGN)"
              placeholder="e.g. TOTAL_GAMING"
              value={freefireIgn}
              onChangeText={setFreefireIgn}
            />

            <View style={styles.modalActionRow}>
              <CustomButton
                title="Cancel"
                variant="secondary"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <CustomButton
                title="Save Changes"
                variant="primary"
                onPress={handleSaveProfiles}
                loading={saving}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileHeaderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    color: COLORS.primaryLight,
    fontSize: 28,
    fontWeight: '900',
  },
  userName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  userEmail: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 12,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  roleText: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
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
    gap: 8,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  gameIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  gameIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameIconText: {
    color: '#ea580c',
    fontSize: 11,
    fontWeight: '900',
  },
  gameIdLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 2,
  },
  gameIdVal: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  gameSubVal: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  menuValue: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '800',
  },
  logoutBtn: {
    marginTop: 8,
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
    marginTop: 10,
  },
});
