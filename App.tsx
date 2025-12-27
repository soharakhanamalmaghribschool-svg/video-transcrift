import React, { useState, useEffect } from 'react';
import { AppState } from './types';
import VideoPlayer from './components/VideoPlayer';
import SubtitleOverlay from './components/SubtitleOverlay';
import AnalysisPanel from './components/AnalysisPanel';
import { processTranscriptWithAI } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    videoUrl: null,
    videoDuration: 0,
    transcript: '',
    currentTime: 0,
    isProcessing: false,
    segments: [],
    error: null,
  });

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (state.videoUrl) {
        URL.revokeObjectURL(state.videoUrl);
      }
    };
  }, [state.videoUrl]);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up the previous URL if it exists
      if (state.videoUrl) {
        URL.revokeObjectURL(state.videoUrl);
      }
      const url = URL.createObjectURL(file);
      setState(prev => ({ ...prev, videoUrl: url, segments: [], error: null }));
    }
  };

  const handleTranscriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({ ...prev, transcript: e.target.value }));
  };

  const handleTimeUpdate = (time: number) => {
    setState(prev => ({ ...prev, currentTime: time }));
  };

  const handleMetadataLoaded = (duration: number) => {
    setState(prev => ({ ...prev, videoDuration: duration }));
  };

  const handleProcess = async () => {
    if (!state.transcript.trim()) {
      setState(prev => ({ ...prev, error: "Please paste a transcript first." }));
      return;
    }
    if (state.videoDuration === 0) {
      setState(prev => ({ ...prev, error: "Please upload a video first." }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      const syncedSegments = await processTranscriptWithAI(state.transcript, state.videoDuration);
      setState(prev => ({ ...prev, segments: syncedSegments, isProcessing: false }));
      
      setTimeout(() => {
        document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, isProcessing: false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-500/30">
      {/* Section 1: Interactive Player (Top View) */}
      <section className="min-h-screen flex flex-col px-6 py-8 lg:px-20 bg-slate-950 relative overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

        <header className="relative z-10 flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-xl shadow-blue-900/40">
              <i className="fa-solid fa-wand-magic-sparkles text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">SyncSub <span className="text-blue-500">AI</span></h1>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl cursor-pointer transition-all border border-slate-800 shadow-xl group">
              <i className="fa-solid fa-file-video group-hover:text-blue-400 transition-colors"></i>
              <span className="font-semibold text-sm">Upload Video</span>
              <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
            </label>
            <button
              onClick={handleProcess}
              disabled={state.isProcessing}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
            >
              {state.isProcessing ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-bolt"></i>
                  <span>Sync Transcript</span>
                </>
              )}
            </button>
          </div>
        </header>

        {state.error && (
          <div className="relative z-10 max-w-4xl mx-auto w-full mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation"></i>
            <p className="font-medium text-sm">{state.error}</p>
          </div>
        )}

        <div className="relative z-10 flex-1 flex flex-col items-center gap-8 max-w-5xl mx-auto w-full">
          <div className="w-full relative rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] bg-black border border-slate-800">
            {state.videoUrl ? (
              <VideoPlayer
                url={state.videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleMetadataLoaded}
              />
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center text-slate-600 bg-slate-900/40">
                <i className="fa-solid fa-clapperboard text-6xl mb-6 opacity-20"></i>
                <p className="text-lg font-medium">Upload a video to begin</p>
              </div>
            )}
          </div>

          {/* Dynamic Subtitle Overlay */}
          <SubtitleOverlay segments={state.segments} currentTime={state.currentTime} />

          {/* Transcript Input Box */}
          <div className="w-full">
            <div className="flex items-center gap-2 mb-3 ml-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  Transcript Source
                </label>
            </div>
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
                <textarea
                  className="relative w-full h-40 bg-blue-950/20 border-2 border-blue-500/20 focus:border-blue-500/60 outline-none p-5 rounded-2xl text-blue-50 placeholder-blue-900/40 resize-none transition-all shadow-2xl backdrop-blur-sm scrollbar-thin"
                  placeholder="Paste your transcript text here..."
                  value={state.transcript}
                  onChange={handleTranscriptChange}
                ></textarea>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex justify-center mt-12 pb-4">
          <button 
            onClick={() => document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex flex-col items-center gap-2 text-slate-600 hover:text-blue-400 transition-all group"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">AI Timeline Breakdown</span>
            <i className="fa-solid fa-chevron-down text-xl animate-bounce"></i>
          </button>
        </div>
      </section>

      {/* Section 2: AI Analysis (Scrollable Bottom View) */}
      <section id="analysis-section" className="min-h-screen bg-[#020617] px-6 py-20 lg:px-20 border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                  <i className="fa-solid fa-microchip text-white text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white tracking-tight">Sync Mapping</h2>
                  <p className="text-slate-500 mt-1 font-medium">Logical segments generated by AI based on video timing.</p>
                </div>
            </div>
          </div>

          <AnalysisPanel
            segments={state.segments}
            currentTime={state.currentTime}
            isProcessing={state.isProcessing}
          />
        </div>
      </section>
    </div>
  );
};

export default App;