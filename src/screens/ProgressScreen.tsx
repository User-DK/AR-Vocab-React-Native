import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationProps } from '../types/navigation';
import Card from '../components/Card';
import Progress from '../components/Progress';
import Badge from '../components/Badge';
import {
  colors,
  typography,
  spacing,
  responsive,
  borderRadius,
  layout,
} from '../styles/constants';

export default function ProgressScreen({ navigation }: NavigationProps) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ddd6fe', '#bfdbfe', '#fce7f3']}
        style={styles.background}
      >
        {/* Header */}
        <LinearGradient
          colors={colors.gradients.orange}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Your Progress</Text>
              <Text style={styles.headerSubtitle}>Keep up the great work!</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Overall Progress */}
          <Card style={styles.progressCard}>
            <Text style={styles.cardTitle}>Overall Progress</Text>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Animals</Text>
              <Progress value={85} />
              <Text style={styles.progressPercent}>85%</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Fruits</Text>
              <Progress value={70} />
              <Text style={styles.progressPercent}>70%</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Objects</Text>
              <Progress value={45} />
              <Text style={styles.progressPercent}>45%</Text>
            </View>
          </Card>

          {/* Achievements */}
          <Card style={styles.achievementsCard}>
            <Text style={styles.cardTitle}>Achievements</Text>
            <View style={styles.badgeGrid}>
              <Badge variant="gradient" gradient={[...colors.gradients.blue]}>
                🦁 Animal Master
              </Badge>
              <Badge variant="gradient" gradient={[...colors.gradients.green]}>
                🍎 Fruit Expert
              </Badge>
              <Badge variant="gradient" gradient={[...colors.gradients.orange]}>
                ⭐ 7-Day Streak
              </Badge>
              <Badge variant="gradient" gradient={[...colors.gradients.purple]}>
                🎯 Perfect Score
              </Badge>
            </View>
          </Card>

          {/* Stats */}
          <Card style={styles.statsCard}>
            <Text style={styles.cardTitle}>Statistics</Text>
            <View style={styles.statGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>127</Text>
                <Text style={styles.statLabel}>Words Learned</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>7</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>95%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>42</Text>
                <Text style={styles.statLabel}>Total Hours</Text>
              </View>
            </View>
          </Card>
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
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: responsive.iconSize(6),
    height: responsive.iconSize(6),
    borderRadius: responsive.iconSize(6) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.card,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.containerPadding,
    paddingBottom: spacing.xl,
  },
  progressCard: {
    marginBottom: layout.cardSpacing,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  achievementsCard: {
    marginBottom: layout.cardSpacing,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  cardTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressLabel: {
    width: '30%',
    fontSize: typography.fontSizes.sm,
    color: colors.mutedForeground,
  },
  progressPercent: {
    width: '15%',
    textAlign: 'right',
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: layout.cardSpacing,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  statNumber: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});
