
export interface SubtitleSegment {
  id: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  text: string;
}

export interface SyncResult {
  segments: SubtitleSegment[];
}

export interface AppState {
  videoUrl: string | null;
  videoDuration: number;
  transcript: string;
  currentTime: number;
  isProcessing: boolean;
  segments: SubtitleSegment[];
  error: string | null;
}
