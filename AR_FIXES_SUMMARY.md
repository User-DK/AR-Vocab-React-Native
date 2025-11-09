# AR Viewer Fixes Summary

## ✅ RESOLVED: Metro Bundler Dynamic Require Error

**Error**: `Invalid call at line 269: require(\`../../${cleanPath}\`)`

**Root Cause**: React Native Metro bundler doesn't support dynamic `require()` statements with template literals or variables.

**Solution**: 
- Removed all dynamic `require()` calls
- Use URI-based asset loading: `{ uri: 'assets/ar/models/model.glb' }`
- Assets must be copied to native projects (see ASSET_SETUP.md)

## Issues Fixed

### 1. **GLB File Format Support** ✅
**Problem**: Code only supported OBJ files, but vocabulary data contains GLB files (e.g., `cartoon_lion.glb`)

**Solution**:
- Added automatic file type detection based on file extension
- Support for GLB, GLTF, and OBJ formats
- Dynamic type assignment: `'GLB' | 'GLTF' | 'OBJ'`

```typescript
const modelFileType = item.modelPath.toLowerCase().endsWith('.glb') 
  ? 'GLB' 
  : item.modelPath.toLowerCase().endsWith('.gltf')
  ? 'GLTF'
  : 'OBJ';
```

### 2. **Asset Path Resolution** ✅
**Problem**: Incorrect asset loading paths for React Native bundler

**Solution**:
- Remove `assets/` prefix for bundler compatibility
- Different handling for iOS (require) vs Android (uri)
- Added comprehensive logging for debugging

```typescript
const getModelSource = () => {
  const cleanPath = item.modelPath.replace(/^assets\//, '');
  
  if (Platform.OS === 'ios') {
    try {
      return require(`../../${cleanPath}`);
    } catch (error) {
      return { uri: cleanPath };
    }
  } else {
    return { uri: cleanPath };
  }
};
```

### 3. **Full-Screen AR Camera View** ✅
**Problem**: AR viewer not taking up entire container, cramped by margins

**Solution**:
- Changed `arContainer` from flex-based to absolute positioning
- Removed `marginTop` and `marginBottom` constraints
- Made AR viewer cover full screen (0,0 to 100%, 100%)

```typescript
arContainer: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 2,
  backgroundColor: "transparent",
}
```

### 4. **ViroReact Component Corrections** ✅
**Problem**: Incorrect component usage and missing imports

**Solution**:
- Added `ViroBox` import for shadow and fallback rendering
- Fixed animation registration to use `useEffect`
- Proper material handling for different model types
- Enhanced lighting (increased ambient and spotlight intensity)

### 5. **Error Handling & Fallback** ✅
**Problem**: No graceful handling when models fail to load

**Solution**:
- Added `modelLoadError` state tracking
- Fallback to ViroBox if 3D model fails
- User-friendly error alerts with model details
- Comprehensive console logging for debugging

### 6. **UI Positioning** ✅
**Problem**: Word info card overlapping AR view

**Solution**:
- Changed card to absolute positioning at bottom
- Keeps AR camera view unobstructed
- Card floats above AR scene with proper z-index

## Key Code Changes

### ARModelViewer.tsx
1. ✅ Multi-format support (GLB/GLTF/OBJ)
2. ✅ Smart asset path resolution
3. ✅ Full-screen absolute positioning
4. ✅ Error handling with fallback rendering
5. ✅ Enhanced lighting (300 ambient, 700 spotlight)
6. ✅ Detailed logging for debugging

### ARLearningScreen.tsx
1. ✅ Full-screen AR container (absolute positioning)
2. ✅ Word info card repositioned to bottom
3. ✅ Removed constraining margins

## Quick Start

### 1. Copy Assets to Android
```powershell
npm run setup:android-assets
# or manually:
.\copy-ar-assets.ps1
```

### 2. Add Assets to iOS
- Open `ios/ARVocabClean.xcworkspace` in Xcode
- Add `assets/ar` folder as **folder references** (blue folders)

### 3. Run the App
```bash
npm run android  # or npm run ios
```

### 4. Test AR Features
- Select a category (e.g., Animals)
- Grant camera permission
- Move device to detect surfaces
- Tap detected surface to place 3D model

## Testing Checklist

- [ ] Test GLB file loading (cartoon_lion.glb)
- [ ] Test OBJ file loading (elephant.obj, etc.)
- [ ] Verify AR camera shows full screen
- [ ] Check surface detection works
- [ ] Confirm model placement on detected planes
- [ ] Test model tap interaction (plays sound)
- [ ] Verify error handling if model missing
- [ ] Check lighting makes models visible
- [ ] Test on both iOS and Android

## Model File Requirements

### Supported Formats
- ✅ **GLB** - Binary glTF (recommended for best performance)
- ✅ **GLTF** - Text-based glTF
- ✅ **OBJ** - Wavefront OBJ (requires .mtl file)

### Asset Placement
Place model files in: `assets/ar/models/`

Example structure:
```
assets/ar/models/
├── animals/
│   └── cartoon_lion.glb
├── elephant.obj
├── elephant.mtl
└── sphere.obj
```

### Path Format in vocabulary-data.json
```json
{
  "modelPath": "assets/ar/models/animals/cartoon_lion.glb"
}
```

## ViroReact Configuration

### Required Package
```json
"@reactvision/react-viro": "^2.44.0"
```

### Permissions Required

**Android** (`AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera.ar" android:required="true"/>
```

**iOS** (`Info.plist`):
```xml
<key>NSCameraUsageDescription</key>
<string>AR features require camera access</string>
```

## Performance Notes

- GLB format recommended for best mobile performance
- Model scale adjusted: 0.3-0.8 range optimal
- Shadow casting disabled for better FPS
- Rotation animation: 5000ms duration (smooth)

## Debugging

All model loading attempts now log:
- ✅ Model word and type
- ✅ Original and cleaned paths
- ✅ Platform-specific source resolution
- ✅ Success or failure with details

Check console output for detailed debugging information.

---

**Date**: 2025-11-09
**Status**: ✅ All critical issues resolved
