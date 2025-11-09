import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, typography, borderRadius, spacing } from '../styles/constants';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'gradient';
  gradient?: string[];
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Badge({ 
  children, 
  variant = 'default',
  gradient = [...colors.gradients.blue],
  style,
  textStyle 
}: BadgeProps) {
  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={[...gradient]}
        style={[styles.badge, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[styles.text, styles.gradientText, textStyle]}>
          {children}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.badge, styles.defaultBadge, style]}>
      <Text style={[styles.text, textStyle]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  defaultBadge: {
    backgroundColor: colors.primary,
  },
  text: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.card,
  },
  gradientText: {
    color: colors.card,
  },
});
