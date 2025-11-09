# AR Model & Sound Loading - Troubleshooting Guide

## Issues Fixed ✅

### 1. **Model Path Issue - FIXED**
**Problem**: Models not loading because ViroReact on Android expects paths relative to `assets/` folder, not including "ar/" prefix.

**Solution**: Modified `ARModelViewer.tsx` to automatically strip "ar/" prefix:
```typescript
// Before: "ar/models/animals/lion.glb"
// After: "models/animals/lion.glb"
const cleanPath = item.modelPath.replace(/^ar\//, '');
```

### 2. **Missing ViroMaterials - FIXED**
**Problem**: Code referenced `fallbackMaterial` and `shadowMaterial` but they were never registered.

**Solution**: Added material registration in ARModelViewer.tsx:
```typescript
ViroMaterials.createMaterials({
  fallbackMaterial: {
    lightingModel: "Blinn",
    diffuseColor: "#FF6B6B",
    shininess: 2.0,
  },
  shadowMaterial: {
    lightingModel: "Blinn",
    diffuseColor: "#000000",
    shininess: 0.0,
  },
});
```

### 3. **Sound Path Issue - FIXED**
**Problem**: Same issue - sound paths included "ar/" prefix.

**Solution**: Modified `ARLearningScreen.tsx` to strip "ar/" prefix:
```typescript
const cleanSoundPath = currentItem.soundPath.replace(/^ar\//, '');
```

### 4. **Missing Sounds Directory - CREATED**
**Problem**: No sounds folder existed in Android assets.

**Solution**: Created `android/app/src/main/assets/sounds/` with README instructions.

## Asset Path Rules for ViroReact & react-native-sound

### ✅ CORRECT Format (Android)
```
android/app/src/main/assets/
├── models/              ← NO "ar/" prefix
│   └── animals/
│       └── lion.glb
└── sounds/              ← NO "ar/" prefix
    └── lion.mp3
```

### ❌ WRONG Format
```
android/app/src/main/assets/
└── ar/                  ← Don't use this in paths!
    ├── models/
    └── sounds/
```

### In vocabulary-data.json
```json
{
  "modelPath": "ar/models/animals/lion.glb",  ← Keep this format
  "soundPath": "ar/sounds/lion.mp3"           ← Keep this format
}
```

The code will automatically clean these paths before loading.

## Current Model Files Available

You have **64 GLB models** ready to use:

### Animals (26 models) ✅
- cartoon_lion.glb, cat.glb, dog.glb, monkey.glb
- cyberphant.glb (elephant), bear.glb, tiger.glb, zebra.glb
- And 18 more...

### Foods (15 models) ✅
- red_apple.glb, banana.glb, orange_fruit.glb, carrot.glb
- burger.glb, cake.glb, ice_cream.glb, chocolate_bar.glb
- And 7 more...

### Toys/Play (16 models) ✅
- teddy_bear.glb, stylized_car.glb, bicycle.glb, scooter.glb
- chess_board.glb, cricket_bat.glb, tennis_ball.glb
- And 9 more...

### Clothing (5 models) ✅
- baseball_cap.glb, shoes.glb, shirt.glb, pants.glb, gloves.glb

### Daily Objects (6 models) ✅
- chair.glb, wood_table.glb, old_bed.glb, cup_of_coffee.glb, plate.glb, spoon.glb

## What You Need to Do Now

### 1. Add Sound Files (Critical) 🔊
```bash
# Create MP3 files in:
android/app/src/main/assets/sounds/

# Required files:
lion.mp3, elephant.mp3, monkey.mp3, cat.mp3, dog.mp3
apple.mp3, banana.mp3, orange.mp3
red.mp3, blue.mp3, green.mp3
car.mp3, airplane.mp3
```

See `android/app/src/main/assets/sounds/README.md` for detailed instructions.

### 2. Update vocabulary-data.json (Optional)
Consider using the actual GLB files you have instead of missing OBJ files:

```json
{
  "id": "elephant",
  "word": "Elephant",
  "modelPath": "ar/models/animals/cyberphant.glb",  ← Change from elephant.obj
  "soundPath": "ar/sounds/elephant.mp3"
}
```

### 3. Rebuild the App
```bash
npm run android
```

## Testing Checklist

After rebuilding:

1. **Open AR Learning Screen**
   - ✅ Should see "Move device to detect surfaces..."
   - ✅ Background should show live camera feed

2. **Move Device Around**
   - ✅ Should see "Tap surface to place [word]" after detecting surface
   - ✅ Horizontal surfaces (floor, table) should be highlighted

3. **Tap Detected Surface**
   - ✅ 3D model should appear at tap location
   - ✅ Model should rotate automatically
   - ✅ Check console for: "✅ Successfully loaded GLB model: models/animals/..."

4. **Tap Model or Repeat Button**
   - ⚠️ Will show error until you add MP3 files
   - ✅ After adding sounds: Should hear pronunciation

## Console Log Examples

### ✅ Successful Model Loading
```
Loading model: Lion
Model type: GLB
Original path: ar/models/animals/cartoon_lion.glb
Cleaned path: models/animals/cartoon_lion.glb
✅ Model source: {uri: "models/animals/cartoon_lion.glb"}
📍 Surface detected at: [0, 0, -1]
🎯 Placing model: Lion
✅ Successfully loaded GLB model: models/animals/cartoon_lion.glb
```

### ⚠️ Sound Not Found (Expected until you add MP3s)
```
🔊 Original sound path: ar/sounds/lion.mp3
🔊 Cleaned sound path: sounds/lion.mp3
❌ Failed to load sound: [error object]
Alert: "Sound file for Lion not found"
```

### ✅ Successful Sound Loading (After adding MP3s)
```
🔊 Original sound path: ar/sounds/lion.mp3
🔊 Cleaned sound path: sounds/lion.mp3
✅ Sound loaded successfully
Duration: 2.5 seconds
✅ Sound played successfully
```

## Common Issues

### Model appears but is too small/large
Adjust `scale` in vocabulary-data.json:
```json
"scale": [0.3, 0.3, 0.3]  // Smaller
"scale": [0.8, 0.8, 0.8]  // Larger
```

### Model appears underground
Adjust `position` Y value:
```json
"position": [0, 0.2, -1]  // Raise model up
```

### Model doesn't rotate
Check ViroReact animation registration in ARModelViewer.tsx (already fixed).

### Sound plays but is too quiet
Check device volume and adjust in vocabulary-data.json settings:
```json
"audioSettings": {
  "volume": 1.0  // Increase from 0.8
}
```

## Next Steps

1. **Add MP3 sound files** to `android/app/src/main/assets/sounds/`
2. **Rebuild app**: `npm run android`
3. **Test AR placement** - tap surfaces to place models
4. **Test sound playback** - tap model or Repeat button
5. **Adjust scales/positions** in vocabulary-data.json if needed

## Need More Models?

Your current vocabulary-data.json references models that don't exist:
- `elephant.obj` → Use `cyberphant.glb` instead
- `sphere.obj` (for colors) → Create simple colored spheres or use placeholder

Consider updating vocabulary data to match your available GLB models!
