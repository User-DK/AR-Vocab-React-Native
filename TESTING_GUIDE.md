# Testing Guide: URI-Based Asset Loading

## ✅ What Was Fixed

**Problem**: Metro bundler couldn't bundle `.glb` 3D model files using `require()`  
**Solution**: Switch to `file:///android_asset/` URI-based loading  
**Implementation**: Updated `assetLoader.ts` to convert paths to Android asset URIs

## 📱 Testing Steps

### 1. Launch the App
- App should open to the Home screen with categories

### 2. Test Animals Category
1. Tap **"Animals"** category
2. Select **"Lion"**
3. Point camera at a **flat surface** (desk, table, floor)
4. Look for **AR plane detection indicators** (white dots/grid)
5. **Tap the detected surface**

**Expected Result**:
- ✅ 3D cartoon lion model appears ON the surface
- ✅ Model rotates slowly (animation working)
- ✅ Model is properly sized and positioned

**What to check in console**:
```
📦 Asset URI: models/animals/cartoon_lion.glb -> file:///android_asset/ar/models/animals/cartoon_lion.glb
✅ Loading model: models/animals/cartoon_lion.glb
✅ Successfully loaded GLB model
```

### 3. Test Elephant (GLB)
1. Go back to Animals
2. Select **"Elephant"**
3. Point at surface and tap

**Expected Result**:
- ✅ 3D elephant model appears
- Check position is correct ([0, 0, 0])

### 4. Test Monkey (OBJ)
1. Go back to Animals
2. Select **"Monkey"**
3. Point at surface and tap

**Expected Result**:
- ✅ 3D monkey model appears with materials (.mtl file loaded)
- Console shows: `✅ Loading MTL: models/monkey.mtl`

## 🔍 What to Observe

### Model Rendering
- ✅ Model appears ON the detected plane (not behind it)
- ✅ Model is correctly sized (not too big/small)
- ✅ Model has proper colors/textures
- ✅ Model rotates smoothly

### AR Functionality
- ✅ Camera view is full-screen
- ✅ Surface detection working (white dots/grid)
- ✅ Model stays in place when you move camera
- ✅ Model occlusion (if supported by device)

### UI Elements
- ✅ Word card appears at bottom of screen
- ✅ "Repeat" button visible (may not play sound yet - MP3 files pending)
- ✅ "Next" button visible
- ✅ Icons display correctly

## 🐛 Troubleshooting

### Model Loading Failed Error

**Check 1**: Are assets in Android folder?
```powershell
# Verify files exist:
Test-Path "android\app\src\main\assets\ar\models\animals\cartoon_lion.glb"
```

**Fix**: Run asset copy script
```powershell
.\copy-ar-assets.ps1
npx react-native run-android
```

### Model Not Visible (But No Error)

**Check 1**: Model position
```json
// In vocabulary-data.json, should be:
"position": [0, 0, 0]  // ✅ ON the plane

// NOT:
"position": [0, 0, -1]  // ❌ BEHIND the plane
```

**Fix**: Update vocabulary-data.json positions to `[0, 0, 0]`

**Check 2**: Model scale
```json
"scale": [0.5, 0.5, 0.5]  // ✅ Good size

// If too small:
"scale": [0.01, 0.01, 0.01]  // ❌ Invisible (too tiny)

// If too large:
"scale": [10, 10, 10]  // ❌ Clips through camera
```

### Double "ar/" in Console Logs

**Check**: Console shows `file:///android_asset/ar/ar/models/...`

**Fix**: Remove "ar/" prefix from vocabulary-data.json:
```json
// ❌ Wrong:
"modelPath": "ar/models/animals/cartoon_lion.glb"

// ✅ Correct:
"modelPath": "models/animals/cartoon_lion.glb"
```

### Metro Bundler Error

**Error**: `Unable to resolve module ...`

**Fix**: Make sure assetLoader.ts is using URI strings, NOT require():
```typescript
// ✅ Correct:
return { uri: `file:///android_asset/ar/${path}` };

// ❌ Wrong:
return require(`../../assets/ar/${path}`);
```

## 📊 Test Matrix

| Category | Item | Model Format | Expected Result |
|----------|------|--------------|-----------------|
| Animals | Lion | GLB | ✅ Should load |
| Animals | Elephant | GLB | ✅ Should load |
| Animals | Monkey | OBJ + MTL | ✅ Should load with materials |
| Animals | Cat | OBJ + MTL | ✅ Should load |
| Animals | Dog | OBJ + MTL | ✅ Should load |
| Fruits | Apple | OBJ + MTL | ✅ Should load |
| Fruits | Banana | OBJ + MTL | ✅ Should load |
| Fruits | Orange | OBJ + MTL | ✅ Should load |
| Colors | Red | OBJ + MTL | ✅ Should load |
| Colors | Blue | OBJ + MTL | ✅ Should load |
| Colors | Green | OBJ + MTL | ✅ Should load |
| Vehicles | Car | OBJ + MTL | ✅ Should load |
| Vehicles | Airplane | OBJ + MTL | ✅ Should load |

## 🔊 Sound Testing (Pending)

**Note**: Sound functionality is implemented but requires MP3 files.

**To test sounds later**:
1. Add MP3 files to `assets/ar/sounds/`
2. Run `.\copy-ar-assets.ps1`
3. Rebuild app
4. Tap "Repeat" button

**Expected**: Hears pronunciation of the word

## ✅ Success Criteria

The fix is successful if:
1. ✅ App builds without "Unable to resolve module" errors
2. ✅ At least one model (Lion) renders in AR
3. ✅ Model appears ON the detected surface (position [0,0,0])
4. ✅ Console logs show `file:///android_asset/ar/` URIs
5. ✅ No "ar/ar/" double prefix in logs

## 📝 Next Steps After Success

1. **Test all 13 vocabulary items** to ensure all models load
2. **Adjust scale/position** if any models are too big/small
3. **Add sound files** (MP3s) to complete the learning experience
4. **Test on multiple devices** to ensure compatibility
5. **Performance testing** - check frame rate with complex models

## 🎯 Key Learnings

1. **Metro bundler limitations**: Can't bundle 3D model files with `require()`
2. **Android asset URIs**: Use `file:///android_asset/` for native assets
3. **Path structure**: No "ar/" prefix in JSON, added by assetLoader
4. **Position matters**: `[0,0,0]` for surface, negative Z goes behind
5. **Runtime loading**: ViroReact loads from native assets at runtime

---

**Ready to test!** 🚀 Follow the steps above and report any errors you see.
