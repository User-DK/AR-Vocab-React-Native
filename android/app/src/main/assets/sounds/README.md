# Sound Files Directory

This directory should contain MP3 audio files for vocabulary pronunciations.

## Required Sound Files

Based on your vocabulary data, you need these MP3 files:

### Animals
- `lion.mp3`
- `elephant.mp3`
- `monkey.mp3`
- `cat.mp3`
- `dog.mp3`

### Fruits
- `apple.mp3`
- `banana.mp3`
- `orange.mp3`

### Colors
- `red.mp3`
- `blue.mp3`
- `green.mp3`

### Vehicles
- `car.mp3`
- `airplane.mp3`

## How to Add Sound Files

1. **Option 1: Text-to-Speech Services**
   - Visit https://ttsmaker.com or https://www.naturalreaders.com
   - Type the word (e.g., "Lion")
   - Choose a child-friendly voice
   - Download as MP3
   - Rename to match the filename above (e.g., `lion.mp3`)

2. **Option 2: Record Your Own**
   - Use your phone's voice recorder
   - Say the word clearly
   - Convert to MP3 format
   - Transfer to this directory

3. **Option 3: Use Sound Libraries**
   - Freesound.org
   - Search for pronunciation recordings
   - Download and rename appropriately

## File Format Requirements

- **Format**: MP3 (preferred) or WAV
- **Sample Rate**: 44100 Hz recommended
- **Bit Rate**: 128 kbps or higher
- **Naming**: Lowercase, match the ID in vocabulary-data.json

## Testing

After adding sound files:
1. Rebuild the app: `npm run android`
2. Tap the model or "Repeat" button in the AR Learning screen
3. Check console for sound loading logs

## Current Status

⚠️ **No sound files present yet**

Please add the MP3 files listed above to enable audio functionality.
