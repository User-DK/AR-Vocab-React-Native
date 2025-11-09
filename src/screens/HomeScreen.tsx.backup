import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationProps } from '../types/navigation';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Progress from '../components/Progress';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  responsive,
} from '../styles/constants';

export default function HomeScreen({ navigation }: NavigationProps) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ddd6fe', '#fce7f3', '#fed7d7']}
        style={styles.background}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section with Avatar */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <LinearGradient
                colors={colors.gradients.orange}
                style={styles.avatar}
              >
                <Text style={styles.avatarEmoji}>😊</Text>
              </LinearGradient>
              <View style={styles.greeting}>
                <Text style={styles.greetingText}>Hi, Alex!</Text>
                <Text style={styles.subGreeting}>Keep learning!</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Icon name="settings-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Stats Card */}
          <Card style={styles.statsCard} elevated={true}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <LinearGradient
                  colors={colors.gradients.yellow}
                  style={styles.statIcon}
                >
                  <Icon name="star" size={24} color="white" />
                </LinearGradient>
                <Text style={styles.statLabel}>Stars</Text>
              </View>
              <View style={styles.statItem}>
                <LinearGradient
                  colors={colors.gradients.purple}
                  style={styles.statIcon}
                >
                  <Icon name="trophy" size={24} color="white" />
                </LinearGradient>
                <Text style={styles.statLabel}>Badges</Text>
              </View>
              <View style={styles.statItem}>
                <LinearGradient
                  colors={colors.gradients.green}
                  style={styles.statIcon}
                >
                  <Icon name="trending-up" size={24} color="white" />
                </LinearGradient>
                <Text style={styles.statLabel}>Level</Text>
              </View>
            </View>

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Today's Progress</Text>
                <Text style={styles.progressValue}>3/5 lessons</Text>
              </View>
              <Progress value={60} height={12} />
            </View>

            {/* Badges */}
            <View style={styles.badgeContainer}>
              <Badge variant="gradient" gradient={colors.gradients.blue}>
                🦁 Animal Master
              </Badge>
              <Badge variant="gradient" gradient={colors.gradients.green}>
                🍎 Fruit Expert
              </Badge>
              <Badge variant="gradient" gradient={colors.gradients.orange}>
                ⭐ 7-Day Streak
              </Badge>
            </View>
          </Card>

          {/* Main Navigation Buttons */}
          <View style={styles.navigationGrid}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('Categories')}
            >
              <LinearGradient
                colors={colors.gradients.blue}
                style={styles.navButtonGradient}
              >
                <Icon name="book-outline" size={32} color="white" />
                <Text style={styles.navButtonText}>Learn</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('Assessment')}
            >
              <LinearGradient
                colors={colors.gradients.purple}
                style={styles.navButtonGradient}
              >
                <Icon name="sparkles-outline" size={32} color="white" />
                <Text style={styles.navButtonText}>Practice</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('Progress')}
            >
              <LinearGradient
                colors={colors.gradients.orange}
                style={styles.navButtonGradient}
              >
                <Icon name="trophy-outline" size={32} color="white" />
                <Text style={styles.navButtonText}>Rewards</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('Help')}
            >
              <LinearGradient
                colors={colors.gradients.teal}
                style={styles.navButtonGradient}
              >
                <Text style={styles.helpIcon}>❓</Text>
                <Text style={styles.navButtonText}>Help</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Fun Message */}
          <View style={styles.funMessage}>
            <Text style={styles.funMessageText}>
              🌟 You're doing amazing! Keep it up!
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: responsive.hp('8%'),
    height: responsive.hp('8%'),
    borderRadius: responsive.hp('4%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.lg,
  },
  avatarEmoji: {
    fontSize: typography.fontSizes['3xl'],
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.foreground,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subGreeting: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    marginTop: 2,
  },
  settingsButton: {
    width: responsive.hp('6%'),
    height: responsive.hp('6%'),
    borderRadius: responsive.hp('3%'),
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  statsCard: {
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: responsive.hp('8%'),
    height: responsive.hp('8%'),
    borderRadius: responsive.hp('4%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.mutedForeground,
    fontWeight: typography.fontWeights.medium,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.mutedForeground,
  },
  progressValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  navButton: {
    width: '48%',
    marginBottom: spacing.md,
  },
  navButtonGradient: {
    height: responsive.hp('16%'),
    borderRadius: borderRadius['3xl'],
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xl,
  },
  navButtonText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.card,
    marginTop: spacing.sm,
  },
  helpIcon: {
    fontSize: typography.fontSizes['4xl'],
  },
  funMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  funMessageText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
});

