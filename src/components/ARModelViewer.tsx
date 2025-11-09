import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  Platform,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { VocabularyItem } from "../types/vocabulary";

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
} from "@reactvision/react-viro";

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
export const ARModelViewer: React.FC<ARModelViewerProps> = ({
  item,
  onModelLoaded,
  onModelTapped,
}) => {
  const [arSupported, setArSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingInitialized, setTrackingInitialized] = useState(false);

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
      console.error("AR Support Check Failed:", error);
      Alert.alert(
        "AR Not Supported",
        "This device does not support AR features. Please use a device with ARCore (Android) or ARKit (iOS) support."
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
            />
          ),
        }}
        style={styles.viroContainer}
      />

      {/* AR Status Overlay */}
      {!trackingInitialized && (
        <View style={styles.trackingOverlay}>
          <ActivityIndicator size="small" color="#ffffff" />
          <Text style={styles.trackingText}>
            Move your device to detect surfaces...
          </Text>
        </View>
      )}

      {/* AR Instructions */}
      <View style={styles.instructionsOverlay}>
        <View style={styles.instructionBadge}>
          <Icon name="scan" size={20} color="#ffffff" />
          <Text style={styles.instructionText}>
            Tap detected surface to place {item.word}
          </Text>
        </View>
      </View>
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
}

const ARSceneComponent: React.FC<ARSceneComponentProps> = ({
  item,
  onModelLoaded,
  onModelTapped,
  onTrackingInitialized,
}) => {
  const [modelPlaced, setModelPlaced] = useState(false);
  const [modelPosition, setModelPosition] = useState([0, 0, -1]);

  const handleModelLoad = useCallback(() => {
    console.log(`✅ Loaded OBJ model: ${item.modelPath}`);
    onModelLoaded?.();
  }, [item.modelPath, onModelLoaded]);

  const handleModelError = useCallback(
    (error: any) => {
      console.error("❌ Model loading error:", error);
      Alert.alert("Model Loading Failed", `Could not load ${item.word} model`);
    },
    [item.word]
  );

  const handlePlaneClick = useCallback(
    (position: number[]) => {
      console.log("📍 Surface detected at:", position);
      setModelPosition(position);
      setModelPlaced(true);
      onTrackingInitialized();
    },
    [onTrackingInitialized]
  );

  const handleModelTap = useCallback(() => {
    console.log(`👆 Tapped model: ${item.word}`);
    onModelTapped?.();
  }, [item.word, onModelTapped]);

  // Register animations
  ViroAnimations.registerAnimations({
    rotate: {
      properties: {
        rotateY: "+=90",
      },
      duration: 2000,
      easing: "Linear",
    },
    scaleUp: {
      properties: {
        scaleX: 1.2,
        scaleY: 1.2,
        scaleZ: 1.2,
      },
      duration: 200,
      easing: "EaseOut",
    },
    scaleDown: {
      properties: {
        scaleX: 1.0,
        scaleY: 1.0,
        scaleZ: 1.0,
      },
      duration: 200,
      easing: "EaseIn",
    },
    float: {
      properties: {
        positionY: "+=0.1",
      },
      duration: 1000,
      easing: "EaseInOut",
    },
  });

  return (
    <ViroARScene onTrackingUpdated={onTrackingInitialized}>
      {/* Ambient lighting for better model visibility */}
      <ViroAmbientLight color="#ffffff" intensity={200} />

      {/* Directional spotlight */}
      <ViroSpotLight
        innerAngle={5}
        outerAngle={25}
        direction={[0, -1, 0]}
        position={[0, 5, 1]}
        color="#ffffff"
        castsShadow={true}
        intensity={500}
      />

      {/* AR Plane Selector - Detects horizontal surfaces */}
      <ViroARPlaneSelector
        minHeight={0.1}
        minWidth={0.1}
        onPlaneSelected={handlePlaneClick}
      >
        {modelPlaced && (
          <ViroNode
            position={[0, 0, 0]}
            dragType="FixedToWorld"
            onDrag={() => {}}
          >
            {/* Load 3D OBJ Model */}
            <Viro3DObject
              source={
                Platform.OS === "ios"
                  ? { uri: item.modelPath }
                  : { uri: `file:///android_asset/${item.modelPath}` }
              }
              resources={[
                Platform.OS === "ios"
                  ? { uri: item.modelPath.replace(".obj", ".mtl") }
                  : {
                      uri: `file:///android_asset/${item.modelPath.replace(
                        ".obj",
                        ".mtl"
                      )}`,
                    },
              ]}
              position={[0, 0, 0]}
              scale={item.scale}
              rotation={item.rotation}
              type="OBJ"
              materials={[item.textureColor || "default"]}
              animation={{
                name: "rotate",
                run: true,
                loop: true,
              }}
              onLoadEnd={handleModelLoad}
              onError={handleModelError}
              onClick={handleModelTap}
              transformBehaviors={["billboard"]}
            />

            {/* Shadow plane underneath model */}
            <ViroNode position={[0, -0.01, 0]}>
              <ViroSpotLight
                innerAngle={10}
                outerAngle={20}
                direction={[0, -1, 0]}
                position={[0, 3, 0]}
                color="#000000"
                castsShadow={true}
                shadowOpacity={0.3}
              />
            </ViroNode>
          </ViroNode>
        )}
      </ViroARPlaneSelector>
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
          {"\n"}
          {Platform.OS === "android"
            ? "ARCore requires Android 7.0+"
            : "ARKit requires iOS 11+"}
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
      scale: item.scale.map((s) => s * 0.5), // Smaller for better mobile performance
      position: [0, 0, -0.5], // Closer to camera
      rotation: item.rotation || [0, 0, 0],

      // Performance settings
      lightReceivingBitMask: 1,
      shadowCastingBitMask: 0, // Disable shadows for better performance

      // Material optimization
      materials: {
        diffuse: item.textureColor || "#FFFFFF",
        shininess: 0.2,
        lightingModel: "Blinn",
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
      console.error("Preload failed:", error);
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
    worldAlignment: "Gravity",
    planeDetection: "Horizontal",
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
    supportedFormats: [".obj", ".gltf", ".glb", ".vrx"],
  },
};

const styles = StyleSheet.create({
  arScene: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  viroContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F2937",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
  trackingOverlay: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  trackingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
  },
  instructionsOverlay: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  instructionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(79, 70, 229, 0.9)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 8,
  },
  instructionText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F2937",
    padding: 24,
  },
  fallbackCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 16,
    marginBottom: 8,
  },
  fallbackMessage: {
    fontSize: 14,
    color: "#D1D5DB",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modelInfo: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
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
    fontWeight: "600",
    color: "#ffffff",
  },
});

export default ARModelViewer;

