
import React, { useState, useCallback } from 'react';
import { AppState, SubtitleSegment } from './types';
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

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      // Auto scroll to analysis
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, isProcessing: false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1st Page View: Interactive Player */}
      <section className="min-h-screen flex flex-col px-4 py-8 md:px-8 lg:px-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <i className="fa-solid fa-closed-captioning text-white text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">SyncSub <span className="text-blue-500">AI</span></h1>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full cursor-pointer transition-all border border-slate-700 shadow-xl">
              <i className="fa-solid fa-cloud-arrow-up"></i>
              <span className="font-semibold">Upload Video</span>
              <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
            </label>
            <button
              onClick={handleProcess}
              disabled={state.isProcessing}
              className={`flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {state.isProcessing ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-sparkles"></i>
                  <span>Analyze & Sync</span>
                </>
              )}
            </button>
          </div>
        </header>

        {state.error && (
          <div className="max-w-4xl mx-auto w-full mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation"></i>
            <p>{state.error}</p>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          {state.videoUrl ? (
            <VideoPlayer
              url={state.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleMetadataLoaded}
            />
          ) : (
            <div className="w-full max-w-4xl aspect-video bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-500 gap-4">
              <i className="fa-solid fa-film text-6xl opacity-20"></i>
              <p className="text-xl">Upload a video to get started</p>
            </div>
          )}

          <SubtitleOverlay segments={state.segments} currentTime={state.currentTime} />

          {/* Transcript Input Box (Pest Transcript) */}
          <div className="w-full max-w-4xl mt-4">
            <label className="block text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3 ml-1">
              Transcript Raw Data Source
            </label>
            <textarea
              className="w-full h-40 bg-blue-900/10 border-2 border-blue-500/30 focus:border-blue-500 outline-none p-4 rounded-xl text-slate-200 placeholder-slate-600 resize-none transition-all shadow-inner"
              placeholder="Paste your long-form transcript here..."
              value={state.transcript}
              onChange={handleTranscriptChange}
            ></textarea>
          </div>
        </div>

        <div className="flex justify-center mt-12 mb-4 animate-bounce">
          <button 
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-chevron-down text-2xl"></i>
          </button>
        </div>
      </section>

      {/* 2nd Page View: AI Analysis */}
      <section className="min-h-screen bg-slate-950 p-8 md:p-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-10 border-b border-slate-800 pb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <i className="fa-solid fa-brain text-white text-xl"></i>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">AI Analysis & Processing</h2>
              <p className="text-slate-500 mt-1">Detailed breakdown of time-coded segments and synchronization logic.</p>
            </div>
          </div>

          <AnalysisPanel
            segments={state.segments}
            currentTime={state.currentTime}
            isProcessing={state.isProcessing}
          />

          <div className="mt-20 pt-10 border-t border-slate-900 text-center">
             <p className="text-slate-600 text-sm">
                Powered by Gemini 3 Flash & Advanced Timestamp Mapping Algorithms
             </p>
          </div>
        </div>
      </section>

      {/* Persistent CTA or Info */}
      <footer className="fixed bottom-6 right-6 z-50">
         {state.segments.length > 0 && !state.isProcessing && (
           <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Current Sync</span>
              <span className="text-blue-400 font-mono text-lg">{Math.floor(state.currentTime / 60)}:{Math.floor(state.currentTime % 60).toString().padStart(2, '0')}</span>
           </div>
         )}
      </footer>
    </div>
  );
};

export default App;
