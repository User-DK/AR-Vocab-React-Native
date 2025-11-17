import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationProps } from '../types/navigation';
import Card from '../components/Card';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  responsive,
  layout,
} from '../styles/constants';
import { VocabularyCategory, VocabularyData } from '../types/vocabulary';

interface Category {
  id: string;
  name: string;
  icon: string;
  gradient: string[];
}

const categories: Category[] = [
  {
    id: 'animals',
    name: 'Animals',
    icon: '🦁',
    gradient: [...colors.gradients.orange],
  },
  {
    id: 'fruits',
    name: 'Fruits',
    icon: '🍎',
    gradient: [...colors.gradients.pink],
  },
  {
    id: 'objects',
    name: 'Objects',
    icon: '⚽',
    gradient: [...colors.gradients.blue],
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    icon: '🚗',
    gradient: [...colors.gradients.green],
  },
  {
    id: 'colors',
    name: 'Colors',
    icon: '🎨',
    gradient: [...colors.gradients.purple],
  },
  {
    id: 'music',
    name: 'Music',
    icon: '🎵',
    gradient: [...colors.gradients.yellow],
  },
  {
    id: 'home',
    name: 'Home',
    icon: '🏠',
    gradient: [...colors.gradients.teal],
  },
  {
    id: 'emotions',
    name: 'Emotions',
    icon: '😊',
    gradient: [...colors.gradients.pink],
  },
];

export default function CategorySelectionScreen({
  navigation,
}: NavigationProps) {
  const [categories, setCategories] = useState<VocabularyCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // For now, let's use the bundled data directly
      const vocabularyData =
        require('../../assets/ar/vocabulary-data.json') as VocabularyData;
      setCategories(vocabularyData.categories);
      setIsLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load categories');
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowModeSelection(true);
  };

  const handleModeSelect = (mode: 'learning' | 'practice') => {
    setShowModeSelection(false);

    if (!selectedCategory) return;

    if (mode === 'learning') {
      navigation.navigate('Learning', { category: selectedCategory });
    } else {
      navigation.navigate('SpeechAssessment', {
        category: selectedCategory,
        itemIndex: 0,
      });
    }

    setSelectedCategory(null);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#ddd6fe', '#bfdbfe', '#fce7f3']}
          style={styles.background}
        >
          <View style={styles.loadingContainer}>
            <Icon name="cube" size={50} color={colors.primary} />
            <Text style={styles.loadingText}>Loading Categories...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ddd6fe', '#bfdbfe', '#fce7f3']}
        style={styles.background}
      >
        {/* Header */}
        <LinearGradient colors={colors.gradients.purple} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Choose a Category</Text>
              <Text style={styles.headerSubtitle}>
                What do you want to learn?
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Categories Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.categoriesGrid}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryButton}
                onPress={() => handleCategorySelect(category.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={category.color}
                  style={styles.categoryGradient}
                >
                  <Text style={styles.categoryIcon}>{category.emoji}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Mode Selection Modal */}
      <Modal
        visible={showModeSelection}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModeSelection(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Choose Learning Mode</Text>
            <Text style={styles.modalSubtitle}>
              {selectedCategory
                ? `for ${
                    categories.find(c => c.id === selectedCategory)?.name ||
                    selectedCategory
                  }`
                : ''}
            </Text>

            <View style={styles.modeButtons}>
              <TouchableOpacity
                style={styles.modeButton}
                onPress={() => handleModeSelect('learning')}
              >
                <LinearGradient
                  colors={['#3b82f6', '#6366f1']}
                  style={styles.modeButtonGradient}
                >
                  <Icon name="school" size={32} color="white" />
                  <Text style={styles.modeButtonTitle}>Learn</Text>
                  <Text style={styles.modeButtonSubtitle}>
                    Explore AR models and hear pronunciations
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modeButton}
                onPress={() => handleModeSelect('practice')}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.modeButtonGradient}
                >
                  <Icon name="mic" size={32} color="white" />
                  <Text style={styles.modeButtonTitle}>Practice</Text>
                  <Text style={styles.modeButtonSubtitle}>
                    Practice pronunciation with AI assessment
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowModeSelection(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary,
    marginTop: spacing.md,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    ...shadows.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: responsiveHeight(6),
    height: responsiveHeight(6),
    borderRadius: responsiveHeight(3),
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '48%',
    marginBottom: layout.buttonSpacing,
  },
  categoryGradient: {
    height: responsive.buttonHeight(20),
    minHeight: 120,
    maxHeight: 160,
    borderRadius: borderRadius['3xl'],
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xl,
  },
  categoryIcon: {
    fontSize: typography.fontSizes['4xl'],
    marginBottom: spacing.sm,
  },
  categoryName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.card,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: borderRadius['3xl'],
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...shadows.xl,
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    fontSize: typography.fontSizes.base,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  modeButtons: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  modeButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  modeButtonGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  modeButtonTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: 'white',
  },
  modeButtonSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalCloseButton: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.muted,
  },
  modalCloseText: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});
