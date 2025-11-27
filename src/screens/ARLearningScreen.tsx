import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Sound from 'react-native-sound';
import LinearGradient from 'react-native-linear-gradient';
import ARModelViewer from '../components/ARModelViewer';
import { getSoundAsset } from '../utils/assetLoader';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  responsive,
  layout,
} from '../styles/constants';

// Default vocabulary data structure
const defaultVocabularyData: VocabularyData = {
  categories: [],
};

interface ARLearningScreenProps {
  navigation: any;
  route: {
    params: {
      category: string; // Changed from categoryId to match the parameter name in CategorySelectionScreen
    };
  };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VocabularyItem {
  id: string;
  word: string;
  emoji: string;
  pronunciation: string;
  phonetic: string;
  modelPath: string;
  soundPath: string;
  textureColor: string;
  scale: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  animations: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
}

interface VocabularyCategory {
  id: string;
  name: string;
  emoji: string;
  color: string[];
  description: string;
  items: VocabularyItem[];
}

interface VocabularyData {
  categories: VocabularyCategory[];
}

export default function ARLearningScreen({
  navigation,
  route,
}: ARLearningScreenProps) {
  const { category: categoryId } = route.params; // Rename the parameter to match our usage
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [sound, setSound] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const [vocabularyData, setVocabularyData] = useState<VocabularyData>(
    defaultVocabularyData,
  );

  // Animation values for Figma-based UI
  const floatingAnimation = useRef(new Animated.Value(0)).current;
  const sparkleAnimation = useRef(new Animated.Value(0)).current;
  const gridOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    loadVocabularyData();

    // Enable playback in silence mode (iOS)
    Sound.setCategory('Playback');

    return () => {
      // Cleanup sound on unmount
      if (sound) {
        sound.release();
      }
    };
  }, []);

  const loadVocabularyData = async () => {
    try {
      // Load the vocabulary data from the bundled asset
      const data = require('../../assets/ar/vocabulary-data.json');
      console.log('Loaded vocabulary data:', JSON.stringify(data, null, 2));
      if (!data || !data.categories) {
        throw new Error('Invalid vocabulary data structure');
      }
      setVocabularyData(data);
    } catch (error) {
      console.error('Error loading vocabulary data:', error);
      Alert.alert('Error', 'Failed to load vocabulary data. Please try again.');
    }
  };

  // Debug category matching
  console.log('Detailed Debug Info:');
  console.log('1. Received categoryId:', categoryId);
  console.log('2. Category ID type:', typeof categoryId);

  // Safety check for categoryId
  if (!categoryId) {
    console.error('Category ID is undefined or null');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <View style={styles.backButtonContainer}>
              <Icon name="arrow-back" size={24} color="white" />
            </View>
          </TouchableOpacity>
          <View style={styles.errorContent}>
            <Text style={styles.errorText}>Invalid category parameter</Text>
            <Text style={styles.errorSubtext}>
              Please select a category from the menu
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  console.log(
    '3. Available categories:',
    JSON.stringify(
      vocabularyData.categories.map((cat: VocabularyCategory) => ({
        id: cat.id,
        type: typeof cat.id,
        items: cat.items?.length || 0,
      })),
      null,
      2,
    ),
  );

  const categoryData = vocabularyData.categories.find(
    (cat: VocabularyCategory) =>
      cat.id && categoryId && cat.id.toLowerCase() === categoryId.toLowerCase(),
  );

  console.log(
    '4. Found category data:',
    categoryData
      ? {
          id: categoryData.id,
          name: categoryData.name,
          itemCount: categoryData.items?.length,
        }
      : 'No matching category',
  );

  const items = categoryData?.items || [];
  console.log('5. Items in category:', items.length);

  const currentItem = items[currentItemIndex];
  console.log('Current item:', currentItem);

  useEffect(() => {
    // Start floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Grid pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(gridOpacity, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(gridOpacity, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const triggerSparkle = () => {
    setShowSparkle(true);
    Animated.sequence([
      Animated.timing(sparkleAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(sparkleAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => setShowSparkle(false));
  };

  const playSound = async () => {
    if (!currentItem?.soundPath || isPlaying) return;

    try {
      // Release previous sound if exists
      if (sound) {
        sound.release();
        setSound(null);
      }

      setIsPlaying(true);
      console.log('🔊 Playing sound for:', currentItem.word);
      console.log('🔊 Sound path from JSON:', currentItem.soundPath);

      /**
       * PROPER SOUND LOADING FOR REACT-NATIVE-SOUND
       *
       * Uses require() to ensure Metro bundler includes the asset.
       * The assetLoader utility maps JSON string paths to proper require() calls.
       */

      // Check if sound path exists
      if (!currentItem.soundPath) {
        console.warn(`⚠️ No sound path for: ${currentItem.word}`);
        setIsPlaying(false);
        return;
      }

      // For Android, react-native-sound loads from res/raw folder
      // Files need to be lowercase with underscores only, no extension needed
      // vocabulary-data.json has: "sounds/Lion.mp3" or "sounds/lion.mp3"
      // Convert to raw resource name: "lion" (lowercase, no extension)
      let rawName = currentItem.soundPath
        .replace(/^sounds\//, '') // Remove "sounds/" prefix
        .replace(/\.mp3$/i, '') // Remove .mp3 extension
        .toLowerCase() // Convert to lowercase
        .replace(/-/g, '_') // Replace hyphens with underscores
        .replace(/\s+/g, '_'); // Replace spaces with underscores

      console.log('✅ Loading sound from raw:', rawName);
      console.log('   Original path:', currentItem.soundPath);

      // On Android, pass empty string as basePath to load from res/raw
      // The file should be at: android/app/src/main/res/raw/{rawName}.mp3
      const soundFile = new Sound(
        rawName + '.mp3',
        Sound.MAIN_BUNDLE,
        error => {
          if (error) {
            console.error('❌ Failed to load sound:', error);
            Alert.alert(
              'Audio Error',
              `Failed to load sound for "${currentItem.word}". Please try again.`,
            );
            setIsPlaying(false);
            return;
          }

          console.log('✅ Sound file loaded successfully');
          console.log('Duration:', soundFile.getDuration(), 'seconds');

          // Play the sound
          soundFile.play(success => {
            if (success) {
              console.log('✅ Sound played successfully');
              triggerSparkle();
            } else {
              console.log('⚠️ Sound playback failed');
            }
            setIsPlaying(false);
          });

          setSound(soundFile);
        },
      );
    } catch (error) {
      console.error('Error playing sound:', error);
      Alert.alert('Audio Error', 'Failed to play sound. Please try again.');
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    // Stop current sound if playing
    if (sound) {
      sound.stop();
      sound.release();
      setSound(null);
      setIsPlaying(false);
    }

    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    } else {
      Alert.alert(
        'Congratulations!',
        'You have completed all words in this category!',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    }
  };

  const handlePrevious = () => {
    // Stop current sound if playing
    if (sound) {
      sound.stop();
      sound.release();
      setSound(null);
      setIsPlaying(false);
    }

    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
    }
  };

  // Cleanup sound when item changes
  useEffect(() => {
    return () => {
      if (sound) {
        sound.release();
      }
    };
  }, [currentItemIndex]);

  if (!currentItem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <View style={styles.backButtonContainer}>
              <Icon name="arrow-back" size={24} color="white" />
            </View>
          </TouchableOpacity>
          <View style={styles.errorContent}>
            <Text style={styles.errorText}>
              No items found for category: {categoryId}
            </Text>
            <Text style={styles.errorSubtext}>Please try another category</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const floatingTransform = {
    transform: [
      {
        translateY: floatingAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Camera Background Simulation */}
      <LinearGradient
        colors={['#1F2937', '#374151', '#4B5563']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        {/* Gradient Orbs */}
        <View style={styles.orbsContainer}>
          <Animated.View style={[styles.orb, styles.blueOrb]} />
          <Animated.View style={[styles.orb, styles.purpleOrb]} />
          <Animated.View style={[styles.orb, styles.greenOrb]} />
        </View>
      </LinearGradient>

      {/* AR Grid Overlay */}
      <Animated.View style={[styles.gridOverlay, { opacity: gridOpacity }]}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLine, { top: i * 40 }]} />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={[styles.gridLineVertical, { left: i * 40 }]}
          />
        ))}
      </Animated.View>

      {/* Header */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <View style={styles.backButtonContainer}>
              <Icon name="arrow-back" size={24} color="white" />
            </View>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>AR Learning</Text>
            <Text style={styles.headerSubtitle}>
              {currentItemIndex + 1} of {items.length}
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      {/* AR View Container */}
      <View style={styles.arContainer}>
        <View style={styles.arViewerContainer}>
          <ARModelViewer
            key={currentItem.id} // Force remount when item changes
            item={{
              ...currentItem,
              scale: currentItem.scale as [number, number, number],
              position: currentItem.position as [number, number, number],
              rotation: currentItem.rotation as [number, number, number],
              difficulty: currentItem.difficulty as 'easy' | 'medium' | 'hard',
            }}
            onModelLoaded={() => console.log('Model loaded:', currentItem.word)}
            onModelTapped={playSound}
          />
        </View>

        {showSparkle && (
          <Animated.View
            style={[
              styles.sparkleContainer,
              {
                transform: [
                  {
                    scale: sparkleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 2],
                    }),
                  },
                ],
                opacity: sparkleAnimation,
              },
            ]}
          >
            <Icon name="star" size={100} color="#FFD700" />
          </Animated.View>
        )}
      </View>

      {/* Word Info Card */}
      <View style={styles.wordInfoCard}>
        <View style={styles.wordInfo}>
          <Text style={styles.instructionText}>Say this word:</Text>
          <Text style={styles.wordText}>{currentItem.word}</Text>
          <Text style={styles.pronunciationText}>
            {currentItem.pronunciation}
          </Text>
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={playSound}
            style={styles.controlButton}
            disabled={isPlaying}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.buttonGradient}
            >
              <Icon
                name={isPlaying ? 'volume-high' : 'volume-high-outline'}
                size={24}
                color="white"
              />
              <Text style={styles.buttonText}>Repeat</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
            <LinearGradient
              colors={['#11998e', '#38ef7d']}
              style={styles.buttonGradient}
            >
              <Icon name="play-skip-forward" size={24} color="white" />
              <Text style={styles.buttonText}>Next</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.controlButton}
          >
            <LinearGradient
              colors={['#bdc3c7', '#95a5a6']}
              style={styles.buttonGradient}
            >
              <Icon name="close" size={24} color="white" />
              <Text style={styles.buttonText}>Exit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {items.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentItemIndex ? styles.progressDotActive : null,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    padding: layout.containerPadding,
    alignItems: 'flex-start',
  },
  errorContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.foreground,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorSubtext: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizes.sm,
    textAlign: 'center',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    opacity: 0.95,
  },
  orbsContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  blueOrb: {
    top: spacing.xl,
    left: spacing.xl,
    width: responsive.avatarSize(16),
    height: responsive.avatarSize(16),
    backgroundColor: colors.gradients.blue[0],
    transform: [{ scale: 2 }],
    opacity: 0.6,
  },
  purpleOrb: {
    bottom: spacing['2xl'],
    right: spacing.xl,
    width: responsive.avatarSize(20),
    height: responsive.avatarSize(20),
    backgroundColor: colors.gradients.purple[0],
    transform: [{ scale: 2 }],
    opacity: 0.6,
  },
  greenOrb: {
    top: '50%',
    left: '50%',
    width: responsive.avatarSize(32),
    height: responsive.avatarSize(32),
    backgroundColor: colors.gradients.green[0],
    transform: [
      { scale: 2 },
      { translateX: -responsive.avatarSize(32) / 2 },
      { translateY: -responsive.avatarSize(32) / 2 },
    ],
    opacity: 0.3,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    opacity: 0.1,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.containerPadding,
    paddingVertical: spacing.md,
    zIndex: 10,
  },
  backButton: {
    width: responsive.iconSize(12),
    height: responsive.iconSize(12),
    borderRadius: responsive.iconSize(12) / 2,
    overflow: 'hidden',
  },
  backButtonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...shadows.md,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...shadows.md,
  },
  headerTitle: {
    color: colors.card,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    marginLeft: spacing.sm,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  headerSpacer: {
    width: responsive.iconSize(12),
  },
  arContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  arViewerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  objectDisplayArea: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkleContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  objectFrame: {
    width: responsive.avatarSize(25),
    height: responsive.avatarSize(25),
    borderRadius: borderRadius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    ...shadows.xl,
  },
  arMarker: {
    position: 'absolute',
    width: responsive.iconSize(3),
    height: responsive.iconSize(3),
    borderColor: colors.gradients.teal[0],
  },
  arMarkerTopLeft: {
    top: spacing.sm,
    left: spacing.sm,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  arMarkerTopRight: {
    top: spacing.sm,
    right: spacing.sm,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  arMarkerBottomLeft: {
    bottom: spacing.sm,
    left: spacing.sm,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  arMarkerBottomRight: {
    bottom: spacing.sm,
    right: spacing.sm,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  emojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: typography.fontSizes['4xl'] * 2,
  },
  wordInfoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    marginHorizontal: layout.containerPadding,
    marginBottom: spacing.xl,
    borderRadius: borderRadius['3xl'],
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    ...shadows.xl,
  },
  wordInfo: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  instructionText: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeights.medium,
  },
  wordText: {
    color: '#7C3AED',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  pronunciationText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: 16,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  controlButton: {
    flex: 1,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    color: colors.card,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    letterSpacing: 0.5,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.sm / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  progressDotActive: {
    width: spacing.xl,
    backgroundColor: colors.primary,
    transform: [{ scaleY: 1.1 }],
  },
});
