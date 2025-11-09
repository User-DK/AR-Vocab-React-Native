import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationProps } from '../types/navigation';
import Card from '../components/Card';
import {
  colors,
  typography,
  spacing,
  responsive,
  layout,
} from '../styles/constants';

export default function SettingsScreen({ navigation }: NavigationProps) {
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [vibrationEnabled, setVibrationEnabled] = React.useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ddd6fe', '#bfdbfe', '#fce7f3']}
        style={styles.background}
      >
        {/* Header */}
        <LinearGradient
          colors={colors.gradients.teal}
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
              <Text style={styles.headerTitle}>Settings</Text>
              <Text style={styles.headerSubtitle}>Customize your experience</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Audio Settings */}
          <Card style={styles.settingsCard}>
            <Text style={styles.cardTitle}>Audio & Haptics</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="volume-high" size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Sound Effects</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: colors.muted, true: colors.primary }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="phone-portrait" size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Vibration</Text>
              </View>
              <Switch
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                trackColor={{ false: colors.muted, true: colors.primary }}
              />
            </View>
          </Card>

          {/* Notification Settings */}
          <Card style={styles.settingsCard}>
            <Text style={styles.cardTitle}>Notifications</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="notifications" size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Push Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.muted, true: colors.primary }}
              />
            </View>
          </Card>

          {/* Account Settings */}
          <Card style={styles.settingsCard}>
            <Text style={styles.cardTitle}>Account</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="person" size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Profile</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="sync" size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Sync Data</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </Card>

          {/* About */}
          <Card style={styles.settingsCard}>
            <Text style={styles.cardTitle}>About</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="information-circle" size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>App Version</Text>
              </View>
              <Text style={styles.versionText}>1.0.0</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="star" size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Rate App</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
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
  settingsCard: {
    marginBottom: layout.cardSpacing,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  cardTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.fontSizes.base,
    color: colors.foreground,
    marginLeft: spacing.md,
  },
  versionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.mutedForeground,
  },
});
