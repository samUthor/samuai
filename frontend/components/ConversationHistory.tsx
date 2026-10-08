import React, { useEffect, useRef } from 'react';
import { User, Volume2, Package, RotateCcw, Shield, Terminal, Cpu } from 'lucide-react';
import { ChatMessage, AgentState } from '../types';

interface ConversationHistoryProps {
  messages: ChatMessage[];
  interimTranscript: string;
  agentState: AgentState;
  onSelectPrompt: (prompt: string) => void;
  onReplayAudio: (text: string) => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  messages,
  interimTranscript,
  agentState,
  onSelectPrompt,
  onReplayAudio
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, interimTranscript, agentState]);

  return (
    <div className="flex flex-col h-full bg-[#08090d]/90 backdrop-blur-xl border border-[#171923] rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-[#171923] flex items-center justify-between bg-[#171923]/40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#e11d48]/20 border border-[#e11d48]/40 flex items-center justify-center text-[#e11d48] font-bold text-xs">
            侍
          </div>
          <div>
            <h2 className="font-cinzel text-xs font-bold text-[#f8fafc] tracking-wider">
              OPERATIONAL DISCOURSE
            </h2>
          </div>
        </div>

        {/* Turn Floor Badge */}
        <div className="text-[10px] font-mono flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#08090d] border border-[#171923]">
          {agentState === AgentState.LISTENING && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-ping" />
              <span className="text-[#d97706]">Receiving Input</span>
            </>
          )}
          {agentState === AgentState.THINKING && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse" />
              <span className="text-slate-300">Processing</span>
            </>
          )}
          {agentState === AgentState.SPEAKING && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48] animate-pulse" />
              <span className="text-[#e11d48]">Delivering Analysis</span>
            </>
          )}
          {agentState === AgentState.IDLE && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <span className="text-slate-400">Standby</span>
            </>
          )}
          {agentState === AgentState.ERROR && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48]" />
              <span className="text-[#e11d48]">Channel Interrupted</span>
            </>
          )}
        </div>
      </div>

      {/* Professional Direct Inquiry Vectors */}
      <div className="px-3.5 py-2.5 bg-[#08090d]/60 border-b border-[#171923]">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1.5">
          <Terminal className="w-3 h-3 text-[#d97706]" /> Direct Inquiry Vectors:
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onSelectPrompt('Provide shipment telemetry and status for Order 9024')}
            className="text-[11px] bg-[#171923] hover:bg-[#272a38] text-slate-300 hover:text-[#d97706] border border-[#272a38] px-2.5 py-1 rounded-lg transition flex items-center gap-1"
          >
            <Package className="w-3 h-3 text-[#d97706]" /> Order 9024 Status
          </button>
          <button
            onClick={() => onSelectPrompt('Authorize return protocol for headphones from Order 9024')}
            className="text-[11px] bg-[#171923] hover:bg-[#272a38] text-slate-300 hover:text-[#e11d48] border border-[#272a38] px-2.5 py-1 rounded-lg transition flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3 text-[#e11d48]" /> Return Protocol
          </button>
          <button
            onClick={() => onSelectPrompt('Analyze strategic optimization for conflicting resource constraints')}
            className="text-[11px] bg-[#171923] hover:bg-[#272a38] text-slate-300 hover:text-[#f8fafc] border border-[#272a38] px-2.5 py-1 rounded-lg transition flex items-center gap-1"
          >
            <Cpu className="w-3 h-3 text-[#d97706]" /> Strategy Analysis
          </button>
          <button
            onClick={() => onSelectPrompt('State the core parameters of critical dispute resolution')}
            className="text-[11px] bg-[#171923] hover:bg-[#272a38] text-slate-300 hover:text-[#d97706] border border-[#272a38] px-2.5 py-1 rounded-lg transition flex items-center gap-1"
          >
            <Shield className="w-3 h-3 text-[#d97706]" /> Dispute Protocol
          </button>
        </div>
      </div>

      {/* Message List */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs"
      >
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isAgent ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-[11px] font-bold ${
                  isAgent
                    ? 'bg-gradient-to-b from-[#e11d48] to-[#9f1239] text-[#f8fafc] border border-[#d97706]/50'
                    : 'bg-[#171923] text-[#d97706] border border-[#272a38]'
                }`}
              >
                {isAgent ? '侍' : <User className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group max-w-[86%] rounded-xl p-3 leading-relaxed text-xs shadow-md ${
                  isAgent
                    ? 'bg-[#171923]/90 text-[#f8fafc] border border-[#272a38] rounded-tl-sm'
                    : 'bg-[#e11d48] text-[#f8fafc] rounded-tr-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className={`text-[10px] font-cinzel font-semibold tracking-wider ${isAgent ? 'text-[#d97706]' : 'text-[#f8fafc]/80'}`}>
                    {isAgent ? 'SAMUAI' : 'DIRECTIVE'}
                  </span>
                  <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                </div>

                <p className="whitespace-pre-wrap">{msg.text}</p>

                {isAgent && (
                  <button
                    onClick={() => onReplayAudio(msg.text)}
                    title="Repeat Audio Output"
                    className="mt-2 text-[10px] flex items-center gap-1 text-slate-400 hover:text-[#d97706] transition"
                  >
                    <Volume2 className="w-3 h-3 text-[#d97706]" />
                    <span>Replay Audio</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Interim Transcript */}
        {interimTranscript && (
          <div className="flex gap-2.5 items-start flex-row-reverse animate-pulse">
            <div className="w-6 h-6 rounded-md bg-[#d97706] text-[#08090d] font-bold flex items-center justify-center text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="max-w-[86%] rounded-xl p-3 bg-[#171923] border border-[#d97706]/40 text-[#f8fafc] rounded-tr-sm">
              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#d97706] font-cinzel font-bold">
                <span>INCOMING TRANSMISSION</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-ping" />
              </div>
              <p className="italic text-slate-300">{interimTranscript}</p>
            </div>
          </div>
        )}

        {/* Thinking Indicator */}
        {agentState === AgentState.THINKING && (
          <div className="flex gap-2.5 items-start">
            <div className="w-6 h-6 rounded-md bg-[#e11d48] text-[#f8fafc] flex items-center justify-center text-xs font-bold">
              侍
            </div>
            <div className="rounded-xl p-3 bg-[#171923] border border-[#272a38] text-slate-300 text-xs flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="font-cinzel text-[11px] text-[#d97706]">Synthesizing technical resolution</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
