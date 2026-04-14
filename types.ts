
export interface Transcript {
  id: number;
  speaker: 'user' | 'ai';
  text: string;
}

export interface UseCase {
  id: string;
  title: string;
  promptDescription: string;
}

export interface Language {
  id: string;
  name: string;
  promptInstruction: string;
}

export interface ConversationRecord {
  id: number;
  timestamp: string;
  transcripts: Transcript[];
  summary: string;
}

export interface Property {
  id: string;
  title: string;
  type: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  description: string;
  amenities: string[];
  builder: string;
  possession: string;
}
