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
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const feedbackScaleAnim = useRef(new Animated.Value(0)).current;
  const scoreBarAnim = useRef(new Animated.Value(0)).current;
  const starAnimations = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  // Load vocabulary data on component mount
  useEffect(() => {
    loadVocabularyData();
    return () => {
      // Cleanup speech assessment engine
      speechAssessmentEngine.cleanup();
    };
  }, []);

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
            toValue: 1.2,
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

      // Rotate AR model while recording for engagement
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      );
      rotateAnimation.start();

      return () => {
        pulseAnimation.stop();
        rotateAnimation.stop();
      };
    } else {
      // Reset animations when not recording
      rotateAnim.setValue(0);
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
      const success = await speechAssessmentEngine.startAssessment(
        currentItem.word,
        currentItem.phonetic,
      );

      if (!success) {
        throw new Error('Failed to start speech assessment');
      }

      // Auto-stop after recording duration
      setTimeout(async () => {
        if (assessmentState.isRecording) {
          await stopPronunciationAssessment();
        }
      }, 3000); // 3 seconds recording
    } catch (error) {
      console.error('❌ Assessment start failed:', error);
      Alert.alert(
        'Recording Error',
        'Could not start pronunciation assessment. Please check microphone permissions and try again.',
      );

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

  // Rotation interpolation for AR model
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Show error state if no vocabulary data
  if (!currentItem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <Icon name="arrow-back" size={24} color="white" />
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
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Background with Gradient */}
      <LinearGradient
        colors={['#312e81', '#581c87', '#be185d']}
        style={styles.background}
      >
        {/* Background Effects */}
        <View style={styles.backgroundEffects}>
          <View style={[styles.backgroundCircle, styles.circle1]} />
          <View style={[styles.backgroundCircle, styles.circle2]} />
          <View style={[styles.backgroundCircle, styles.circle3]} />
        </View>

        {/* Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.speechTestIndicator}>
            <Icon name="mic" size={20} color="white" />
            <Text style={styles.speechTestText}>Pronunciation Practice</Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* AR Model Viewer Container */}
        <View style={styles.arContainer}>
          <Animated.View
            style={[
              styles.arViewerWrapper,
              {
                transform: [
                  { scale: scaleAnim },
                  { rotate: rotateInterpolate },
                ],
              },
            ]}
          >
            <ARModelViewer
              key={currentItem.id} // Force remount when item changes
              item={{
                ...currentItem,
                scale: currentItem.scale as [number, number, number],
                position: currentItem.position as [number, number, number],
                rotation: currentItem.rotation as [number, number, number],
                difficulty: currentItem.difficulty as
                  | 'easy'
                  | 'medium'
                  | 'hard',
              }}
              onModelLoaded={() =>
                console.log('AR Model loaded for practice:', currentItem.word)
              }
              onModelTapped={() =>
                console.log('AR Model tapped:', currentItem.word)
              }
            />

            {/* AR Practice Indicators */}
            <View style={styles.arIndicators}>
              <View style={[styles.arMarker, styles.topLeft]} />
              <View style={[styles.arMarker, styles.topRight]} />
              <View style={[styles.arMarker, styles.bottomLeft]} />
              <View style={[styles.arMarker, styles.bottomRight]} />
            </View>
          </Animated.View>
        </View>

        {/* Word Display */}
        <View style={styles.wordDisplay}>
          <Text style={styles.instructionText}>Practice saying:</Text>
          <Text style={styles.wordText}>{currentItem.word}</Text>
          <Text style={styles.phoneticText}>{currentItem.phonetic}</Text>
        </View>

        {/* Recording Button */}
        <Animated.View
          style={[
            styles.recordButtonContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
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
                  size={48}
                  color="white"
                />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Status Text */}
        {assessmentState.isRecording && (
          <Text style={styles.statusText}>🎤 Listening...</Text>
        )}
        {assessmentState.isProcessing && (
          <Text style={styles.statusText}>🧠 Analyzing pronunciation...</Text>
        )}

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
            style={styles.controlsGradient}
          >
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
                {items.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index === currentIndex && styles.progressDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          </LinearGradient>
        </View>
      </LinearGradient>

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
  backgroundEffects: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.3,
  },
  circle1: {
    width: 128,
    height: 128,
    backgroundColor: '#fbbf24',
    top: 80,
    left: 40,
  },
  circle2: {
    width: 160,
    height: 160,
    backgroundColor: '#06b6d4',
    bottom: 160,
    right: 40,
  },
  circle3: {
    width: 192,
    height: 192,
    backgroundColor: '#ec4899',
    top: '33%',
    left: '33%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    zIndex: 10,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  speechTestIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: spacing.sm,
  },
  speechTestText: {
    color: 'white',
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  // AR Container Styles
  arContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    position: 'relative',
  },
  arViewerWrapper: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  arIndicators: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  arMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#fbbf24',
    borderWidth: 4,
  },
  topLeft: {
    top: 8,
    left: 8,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 8,
    right: 8,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 8,
    left: 8,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 8,
    right: 8,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  // Word Display Styles
  wordDisplay: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  instructionText: {
    fontSize: typography.fontSizes.lg,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.sm,
  },
  wordText: {
    fontSize: typography.fontSizes['4xl'],
    fontWeight: typography.fontWeights.bold,
    color: 'white',
    marginBottom: spacing.xs,
  },
  phoneticText: {
    fontSize: typography.fontSizes.lg,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  // Recording Button Styles
  recordButtonContainer: {
    marginBottom: spacing.lg,
  },
  recordButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    ...shadows.xl,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
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
  statusText: {
    color: 'white',
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    textAlign: 'center',
  },
  // Bottom Controls Styles
  bottomControls: {
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    overflow: 'hidden',
    ...shadows.xl,
  },
  controlsGradient: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
    height: 64,
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
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
  },
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
    gap: spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  progressDotActive: {
    width: 32,
    backgroundColor: colors.primary,
  },
  // Error State Styles
  errorContainer: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: '#1f2937',
  },
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
  // Feedback Modal Styles
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
  // Score Breakdown Styles
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
  // Recognition Details Styles
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
  // Star Animation Styles
  starsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  star: {
    fontSize: 24,
  },
  // Close Button Styles
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
