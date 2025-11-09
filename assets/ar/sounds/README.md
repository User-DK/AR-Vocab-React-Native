# Audio Files for AR Vocabulary

## Audio File Requirements

### Format
- **Recommended**: MP3 or WAV
- **Sample Rate**: 44100 Hz (44.1 kHz)
- **Bit Rate**: 128 kbps or higher
- **Duration**: 1-3 seconds per word

### Naming Convention
Use the same name as in `vocabulary-data.json`:
- `lion.mp3`
- `elephant.mp3`
- `cat.mp3`
- etc.

## Where to Get Audio Files

### Option 1: Text-to-Speech (Free)
1. **Google Text-to-Speech**: https://cloud.google.com/text-to-speech
2. **Amazon Polly**: https://aws.amazon.com/polly/
3. **Online Tools**: 
   - https://ttsmaker.com/
   - https://www.naturalreaders.com/online/

### Option 2: Record Your Own
1. Use a smartphone voice recorder
2. Say each word clearly
3. Export as MP3
4. Keep files short (1-2 seconds)

### Option 3: Free Sound Libraries
- **Freesound**: https://freesound.org/
- **Zapsplat**: https://www.zapsplat.com/
- **BBC Sound Effects**: https://sound-effects.bbcrewind.co.uk/

## Creating Audio Files

### Using Online TTS (Easiest)

1. Go to https://ttsmaker.com/
2. Enter word (e.g., "Lion")
3. Select voice (English - US or UK)
4. Click "Convert to Speech"
5. Download as MP3
6. Rename to match your vocabulary data (e.g., `lion.mp3`)
7. Place in this folder

### Using Python (Automated)

```python
from gtts import gTTS
import os

words = ["lion", "elephant", "cat", "dog", "apple", "banana"]

for word in words:
    tts = gTTS(text=word, lang='en', slow=False)
    tts.save(f"{word}.mp3")
    print(f"Created {word}.mp3")
```

## After Adding Audio Files

1. **Copy to Android**:
   ```powershell
   .\copy-ar-assets.ps1
   ```

2. **Add to iOS** (in Xcode):
   - Right-click project → Add Files
   - Select `assets/ar/sounds` folder
   - Check "Create folder references"

3. **Rebuild app**:
   ```bash
   npm run android  # or npm run ios
   ```

## File List (Add These)

Based on your vocabulary data, you need:

### Animals
- [ ] lion.mp3
- [ ] elephant.mp3
- [ ] monkey.mp3
- [ ] cat.mp3
- [ ] dog.mp3

### Fruits
- [ ] apple.mp3
- [ ] banana.mp3
- [ ] orange.mp3

### Colors
- [ ] red.mp3
- [ ] blue.mp3
- [ ] green.mp3

### Vehicles
- [ ] car.mp3
- [ ] airplane.mp3

## Demo Sound

For testing, a simple beep sound is included. Replace with real pronunciations.

---

**Current Status**: 🔴 No audio files yet - Add MP3 files following naming convention above
