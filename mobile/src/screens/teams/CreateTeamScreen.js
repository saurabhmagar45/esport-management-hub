import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Users, Tag, Gamepad2, ArrowLeft, Shield } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { teamsAPI } from '../../api/teams';
import { getErrorMessage } from '../../api/client';

const GAMES = ['BGMI', 'Free Fire', 'Call of Duty: Mobile', 'Valorant'];

export const CreateTeamScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [selectedGame, setSelectedGame] = useState('BGMI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please provide a squad name.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await teamsAPI.create({
        name: name.trim(),
        tag: tag.trim().toUpperCase(),
        preferredGame: selectedGame,
      });

      if (res.data && res.data.success) {
        Alert.alert('Squad Created! 🏆', `${name} is ready. Share your team code to invite players.`);
        navigation.goBack();
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      Alert.alert('Creation Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Create New Squad</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Shield size={32} color={COLORS.primaryLight} />
          </View>
          <Text style={styles.title}>ASSEMBLE YOUR TEAM</Text>
          <Text style={styles.subtitle}>
            Register an official squad roster to compete in tournament brackets
          </Text>
        </View>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <CustomInput
            label="Squad Name"
            placeholder="e.g. Soul Esports, Team Vitality"
            value={name}
            onChangeText={setName}
            icon={<Users size={18} color={COLORS.textMuted} />}
          />

          <CustomInput
            label="Squad Tag (Short abbreviation)"
            placeholder="e.g. SOUL, GOD, TX"
            value={tag}
            onChangeText={setTag}
            autoCapitalize="characters"
            icon={<Tag size={18} color={COLORS.textMuted} />}
          />

          <Text style={styles.gameSelectLabel}>PRIMARY COMPETITIVE GAME</Text>
          <View style={styles.gamesGrid}>
            {GAMES.map((game) => (
              <TouchableOpacity
                key={game}
                style={[
                  styles.gameChip,
                  selectedGame === game && styles.gameChipActive,
                ]}
                onPress={() => setSelectedGame(game)}
              >
                <Text
                  style={[
                    styles.gameChipText,
                    selectedGame === game && styles.gameChipTextActive,
                  ]}
                >
                  {game}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <CustomButton
            title="Create Official Squad"
            onPress={handleCreate}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    marginBottom: 14,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  gameSelectLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  gameChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gameChipActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: COLORS.primary,
  },
  gameChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  gameChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 8,
  },
});
