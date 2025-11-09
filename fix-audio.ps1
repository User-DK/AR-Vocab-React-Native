# Script to fix ARLearningScreen audio issues
param()

$filePath = "src\screens\ARLearningScreen.tsx"
$content = Get-Content $filePath -Raw

# Remove broken audio imports and state
$content = $content -replace 'import Sound from "react-native-sound";.*?import RNFS from "react-native-fs";', ''
$content = $content -replace 'const \[sound, setSound\] = useState<Sound \| null>\(null\);', ''
$content = $content -replace 'const \[isPlaying, setIsPlaying\] = useState\(false\);', ''

# Replace the broken playSound function with a simple stub
$content = $content -replace '(?s)const playSound = async \(\) => \{.*?\};', @'
  const playSound = async () => {
    // TODO: Implement audio playback with react-native-sound
    console.log('Playing sound for:', currentItem?.name);
    triggerSparkle();
  };
'@

# Remove the broken useEffect
$content = $content -replace '(?s)useEffect\(\(\) => \{.*?return.*?\}, \[\]\);', ''

Set-Content -Path $filePath -Value $content
Write-Host "Fixed ARLearningScreen.tsx"