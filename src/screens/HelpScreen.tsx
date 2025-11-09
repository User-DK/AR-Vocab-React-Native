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
import {
  colors,
  typography,
  spacing,
  responsive,
  layout,
} from '../styles/constants';

export default function HelpScreen({ navigation }: NavigationProps) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ddd6fe', '#bfdbfe', '#fce7f3']}
        style={styles.background}
      >
        {/* Header */}
        <LinearGradient
          colors={colors.gradients.green}
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
              <Text style={styles.headerTitle}>Help & Support</Text>
              <Text style={styles.headerSubtitle}>Get help when you need it</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Getting Started */}
          <Card style={styles.helpCard}>
            <Text style={styles.cardTitle}>Getting Started</Text>
            <Text style={styles.helpText}>
              Welcome to AR-Vocab! This app helps you learn vocabulary through interactive AR experiences and speech recognition.
            </Text>
          </Card>

          {/* How to Use */}
          <Card style={styles.helpCard}>
            <Text style={styles.cardTitle}>How to Use</Text>
            <View style={styles.stepContainer}>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>Choose a category from the home screen</Text>
              </View>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>Point your camera at objects for AR learning</Text>
              </View>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>Practice pronunciation with speech assessment</Text>
              </View>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>4</Text>
                <Text style={styles.stepText}>Track your progress and earn badges</Text>
              </View>
            </View>
          </Card>

          {/* FAQ */}
          <Card style={styles.helpCard}>
            <Text style={styles.cardTitle}>Frequently Asked Questions</Text>
            
            <View style={styles.faqItem}>
              <Text style={styles.question}>How does AR learning work?</Text>
              <Text style={styles.answer}>
                Point your camera at real objects and the app will recognize them, showing interactive 3D models and vocabulary information.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.question}>Why isn't speech recognition working?</Text>
              <Text style={styles.answer}>
                Make sure you've granted microphone permissions and speak clearly in a quiet environment.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.question}>How do I earn badges?</Text>
              <Text style={styles.answer}>
                Complete lessons, maintain learning streaks, and achieve high scores in pronunciation practice.
              </Text>
            </View>
          </Card>

          {/* Contact Support */}
          <Card style={styles.helpCard}>
            <Text style={styles.cardTitle}>Contact Support</Text>
            
            <TouchableOpacity style={styles.contactItem}>
              <Icon name="mail" size={20} color={colors.primary} />
              <Text style={styles.contactText}>support@arvocab.com</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <Icon name="chatbubble" size={20} color={colors.primary} />
              <Text style={styles.contactText}>Live Chat Support</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <Icon name="call" size={20} color={colors.primary} />
              <Text style={styles.contactText}>1-800-AR-VOCAB</Text>
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
    paddingHorizontal: layout.containerPadding,
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
  helpCard: {
    marginBottom: layout.cardSpacing,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  cardTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  helpText: {
    fontSize: typography.fontSizes.base,
    color: colors.mutedForeground,
    lineHeight: typography.fontSizes.base * 1.5,
  },
  stepContainer: {
    gap: spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: colors.card,
    textAlign: 'center',
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    marginRight: spacing.md,
    lineHeight: 24,
  },
  stepText: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    color: colors.mutedForeground,
    lineHeight: typography.fontSizes.base * 1.5,
  },
  faqItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  question: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  answer: {
    fontSize: typography.fontSizes.sm,
    color: colors.mutedForeground,
    lineHeight: typography.fontSizes.sm * 1.5,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactText: {
    fontSize: typography.fontSizes.base,
    color: colors.foreground,
    marginLeft: spacing.md,
  },
});
