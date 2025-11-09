# AR Model Not Rendering - Troubleshooting Guide

## Quick Checklist

### 1. ✅ Assets Copied
```powershell
# Verify asset exists
Test-Path "android\app\src\main\assets\ar\models\animals\cartoon_lion.glb"
# Should return: True
```

### 2. ✅ App Rebuilt
```bash
npm run clean:android  # Clean build
npm run android        # Rebuild with new assets
```

### 3. Check Console Logs

**When you tap "Animals" category, look for:**
```
Loading model: Lion
Model type: GLB
Model path: assets/ar/models/animals/cartoon_lion.glb
✅ Model source: {uri: "assets/ar/models/animals/cartoon_lion.glb"}
```

**When surface is detected:**
```
📍 Surface detected at: [x, y, z]
🎯 Placing model: Lion
📦 Model type: GLB
📂 Model path: assets/ar/models/animals/cartoon_lion.glb
```

**When model loads successfully:**
```
✅ Successfully loaded GLB model: assets/ar/models/animals/cartoon_lion.glb
Model word: Lion
```

### 4. Common Issues

#### Issue: Surface Detection Not Working
**Symptoms:** 
- Message stays "Move device to detect surfaces..."
- Can't tap to place model

**Solutions:**
1. **Point camera at a flat surface** (table, floor, desk)
2. **Move device slowly** in different angles
3. **Ensure good lighting** - AR needs light to detect surfaces
4. **Check camera permissions** - Go to Settings → Apps → ARVocabClean → Permissions

#### Issue: Model Not Appearing After Tap
**Check console for errors:**

**Error: "Model loading error"**
- Verify asset was copied: `Test-Path android\app\src\main\assets\ar\models\animals\cartoon_lion.glb`
- If False, run: `.\copy-ar-assets.ps1` then rebuild

**Error: "Invalid model format"**
- Check file is actually GLB format
- Try opening in 3D viewer on PC

#### Issue: Black Screen / Camera Not Showing
**Solutions:**
1. Grant camera permission in Android settings
2. Check ViroReact is properly installed: `npm list @reactvision/react-viro`
3. Restart app completely

### 5. Testing Steps

1. **Launch App** → Home Screen appears
2. **Tap "Animals"** → Category selection
3. **Tap "Lion"** → AR screen loads
4. **See Camera View** → Should show real world through camera
5. **Move Device** → Look for "Tap surface" message
6. **Tap Flat Surface** → Model should appear
7. **See 3D Lion** → Should be rotating slowly

### 6. Debug Commands

```powershell
# Check Metro bundler console
# Look for console.log messages

# Check Android logcat (in separate terminal)
adb logcat | Select-String "ReactNativeJS"
adb logcat | Select-String "ViroReact"

# Verify APK has assets
cd android\app\build\outputs\apk\debug
jar -tf app-debug.apk | Select-String "ar/models"
```

### 7. Model Placement Tips

**Best Practices:**
- **Distance**: Hold phone 1-2 meters from surface
- **Surface**: Use flat, textured surfaces (not glass/mirrors)
- **Lighting**: Bright, even lighting works best
- **Movement**: Slowly pan/tilt device for better tracking

**Model Scale:**
Current lion model scale: `[0.5, 0.5, 0.5]`
- If too small: Increase scale in vocabulary-data.json
- If too large: Decrease scale

### 8. Force Refresh

If model still not appearing:
```powershell
# 1. Stop app
# 2. Clean everything
cd android
.\gradlew clean
cd ..

# 3. Clear Metro cache
npm start -- --reset-cache

# 4. In new terminal, rebuild
npm run android
```

### 9. Expected Behavior

**Timeline:**
1. **0-2s**: Camera view appears
2. **2-5s**: "Move device..." message
3. **5-10s**: Surface detection completes
4. **10s+**: "Tap surface..." message
5. **On tap**: Model appears instantly
6. **Model**: Rotates slowly, can tap to hear sound

**Visual Indicators:**
- ⏳ Loading spinner → Initializing AR
- 📱 Hand icon → Ready to place
- ✓ Green check → Model loaded

### 10. Get Help

**Check these logs in Metro console:**
```javascript
// Model loading attempt
"Loading model: Lion"
"Model source: {uri: '...'}"

// Success
"✅ Successfully loaded GLB model"

// Error (note exact message)
"❌ Model loading error: ..."
```

**Share this info:**
1. Exact error message from console
2. Android version (Settings → About)
3. Device model
4. What surface you're trying to use

---

## Quick Test

Try this simple test:
1. Open app
2. Animals → Lion
3. Point camera at **wooden table** or **carpet**
4. Move phone slowly left-right for 5 seconds
5. Should see "Tap surface" message
6. Tap the surface once
7. Lion should appear

If lion doesn't appear, check Metro console for error message.
