import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, borderRadius } from '../styles/constants';

interface ProgressProps {
  value: number; // 0-100
  height?: number;
  style?: ViewStyle;
  gradient?: string[];
}

export default function Progress({ 
  value, 
  height = 8, 
  style,
  gradient = [...colors.gradients.blue] 
}: ProgressProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <View style={[styles.container, { height }, style]}>
      <LinearGradient
        colors={[...gradient]}
        style={[
          styles.progress,
          { 
            width: `${clampedValue}%`,
            height,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.muted,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: borderRadius.full,
  },
});
