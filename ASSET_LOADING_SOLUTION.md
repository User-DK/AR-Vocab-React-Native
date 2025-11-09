# Asset Loading Solution for ViroReact

## 🔴 The Problem

**Error**: `Unable to resolve module ../../assets/ar/models/animals/cartoon_lion.glb`

**Root Cause**: Metro bundler (React Native's JavaScript bundler) **CANNOT** bundle non-JavaScript files like:
- `.glb` (3D models)
- `.obj` (3D models)
- `.mtl` (material files)
- `.mp3` (sound files - partially supported)

When we tried to use `require('../../assets/ar/models/animals/cartoon_lion.glb')`, Metro failed because it doesn't know how to process GLB files.

## ✅ The Solution: URI-Based Asset Loading

### How It Works

1. **Place assets in Android native folder**:
   ```
   android/app/src/main/assets/ar/
   ├── models/
   │   ├── animals/
   │   │   ├── cartoon_lion.glb
   │   │   └── elephant.glb
   │   ├── monkey.obj
   │   ├── monkey.mtl
   │   └── ...
   └── sounds/
       ├── lion.mp3
       └── ...
   ```

2. **Use `file:///android_asset/` URI scheme**:
   ```typescript
   // vocabulary-data.json
   {
     "modelPath": "models/animals/cartoon_lion.glb",
     "soundPath": "sounds/lion.mp3"
   }
   
   // assetLoader.ts converts to:
   {
     uri: "file:///android_asset/ar/models/animals/cartoon_lion.glb"
   }
   ```

3. **ViroReact loads assets at runtime**:
   ```tsx
   <Viro3DObject
     source={getModelAsset(item.modelPath)} // { uri: "file:///android_asset/ar/..." }
     resources={getMaterialAsset(item.modelPath)} // For OBJ files
   />
   ```

## 📋 Asset Path Rules

### ✅ CORRECT Paths in vocabulary-data.json

```json
{
  "modelPath": "models/animals/cartoon_lion.glb",
  "soundPath": "sounds/lion.mp3"
}
```

**Why**: No "ar/" prefix - the `assetLoader.ts` automatically adds `file:///android_asset/ar/` prefix

### ❌ INCORRECT Paths

```json
{
  "modelPath": "ar/models/animals/cartoon_lion.glb",  // ❌ Don't include "ar/" prefix
  "soundPath": "ar/sounds/lion.mp3"                   // ❌ Don't include "ar/" prefix
}
```

**Why**: Would create double "ar/" in final URI: `file:///android_asset/ar/ar/models/...`

## 🔄 Asset Loading Flow

```
vocabulary-data.json
  "modelPath": "models/animals/cartoon_lion.glb"
          ↓
assetLoader.ts → getModelAsset()
          ↓
  { uri: "file:///android_asset/ar/models/animals/cartoon_lion.glb" }
          ↓
ARModelViewer.tsx → <Viro3DObject source={...} />
          ↓
ViroReact loads from: android/app/src/main/assets/ar/models/animals/cartoon_lion.glb
```

## 🛠️ Implementation Details

### assetLoader.ts Functions

#### 1. `getModelAsset(modelPath)` - For 3D Models
```typescript
getModelAsset("models/animals/cartoon_lion.glb")
// Returns: { uri: "file:///android_asset/ar/models/animals/cartoon_lion.glb" }

// Usage in ARModelViewer.tsx:
<Viro3DObject source={getModelAsset(item.modelPath)} />
```

#### 2. `getMaterialAsset(modelPath)` - For OBJ Materials
```typescript
getMaterialAsset("models/monkey.obj")
// Returns: [{ uri: "file:///android_asset/ar/models/monkey.mtl" }]

// Usage in ARModelViewer.tsx:
<Viro3DObject
  source={getModelAsset(item.modelPath)}
  resources={getMaterialAsset(item.modelPath)} // Only for OBJ
/>
```

#### 3. `getSoundAsset(soundPath)` - For Sounds
```typescript
getSoundAsset("sounds/lion.mp3")
// Returns: "ar/sounds/lion.mp3" (no file:// prefix for react-native-sound)

// Usage in ARLearningScreen.tsx:
const sound = new Sound(getSoundAsset(item.soundPath), Sound.MAIN_BUNDLE, callback);
```

### ARModelViewer.tsx - Model Rendering

```tsx
const getModelSource = () => {
  const source = getModelAsset(item.modelPath);
  if (!source) {
    console.error('Failed to load model source');
    return null;
  }
  return source; // { uri: "file:///android_asset/ar/..." }
};

const getResources = () => {
  if (isOBJModel(item.modelPath)) {
    return getMaterialAsset(item.modelPath); // For OBJ files
  }
  return undefined; // GLB files don't need resources
};

<Viro3DObject
  source={getModelSource()}
  resources={getResources()}
  position={item.position}
  scale={item.scale}
  type={getModelType(item.modelPath)}
/>
```

## 🎯 Position Fixing

### Issue: Models Behind AR Plane
```json
{
  "position": [0, 0, -1]  // ❌ Z=-1 places model 1 meter BEHIND the plane
}
```

### Solution: Position ON AR Plane
```json
{
  "position": [0, 0, 0]  // ✅ Z=0 places model ON the detected surface
}
```

**Why**: In AR, when you tap a surface:
- The detected plane is at position `[0, 0, 0]`
- Negative Z values go behind the plane (invisible)
- Positive Z values go toward the camera
- X/Y are horizontal/vertical offsets

## 📦 File Organization

### Source Assets (for development)
```
assets/ar/
├── models/
│   ├── animals/
│   │   ├── cartoon_lion.glb
│   │   └── elephant.glb
│   └── monkey.obj
└── sounds/
    └── lion.mp3
```

### Built Assets (bundled in app)
```
android/app/src/main/assets/ar/
├── models/
│   ├── animals/
│   │   ├── cartoon_lion.glb
│   │   └── elephant.glb
│   └── monkey.obj
└── sounds/
    └── lion.mp3
```

Use `copy-ar-assets.ps1` to sync: `.\copy-ar-assets.ps1`

## 🚀 Build & Deploy

1. **Copy assets to Android**:
   ```powershell
   .\copy-ar-assets.ps1
   # Or manually:
   Copy-Item -Recurse -Force "assets\ar\*" "android\app\src\main\assets\ar\"
   ```

2. **Rebuild app**:
   ```bash
   npx react-native run-android
   ```

3. **Test**:
   - Open app → Animals → Lion
   - Point camera at flat surface
   - Tap surface when AR markers appear
   - 3D lion model should appear ON the surface

## 🐛 Debugging

### Check Console Logs
```
✅ Loading model: models/animals/cartoon_lion.glb
📦 Asset URI: models/animals/cartoon_lion.glb -> file:///android_asset/ar/models/animals/cartoon_lion.glb
✅ Successfully loaded GLB model
```

### Common Errors

**"Unable to resolve module"** → Asset using `require()` instead of URI
- **Fix**: Update `assetLoader.ts` to use `file:///android_asset/` URIs

**"Model Loading Failed"** → File not in Android assets folder
- **Fix**: Run `.\copy-ar-assets.ps1` to copy files

**"ar/ar/models/..." in logs** → Double "ar/" prefix
- **Fix**: Remove "ar/" from paths in `vocabulary-data.json`

**Model not visible** → Wrong position (behind plane)
- **Fix**: Set position to `[0, 0, 0]` in `vocabulary-data.json`

## 📊 Comparison: require() vs URI Loading

| Feature | `require()` Approach | `file:///android_asset/` URI |
|---------|---------------------|------------------------------|
| **Metro Bundling** | ✅ JS/JSON/Images | ❌ GLB/OBJ/MTL |
| **3D Models** | ❌ Not supported | ✅ Supported |
| **Sound Files** | ⚠️ Limited support | ✅ Fully supported |
| **Dynamic Loading** | ❌ Paths must be static | ✅ Runtime path resolution |
| **Bundle Size** | Larger (all assets in JS bundle) | Smaller (native assets) |
| **ViroReact Compatibility** | ❌ GLB files fail | ✅ All formats work |

## ✅ Summary

**Before** (Broken):
```typescript
// ❌ Metro can't bundle GLB files
const asset = require('../../assets/ar/models/animals/cartoon_lion.glb');
```

**After** (Working):
```typescript
// ✅ URI-based loading from Android assets
const asset = getModelAsset('models/animals/cartoon_lion.glb');
// Returns: { uri: 'file:///android_asset/ar/models/animals/cartoon_lion.glb' }
```

**Key Takeaways**:
1. ✅ Use `file:///android_asset/ar/` URIs for 3D models
2. ✅ Place assets in `android/app/src/main/assets/ar/`
3. ✅ Remove "ar/" prefix from paths in `vocabulary-data.json`
4. ✅ Set model position to `[0, 0, 0]` for AR surface placement
5. ✅ Use `assetLoader.ts` helper functions for all asset loading

This solution enables ViroReact to load 3D models at runtime without Metro bundler limitations! 🎉
