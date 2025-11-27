import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationProps } from '../types/navigation';
import { VocabularyItem } from '../types/vocabulary';
import ARModelViewer from '../components/ARModelViewer';
import {
  speechAssessmentEngine,
  PronunciationScore,
  getFeedbackMessage,
  getFeedbackColor,
  SCORE_THRESHOLDS,
} from '../utils/speechAssessment';
import {
  colors,
  typography,
  spacing,
  responsive,
  borderRadius,
  shadows,
  layout,
} from '../styles/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Default vocabulary data structure for practice
const defaultVocabularyData: {
  categories: Array<{
    id: string;
    name: string;
    emoji: string;
    color: string[];
    description: string;
    items: VocabularyItem[];
  }>;
} = {
  categories: [],
};

interface SpeechAssessmentScreenProps extends NavigationProps {
  route: {
    params?: {
      category?: string;
      itemIndex?: number;
    };
  };
}

interface AssessmentState {
  isRecording: boolean;
  isProcessing: boolean;
  showFeedback: boolean;
  currentScore: PronunciationScore | null;
  assessmentHistory: PronunciationScore[];
}

export default function SpeechAssessmentScreen({
  navigation,
  route,
}: SpeechAssessmentScreenProps) {
  // Get parameters from navigation (category and starting item)
  const { category = 'animals', itemIndex = 0 } = route.params || {};

  // State management
  const [currentIndex, setCurrentIndex] = useState(itemIndex);
  const [vocabularyData, setVocabularyData] = useState(defaultVocabularyData);
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({
    isRecording: false,
    isProcessing: false,
    showFeedback: false,
    currentScore: null,
    assessmentHistory: [],
  });

  // Animation values for interactive UI
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const feedbackScaleAnim = useRef(new Animated.Value(0)).current;
  const scoreBarAnim = useRef(new Animated.Value(0)).current;
  const gridOpacity = useRef(new Animated.Value(0.3)).current;
  const starAnimations = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  // Load vocabulary data on component mount
  useEffect(() => {
    loadVocabularyData();
    startBackgroundAnimations();
    return () => {
      // Cleanup speech assessment engine
      speechAssessmentEngine.cleanup();
    };
  }, []);

  // Start background animations (like ARLearningScreen)
  const startBackgroundAnimations = () => {
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
  };

  // Load vocabulary data from bundled asset
  const loadVocabularyData = async () => {
    try {
      const data = require('../../assets/ar/vocabulary-data.json');
      console.log('📚 Loaded vocabulary data for speech assessment');
      if (!data || !data.categories) {
        throw new Error('Invalid vocabulary data structure');
      }
      setVocabularyData(data);
    } catch (error) {
      console.error('❌ Error loading vocabulary data:', error);
      Alert.alert('Error', 'Failed to load vocabulary data. Please try again.');
    }
  };

  // Find current category and items
  const categoryData = vocabularyData.categories.find(
    cat =>
      cat.id && category && cat.id.toLowerCase() === category.toLowerCase(),
  );

  const items = categoryData?.items || [];
  const currentItem = items[currentIndex];

  console.log(`🎯 Current practice item: ${currentItem?.word || 'None'}`);
  console.log(
    `📂 Category: ${categoryData?.name || 'Unknown'} (${items.length} items)`,
  );

  // Word change animation
  useEffect(() => {
    if (currentItem) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentIndex]);

  // Recording state animations
  useEffect(() => {
    if (assessmentState.isRecording) {
      console.log('🎤 Starting recording animations');

      // Pulse animation while recording
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      // Reset animations when not recording
      pulseAnim.setValue(1);
    }
  }, [assessmentState.isRecording]);

  /**
   * Start pronunciation assessment for current word
   */
  const startPronunciationAssessment = async () => {
    if (
      !currentItem ||
      assessmentState.isRecording ||
      assessmentState.isProcessing
    ) {
      return;
    }

    try {
      console.log(`🎯 Starting assessment for: "${currentItem.word}"`);
      console.log(`🔤 Phonetic: "${currentItem.phonetic}"`);

      // Update state to recording
      setAssessmentState(prev => ({
        ...prev,
        isRecording: true,
        showFeedback: false,
        currentScore: null,
      }));

      // Start speech assessment with MFCC analysis
      await speechAssessmentEngine.startAssessment(
        currentItem.word,
        currentItem.phonetic,
      );

      // Auto-stop after recording duration
      setTimeout(async () => {
        if (assessmentState.isRecording) {
          await stopPronunciationAssessment();
        }
      }, 3000); // 3 seconds recording
    } catch (error: any) {
      console.error('❌ Assessment start failed:', error);

      // If voice is unavailable, offer to open app settings
      if (error?.code === 'VOICE_UNAVAILABLE') {
        Alert.alert(
          'Recording Error',
          error.message ||
            'Voice recognition is not available on this device. You can open app settings to check permissions or install a speech recognition provider.',
          [
            {
              text: 'Open Settings',
              onPress: () => {
                Linking.openSettings().catch(() => {
                  console.warn('Unable to open settings');
                });
              },
            },
            { text: 'OK' },
          ],
        );
      } else {
        Alert.alert(
          'Recording Error',
          error.message ||
            'Could not start pronunciation assessment. Please check microphone permissions and try again.',
        );
      }

      setAssessmentState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
      }));
    }
  };

  /**
   * Stop assessment and process pronunciation score
   */
  const stopPronunciationAssessment = async () => {
    try {
      console.log('⏹️ Stopping pronunciation assessment...');

      // Update state to processing
      setAssessmentState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: true,
      }));

      // Get pronunciation score from MFCC analysis
      const score = await speechAssessmentEngine.stopAssessment();

      if (score) {
        console.log('📊 Pronunciation score received:', score);

        // Add to assessment history
        setAssessmentState(prev => ({
          ...prev,
          isProcessing: false,
          currentScore: score,
          showFeedback: true,
          assessmentHistory: [...prev.assessmentHistory, score],
        }));

        // Animate feedback display
        animateFeedbackDisplay(score);

        // Auto-hide feedback after delay
        setTimeout(() => {
          setAssessmentState(prev => ({
            ...prev,
            showFeedback: false,
          }));
        }, 4000);
      } else {
        throw new Error('No pronunciation score received');
      }
    } catch (error) {
      console.error('❌ Assessment processing failed:', error);
      Alert.alert(
        'Assessment Error',
        'Could not process your pronunciation. Please try again.',
      );

      setAssessmentState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
      }));
    }
  };

  /**
   * Animate feedback display based on score
   */
  const animateFeedbackDisplay = (score: PronunciationScore) => {
    // Reset animations
    feedbackScaleAnim.setValue(0);
    scoreBarAnim.setValue(0);
    starAnimations.forEach(anim => anim.setValue(0));

    // Scale in feedback
    Animated.spring(feedbackScaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Animate score bar
    Animated.timing(scoreBarAnim, {
      toValue: score.overall,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    // Star animations for good scores
    if (score.overall >= SCORE_THRESHOLDS.good) {
      const starDelay = 500;
      starAnimations.forEach((anim, index) => {
        setTimeout(() => {
          Animated.sequence([
            Animated.timing(anim, {
              toValue: -30,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        }, index * 200 + starDelay);
      });
    }
  };

  /**
   * Navigate to next word for practice
   */
  const handleNextWord = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Loop back to first item or show completion
      Alert.alert(
        'Practice Complete!',
        `You've practiced all ${items.length} words in the ${categoryData?.name} category.\\n\\nWould you like to practice again?`,
        [
          { text: 'Practice Again', onPress: () => setCurrentIndex(0) },
          { text: 'Back to Home', onPress: () => navigation.navigate('Home') },
        ],
      );
    }

    // Reset assessment state
    setAssessmentState(prev => ({
      ...prev,
      showFeedback: false,
      currentScore: null,
    }));
  };

  /**
   * Navigate to previous word
   */
  const handlePreviousWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(items.length - 1); // Loop to last item
    }

    // Reset assessment state
    setAssessmentState(prev => ({
      ...prev,
      showFeedback: false,
      currentScore: null,
    }));
  };

  // Show error state if no vocabulary data
  if (!currentItem) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1F2937', '#374151', '#4B5563']}
          style={styles.backgroundGradient}
        >
          <SafeAreaView style={styles.errorSafeArea}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerButton}
            >
              <View style={styles.headerButtonInner}>
                <Icon name="arrow-back" size={24} color="white" />
              </View>
            </TouchableOpacity>
            <View style={styles.errorContent}>
              <Icon name="alert-circle" size={64} color="#ef4444" />
              <Text style={styles.errorText}>No Practice Items Available</Text>
              <Text style={styles.errorSubtext}>
                {category
                  ? `No items found in "${category}" category.`
                  : 'Please select a category first.'}
              </Text>
              <TouchableOpacity
                style={styles.errorButton}
                onPress={() => navigation.navigate('CategorySelection')}
              >
                <Text style={styles.errorButtonText}>Choose Category</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Full-screen AR Camera Background */}
      <View style={styles.arBackground}>
        <ARModelViewer
          key={currentItem.id}
          item={{
            ...currentItem,
            scale: currentItem.scale as [number, number, number],
            position: currentItem.position as [number, number, number],
            rotation: currentItem.rotation as [number, number, number],
            difficulty: currentItem.difficulty as 'easy' | 'medium' | 'hard',
          }}
          onModelLoaded={() =>
            console.log('AR Model loaded for practice:', currentItem.word)
          }
          onModelTapped={() =>
            console.log('AR Model tapped:', currentItem.word)
          }
        />
      </View>

      {/* Fallback Gradient Background (behind AR) */}
      <LinearGradient
        colors={['#1F2937', '#374151', '#4B5563']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fallbackBackground}
        pointerEvents="none"
      >
        {/* Gradient Orbs */}
        <View style={styles.orbsContainer}>
          <View style={[styles.orb, styles.blueOrb]} />
          <View style={[styles.orb, styles.purpleOrb]} />
          <View style={[styles.orb, styles.greenOrb]} />
        </View>
      </LinearGradient>

      {/* AR Grid Overlay */}
      <Animated.View
        style={[styles.gridOverlay, { opacity: gridOpacity }]}
        pointerEvents="none"
      >
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

      {/* Floating Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.headerButtonInner}>
              <Icon name="arrow-back" size={24} color="white" />
            </View>
          </TouchableOpacity>

          <View style={styles.speechTestIndicator}>
            <Icon name="mic" size={20} color="white" />
            <Text style={styles.speechTestText}>Pronunciation Practice</Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Home')}
          >
            <View style={styles.headerButtonInner}>
              <Icon name="close" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Recording Status Overlay */}
      {assessmentState.isRecording && (
        <View style={styles.recordingOverlay}>
          <View style={styles.recordingIndicator}>
            <Animated.View
              style={[
                styles.recordingDot,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Text style={styles.recordingText}>🎤 Listening...</Text>
          </View>
        </View>
      )}

      {assessmentState.isProcessing && (
        <View style={styles.recordingOverlay}>
          <View style={styles.recordingIndicator}>
            <ActivityIndicator size="small" color="#f59e0b" />
            <Text style={styles.recordingText}>
              🧠 Analyzing pronunciation...
            </Text>
          </View>
        </View>
      )}

      {/* Floating Bottom Card with Controls */}
      <View style={styles.bottomCard}>
        <View style={styles.bottomCardContent}>
          {/* Word Info */}
          <View style={styles.wordInfo}>
            <Text style={styles.instructionText}>Practice saying:</Text>
            <Animated.Text
              style={[styles.wordText, { transform: [{ scale: scaleAnim }] }]}
            >
              {currentItem.word}
            </Animated.Text>
            <Text style={styles.phoneticText}>{currentItem.phonetic}</Text>
          </View>

          {/* Recording Button */}
          <View style={styles.recordButtonContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  assessmentState.isRecording && styles.recordButtonActive,
                  assessmentState.isProcessing && styles.recordButtonProcessing,
                ]}
                onPress={startPronunciationAssessment}
                disabled={
                  assessmentState.isRecording || assessmentState.isProcessing
                }
              >
                <LinearGradient
                  colors={
                    assessmentState.isRecording
                      ? ['#ef4444', '#dc2626']
                      : assessmentState.isProcessing
                      ? ['#f59e0b', '#d97706']
                      : ['#10b981', '#059669']
                  }
                  style={styles.recordButtonGradient}
                >
                  {assessmentState.isProcessing ? (
                    <ActivityIndicator size="large" color="white" />
                  ) : (
                    <Icon
                      name={assessmentState.isRecording ? 'stop' : 'mic'}
                      size={36}
                      color="white"
                    />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
            <Text style={styles.recordButtonLabel}>
              {assessmentState.isRecording
                ? 'Recording...'
                : assessmentState.isProcessing
                ? 'Processing...'
                : 'Tap to Speak'}
            </Text>
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={handlePreviousWord}
              disabled={
                assessmentState.isRecording || assessmentState.isProcessing
              }
            >
              <LinearGradient
                colors={['#6b7280', '#4b5563']}
                style={styles.navButtonGradient}
              >
                <Icon name="play-back" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextWord}
              disabled={
                assessmentState.isRecording || assessmentState.isProcessing
              }
            >
              <LinearGradient
                colors={['#3b82f6', '#6366f1']}
                style={styles.nextButtonGradient}
              >
                <Icon name="play-forward" size={24} color="white" />
                <Text style={styles.nextButtonText}>Next Word</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('Home')}
            >
              <LinearGradient
                colors={['#ef4444', '#dc2626']}
                style={styles.navButtonGradient}
              >
                <Icon name="home" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentIndex + 1} of {items.length}
            </Text>
            <View style={styles.progressDots}>
              {items.slice(0, Math.min(items.length, 10)).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentIndex && styles.progressDotActive,
                  ]}
                />
              ))}
              {items.length > 10 && (
                <Text style={styles.progressMoreText}>...</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Advanced Feedback Modal */}
      <Modal
        visible={assessmentState.showFeedback}
        transparent={true}
        animationType="none"
      >
        <View style={styles.feedbackOverlay}>
          <Animated.View
            style={[
              styles.feedbackContainer,
              {
                transform: [{ scale: feedbackScaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={
                assessmentState.currentScore
                  ? [
                      getFeedbackColor(assessmentState.currentScore.feedback),
                      '#ffffff',
                    ]
                  : ['#6b7280', '#ffffff']
              }
              style={styles.feedbackGradient}
            >
              {assessmentState.currentScore && (
                <>
                  {/* Feedback Icon */}
                  <Text style={styles.feedbackEmoji}>
                    {assessmentState.currentScore.feedback === 'excellent' &&
                      '🌟'}
                    {assessmentState.currentScore.feedback === 'good' && '👍'}
                    {assessmentState.currentScore.feedback === 'acceptable' &&
                      '👌'}
                    {assessmentState.currentScore.feedback === 'poor' && '📚'}
                    {assessmentState.currentScore.feedback === 'unclear' &&
                      '🎤'}
                  </Text>

                  {/* Score Display */}
                  <Text style={styles.feedbackTitle}>
                    {
                      getFeedbackMessage(assessmentState.currentScore).split(
                        '!',
                      )[0]
                    }
                    !
                  </Text>

                  {/* Detailed Score Breakdown */}
                  <View style={styles.scoreBreakdown}>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>Overall Score</Text>
                      <Animated.View style={styles.scoreBarContainer}>
                        <Animated.View
                          style={[
                            styles.scoreBar,
                            {
                              width: scoreBarAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [
                                  '0%',
                                  `${
                                    assessmentState.currentScore.overall * 100
                                  }%`,
                                ],
                                extrapolate: 'clamp',
                              }),
                              backgroundColor: getFeedbackColor(
                                assessmentState.currentScore.feedback,
                              ),
                            },
                          ]}
                        />
                      </Animated.View>
                      <Text style={styles.scoreValue}>
                        {Math.round(assessmentState.currentScore.overall * 100)}
                        %
                      </Text>
                    </View>

                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>Accuracy</Text>
                      <View style={styles.scoreBarContainer}>
                        <View
                          style={[
                            styles.scoreBar,
                            {
                              width: `${
                                assessmentState.currentScore.accuracy * 100
                              }%`,
                              backgroundColor: '#3b82f6',
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.scoreValue}>
                        {Math.round(
                          assessmentState.currentScore.accuracy * 100,
                        )}
                        %
                      </Text>
                    </View>

                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>Fluency</Text>
                      <View style={styles.scoreBarContainer}>
                        <View
                          style={[
                            styles.scoreBar,
                            {
                              width: `${
                                assessmentState.currentScore.fluency * 100
                              }%`,
                              backgroundColor: '#10b981',
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.scoreValue}>
                        {Math.round(assessmentState.currentScore.fluency * 100)}
                        %
                      </Text>
                    </View>
                  </View>

                  {/* Recognition Details */}
                  <View style={styles.recognitionDetails}>
                    <Text style={styles.recognitionLabel}>You said:</Text>
                    <Text style={styles.recognitionText}>
                      "
                      {assessmentState.currentScore.details.recognizedText ||
                        'Unable to recognize'}
                      "
                    </Text>
                    <Text style={styles.targetLabel}>Target:</Text>
                    <Text style={styles.targetText}>
                      "{assessmentState.currentScore.details.targetText}"
                    </Text>
                  </View>

                  {/* Star Animation for Good Scores */}
                  {assessmentState.currentScore.overall >=
                    SCORE_THRESHOLDS.good && (
                    <View style={styles.starsContainer}>
                      {starAnimations.map((anim, index) => (
                        <Animated.Text
                          key={index}
                          style={[
                            styles.star,
                            {
                              transform: [{ translateY: anim }],
                            },
                          ]}
                        >
                          ⭐
                        </Animated.Text>
                      ))}
                    </View>
                  )}

                  {/* Close Button */}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() =>
                      setAssessmentState(prev => ({
                        ...prev,
                        showFeedback: false,
                      }))
                    }
                  >
                    <Text style={styles.closeButtonText}>Continue</Text>
                  </TouchableOpacity>
                </>
              )}
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  // Full-screen AR Background
  arBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  fallbackBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    opacity: 0.5,
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
    top: 80,
    left: 40,
    width: 128,
    height: 128,
    backgroundColor: '#3b82f6',
    transform: [{ scale: 2 }],
    opacity: 0.6,
  },
  purpleOrb: {
    bottom: 200,
    right: 40,
    width: 160,
    height: 160,
    backgroundColor: '#8b5cf6',
    transform: [{ scale: 2 }],
    opacity: 0.6,
  },
  greenOrb: {
    top: '40%',
    left: '30%',
    width: 200,
    height: 200,
    backgroundColor: '#10b981',
    transform: [{ scale: 2 }],
    opacity: 0.3,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
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
  // Floating Header
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  errorSafeArea: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  headerButtonInner: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  speechTestIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: spacing.sm,
  },
  speechTestText: {
    color: 'white',
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  // Recording Status Overlay
  recordingOverlay: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 15,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  recordingText: {
    color: 'white',
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
  },
  // Floating Bottom Card
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius['3xl'],
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    ...shadows.xl,
  },
  bottomCardContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  wordInfo: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  instructionText: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeights.medium,
  },
  wordText: {
    color: '#7C3AED',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  phoneticText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: typography.fontSizes.base,
    fontStyle: 'italic',
  },
  // Recording Button
  recordButtonContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    ...shadows.xl,
    borderWidth: 4,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  recordButtonActive: {
    borderColor: 'rgba(239, 68, 68, 0.8)',
  },
  recordButtonProcessing: {
    borderColor: 'rgba(245, 158, 11, 0.8)',
  },
  recordButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonLabel: {
    marginTop: spacing.sm,
    color: colors.mutedForeground,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  // Navigation Buttons
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    ...shadows.md,
  },
  navButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    height: 56,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  nextButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nextButtonText: {
    color: 'white',
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
  },
  // Progress
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: typography.fontSizes.sm,
    color: colors.mutedForeground,
    marginBottom: spacing.sm,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  progressMoreText: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizes.xs,
    marginLeft: spacing.xs,
  },
  // Error State
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: 'white',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: typography.fontSizes.base,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  errorButtonText: {
    color: 'white',
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
  },
  // Feedback Modal
  feedbackOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: spacing.lg,
  },
  feedbackContainer: {
    borderRadius: borderRadius['3xl'],
    overflow: 'hidden',
    maxWidth: SCREEN_WIDTH - 40,
    width: '100%',
    ...shadows.xl,
  },
  feedbackGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  feedbackEmoji: {
    fontSize: 60,
    marginBottom: spacing.lg,
  },
  feedbackTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: 'white',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  // Score Breakdown
  scoreBreakdown: {
    width: '100%',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  scoreLabel: {
    fontSize: typography.fontSizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    width: '25%',
  },
  scoreBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    fontSize: typography.fontSizes.sm,
    color: 'white',
    fontWeight: typography.fontWeights.bold,
    width: '15%',
    textAlign: 'right',
  },
  // Recognition Details
  recognitionDetails: {
    width: '100%',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.lg,
  },
  recognitionLabel: {
    fontSize: typography.fontSizes.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: spacing.xs,
  },
  recognitionText: {
    fontSize: typography.fontSizes.sm,
    color: 'white',
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.sm,
  },
  targetLabel: {
    fontSize: typography.fontSizes.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: spacing.xs,
  },
  targetText: {
    fontSize: typography.fontSizes.sm,
    color: 'white',
    fontWeight: typography.fontWeights.semibold,
  },
  // Stars
  starsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  star: {
    fontSize: 24,
  },
  // Close Button
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: spacing.md,
  },
  closeButtonText: {
    color: 'white',
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
  },
});
