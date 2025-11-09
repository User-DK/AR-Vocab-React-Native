// AR Vocabulary Types
export interface VocabularyItem {
  id: string;
  word: string;
  emoji: string;
  pronunciation: string;
  phonetic: string;
  modelPath: string;
  soundPath: string;
  textureColor: string;
  scale: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  animations: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
}

export interface VocabularyCategory {
  id: string;
  name: string;
  emoji: string;
  color: [string, string];
  description: string;
  items: VocabularyItem[];
}

export interface ARSettings {
  planeDetection: boolean;
  lightEstimation: boolean;
  worldAlignment: string;
  sessionConfiguration: string;
}

export interface AudioSettings {
  autoPlay: boolean;
  loop: boolean;
  volume: number;
}

export interface ModelSettings {
  defaultScale: [number, number, number];
  defaultPosition: [number, number, number];
  autoRotate: boolean;
  shadowEnabled: boolean;
}

export interface VocabularyData {
  categories: VocabularyCategory[];
  settings: {
    arSettings: ARSettings;
    audioSettings: AudioSettings;
    modelSettings: ModelSettings;
  };
}

// AR Component Props
export interface ARViewProps {
  item: VocabularyItem;
  onItemLoaded?: () => void;
  onItemTapped?: () => void;
  onSoundComplete?: () => void;
}

// Speech Assessment Types
export interface SpeechResult {
  accuracy: number;
  pronunciation: number;
  fluency: number;
  completeness: number;
  feedback: string;
  suggestions: string[];
}

export interface AssessmentSession {
  itemId: string;
  attempts: number;
  bestScore: number;
  timestamp: number;
  results: SpeechResult[];
}