import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationProps } from '../types/navigation';
import {
  colors,
  typography,
  spacing,
  responsive,
  borderRadius,
  shadows,
} from '../styles/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WordData {
  word: string;
  emoji: string;
  target: string;
}

const assessmentWords: WordData[] = [
  { word: "Cat", emoji: "🐱", target: "cat" },
  { word: "Dog", emoji: "🐶", target: "dog" },
  { word: "Bird", emoji: "🐦", target: "bird" },
  { word: "Fish", emoji: "🐠", target: "fish" },
  { word: "Horse", emoji: "🐴", target: "horse" },
];

type FeedbackType = "great" | "tryagain" | null;

export default function SpeechAssessmentScreen({ navigation }: NavigationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  
  // Animation values
  const scaleAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);
  const pulseAnim = new Animated.Value(1);
  const feedbackScaleAnim = new Animated.Value(0);
  const starAnimations = [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ];

  const currentWord = assessmentWords[currentIndex];

  useEffect(() => {
    // Word change animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex]);

  useEffect(() => {
    if (isRecording) {
      // Pulse animation while recording
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Rotate emoji while recording
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();

      return () => {
        pulseAnimation.stop();
        rotateAnimation.stop();
      };
    } else {
      rotateAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const handleRecord = () => {
    setIsRecording(true);
    
    // Simulate recording for 2 seconds
    setTimeout(() => {
      setIsRecording(false);
      
      // Simulate speech recognition result (random for demo)
      const isCorrect = Math.random() > 0.3;
      setFeedback(isCorrect ? "great" : "tryagain");
      setShowFeedback(true);
      
      // Feedback animation
      Animated.timing(feedbackScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      if (isCorrect) {
        // Star animation for success
        const starAnimationSequence = Animated.stagger(100, [
          Animated.sequence([
            Animated.timing(starAnimations[0], { toValue: -20, duration: 300, useNativeDriver: true }),
            Animated.timing(starAnimations[0], { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(starAnimations[1], { toValue: -20, duration: 300, useNativeDriver: true }),
            Animated.timing(starAnimations[1], { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(starAnimations[2], { toValue: -20, duration: 300, useNativeDriver: true }),
            Animated.timing(starAnimations[2], { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
        ]);
        starAnimationSequence.start();
      }
      
      // Hide feedback after 2 seconds
      setTimeout(() => {
        setShowFeedback(false);
        setFeedback(null);
        feedbackScaleAnim.setValue(0);
        starAnimations.forEach(anim => anim.setValue(0));
      }, 2000);
    }, 2000);
  };

  const handleNext = () => {
    if (currentIndex < assessmentWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
    setShowFeedback(false);
    setFeedback(null);
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
            onPress={() => navigation.navigate('Home')}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.speechTestIndicator}>
            <Icon name="mic" size={20} color="white" />
            <Text style={styles.speechTestText}>Speech Test</Text>
          </View>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Object Display */}
          <Animated.View
            style={[
              styles.objectWrapper,
              {
                transform: [
                  { scale: scaleAnim },
                  { rotate: rotateInterpolate },
                ],
              },
            ]}
          >
            <View style={styles.arObjectContainer}>
              {/* AR Markers */}
              <View style={[styles.arMarker, styles.topLeft]} />
              <View style={[styles.arMarker, styles.topRight]} />
              <View style={[styles.arMarker, styles.bottomLeft]} />
              <View style={[styles.arMarker, styles.bottomRight]} />
              
              <Text style={styles.objectEmoji}>{currentWord.emoji}</Text>
            </View>
          </Animated.View>

          {/* Word Display */}
          <View style={styles.wordDisplay}>
            <Text style={styles.instructionText}>Say this word:</Text>
            <Text style={styles.wordText}>{currentWord.word}</Text>
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
                isRecording && styles.recordButtonActive,
              ]}
              onPress={handleRecord}
              disabled={isRecording}
            >
              <LinearGradient
                colors={
                  isRecording
                    ? ['#ef4444', '#dc2626']
                    : ['#10b981', '#059669']
                }
                style={styles.recordButtonGradient}
              >
                <Icon name="mic" size={48} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {isRecording && (
            <Text style={styles.listeningText}>Listening...</Text>
          )}
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
            style={styles.controlsGradient}
          >
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <LinearGradient
                colors={['#3b82f6', '#6366f1']}
                style={styles.nextButtonGradient}
              >
                <Icon name="play-forward" size={24} color="white" />
                <Text style={styles.nextButtonText}>Next Word</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              {assessmentWords.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentIndex && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>
          </LinearGradient>
        </View>
      </LinearGradient>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedback}
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
                feedback === "great"
                  ? ['#10b981', '#059669']
                  : ['#f59e0b', '#d97706']
              }
              style={styles.feedbackGradient}
            >
              <Text style={styles.feedbackEmoji}>
                {feedback === "great" ? "🌟" : "🔄"}
              </Text>
              <Text style={styles.feedbackTitle}>
                {feedback === "great" ? "Great Job!" : "Try Again!"}
              </Text>
              <Text style={styles.feedbackMessage}>
                {feedback === "great"
                  ? "You said it perfectly!"
                  : "You can do it! Try once more."}
              </Text>
              
              {feedback === "great" && (
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
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 5,
  },
  objectWrapper: {
    marginBottom: spacing.xl,
  },
  arObjectContainer: {
    width: 192,
    height: 192,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius['3xl'],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    ...shadows.xl,
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
  objectEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  wordDisplay: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
  },
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
  recordButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningText: {
    color: 'white',
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
  },
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
  nextButton: {
    height: 64,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
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
  feedbackOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  feedbackContainer: {
    borderRadius: borderRadius['3xl'],
    overflow: 'hidden',
    ...shadows.xl,
  },
  feedbackGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    minWidth: 280,
  },
  feedbackEmoji: {
    fontSize: 60,
    marginBottom: spacing.lg,
  },
  feedbackTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: 'white',
    marginBottom: spacing.sm,
  },
  feedbackMessage: {
    fontSize: typography.fontSizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  star: {
    fontSize: 24,
  },
});
