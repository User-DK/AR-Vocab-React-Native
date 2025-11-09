# Vocabulary Data Field Guide

## Fields Used by AR Viewer

### ✅ Required & Used Fields

| Field | Type | Purpose | Example | Notes |
|-------|------|---------|---------|-------|
| `id` | string | Unique identifier | `"lion"` | Used for tracking |
| `word` | string | Display text | `"Lion"` | Shown in UI |
| `emoji` | string | Emoji icon | `"🦁"` | Fallback display |
| `pronunciation` | string | IPA notation | `"/ˈlaɪ.ən/"` | Shown in UI |
| `phonetic` | string | Readable pronunciation | `"LIE-uhn"` | Shown in UI |
| `modelPath` | string | 3D model location | `"ar/models/animals/lion.glb"` | **CRITICAL** - Must match actual file |
| `soundPath` | string | Audio file location | `"ar/sounds/lion.mp3"` | **CRITICAL** - Must match actual file |
| `textureColor` | string | OBJ fallback color | `"#fbbf24"` | Only used for OBJ files |
| `scale` | [number, number, number] | Model size | `[0.5, 0.5, 0.5]` | **IMPORTANT** - Controls model size in AR |
| `position` | [number, number, number] | Model placement | `[0, 0, 0]` | **SEE BELOW** |
| `rotation` | [number, number, number] | Model orientation | `[0, 0, 0]` | In degrees (X, Y, Z) |
| `difficulty` | string | Learning level | `"easy"` | Used for filtering |
| `description` | string | Info text | `"A large wild cat..."` | Shown in UI |

### ⚠️ Unused Fields (Metadata Only)

| Field | Status | Reason |
|-------|--------|--------|
| `animations` | ❌ Not used | ViroReact uses custom animation system, not model animations |

---

## Field Details

### Scale `[x, y, z]`

**What it does:** Controls how big the 3D model appears in AR

**Recommended values:**
- Small objects (fruits, toys): `[0.6, 0.6, 0.6]` to `[1.0, 1.0, 1.0]`
- Medium objects (animals): `[0.4, 0.4, 0.4]` to `[0.6, 0.6, 0.6]`
- Large objects (vehicles): `[0.3, 0.3, 0.3]` to `[0.5, 0.5, 0.5]`

**Tips:**
- Uniform scaling (same value for x, y, z) prevents distortion
- Start with `[0.5, 0.5, 0.5]` and adjust
- Too large: model won't fit in view
- Too small: hard to see details

### Position `[x, y, z]`

**What it does:** Offsets the model from the detected surface

**Coordinate system:**
- `x`: Left (-) / Right (+)
- `y`: Down (-) / Up (+)
- `z`: Forward (-) / Back (+)

**Recommended values for AR:**
```json
"position": [0, 0, 0]
```

**Why `[0, 0, 0]` is best:**
- Model appears exactly where user taps
- No unexpected offsets
- Natural placement on surfaces

**When to use non-zero values:**
- Floating effect: `[0, 0.2, 0]` (lifts model 0.2 units up)
- Centering tall models: `[0, -0.1, 0]` (lowers by 0.1 units)
- **Avoid negative Z** (moves toward camera, can clip)

### Rotation `[x, y, z]`

**What it does:** Rotates the model in degrees

**Values:**
- `x`: Pitch (forward/backward tilt)
- `y`: Yaw (left/right spin)
- `z`: Roll (rotate on axis)

**Recommended:**
```json
"rotation": [0, 0, 0]
```

**Common adjustments:**
- Face user: `[0, 180, 0]` (turn around)
- Tilt forward: `[15, 0, 0]`
- Auto-rotate is handled by ViroReact animations

### Animations `[]` (Metadata)

**Status:** ⚠️ Not implemented in current AR viewer

**Purpose:** Documents what animations the model file contains

**Current behavior:**
- All models get automatic rotation animation
- Custom animations defined in code, not from JSON

**Future enhancement:** Could be used to trigger specific model animations

---

## Validation Checklist

Before rebuilding the app, verify:

- [ ] All `modelPath` values point to existing GLB/OBJ files
- [ ] All `soundPath` values point to existing MP3 files
- [ ] File paths use format: `ar/models/...` or `ar/sounds/...`
- [ ] Scale values are between 0.1 and 2.0
- [ ] Position Y values are not too negative (avoid clipping)
- [ ] All required fields are present

## Common Mistakes

### ❌ Wrong: Absolute position values
```json
"position": [0, 0, -1.5]  // Model appears in front of surface
```

### ✅ Correct: Relative to surface
```json
"position": [0, 0, 0]     // Model appears on surface
```

### ❌ Wrong: Huge scale
```json
"scale": [5.0, 5.0, 5.0]  // Model too big to see
```

### ✅ Correct: Reasonable scale
```json
"scale": [0.5, 0.5, 0.5]  // Appropriate size for AR
```

### ❌ Wrong: File paths with "assets/" prefix
```json
"modelPath": "assets/ar/models/lion.glb"  // Won't work
```

### ✅ Correct: Relative to assets folder
```json
"modelPath": "ar/models/animals/lion.glb"  // Correct
```

---

## Recommended Position Values for AR

Update your vocabulary-data.json positions to:

```json
{
  "lion": {
    "position": [0, 0, 0],      // ✅ On surface
    "scale": [0.5, 0.5, 0.5]
  },
  "elephant": {
    "position": [0, 0, 0],      // ✅ On surface (was [0, 0, -1.5])
    "scale": [0.4, 0.4, 0.4]    // Slightly smaller
  },
  "car": {
    "position": [0, 0, 0],      // ✅ On surface (was [0, -0.3, -1.2])
    "scale": [0.4, 0.4, 0.4]
  }
}
```

**Why change from current values?**
- Current: Models offset from surface (confusing placement)
- Updated: Models appear exactly where user taps (intuitive)

---

## Quick Reference

**Perfect starting values for any new object:**
```json
{
  "scale": [0.5, 0.5, 0.5],
  "position": [0, 0, 0],
  "rotation": [0, 0, 0]
}
```

Then adjust scale based on visual testing:
- Too big? Reduce to [0.3, 0.3, 0.3]
- Too small? Increase to [0.7, 0.7, 0.7]
