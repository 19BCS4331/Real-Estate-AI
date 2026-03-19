
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
