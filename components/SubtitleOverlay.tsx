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

  // Calculate progress within the current segment for the visual bar
  const progress = activeSegment 
    ? ((currentTime - activeSegment.startTime) / (activeSegment.endTime - activeSegment.startTime)) * 100 
    : 0;

  // Dynamically adjust font size for "Big Sentences"
  const getFontSize = (text: string) => {
    if (text.length > 100) return 'text-xl md:text-2xl';
    if (text.length > 50) return 'text-2xl md:text-3xl';
    return 'text-3xl md:text-4xl';
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 relative group">
      <div className="min-h-[140px] flex flex-col items-center justify-center text-center p-8 bg-slate-900/80 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl transition-all duration-500 overflow-hidden">
        {activeSegment ? (
          <>
            <p className={`${getFontSize(activeSegment.text)} font-bold text-white leading-tight drop-shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              {activeSegment.text}
            </p>
            
            {/* Reading Progress Indicator */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/5">
              <div 
                className="h-full bg-blue-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 opacity-30">
            <i className="fa-solid fa-volume-low text-3xl text-slate-400"></i>
            <span className="text-slate-400 italic text-lg font-medium tracking-wide">
              {segments.length > 0 ? "Silent Moment or Gap..." : "Upload & Sync to start"}
            </span>
          </div>
        )}
      </div>
      
      {/* Visual Hint for Large Text */}
      {activeSegment && activeSegment.text.length > 80 && (
        <div className="absolute -top-3 right-4 px-2 py-0.5 bg-blue-600 rounded text-[10px] font-bold text-white uppercase tracking-tighter animate-pulse">
          Dense Segment
        </div>
      )}
    </div>
  );
};

export default SubtitleOverlay;