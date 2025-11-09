import { Dimensions } from 'react-native';
import {
  responsiveWidth,
  responsiveHeight,
} from 'react-native-responsive-dimensions';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Device size detection
const isTablet = SCREEN_WIDTH >= 768;
const isSmallScreen = SCREEN_WIDTH <= 375;
const isLargeScreen = SCREEN_WIDTH >= 414;

// Custom responsive font size function
const responsiveFontSize = (percentage: number) => {
  const fontSize = responsiveHeight(percentage);
  return Math.max(10, Math.min(fontSize, isTablet ? 32 : 24));
};

// Responsive dimensions with better scaling
export const responsive = {
  wp: responsiveWidth,
  hp: responsiveHeight,
  fs: responsiveFontSize,
  // Constrained sizing for icons and elements
  iconSize: (percentage: number) => {
    const size = responsiveHeight(percentage);
    return Math.max(24, Math.min(size, isTablet ? 80 : 60));
  },
  avatarSize: (percentage: number) => {
    const size = responsiveHeight(percentage);
    return Math.max(40, Math.min(size, isTablet ? 120 : 80));
  },
  buttonHeight: (percentage: number) => {
    const size = responsiveHeight(percentage);
    return Math.max(44, Math.min(size, isTablet ? 200 : 120));
  },
};

// Colors
export const colors = {
  primary: '#4f46e5',
  secondary: '#fbbf24',
  accent: '#10b981',
  background: '#f8f9fe',
  foreground: '#2d3748',
  card: '#ffffff',
  border: 'rgba(0, 0, 0, 0.1)',
  muted: '#e5e7eb',
  mutedForeground: '#6b7280',
  destructive: '#ef4444',

  // Gradient colors
  gradients: {
    blue: ['#4f46e5', '#3b82f6'],
    purple: ['#8b5cf6', '#a855f7'],
    orange: ['#f59e0b', '#f97316'],
    green: ['#10b981', '#059669'],
    pink: ['#ec4899', '#f472b6'],
    yellow: ['#fbbf24', '#f59e0b'],
    teal: ['#14b8a6', '#0891b2'],
  },
};

// Improved Typography with better scaling
export const typography = {
  fontSizes: {
    xs: responsiveFontSize(1.4),
    sm: responsiveFontSize(1.6),
    base: responsiveFontSize(1.8),
    lg: responsiveFontSize(2.0),
    xl: responsiveFontSize(2.2),
    '2xl': responsiveFontSize(2.6),
    '3xl': responsiveFontSize(3.0),
    '4xl': responsiveFontSize(3.4),
  },
  fontWeights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Improved Spacing with device-aware scaling
export const spacing = {
  xs: isSmallScreen ? responsiveWidth(0.5) : responsiveWidth(1),
  sm: isSmallScreen ? responsiveWidth(1.5) : responsiveWidth(2),
  md: isSmallScreen ? responsiveWidth(3) : responsiveWidth(4),
  lg: isSmallScreen ? responsiveWidth(4.5) : responsiveWidth(6),
  xl: isSmallScreen ? responsiveWidth(6) : responsiveWidth(8),
  '2xl': isSmallScreen ? responsiveWidth(8) : responsiveWidth(10),
  '3xl': isSmallScreen ? responsiveWidth(10) : responsiveWidth(12),
};

// Border radius with better proportions
export const borderRadius = {
  sm: responsiveWidth(0.5),
  md: responsiveWidth(1),
  lg: responsiveWidth(2),
  xl: responsiveWidth(3),
  '2xl': responsiveWidth(4),
  '3xl': responsiveWidth(6),
  full: 999,
};

// Enhanced shadows for different screen densities
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isTablet ? 0.15 : 0.2,
    shadowRadius: isTablet ? 2 : 1.41,
    elevation: isTablet ? 3 : 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isTablet ? 0.2 : 0.25,
    shadowRadius: isTablet ? 4.5 : 3.84,
    elevation: isTablet ? 6 : 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isTablet ? 0.25 : 0.3,
    shadowRadius: isTablet ? 5.5 : 4.65,
    elevation: isTablet ? 9 : 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isTablet ? 0.3 : 0.37,
    shadowRadius: isTablet ? 8.5 : 7.49,
    elevation: isTablet ? 14 : 12,
  },
};

// Layout helpers
export const layout = {
  containerPadding: isSmallScreen ? spacing.md : spacing.lg,
  cardSpacing: isSmallScreen ? spacing.sm : spacing.md,
  buttonSpacing: isSmallScreen ? spacing.md : spacing.lg,
  gridGap: isSmallScreen ? '2%' : '4%',
  maxContentWidth: isTablet ? 600 : SCREEN_WIDTH * 0.9,
};