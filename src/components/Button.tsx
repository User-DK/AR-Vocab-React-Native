import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, typography, borderRadius, shadows } from '../styles/constants';

interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  gradient?: readonly [string, string, ...string[]];
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  gradient,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: disabled ? 0.6 : 1,
      ...shadows.md,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (size) {
      case 'sm':
        return { ...baseStyle, paddingHorizontal: 16, paddingVertical: 8 };
      case 'lg':
        return { ...baseStyle, paddingHorizontal: 32, paddingVertical: 16 };
      default:
        return { ...baseStyle, paddingHorizontal: 24, paddingVertical: 12 };
    }
  };

  const getTextStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: typography.fontWeights.semibold,
      textAlign: 'center',
    };

    switch (size) {
      case 'sm':
        return { ...baseStyle, fontSize: typography.fontSizes.sm };
      case 'lg':
        return { ...baseStyle, fontSize: typography.fontSizes.xl };
      default:
        return { ...baseStyle, fontSize: typography.fontSizes.base };
    }
  };

  const renderButton = () => {
    if (variant === 'gradient' || gradient) {
      return (
        <LinearGradient
          colors={gradient || colors.gradients.blue}
          style={[getButtonStyles(), style]}
        >
          {icon && icon}
          <Text style={[getTextStyles(), { color: colors.card }, textStyle]}>
            {title}
          </Text>
        </LinearGradient>
      );
    }

    let backgroundColor = colors.primary;
    let textColor = colors.card;

    switch (variant) {
      case 'secondary':
        backgroundColor = colors.secondary;
        textColor = colors.foreground;
        break;
      case 'ghost':
        backgroundColor = 'transparent';
        textColor = colors.primary;
        break;
    }

    return (
      <TouchableOpacity
        style={[
          getButtonStyles(),
          { backgroundColor },
          variant === 'ghost' && { shadowOpacity: 0, elevation: 0 },
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {icon && icon}
        <Text style={[getTextStyles(), { color: textColor }, textStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  if (variant === 'gradient' || gradient) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8}>
        {renderButton()}
      </TouchableOpacity>
    );
  }

  return renderButton();
}
