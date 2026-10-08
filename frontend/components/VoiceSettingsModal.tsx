import React from 'react';
import { X, Sliders, Play, Check } from 'lucide-react';
import { VoiceConfig } from '../types';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableVoices: SpeechSynthesisVoice[];
  voiceConfig: VoiceConfig;
  onChangeConfig: (newConfig: Partial<VoiceConfig>) => void;
  onTestVoice: () => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  availableVoices,
  voiceConfig,
  onChangeConfig,
  onTestVoice
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#08090d]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#08090d] border border-[#272a38] rounded-2xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[#171923] flex items-center justify-between bg-[#171923]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d97706]/20 border border-[#d97706]/40 flex items-center justify-center text-[#d97706]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-sm text-[#f8fafc] tracking-wider">
                VOICE CALIBRATION
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-[#f8fafc] hover:bg-[#171923] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Voice selector */}
          <div>
            <label className="block text-[11px] font-cinzel font-bold text-slate-300 uppercase tracking-wider mb-2">
              Voice Persona
            </label>
            <div className="relative">
              <select
                value={voiceConfig.voiceURI}
                onChange={(e) => onChangeConfig({ voiceURI: e.target.value })}
                className="w-full bg-[#171923] border border-[#272a38] rounded-xl px-3.5 py-2.5 text-xs text-[#f8fafc] focus:outline-none focus:border-[#d97706] transition appearance-none cursor-pointer"
              >
                {availableVoices.length === 0 ? (
                  <option value="">Default System Voice</option>
                ) : (
                  availableVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang}) {voice.default ? 'Default' : ''}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#d97706]">
                ▼
              </div>
            </div>
          </div>

          {/* Rate (Speed) Slider - default calibrated to 1.75x */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-cinzel">
              <span className="font-semibold text-slate-300">Speech Rate</span>
              <span className="font-mono text-[#d97706] font-bold">{voiceConfig.rate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="2.0"
              step="0.05"
              value={voiceConfig.rate}
              onChange={(e) => onChangeConfig({ rate: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-[#171923] rounded-lg appearance-none cursor-pointer accent-[#e11d48]"
            />
          </div>

          {/* Pitch Slider - default calibrated to 0.75 */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-cinzel">
              <span className="font-semibold text-slate-300">Voice Pitch</span>
              <span className="font-mono text-[#d97706] font-bold">{voiceConfig.pitch.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={voiceConfig.pitch}
              onChange={(e) => onChangeConfig({ pitch: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-[#171923] rounded-lg appearance-none cursor-pointer accent-[#e11d48]"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-[#171923] flex items-center justify-between">
            <button
              onClick={onTestVoice}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#171923] hover:bg-[#272a38] text-xs font-semibold text-[#f8fafc] transition border border-[#272a38]"
            >
              <Play className="w-3.5 h-3.5 text-[#d97706] fill-[#d97706]" />
              <span>Test Audio</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-xs font-semibold text-[#f8fafc] transition shadow-md shadow-[#e11d48]/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
