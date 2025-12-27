
import React, { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  url: string;
  onTimeUpdate: (time: number) => void;
  onLoadedMetadata: (duration: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onTimeUpdate, onLoadedMetadata }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      onLoadedMetadata(videoRef.current.duration);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video group">
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        controls
      />
    </div>
  );
};

export default VideoPlayer;
