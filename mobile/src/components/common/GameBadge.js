import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const GameBadge = ({ game }) => {
  const getTheme = () => {
    const g = (game || '').toLowerCase();
    if (g.includes('bgmi') || g.includes('battlegrounds') || g.includes('pubg')) {
      return { bg: 'rgba(234, 88, 12, 0.15)', text: '#fb923c', border: '#ea580c' };
    }
    if (g.includes('free fire') || g.includes('freefire')) {
      return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '#ef4444' };
    }
    if (g.includes('valorant')) {
      return { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: '#f43f5e' };
    }
    if (g.includes('cod') || g.includes('duty')) {
      return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: '#3b82f6' };
    }
    return { bg: 'rgba(139, 92, 246, 0.15)', text: '#c084fc', border: '#8b5cf6' };
  };

  const theme = getTheme();

  return (
    <View style={[styles.badge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      <Text style={[styles.text, { color: theme.text }]}>{game || 'Esports'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
