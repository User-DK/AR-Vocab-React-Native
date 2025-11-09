/**
 * Asset Loader Utility
 * 
 * Converts string paths from vocabulary-data.json to Android asset URIs
 * that ViroReact can load at runtime.
 * 
 * WHY URI LOADING INSTEAD OF require():
 * - Metro bundler CANNOT bundle .glb, .obj, .mtl files via require()
 * - Those files must be placed in android/app/src/main/assets/
 * - ViroReact loads them using file:///android_asset/ URI scheme
 * 
 * SOLUTION:
 * - All 3D models and sounds are in android/app/src/main/assets/ar/
 * - Convert JSON paths to file:///android_asset/ar/ URIs
 * - ViroReact loads them at runtime from the native assets folder
 */

import { Platform } from 'react-native';

// ============================================================================
// URI CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert a relative asset path to Android asset URI
 * 
 * Example:
 *   Input:  "models/animals/cartoon_lion.glb"
 *   Output: "file:///android_asset/ar/models/animals/cartoon_lion.glb"
 * 
 * @param path - Relative path from vocabulary-data.json
 * @returns Full Android asset URI
 */
export const getAssetUri = (path: string): string => {
  if (!path) {
    console.warn('⚠️ Empty asset path provided');
    return '';
  }

  // Remove "ar/" prefix if present (we add it back with file:///android_asset/ar/)
  const cleanPath = path.replace(/^ar\//, '');
  
  if (Platform.OS === 'android') {
    const uri = `file:///android_asset/ar/${cleanPath}`;
    console.log(`📦 Asset URI: ${cleanPath} -> ${uri}`);
    return uri;
  } else {
    // iOS: TODO - implement iOS asset loading
    console.warn('⚠️ iOS asset loading not yet implemented');
    return cleanPath;
  }
};

/**
 * Get model asset source for ViroReact
 * 
 * Returns object in format: { uri: "file:///android_asset/ar/models/..." }
 * This is what Viro3DObject expects for the `source` prop
 * 
 * @param modelPath - Path from vocabulary-data.json (e.g., "models/animals/cartoon_lion.glb")
 * @returns Source object for Viro3DObject
 */
export function getModelAsset(modelPath: string): { uri: string } | null {
  if (!modelPath) {
    console.warn('⚠️ No model path provided');
    return null;
  }

  const uri = getAssetUri(modelPath);
  
  if (!uri) {
    return null;
  }

  console.log(`✅ Loading model: ${modelPath}`);
  return { uri };
}

/**
 * Get MTL material resources for OBJ models
 * 
 * Returns array with material URI: [{ uri: "file:///android_asset/ar/models/..." }]
 * This is what Viro3DObject expects for the `resources` prop
 * 
 * @param modelPath - OBJ model path (e.g., "models/monkey.obj")
 * @returns Array with material source object, or undefined if GLB
 */
export function getMaterialAsset(modelPath: string): Array<{ uri: string }> | undefined {
  if (!modelPath || !modelPath.toLowerCase().endsWith('.obj')) {
    return undefined; // GLB files don't need separate materials
  }

  // Convert .obj to .mtl
  const mtlPath = modelPath.replace('.obj', '.mtl');
  const uri = getAssetUri(mtlPath);
  
  console.log(`✅ Loading MTL: ${mtlPath}`);
  return [{ uri }];
}

/**
 * Get sound asset path for react-native-sound
 * 
 * react-native-sound on Android loads from assets folder using relative path
 * WITHOUT the file:///android_asset/ prefix
 * 
 * @param soundPath - Path from vocabulary-data.json (e.g., "sounds/lion.mp3")
 * @returns Path for react-native-sound (e.g., "ar/sounds/lion.mp3")
 */
export function getSoundAsset(soundPath: string): string | null {
  if (!soundPath) {
    console.warn('⚠️ No sound path provided');
    return null;
  }

  // Remove "ar/" prefix if present
  const cleanPath = soundPath.replace(/^ar\//, '');
  
  if (Platform.OS === 'android') {
    // react-native-sound needs path relative to assets folder
    const path = `ar/${cleanPath}`;
    console.log(`🔊 Loading sound: ${soundPath} -> ${path}`);
    return path;
  } else {
    // iOS: TODO - implement iOS sound loading
    console.warn('⚠️ iOS sound loading not yet implemented');
    return cleanPath;
  }
}

// ============================================================================
// MODEL TYPE DETECTION
// ============================================================================

/**
 * Check if model is GLB/GLTF format
 */
export function isGLBModel(modelPath: string): boolean {
  if (!modelPath) return false;
  const lower = modelPath.toLowerCase();
  return lower.endsWith('.glb') || lower.endsWith('.gltf');
}

/**
 * Check if model is OBJ format
 */
export function isOBJModel(modelPath: string): boolean {
  if (!modelPath) return false;
  return modelPath.toLowerCase().endsWith('.obj');
}

/**
 * Get model type string for ViroReact
 */
export function getModelType(modelPath: string): 'GLB' | 'GLTF' | 'OBJ' | 'VRX' {
  if (!modelPath) return 'OBJ';
  
  const lower = modelPath.toLowerCase();
  if (lower.endsWith('.glb')) return 'GLB';
  if (lower.endsWith('.gltf')) return 'GLTF';
  if (lower.endsWith('.obj')) return 'OBJ';
  if (lower.endsWith('.vrx')) return 'VRX';
  
  return 'OBJ'; // Default fallback
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate that vocabulary data has correct path structure
 */
export function validateVocabularyAssets(vocabularyData: any): {
  issues: string[];
  valid: boolean;
} {
  const issues: string[] = [];
  
  if (!vocabularyData || !vocabularyData.categories) {
    issues.push('Invalid vocabulary data structure');
    return { issues, valid: false };
  }

  vocabularyData.categories.forEach((category: any, catIndex: number) => {
    if (!category.items || !Array.isArray(category.items)) {
      issues.push(`Category ${catIndex} (${category.name}) has no items array`);
      return;
    }

    category.items.forEach((item: any, itemIndex: number) => {
      // Check model path
      if (!item.modelPath) {
        issues.push(`${category.name}[${itemIndex}] (${item.word}) missing modelPath`);
      } else if (item.modelPath.startsWith('ar/')) {
        issues.push(`${category.name}[${itemIndex}] (${item.word}) has "ar/" prefix in modelPath - should be removed`);
      }

      // Check sound path
      if (!item.soundPath) {
        issues.push(`${category.name}[${itemIndex}] (${item.word}) missing soundPath`);
      } else if (item.soundPath.startsWith('ar/')) {
        issues.push(`${category.name}[${itemIndex}] (${item.word}) has "ar/" prefix in soundPath - should be removed`);
      }

      // Check position array
      if (!item.position || item.position.length !== 3) {
        issues.push(`${category.name}[${itemIndex}] (${item.word}) has invalid position (should be [x,y,z])`);
      }

      // Check scale array
      if (!item.scale || item.scale.length !== 3) {
        issues.push(`${category.name}[${itemIndex}] (${item.word}) has invalid scale (should be [x,y,z])`);
      }
    });
  });

  const valid = issues.length === 0;
  
  if (!valid) {
    console.warn('⚠️ Vocabulary Data Validation Failed:');
    issues.forEach(issue => console.warn(`  - ${issue}`));
  } else {
    console.log('✅ Vocabulary data structure validated successfully');
  }

  return { issues, valid };
}

/**
 * List all model and sound paths from vocabulary data
 */
export function listVocabularyAssets(vocabularyData: any): void {
  console.log('\n📋 Vocabulary Assets Summary:');
  
  if (!vocabularyData || !vocabularyData.categories) {
    console.warn('Invalid vocabulary data');
    return;
  }

  let totalItems = 0;
  const modelTypes = { glb: 0, obj: 0, other: 0 };

  vocabularyData.categories.forEach((category: any) => {
    console.log(`\n${category.name} (${category.items?.length || 0} items):`);
    
    category.items?.forEach((item: any) => {
      totalItems++;
      const modelExt = item.modelPath?.split('.').pop()?.toLowerCase();
      
      if (modelExt === 'glb' || modelExt === 'gltf') modelTypes.glb++;
      else if (modelExt === 'obj') modelTypes.obj++;
      else modelTypes.other++;

      console.log(`  - ${item.word}: ${item.modelPath} (${item.soundPath || 'no sound'})`);
    });
  });

  console.log(`\n📊 Summary:`);
  console.log(`  Total items: ${totalItems}`);
  console.log(`  GLB/GLTF models: ${modelTypes.glb}`);
  console.log(`  OBJ models: ${modelTypes.obj}`);
  console.log(`  Other formats: ${modelTypes.other}`);
}

// ============================================================================
// DEBUG LOGGING
// ============================================================================

/**
 * Enable detailed asset loading logs
 */
export const DEBUG_ASSETS = __DEV__; // Only in development

export function logAssetLoading(type: string, path: string, success: boolean): void {
  if (!DEBUG_ASSETS) return;

  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${type}: ${path}`);
}
