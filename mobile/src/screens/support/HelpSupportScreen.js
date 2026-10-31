import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Mail,
  Send,
} from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { disputesAPI } from '../../api/notifications';
import { getErrorMessage } from '../../api/client';

const FAQS = [
  {
    q: 'When do Room ID and Password unlock?',
    a: 'Room credentials unlock exactly 5 minutes before scheduled kickoff for all verified registered squad participants.',
  },
  {
    q: 'Can I play with an emulator in BGMI or Free Fire?',
    a: 'No. Both BGMI and Free Fire tournaments on Esport Hub are strictly mobile-device-only to preserve competitive integrity.',
  },
  {
    q: 'How does entry fee refund work if tournament is cancelled?',
    a: 'If a tournament is cancelled by administration or host, all deducted coins are automatically and instantly refunded to your wallet.',
  },
  {
    q: 'How do I invite teammates to my squad?',
    a: 'Navigate to "My Teams", open your squad roster, and copy your 6-digit squad code. Teammates can enter this code in the app to join instantly.',
  },
];

export const HelpSupportScreen = ({ navigation }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [matchId, setMatchId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleDisputeSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Required', 'Please describe the issue or dispute.');
      return;
    }

    setSubmitting(true);
    try {
      await disputesAPI.create({
        matchId: matchId.trim() || undefined,
        reason: reason.trim(),
      });
      Alert.alert('Ticket Dispatched', 'Your dispute report has been registered with tournament administration.');
      setMatchId('');
      setReason('');
    } catch (err) {
      Alert.alert('Submission Notice', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Help & Support Center</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Support Header */}
        <View style={styles.headerCard}>
          <HelpCircle size={32} color={COLORS.secondary} />
          <Text style={styles.headerTitle}>ESPORT HUB SUPPORT</Text>
          <Text style={styles.headerDesc}>
            Official dispute resolution, tournament rules FAQ, and player assistance.
          </Text>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.faqList}>
          {FAQS.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <TouchableOpacity
                key={String(idx)}
                style={styles.faqCard}
                onPress={() => toggleFaq(idx)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  {isExpanded ? (
                    <ChevronUp size={18} color={COLORS.primaryLight} />
                  ) : (
                    <ChevronDown size={18} color={COLORS.textMuted} />
                  )}
                </View>
                {isExpanded && <Text style={styles.faqAnswer}>{faq.a}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dispute Submission Form */}
        <View style={styles.disputeCard}>
          <View style={styles.disputeHeaderRow}>
            <AlertTriangle size={18} color={COLORS.accent} />
            <Text style={styles.disputeTitle}>SUBMIT A DISPUTE / MATCH REPORT</Text>
          </View>
          <Text style={styles.disputeDesc}>
            Contesting a match result or reporting unfair gameplay? Submit an official dispute ticket to tournament admins.
          </Text>

          <CustomInput
            label="Match / Tournament ID (Optional)"
            placeholder="e.g. 64a8b9f..."
            value={matchId}
            onChangeText={setMatchId}
          />

          <CustomInput
            label="Describe The Issue / Complaint"
            placeholder="Provide complete details including player IGNs, timestamps, or room details..."
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
          />

          <CustomButton
            title="Submit Official Report"
            onPress={handleDisputeSubmit}
            loading={submitting}
            icon={<Send size={15} color="#ffffff" />}
            style={{ marginTop: 8 }}
          />
        </View>
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
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 4,
    letterSpacing: 0.8,
  },
  headerDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  faqList: {
    marginBottom: 24,
  },
  faqCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  faqQuestion: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  faqAnswer: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  disputeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  disputeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  disputeTitle: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  disputeDesc: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 16,
  },
});
