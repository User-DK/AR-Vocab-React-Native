# PowerShell script to replace Expo imports with React Native alternatives

# Get all TypeScript files in src directory
$files = Get-ChildItem -Path "src\" -Recurse -Filter "*.tsx"

foreach ($file in $files) {
    Write-Host "Processing: $($file.FullName)"
    
    $content = Get-Content $file.FullName -Raw
    
    # Replace LinearGradient import
    $content = $content -replace "import \{ LinearGradient \} from 'expo-linear-gradient';", "import LinearGradient from 'react-native-linear-gradient';"
    $content = $content -replace 'import \{ LinearGradient \} from "expo-linear-gradient";', 'import LinearGradient from "react-native-linear-gradient";'
    
    # Replace Ionicons import
    $content = $content -replace "import \{ Ionicons \} from '@expo/vector-icons';", "import Icon from 'react-native-vector-icons/Ionicons';"
    $content = $content -replace 'import \{ Ionicons \} from "@expo/vector-icons";', 'import Icon from "react-native-vector-icons/Ionicons";'
    
    # Replace component usage
    $content = $content -replace "<Ionicons", "<Icon"
    $content = $content -replace "</Ionicons>", "</Icon>"
    
    # Write back to file
    Set-Content -Path $file.FullName -Value $content
}

Write-Host "All files updated!"