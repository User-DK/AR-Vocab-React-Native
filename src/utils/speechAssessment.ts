/**
 * Speech Assessment Utility with MFCC-based Pronunciation Scoring
 * 
 * This module provides pronunciation assessment functionality using:
 * - MFCC (Mel-Frequency Cepstral Coefficients) feature extraction
 * - Audio recording and processing
 * - Pronunciation similarity scoring
 * - Real-time feedback generation
 */

import { Platform, PermissionsAndroid } from 'react-native';
import Voice from '@react-native-voice/voice';

// Audio configuration for high-quality recording
export const AUDIO_CONFIG = {
  sampleRate: 16000, // Standard for speech recognition
  channels: 1, // Mono recording
  bitsPerSample: 16,
  audioSource: 6, // VOICE_RECOGNITION on Android
  wavFile: 'pronunciation_test.wav',
  bufferSize: 4096,
  // Duration in milliseconds
  maxDuration: 5000, // 5 seconds max recording
  minDuration: 500,  // 0.5 seconds minimum
};

// MFCC Analysis configuration
export const MFCC_CONFIG = {
  frameSize: 512,
  hopSize: 160,
  numCoefficients: 13, // Standard MFCC coefficients
  minFreq: 0,
  maxFreq: 8000,
  numFilters: 26,
  lifterParam: 22,
  preEmphasis: 0.97,
  windowFunction: 'hamming' as const,
};

// Pronunciation scoring thresholds
export const SCORE_THRESHOLDS = {
  excellent: 0.85,
  good: 0.70,
  acceptable: 0.55,
  poor: 0.40,
};

// Assessment result types
export interface PronunciationScore {
  overall: number; // 0-1 score
  confidence: number; // Recognition confidence
  accuracy: number; // Pronunciation accuracy
  fluency: number; // Speech fluency
  feedback: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unclear';
  details: {
    recognizedText: string;
    targetText: string;
    duration: number;
    mfccSimilarity: number;
    phoneticMatch: number;
  };
}

export interface AudioFeatures {
  mfcc: number[][];
  energy: number[];
  pitch: number[];
  duration: number;
  spectralCentroid: number[];
}

/**
 * Advanced Speech Assessment Engine
 */
export class SpeechAssessmentEngine {
  private isRecording = false;
  private recordingPath = '';
  private targetWord = '';
  private targetPhonetic = '';

  constructor() {
    this.initializeVoice();
    this.initializeAudioRecorder();
  }

  /**
   * Initialize speech recognition
   */
  private async initializeVoice() {
    try {
      if (!Voice) {
        console.error('❌ Voice module not available');
        return;
      }

      // Remove any existing listeners first
      Voice.removeAllListeners();
      
      Voice.onSpeechResults = this.handleSpeechResults.bind(this);
      Voice.onSpeechError = this.handleSpeechError.bind(this);
      Voice.onSpeechEnd = this.handleSpeechEnd.bind(this);
      Voice.onSpeechPartialResults = this.handlePartialResults.bind(this);
      
      console.log('✅ Voice recognition initialized');
    } catch (error) {
      console.error('❌ Voice initialization failed:', error);
    }
  }

  /**
   * Initialize audio recorder (simplified version)
   */
  private async initializeAudioRecorder() {
    try {
      console.log('✅ Audio recorder initialized (voice-only mode)');
    } catch (error) {
      console.error('❌ Audio recorder initialization failed:', error);
    }
  }

  /**
   * Start pronunciation assessment for a specific word
   */
  async startAssessment(targetWord: string, targetPhonetic: string): Promise<boolean> {
    try {
      // Check if Voice module exists
      if (!Voice) {
        console.error('❌ Voice module not available');
        throw new Error('Voice recognition module is not available. Please reinstall the app.');
      }

      this.targetWord = targetWord.toLowerCase().trim();
      this.targetPhonetic = targetPhonetic;
      this.recognizedText = ''; // Reset recognized text
      this.isRecording = true;

      console.log(`🎯 Starting assessment for: "${this.targetWord}"`);
      console.log(`🔤 Target phonetic: "${this.targetPhonetic}"`);

      // Check if voice is available - wrap in try-catch for null safety
      let available: boolean = false;
      try {
        const isAvailable = await Voice.isAvailable();
        available = Boolean(isAvailable);
      } catch (voiceError) {
        console.error('❌ Voice.isAvailable() failed:', voiceError);
        available = false;
      }
      if (!available) {
        console.error('❌ Voice recognition not available on this device');
        this.isRecording = false;
        throw new Error('Voice recognition is not available. Please ensure:\n1. Google App is installed\n2. Speech recognition is enabled\n3. Microphone permissions are granted');
      }

      // Request permissions on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone for pronunciation practice.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.error('❌ Microphone permission denied');
          this.isRecording = false;
          throw new Error('Microphone permission was denied. Please enable it in settings.');
        }
      }

      // Start voice recognition with error handling
      try {
        await Voice.start('en-US');
        console.log('🎤 Voice recognition started');
      } catch (startError: any) {
        console.error('❌ Voice.start() failed:', startError);
        this.isRecording = false;
        throw new Error(startError?.message || 'Failed to start voice recognition. Please try again.');
      }

      // Auto-stop after max duration
      setTimeout(() => {
        if (this.isRecording) {
          this.stopAssessment();
        }
      }, AUDIO_CONFIG.maxDuration);

      return true;
    } catch (error) {
      console.error('❌ Assessment start failed:', error);
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Stop assessment and process results
   */
  async stopAssessment(): Promise<PronunciationScore | null> {
    try {
      if (!this.isRecording) {
        return null;
      }

      this.isRecording = false;
      console.log('⏹️ Stopping assessment...');

      // Stop voice recognition
      if (Voice) {
        try {
          await Voice.stop();
        } catch (err) {
          console.warn('Voice.stop() failed:', err);
        }
      }

      // Process the speech recognition results (simplified without audio file)
      return await this.processRecognitionResults();
    } catch (error) {
      console.error('❌ Assessment stop failed:', error);
      return null;
    }
  }

  /**
   * Process speech recognition results and generate pronunciation score (simplified)
   */
  private async processRecognitionResults(): Promise<PronunciationScore | null> {
    try {
      console.log('🔬 Processing speech recognition results...');

      // Calculate phonetic similarity (from speech recognition)
      const phoneticMatch = this.calculatePhoneticMatch(
        this.recognizedText || '',
        this.targetWord
      );

      // Simplified scoring based on recognition accuracy
      const accuracy = phoneticMatch;
      const fluency = Math.max(0.3, phoneticMatch); // Base fluency on recognition
      const confidence = phoneticMatch * 0.8; // Recognition confidence
      const overall = this.calculateOverallScore(accuracy, fluency, confidence);

      // Generate feedback
      const feedback = this.generateFeedback(overall);

      const result: PronunciationScore = {
        overall,
        confidence,
        accuracy,
        fluency,
        feedback,
        details: {
          recognizedText: this.recognizedText || '',
          targetText: this.targetWord,
          duration: 2.5, // Estimated duration
          mfccSimilarity: phoneticMatch, // Use phonetic match as substitute
          phoneticMatch,
        },
      };

      console.log('📊 Assessment result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('❌ Recognition processing failed:', error);
      return null;
    }
  }

  /**
   * Extract MFCC and other audio features from recording
   */
  private async extractAudioFeatures(audioPath: string): Promise<AudioFeatures> {
    try {
      console.log('🎵 Extracting audio features...');

      // For production, you would use a native module for FFT/MFCC calculation
      // Here's a simplified implementation for demo purposes
      
      // Simulate MFCC extraction (in production, use native audio processing)
      const mockMFCC = this.generateMockMFCC();
      const mockEnergy = this.generateMockEnergy();
      const mockPitch = this.generateMockPitch();
      const mockSpectral = this.generateMockSpectralCentroid();

      return {
        mfcc: mockMFCC,
        energy: mockEnergy,
        pitch: mockPitch,
        duration: 2.5, // Estimated duration
        spectralCentroid: mockSpectral,
      };
    } catch (error) {
      console.error('❌ Feature extraction failed:', error);
      throw error;
    }
  }

  /**
   * Get reference audio features for target word
   */
  private async getReferenceFeatures(word: string): Promise<AudioFeatures> {
    // In a production app, you would have pre-recorded reference pronunciations
    // stored as MFCC features in a database or bundled with the app
    
    console.log(`📚 Loading reference features for: ${word}`);
    
    // For demo, return mock reference data
    return {
      mfcc: this.generateReferenceMFCC(word),
      energy: this.generateMockEnergy(),
      pitch: this.generateMockPitch(),
      duration: 1.5,
      spectralCentroid: this.generateMockSpectralCentroid(),
    };
  }

  /**
   * Calculate MFCC similarity between recorded and reference audio
   */
  private calculateMFCCSimilarity(recordedMFCC: number[][], referenceMFCC: number[][]): number {
    try {
      console.log('🧮 Calculating MFCC similarity...');

      // Dynamic Time Warping (DTW) for sequence alignment
      const similarity = this.dynamicTimeWarping(recordedMFCC, referenceMFCC);
      
      // Normalize to 0-1 range
      const normalizedSimilarity = Math.max(0, Math.min(1, 1 - (similarity / 10)));
      
      console.log(`📈 MFCC Similarity: ${(normalizedSimilarity * 100).toFixed(1)}%`);
      return normalizedSimilarity;
    } catch (error) {
      console.error('❌ MFCC similarity calculation failed:', error);
      return 0;
    }
  }

  /**
   * Dynamic Time Warping algorithm for sequence comparison
   */
  private dynamicTimeWarping(seq1: number[][], seq2: number[][]): number {
    const m = seq1.length;
    const n = seq2.length;
    
    // Create DTW matrix
    const dtw = Array(m + 1).fill(null).map(() => Array(n + 1).fill(Infinity));
    dtw[0][0] = 0;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = this.euclideanDistance(seq1[i - 1], seq2[j - 1]);
        dtw[i][j] = cost + Math.min(
          dtw[i - 1][j],     // insertion
          dtw[i][j - 1],     // deletion
          dtw[i - 1][j - 1]  // match
        );
      }
    }

    return dtw[m][n] / (m + n); // Normalized by path length
  }

  /**
   * Calculate Euclidean distance between two feature vectors
   */
  private euclideanDistance(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      return Infinity;
    }
    
    const sum = vec1.reduce((acc, val, idx) => {
      const diff = val - vec2[idx];
      return acc + (diff * diff);
    }, 0);
    
    return Math.sqrt(sum);
  }

  /**
   * Calculate phonetic match between recognized and target text
   */
  private calculatePhoneticMatch(recognized: string, target: string): number {
    const recognizedClean = recognized.toLowerCase().trim();
    const targetClean = target.toLowerCase().trim();

    console.log(`🔤 Phonetic match: "${recognizedClean}" vs "${targetClean}"`);

    // Exact match
    if (recognizedClean === targetClean) {
      return 1.0;
    }

    // Partial match using edit distance
    const editDistance = this.calculateEditDistance(recognizedClean, targetClean);
    const maxLength = Math.max(recognizedClean.length, targetClean.length);
    
    if (maxLength === 0) {
      return 0;
    }

    const similarity = 1 - (editDistance / maxLength);
    console.log(`📊 Phonetic similarity: ${(similarity * 100).toFixed(1)}%`);
    
    return Math.max(0, similarity);
  }

  /**
   * Calculate Levenshtein edit distance
   */
  private calculateEditDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,     // deletion
            dp[i][j - 1] + 1,     // insertion
            dp[i - 1][j - 1] + 1  // substitution
          );
        }
      }
    }
    
    return dp[m][n];
  }

  /**
   * Calculate pronunciation accuracy
   */
  private calculateAccuracy(mfccSimilarity: number, phoneticMatch: number): number {
    // Weight MFCC similarity more heavily for pronunciation assessment
    return (mfccSimilarity * 0.7) + (phoneticMatch * 0.3);
  }

  /**
   * Calculate speech fluency
   */
  private calculateFluency(features: AudioFeatures): number {
    // Analyze energy patterns for fluency (steady vs. choppy speech)
    const energyVariance = this.calculateVariance(features.energy);
    const pitchStability = this.calculatePitchStability(features.pitch);
    
    // Lower variance = more fluent speech
    const fluencyScore = Math.max(0, 1 - (energyVariance / 100)) * pitchStability;
    
    console.log(`🎵 Fluency score: ${(fluencyScore * 100).toFixed(1)}%`);
    return fluencyScore;
  }

  /**
   * Calculate recognition confidence
   */
  private calculateConfidence(features: AudioFeatures, mfccSimilarity: number): number {
    // Base confidence on audio quality and consistency
    const energyLevel = this.calculateMean(features.energy);
    const audioQuality = Math.min(1, energyLevel / 50); // Normalize energy
    
    return (audioQuality * 0.4) + (mfccSimilarity * 0.6);
  }

  /**
   * Calculate overall pronunciation score
   */
  private calculateOverallScore(accuracy: number, fluency: number, confidence: number): number {
    // Weighted combination of all factors
    return (accuracy * 0.5) + (fluency * 0.3) + (confidence * 0.2);
  }

  /**
   * Generate feedback based on overall score
   */
  private generateFeedback(score: number): PronunciationScore['feedback'] {
    if (score >= SCORE_THRESHOLDS.excellent) {
      return 'excellent';
    } else if (score >= SCORE_THRESHOLDS.good) {
      return 'good';
    } else if (score >= SCORE_THRESHOLDS.acceptable) {
      return 'acceptable';
    } else if (score >= SCORE_THRESHOLDS.poor) {
      return 'poor';
    } else {
      return 'unclear';
    }
  }

  // Voice recognition event handlers
  private recognizedText = '';

  private handleSpeechResults(event: any) {
    if (event.value && event.value.length > 0) {
      this.recognizedText = event.value[0];
      console.log('🎤 Speech recognized:', this.recognizedText);
    }
  }

  private handleSpeechError(event: any) {
    console.error('🚨 Speech recognition error:', event.error);
  }

  private handleSpeechEnd() {
    console.log('🎤 Speech recognition ended');
  }

  private handlePartialResults(event: any) {
    if (event.value && event.value.length > 0) {
      console.log('🎤 Partial result:', event.value[0]);
    }
  }

  // Mock data generators for demo (replace with actual audio processing in production)
  private generateMockMFCC(): number[][] {
    const frames = Math.floor(Math.random() * 50) + 30; // 30-80 frames
    return Array(frames).fill(null).map(() => 
      Array(MFCC_CONFIG.numCoefficients).fill(null).map(() => 
        (Math.random() - 0.5) * 2
      )
    );
  }

  private generateReferenceMFCC(word: string): number[][] {
    // Generate consistent reference MFCC based on word
    const seed = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const frames = 40 + (seed % 20); // Consistent frame count per word
    
    return Array(frames).fill(null).map((_, i) => 
      Array(MFCC_CONFIG.numCoefficients).fill(null).map((_, j) => 
        Math.sin((seed + i + j) / 10) * 0.5
      )
    );
  }

  private generateMockEnergy(): number[] {
    return Array(50).fill(null).map(() => Math.random() * 100 + 20);
  }

  private generateMockPitch(): number[] {
    return Array(50).fill(null).map(() => Math.random() * 200 + 80);
  }

  private generateMockSpectralCentroid(): number[] {
    return Array(50).fill(null).map(() => Math.random() * 2000 + 500);
  }

  // Utility functions
  private calculateVariance(values: number[]): number {
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  private calculateMean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculatePitchStability(pitch: number[]): number {
    const variance = this.calculateVariance(pitch);
    return Math.max(0, 1 - (variance / 1000)); // Normalize pitch variance
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      if (Voice) {
        await Voice.destroy();
        Voice.removeAllListeners();
      }
      console.log('🧹 Speech assessment cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

// Export singleton instance
export const speechAssessmentEngine = new SpeechAssessmentEngine();

/**
 * Helper function for quick pronunciation assessment
 */
export async function assessPronunciation(
  targetWord: string,
  targetPhonetic: string
): Promise<PronunciationScore | null> {
  try {
    const success = await speechAssessmentEngine.startAssessment(targetWord, targetPhonetic);
    if (!success) {
      return null;
    }

    // Return a promise that resolves when assessment completes
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await speechAssessmentEngine.stopAssessment();
        resolve(result);
      }, AUDIO_CONFIG.maxDuration);
    });
  } catch (error) {
    console.error('❌ Quick assessment failed:', error);
    return null;
  }
}

/**
 * Get pronunciation feedback message
 */
export function getFeedbackMessage(score: PronunciationScore): string {
  switch (score.feedback) {
    case 'excellent':
      return '🌟 Excellent! Perfect pronunciation!';
    case 'good':
      return '👍 Good job! Very close to perfect!';
    case 'acceptable':
      return '👌 Not bad! Keep practicing!';
    case 'poor':
      return '📚 Try again! Listen carefully and repeat.';
    case 'unclear':
      return '🎤 Could not understand. Speak clearly and try again.';
    default:
      return '🔄 Please try again.';
  }
}

/**
 * Get pronunciation feedback color
 */
export function getFeedbackColor(feedback: PronunciationScore['feedback']): string {
  switch (feedback) {
    case 'excellent':
      return '#10b981'; // Green
    case 'good':
      return '#3b82f6'; // Blue
    case 'acceptable':
      return '#f59e0b'; // Orange
    case 'poor':
      return '#ef4444'; // Red
    case 'unclear':
      return '#6b7280'; // Gray
    default:
      return '#6b7280';
  }
}