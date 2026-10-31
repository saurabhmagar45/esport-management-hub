import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/theme';

export const CustomButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'danger', 'outline', 'gold'
  loading = false,
  disabled = false,
  icon = null,
  style = {},
  textStyle = {},
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#242b3d';
    switch (variant) {
      case 'primary':
        return COLORS.primary;
      case 'secondary':
        return COLORS.surfaceLight;
      case 'danger':
        return COLORS.danger;
      case 'gold':
        return COLORS.accent;
      case 'outline':
        return 'transparent';
      default:
        return COLORS.primary;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return COLORS.primary;
    if (variant === 'secondary') return COLORS.border;
    return 'transparent';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              variant === 'outline' && { color: COLORS.primaryLight },
              variant === 'gold' && { color: '#000000' },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
