# AR Asset Setup Guide

## Overview
ViroReact requires 3D models and audio files to be placed in native asset folders, not just the React Native `assets/` directory.

## Asset Setup Steps

### 1. Prepare Your Assets

Place your 3D models in:
```
assets/ar/models/
├── animals/
│   └── cartoon_lion.glb
├── elephant.obj
├── elephant.mtl
└── sphere.obj
```

### 2. Android Setup

**Option A: Automatic (Recommended)**
Run the PowerShell script:
```powershell
.\copy-ar-assets.ps1
```

**Option B: Manual**
Copy the `assets/ar` folder to:
```
android/app/src/main/assets/ar/
```

Final structure:
```
android/app/src/main/assets/
└── ar/
    ├── models/
    │   └── (your .glb, .obj files)
    └── sounds/
        └── (your .mp3 files)
```

### 3. iOS Setup

1. Open Xcode project:
   ```bash
   open ios/ARVocabClean.xcworkspace
   ```

2. In Xcode:
   - Right-click on `ARVocabClean` folder
   - Select "Add Files to ARVocabClean..."
   - Navigate to `assets/ar` folder
   - **Important**: Check "Create folder references" (not "Create groups")
   - Check "Copy items if needed"
   - Click "Add"

3. Verify the folder appears **blue** (folder reference) not **yellow** (group)

### 4. Update Asset Paths

In `vocabulary-data.json`, use full paths:

```json
{
  "modelPath": "assets/ar/models/animals/cartoon_lion.glb",
  "soundPath": "assets/ar/sounds/lion.mp3"
}
```

**Do NOT remove the `assets/` prefix** - ViroReact needs the full path.

## Model Format Guide

### Recommended: GLB Format
- **Best performance** on mobile
- Single file (includes textures)
- Smaller file size
- Example: `cartoon_lion.glb`

### Alternative: OBJ Format
- Requires separate `.mtl` material file
- Both files must have same name:
  - `elephant.obj`
  - `elephant.mtl`

### Converting Models

**To GLB (recommended):**
1. Use Blender (free): File → Export → glTF 2.0 (.glb)
2. Online: https://products.aspose.app/3d/conversion/obj-to-glb

**Settings:**
- Format: GLB (binary)
- Include: Materials, Textures
- Compression: Draco (optional, for smaller files)

## Verification Steps

### 1. Check Files Exist
```powershell
# Android
ls android\app\src\main\assets\ar\models

# iOS (after adding to Xcode)
# Check in Xcode project navigator
```

### 2. Check Console Logs
When running the app, you should see:
```
Loading model: Lion
Model type: GLB
Model path: assets/ar/models/animals/cartoon_lion.glb
✅ Model source: {uri: "assets/ar/models/animals/cartoon_lion.glb"}
```

### 3. Test AR Loading
1. Launch app
2. Select a category
3. Grant camera permissions
4. Move device to detect surfaces
5. Tap surface to place model

## Troubleshooting

### Model Not Appearing

**Check 1: Asset Location**
```powershell
# Verify Android assets
Test-Path android\app\src\main\assets\ar\models\animals\cartoon_lion.glb
```

**Check 2: File Path in JSON**
Ensure path matches exactly:
```json
"modelPath": "assets/ar/models/animals/cartoon_lion.glb"
```

**Check 3: Model Format**
- GLB files are single files
- OBJ files need matching .mtl file
- File names are case-sensitive on some systems

**Check 4: Rebuild App**
```bash
# Clean and rebuild
cd android
.\gradlew clean
cd ..
npm run android
```

### Metro Bundler Error: "Invalid call at line X: require(...)"

✅ **FIXED** - No longer using dynamic `require()`

If you still see this:
1. Make sure you pulled latest code
2. Restart Metro: `npm start -- --reset-cache`

### iOS Build Errors

**Error: "File not found"**
- Make sure assets added as **folder references** (blue folders)
- Not as groups (yellow folders)
- Right-click folder → Show in Finder to verify

### Android Build Errors

**Error: "Asset not found"**
1. Run `.\copy-ar-assets.ps1` again
2. Check `android\app\src\main\assets\ar\` exists
3. Rebuild: `cd android && .\gradlew clean && cd .. && npm run android`

## Asset Optimization

### Model Size
- **Target**: < 5MB per model
- **Maximum**: 10MB (for slower devices)
- Use Draco compression for GLB files

### Polygon Count
- **Simple models**: 1,000-5,000 polygons
- **Detailed models**: 10,000-20,000 polygons
- **Maximum**: 50,000 polygons

### Texture Size
- **Recommended**: 512x512 or 1024x1024
- **Maximum**: 2048x2048
- Use PNG or JPG format

## Re-running After Changes

### After Adding New Models
```powershell
# 1. Copy to Android
.\copy-ar-assets.ps1

# 2. Add to iOS (in Xcode)

# 3. Rebuild
npm run android  # or npm run ios
```

### After Updating Existing Models
Just replace the files and rebuild - no need to re-copy if filenames are the same.

## Quick Reference

| Platform | Asset Location | Setup Method |
|----------|---------------|--------------|
| **Android** | `android/app/src/main/assets/ar/` | Run `copy-ar-assets.ps1` |
| **iOS** | Added via Xcode | Add Files → Create folder references |
| **Format** | `.glb` (recommended) or `.obj + .mtl` | Use GLB for best results |
| **Path** | `assets/ar/models/yourmodel.glb` | Full path from project root |

---

**Need Help?**
Check console logs for detailed error messages and file paths.
