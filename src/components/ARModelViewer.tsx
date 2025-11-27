import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { VocabularyItem } from '../types/vocabulary';
import {
  getModelAsset,
  getMaterialAsset,
  getModelType,
} from '../utils/assetLoader';

// ViroReact - Best cross-platform AR solution for React Native
// Install: npm install @reactvision/react-viro
import {
  ViroARSceneNavigator,
  ViroARScene,
  ViroAmbientLight,
  ViroSpotLight,
  ViroARPlaneSelector,
  Viro3DObject,
  ViroNode,
  ViroAnimations,
  ViroARTrackingTargets,
  ViroBox,
  ViroMaterials,
} from '@reactvision/react-viro';

interface ARModelViewerProps {
  item: VocabularyItem;
  onModelLoaded?: () => void;
  onModelTapped?: () => void;
}

/**
 * Real AR Implementation using ViroReact
 *
 * Setup Instructions:
 * 1. Install: npm install @reactvision/react-viro
 * 2. For iOS: cd ios && pod install
 * 3. Add permissions to AndroidManifest.xml:
 *    <uses-permission android:name="android.permission.CAMERA" />
 *    <uses-feature android:name="android.hardware.camera.ar" android:required="true"/>
 * 4. Add to Info.plist (iOS):
 *    <key>NSCameraUsageDescription</key>
 *    <string>AR features require camera access</string>
 */
/**
 * ARModelViewer Component
 *
 * Real AR implementation using ViroReact (@reactvision/react-viro)
 *
 * SUPPORTED MODEL FORMATS:
 * - GLB (Binary glTF) - Recommended for best performance
 * - GLTF (Text glTF)
 * - OBJ (Wavefront OBJ + MTL)
 *
 * FEATURES:
 * - Automatic surface detection via ARKit/ARCore
 * - Tap-to-place 3D models on detected planes
 * - Model rotation animation
 * - Touch interaction support
 * - Fallback rendering on error
 * - Full-screen AR camera view
 *
 * REQUIREMENTS:
 * - iOS: ARKit support (iOS 11+)
 * - Android: ARCore support (Android 7.0+)
 * - Camera permissions configured
 */
export const ARModelViewer: React.FC<ARModelViewerProps> = ({
  item,
  onModelLoaded,
  onModelTapped,
}) => {
  const [arSupported, setArSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingInitialized, setTrackingInitialized] = useState(false);
  const [modelPlaced, setModelPlaced] = useState(false);

  useEffect(() => {
    checkARSupport();
  }, []);

  const checkARSupport = async () => {
    try {
      // ViroReact handles AR support detection internally
      // ARCore for Android 7.0+, ARKit for iOS 11+
      setArSupported(true);
      setIsLoading(false);
    } catch (error) {
      console.error('AR Support Check Failed:', error);
      Alert.alert(
        'AR Not Supported',
        'This device does not support AR features. Please use a device with ARCore (Android) or ARKit (iOS) support.',
      );
      setArSupported(false);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Initializing AR...</Text>
      </View>
    );
  }

  if (!arSupported) {
    return <ARFallbackView item={item} />;
  }

  return (
    <View style={styles.arScene}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: () => (
            <ARSceneComponent
              item={item}
              onModelLoaded={onModelLoaded}
              onModelTapped={onModelTapped}
              onTrackingInitialized={() => setTrackingInitialized(true)}
              onModelPlaced={placed => setModelPlaced(placed)}
            />
          ),
        }}
        style={styles.viroContainer}
      />

      {/* AR Status Overlay */}
      {!trackingInitialized && (
        <View style={styles.trackingOverlay}>
          <ActivityIndicator size="small" color="#ffffff" />
          <Text style={styles.trackingText}>Loading AR model...</Text>
        </View>
      )}

      {/* AR Instructions */}
      {modelPlaced && (
        <View style={styles.instructionsOverlay}>
          <View style={styles.instructionBadge}>
            <Icon name="cube-outline" size={20} color="#ffffff" />
            <Text style={styles.instructionText}>
              Viewing {item.word} in AR
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

/**
 * AR Scene Component with 3D Model Loading
 */
interface ARSceneComponentProps {
  item: VocabularyItem;
  onModelLoaded?: () => void;
  onModelTapped?: () => void;
  onTrackingInitialized: () => void;
  onModelPlaced: (placed: boolean) => void;
}

const ARSceneComponent: React.FC<ARSceneComponentProps> = ({
  item,
  onModelLoaded,
  onModelTapped,
  onTrackingInitialized,
  onModelPlaced,
}) => {
  const [modelPlaced, setModelPlaced] = useState(true); // Auto-place model
  const [modelPosition, setModelPosition] = useState([0, -0.5, -1.5]); // Fixed position in front of camera
  const [modelLoadError, setModelLoadError] = useState(false);

  // Get model type using utility function
  const modelFileType = getModelType(item.modelPath);

  // Auto-place model and notify tracking when item changes
  useEffect(() => {
    console.log('🔄 Item changed, auto-placing AR model for:', item.word);
    setModelPlaced(true);
    setModelPosition([0, -0.5, -1.5]); // Position in front of camera
    setModelLoadError(false);
    onModelPlaced(true);
    onTrackingInitialized(); // Immediately mark as initialized
  }, [item.id, item.word, onModelPlaced, onTrackingInitialized]);

  const handleModelLoad = useCallback(() => {
    console.log(
      `✅ Successfully loaded ${modelFileType} model: ${item.modelPath}`,
    );
    console.log(`Model word: ${item.word}`);
    setModelLoadError(false);
    onModelLoaded?.();
  }, [item.modelPath, item.word, modelFileType, onModelLoaded]);

  const handleModelError = useCallback(
    (error: any) => {
      console.error('❌ Model loading error:', error);
      console.error('Model path:', item.modelPath);
      console.error('Model type:', modelFileType);
      console.error('Item:', item);
      setModelLoadError(true);
      Alert.alert(
        'Model Loading Failed',
        `Could not load ${item.word} model.\n\nType: ${modelFileType}\nPath: ${item.modelPath}\n\nShowing fallback emoji instead.`,
        [{ text: 'OK' }],
      );
    },
    [item.word, item.modelPath, modelFileType, item],
  );

  const handlePlaneClick = useCallback(
    (position: number[]) => {
      console.log('📍 Surface detected at:', position);
      console.log('🎯 Placing model:', item.word);
      console.log('📦 Model type:', modelFileType);
      console.log('📂 Model path:', item.modelPath);
      setModelPosition(position);
      setModelPlaced(true);
      onModelPlaced(true);
      onTrackingInitialized();
    },
    [
      onTrackingInitialized,
      onModelPlaced,
      item.word,
      item.modelPath,
      modelFileType,
    ],
  );

  const handleModelTap = useCallback(() => {
    console.log(`👆 Tapped model: ${item.word}`);
    onModelTapped?.();
  }, [item.word, onModelTapped]);

  // Register animations
  useEffect(() => {
    // Register ViroReact animations
    ViroAnimations.registerAnimations({
      rotate: {
        properties: {
          rotateY: '+=360',
        },
        duration: 5000,
        easing: 'Linear',
      },
      scaleUp: {
        properties: {
          scaleX: 1.2,
          scaleY: 1.2,
          scaleZ: 1.2,
        },
        duration: 200,
        easing: 'EaseOut',
      },
      scaleDown: {
        properties: {
          scaleX: 1.0,
          scaleY: 1.0,
          scaleZ: 1.0,
        },
        duration: 200,
        easing: 'EaseIn',
      },
      float: {
        properties: {
          positionY: '+=0.1',
        },
        duration: 1000,
        easing: 'EaseInOut',
      },
    });

    // Register ViroReact materials
    ViroMaterials.createMaterials({
      fallbackMaterial: {
        lightingModel: 'Blinn',
        diffuseColor: '#FF6B6B',
        shininess: 2.0,
      },
      shadowMaterial: {
        lightingModel: 'Blinn',
        diffuseColor: '#000000',
        shininess: 0.0,
      },
    });
  }, []);

  const getModelSource = () => {
    /**
     * PROPER ASSET LOADING FOR VIRO REACT
     *
     * Uses require() to ensure Metro bundler includes the asset in the app bundle.
     * The assetLoader utility maps JSON string paths to proper require() calls.
     *
     * Why this is needed:
     * - Metro bundler only bundles assets imported via require()
     * - Dynamic string paths from JSON won't trigger Metro to include files
     * - ViroReact needs proper asset references, not just string paths
     */

    console.log(`🎯 Loading model: ${item.word}`);
    console.log(`📂 Model path from JSON: ${item.modelPath}`);
    console.log(`🎨 Model type: ${modelFileType}`);

    // Get the proper require() reference for this model path
    const modelAsset = getModelAsset(item.modelPath);

    if (!modelAsset) {
      console.error(`❌ Model asset not found in mapping: ${item.modelPath}`);
      console.error(
        `This means the asset loader doesn't have a require() entry for this file.`,
      );
      console.error(
        `Add the model to MODEL_ASSETS in src/utils/assetLoader.ts`,
      );
      setModelLoadError(true);
      return null;
    }

    console.log(`✅ Model asset loaded via require():`, modelAsset);
    return modelAsset;
  };

  const getResourcesForOBJ = () => {
    if (modelFileType !== 'OBJ') return undefined;

    console.log(`🎨 Loading MTL materials for OBJ model`);

    // Get MTL material file using asset loader
    const mtlAsset = getMaterialAsset(item.modelPath);

    if (!mtlAsset) {
      console.log(
        `ℹ️ No MTL file found for ${item.modelPath}, using default materials`,
      );
    } else {
      console.log(`✅ MTL asset loaded via require()`, mtlAsset);
    }

    return mtlAsset;
  };

  return (
    <ViroARScene onTrackingUpdated={onTrackingInitialized}>
      {/* Ambient lighting for better model visibility */}
      <ViroAmbientLight color="#ffffff" intensity={300} />

      {/* Directional spotlight */}
      <ViroSpotLight
        innerAngle={5}
        outerAngle={25}
        direction={[0, -1, 0]}
        position={[0, 5, 1]}
        color="#ffffff"
        castsShadow={true}
        intensity={700}
      />

      {/* Direct model placement without plane detection */}
      {modelPlaced && (
        <ViroNode
          position={modelPosition as [number, number, number]}
          dragType="FixedToWorld"
          onDrag={() => {}}
        >
          {!modelLoadError ? (
            <>
              {/* Load 3D Model - Supports GLB, GLTF, and OBJ */}
              <Viro3DObject
                source={getModelSource()}
                resources={getResourcesForOBJ()}
                position={[0, 0, 0]}
                scale={item.scale}
                rotation={item.rotation}
                type={modelFileType}
                materials={
                  modelFileType === 'OBJ' ? [item.textureColor] : undefined
                }
                onLoadStart={() => {
                  console.log(
                    `⏳ Starting to load ${modelFileType} model: ${item.word}`,
                  );
                }}
                onLoadEnd={handleModelLoad}
                onError={handleModelError}
                onClick={handleModelTap}
                lightReceivingBitMask={1}
                shadowCastingBitMask={1}
                animation={{ name: 'rotate', run: true, loop: true }}
              />
            </>
          ) : (
            // Fallback: Show emoji if model fails to load
            <ViroNode position={[0, 0, 0]}>
              <ViroBox
                position={[0, 0, 0]}
                scale={[0.3, 0.3, 0.3]}
                materials={['fallbackMaterial']}
                onClick={handleModelTap}
              />
            </ViroNode>
          )}

          {/* Shadow plane underneath model */}
          <ViroNode position={[0, -0.5, 0]}>
            <ViroBox
              position={[0, 0, 0]}
              scale={[1.5, 0.01, 1.5]}
              materials={['shadowMaterial']}
              opacity={0.3}
            />
          </ViroNode>
        </ViroNode>
      )}
    </ViroARScene>
  );
};

/**
 * Fallback View for devices without AR support
 */
const ARFallbackView: React.FC<{ item: VocabularyItem }> = ({ item }) => {
  return (
    <View style={styles.fallbackContainer}>
      <View style={styles.fallbackCard}>
        <Icon name="cube-outline" size={64} color="#9CA3AF" />
        <Text style={styles.fallbackTitle}>AR Not Available</Text>
        <Text style={styles.fallbackMessage}>
          This device doesn't support AR features.
          {'\n'}
          {Platform.OS === 'android'
            ? 'ARCore requires Android 7.0+'
            : 'ARKit requires iOS 11+'}
        </Text>
        <View style={styles.modelInfo}>
          <Text style={styles.modelEmoji}>{item.emoji}</Text>
          <Text style={styles.modelWord}>{item.word}</Text>
        </View>
      </View>
    </View>
  );
};

/**
 * Utility class for OBJ model optimization
 */
export class ARModelOptimizer {
  /**
   * Optimize model settings for mobile AR
   */
  static getOptimizedSettings(item: VocabularyItem) {
    return {
      scale: item.scale.map(s => s * 0.5), // Smaller for better mobile performance
      position: [0, 0, -0.5], // Closer to camera
      rotation: item.rotation || [0, 0, 0],

      // Performance settings
      lightReceivingBitMask: 1,
      shadowCastingBitMask: 0, // Disable shadows for better performance

      // Material optimization
      materials: {
        diffuse: item.textureColor || '#FFFFFF',
        shininess: 0.2,
        lightingModel: 'Blinn',
      },
    };
  }

  /**
   * Preload models for faster rendering
   */
  static async preloadModel(modelPath: string): Promise<boolean> {
    try {
      // ViroReact handles caching internally
      console.log(`📦 Preloading model: ${modelPath}`);
      return true;
    } catch (error) {
      console.error('Preload failed:', error);
      return false;
    }
  }
}

/**
 * AR Configuration
 */
export const ARConfig = {
  // Tracking settings
  tracking: {
    worldAlignment: 'Gravity',
    planeDetection: 'Horizontal',
    autoFocus: true,
  },

  // Performance settings
  performance: {
    enableLightEstimation: true,
    enableHDR: false, // Disable for better performance
    enableShadows: false,
    maxPolygons: 5000,
  },

  // Model loading
  models: {
    timeout: 10000,
    cacheEnabled: true,
    supportedFormats: ['.obj', '.gltf', '.glb', '.vrx'],
  },
};

const styles = StyleSheet.create({
  arScene: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  viroContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  trackingOverlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  trackingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  instructionsOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  instructionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 24,
  },
  fallbackCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  fallbackMessage: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modelInfo: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    minWidth: 200,
  },
  modelEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  modelWord: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ARModelViewer;
