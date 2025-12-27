
import React from 'react';
import { SubtitleSegment } from '../types';

interface AnalysisPanelProps {
  segments: SubtitleSegment[];
  currentTime: number;
  isProcessing: boolean;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ segments, currentTime, isProcessing }) => {
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-lg">AI is analyzing and syncing your transcript...</p>
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl">
        <i className="fa-solid fa-wand-magic-sparkles text-4xl mb-4 opacity-30"></i>
        <p>Paste a transcript and process it to see the AI analysis breakdown.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {segments.map((segment) => {
        const isActive = currentTime >= segment.startTime && currentTime <= segment.endTime;
        return (
          <div
            key={segment.id}
            className={`p-4 rounded-xl border transition-all duration-300 ${
              isActive
                ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)] scale-[1.02]'
                : 'bg-slate-800/40 border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                {formatTime(segment.startTime)} — {formatTime(segment.endTime)}
              </span>
              {isActive && (
                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              )}
            </div>
            <p className={`text-sm leading-relaxed ${isActive ? 'text-white font-medium' : 'text-slate-300'}`}>
              {segment.text}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default AnalysisPanel;
