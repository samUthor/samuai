import React from 'react';
import { Mic, MicOff, Sliders, Trees } from 'lucide-react';
import { AgentState } from '../types';

interface SupportHeaderProps {
  agentState: AgentState;
  isListeningActive: boolean;
  isAmbientActive: boolean;
  onToggleMic: () => void;
  onToggleAmbient: () => void;
  onOpenVoiceModal: () => void;
}

export const SupportHeader: React.FC<SupportHeaderProps> = ({
  agentState,
  isListeningActive,
  isAmbientActive,
  onToggleMic,
  onToggleAmbient,
  onOpenVoiceModal
}) => {
  return (
    <header className="h-16 px-6 bg-transparent absolute top-0 left-0 right-0 flex items-center justify-between z-30 pointer-events-none">
      {/* Brand Identity: Pristine SAMUAI Monogram */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#e11d48] to-[#9f1239] flex items-center justify-center text-[#f8fafc] shadow-lg shadow-[#e11d48]/25 border border-[#d97706]/40 backdrop-blur-md">
            <span className="font-extrabold text-lg select-none font-cinzel">侍</span>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#d97706] border-2 border-[#08090d]" />
        </div>

        <div>
          <h1 className="font-cinzel font-bold text-xl tracking-widest text-[#f8fafc] flex items-center gap-1">
            SAMU<span className="text-[#e11d48]">AI</span>
          </h1>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        {/* Nature Ambience Toggle Button */}
        <button
          onClick={onToggleAmbient}
          title={isAmbientActive ? 'Mute Nature Ambience' : 'Activate Forest Stream and Temple Bells'}
          className={`px-3.5 py-2 rounded-xl text-xs font-cinzel font-semibold tracking-wider transition-all backdrop-blur-md border flex items-center gap-2 ${
            isAmbientActive
              ? 'bg-[#d97706]/20 border-[#d97706] text-[#d97706] shadow-lg shadow-[#d97706]/15'
              : 'bg-[#171923]/70 border-[#272a38] text-slate-300 hover:text-[#f8fafc] hover:border-[#d97706]/50'
          }`}
        >
          <Trees className={`w-3.5 h-3.5 ${isAmbientActive ? 'text-[#d97706] animate-pulse' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">{isAmbientActive ? 'NATURE ON' : 'NATURE OFF'}</span>
        </button>

        {/* Voice Calibration Button */}
        <button
          onClick={onOpenVoiceModal}
          title="Voice Calibration"
          className="px-3.5 py-2 rounded-xl text-xs font-cinzel font-semibold tracking-wider bg-[#171923]/70 hover:bg-[#272a38]/80 border border-[#272a38] hover:border-[#d97706]/50 text-slate-300 hover:text-[#f8fafc] transition-all backdrop-blur-md flex items-center gap-1.5"
        >
          <Sliders className="w-3.5 h-3.5 text-[#d97706]" />
          <span className="hidden sm:inline">VOICE</span>
        </button>

        {/* Master Microphone Button */}
        <button
          onClick={onToggleMic}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-cinzel font-bold text-xs tracking-wider shadow-lg transition-all backdrop-blur-md ${
            isListeningActive
              ? 'bg-[#e11d48] hover:bg-[#be123c] text-[#f8fafc] shadow-[#e11d48]/40 ring-2 ring-[#e11d48]/40'
              : 'bg-[#171923]/80 hover:bg-[#272a38] text-slate-200 border border-[#272a38] hover:border-[#d97706]/50'
          }`}
        >
          {isListeningActive ? (
            <>
              <Mic className="w-3.5 h-3.5 animate-pulse text-[#f8fafc]" />
              <span>LISTENING</span>
            </>
          ) : (
            <>
              <MicOff className="w-3.5 h-3.5 text-slate-400" />
              <span>TALK</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
