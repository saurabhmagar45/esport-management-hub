import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const StatusBadge = ({ status }) => {
  const getStyle = () => {
    switch ((status || '').toLowerCase()) {
      case 'published':
      case 'open':
      case 'upcoming':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: '#3b82f6', label: 'UPCOMING' };
      case 'ongoing':
      case 'live':
        return { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399', border: '#10b981', label: 'LIVE' };
      case 'completed':
        return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: '#64748b', label: 'ENDED' };
      case 'cancelled':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '#ef4444', label: 'CANCELLED' };
      default:
        return { bg: 'rgba(139, 92, 246, 0.15)', text: '#c084fc', border: '#8b5cf6', label: (status || 'ACTIVE').toUpperCase() };
    }
  };

  const style = getStyle();

  return (
    <View style={[styles.badge, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Text style={[styles.text, { color: style.text }]}>{style.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
