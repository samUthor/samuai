import React, { useState, useRef, useEffect } from 'react';
import { GripHorizontal, Minus, X, Maximize2, User, Volume2, Sparkles, UploadCloud } from 'lucide-react';
import { ChatMessage, AgentState } from '../types';

interface DraggableWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  interimTranscript: string;
  agentState: AgentState;
  onSelectPrompt: (prompt: string) => void;
  onReplayAudio: (text: string) => void;
  onFileDropText: (content: string, fileName: string) => void;
}

export const DraggableWindow: React.FC<DraggableWindowProps> = ({
  isOpen,
  onClose,
  messages,
  interimTranscript,
  agentState,
  onSelectPrompt,
  onReplayAudio,
  onFileDropText
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const initX = Math.max(20, window.innerWidth - 420);
      const initY = 80;
      return { x: initX, y: initY };
    }
    return { x: 50, y: 80 };
  });

  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDragOverFile, setIsDragOverFile] = useState<boolean>(false);

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, interimTranscript, agentState, isMinimized]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;

    const windowWidth = isMinimized ? 260 : 380;
    const windowHeight = isMinimized ? 52 : 460;

    const maxX = Math.max(10, window.innerWidth - windowWidth - 10);
    const maxY = Math.max(10, window.innerHeight - windowHeight - 10);

    const nextX = Math.min(Math.max(10, dragStartRef.current.startX + deltaX), maxX);
    const nextY = Math.min(Math.max(70, dragStartRef.current.startY + deltaY), maxY);

    setPosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          onFileDropText(text.slice(0, 1500), file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 40
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOverFile(true);
      }}
      onDragLeave={() => setIsDragOverFile(false)}
      onDrop={handleFileDrop}
      className={`transition-shadow duration-150 select-none ${
        isMinimized ? 'w-64' : 'w-[90vw] sm:w-[380px] md:w-[400px]'
      }`}
    >
      <div
        className={`rounded-2xl border backdrop-blur-xl transition-all ${
          isDragging
            ? 'border-[#d97706] ring-2 ring-[#d97706]/30 shadow-2xl shadow-[#d97706]/20 bg-[#08090d]/95'
            : isDragOverFile
            ? 'border-[#e11d48] ring-2 ring-[#e11d48]/40 bg-[#08090d]/95'
            : 'border-[#171923] bg-[#08090d]/90 shadow-2xl'
        }`}
      >
        {/* Header Bar with Grab Handle */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="h-12 px-3.5 border-b border-[#171923] flex items-center justify-between cursor-grab active:cursor-grabbing bg-[#171923]/60 rounded-t-2xl"
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-slate-500 hover:text-[#d97706] transition" />
            <div className="w-5 h-5 rounded bg-[#e11d48]/20 border border-[#e11d48]/40 flex items-center justify-center text-[#e11d48] font-bold text-[10px]">
              侍
            </div>
            <span className="font-cinzel text-xs font-bold text-[#f8fafc] tracking-wider truncate">
              {isMinimized ? 'CHAT DOCKED' : 'SAMURAI CHAT'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Expand window' : 'Minimize window'}
              className="p-1 rounded-md text-slate-400 hover:text-[#f8fafc] hover:bg-[#272a38] transition"
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              title="Close window"
              className="p-1 rounded-md text-slate-400 hover:text-[#e11d48] hover:bg-[#272a38] transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Window Body (Hidden when Minimized) */}
        {!isMinimized && (
          <div className="flex flex-col h-[420px]">
            {/* Friendly prompt starters with zero dashes */}
            <div className="px-3.5 py-2 bg-[#08090d]/60 border-b border-[#171923] flex flex-wrap gap-1.5">
              <button
                onClick={() => onSelectPrompt('Tell me the tale of Order 9024')}
                className="text-[10px] bg-[#171923] hover:bg-[#272a38] text-slate-300 hover:text-[#d97706] border border-[#272a38] px-2.5 py-1 rounded-md transition"
              >
                Check Order 9024
              </button>
              <button
                onClick={() => onSelectPrompt('Can you help me return those headphones')}
                className="text-[10px] bg-[#171923] hover:bg-[#272a38] text-slate-300 hover:text-[#e11d48] border border-[#272a38] px-2.5 py-1 rounded-md transition"
              >
                Return Headphones
              </button>
              <button
                onClick={() => onSelectPrompt('Give me a funny piece of samurai wisdom for a stressful day')}
                className="text-[10px] bg-[#171923] hover:bg-[#272a38] text-slate-300 hover:text-[#f8fafc] border border-[#272a38] px-2.5 py-1 rounded-md transition flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5 text-[#d97706]" /> Samurai Humor
              </button>
            </div>

            {/* Scrollable Conversation History */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs select-text"
            >
              {messages.map((msg) => {
                const isAgent = msg.sender === 'agent';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isAgent ? 'items-start' : 'items-start flex-row-reverse'}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                        isAgent
                          ? 'bg-gradient-to-b from-[#e11d48] to-[#9f1239] text-[#f8fafc] border border-[#d97706]/40'
                          : 'bg-[#171923] text-[#d97706] border border-[#272a38]'
                      }`}
                    >
                      {isAgent ? '侍' : <User className="w-3 h-3" />}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-xl p-3 leading-relaxed text-xs shadow-md ${
                        isAgent
                          ? 'bg-[#171923]/90 text-[#f8fafc] border border-[#272a38] rounded-tl-sm'
                          : 'bg-[#e11d48] text-[#f8fafc] rounded-tr-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className={`text-[10px] font-cinzel font-semibold tracking-wider ${isAgent ? 'text-[#d97706]' : 'text-[#f8fafc]/80'}`}>
                          {isAgent ? 'SAMUAI' : 'YOU'}
                        </span>
                        <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                      </div>

                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {isAgent && (
                        <button
                          onClick={() => onReplayAudio(msg.text)}
                          title="Repeat Audio Output"
                          className="mt-1.5 text-[10px] flex items-center gap-1 text-slate-400 hover:text-[#d97706] transition"
                        >
                          <Volume2 className="w-3 h-3 text-[#d97706]" />
                          <span>Say it again</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Interim voice transcript preview */}
              {interimTranscript && (
                <div className="flex gap-2.5 items-start flex-row-reverse animate-pulse">
                  <div className="w-6 h-6 rounded-md bg-[#d97706] text-[#08090d] font-bold flex items-center justify-center text-xs">
                    <User className="w-3 h-3" />
                  </div>
                  <div className="max-w-[85%] rounded-xl p-3 bg-[#171923] border border-[#d97706]/40 text-[#f8fafc] rounded-tr-sm">
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#d97706] font-cinzel font-bold">
                      <span>HEARING YOU CLEARLY</span>
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
                  <div className="rounded-xl p-2.5 bg-[#171923] border border-[#272a38] text-slate-300 text-xs flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="font-cinzel text-[10px] text-[#d97706]">Sharpening a witty answer</span>
                  </div>
                </div>
              )}
            </div>

            {/* Drag & Drop File Zone Footer */}
            <div className="px-3.5 py-2 border-t border-[#171923] bg-[#08090d]/80 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UploadCloud className="w-3 h-3 text-[#d97706]" />
                <span>Drop text or order manifest here to inspect</span>
              </span>
              <span className="text-[9px] text-slate-500 font-mono">DRAG BAR TO MOVE</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
