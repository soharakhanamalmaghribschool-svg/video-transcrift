
import React from 'react';
import { SubtitleSegment } from '../types';

interface SubtitleOverlayProps {
  segments: SubtitleSegment[];
  currentTime: number;
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ segments, currentTime }) => {
  const activeSegment = segments.find(
    (s) => currentTime >= s.startTime && currentTime <= s.endTime
  );

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 min-h-[100px] flex items-center justify-center text-center p-6 bg-slate-800/50 rounded-xl border border-slate-700 backdrop-blur-sm">
      <p className="text-2xl md:text-3xl font-medium text-white transition-opacity duration-300">
        {activeSegment ? activeSegment.text : (
            <span className="text-slate-500 italic text-xl">Waiting for playback...</span>
        )}
      </p>
    </div>
  );
};

export default SubtitleOverlay;
