import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ThreeAgentCanvas } from './components/ThreeAgentCanvas';
import { SupportHeader } from './components/SupportHeader';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { AgentState, ChatMessage, VoiceConfig } from './types';
import { requestAgentResponse } from './services/geminiService';
import { ambientEngine } from './services/ambientAudioService';
import { Mic, MicOff, RefreshCw, AlertTriangle, Send } from 'lucide-react';

interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
  webkitAudioContext?: typeof AudioContext;
}

export default function App() {
  const [agentState, setAgentState] = useState<AgentState>(AgentState.IDLE);
  const [isMicEnabled, setIsMicEnabled] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [fallbackTextInput, setFallbackTextInput] = useState<string>('');
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  // Procedural nature ambience & 3D bell resonance trigger
  const [isAmbientActive, setIsAmbientActive] = useState<boolean>(false);
  const [bellResonanceTrigger, setBellResonanceTrigger] = useState<number>(0);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Set default voice configuration to 1.75x speed and 0.75 pitch
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
    voiceURI: '',
    rate: 1.75,
    pitch: 0.75,
    volume: 1.0
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'greeting turn',
      sender: 'agent',
      text: "Greetings! I am SamuAI, your friendly neighborhood samurai specialist. Ask me anything and I will slice right through the confusion with a smile.",
      timestamp: 'Just now'
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isAgentSpeakingRef = useRef<boolean>(false);
  const voiceConfigRef = useRef(voiceConfig);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    voiceConfigRef.current = voiceConfig;
  }, [voiceConfig]);

  useEffect(() => {
    ambientEngine.setBellPulseCallback(() => {
      setBellResonanceTrigger((prev) => prev + 1);
    });

    return () => {
      ambientEngine.stop();
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const populateVoices = () => {
        if (!synthRef.current) return;
        const voices = synthRef.current.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);

          if (!voiceConfigRef.current.voiceURI) {
            const preferred =
              voices.find(
                (v) =>
                  (v.name.includes('Natural') ||
                    v.name.includes('Google') ||
                    v.name.includes('Daniel') ||
                    v.name.includes('David') ||
                    v.name.includes('Guy')) &&
                  v.lang.startsWith('en')
              ) ||
              voices.find((v) => v.lang.startsWith('en')) ||
              voices[0];

            if (preferred) {
              setVoiceConfig((prev) => ({ ...prev, voiceURI: preferred.voiceURI }));
            }
          }
        }
      };

      populateVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = populateVoices;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      ambientEngine.stop();
    };
  }, []);

  const speakReply = useCallback((textToSpeak: string) => {
    if (!synthRef.current) {
      setAgentState(AgentState.IDLE);
      return;
    }

    synthRef.current.cancel();

    // Clean out all dashes and markdown punctuation
    const sanitizedText = textToSpeak
      .replace(/[\-—–_#`~[\]*]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(sanitizedText);
    utterance.rate = voiceConfigRef.current.rate;
    utterance.pitch = voiceConfigRef.current.pitch;
    utterance.volume = voiceConfigRef.current.volume;

    if (voiceConfigRef.current.voiceURI) {
      const selected = availableVoices.find((v) => v.voiceURI === voiceConfigRef.current.voiceURI);
      if (selected) {
        utterance.voice = selected;
      }
    }

    utterance.onstart = () => {
      isAgentSpeakingRef.current = true;
      setAgentState(AgentState.SPEAKING);
    };

    utterance.onend = () => {
      isAgentSpeakingRef.current = false;
      if (isMicEnabled) {
        setAgentState(AgentState.LISTENING);
        restartRecognitionSafe();
      } else {
        setAgentState(AgentState.IDLE);
      }
    };

    utterance.onerror = () => {
      isAgentSpeakingRef.current = false;
      if (isMicEnabled) {
        setAgentState(AgentState.LISTENING);
      } else {
        setAgentState(AgentState.IDLE);
      }
    };

    synthRef.current.speak(utterance);
  }, [availableVoices, isMicEnabled]);

  const processCustomerTurn = useCallback(async (userQuery: string) => {
    if (!userQuery.trim()) return;

    const cleanUserQuery = userQuery.replace(/[\-—–]/g, ' ').replace(/\s+/g, ' ').trim();

    const userMsg: ChatMessage = {
      id: `query ${Date.now()}`,
      sender: 'user',
      text: cleanUserQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInterimTranscript('');
    setAgentState(AgentState.THINKING);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    try {
      const agentReplyRaw = await requestAgentResponse(messages, cleanUserQuery);
      const agentReplyText = agentReplyRaw.replace(/[\-—–]/g, ' ').replace(/\s+/g, ' ').trim();

      const agentMsg: ChatMessage = {
        id: `resolution ${Date.now()}`,
        sender: 'agent',
        text: agentReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, agentMsg]);
      speakReply(agentReplyText);
    } catch (err: any) {
      console.error('Gemini execution error:', err);
      const fallbackReply = "Well that was an unexpected rogue ninja technique. Try asking me again and I will give it another honorable swing.";
      const errorMsg: ChatMessage = {
        id: `error ${Date.now()}`,
        sender: 'agent',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
      speakReply(fallbackReply);
    }
  }, [messages, speakReply]);

  const restartRecognitionSafe = useCallback(() => {
    if (!recognitionRef.current || !isMicEnabled || isAgentSpeakingRef.current) {
      return;
    }
    try {
      recognitionRef.current.start();
    } catch (e) {}
  }, [isMicEnabled]);

  const initializeAudioAnalyser = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const win = window as unknown as IWindow;
      const AudioCtx = win.AudioContext || win.webkitAudioContext;
      if (!AudioCtx) return false;

      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceNodeRef.current = source;

      setAnalyserNode(analyser);
      return true;
    } catch (err) {
      console.warn('Microphone access failed:', err);
      return false;
    }
  };

  const stopAudioAnalyser = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAnalyserNode(null);
  };

  const handleToggleAmbient = async () => {
    if (isAmbientActive) {
      ambientEngine.stop();
      setIsAmbientActive(false);
    } else {
      const started = await ambientEngine.start(audioContextRef.current || undefined);
      if (started) {
        setIsAmbientActive(true);
      }
    }
  };

  const initSpeechRecognition = useCallback(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setErrorMessage('Speech recognition is not available on this browser.');
      setAgentState(AgentState.ERROR);
      return false;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setErrorMessage(null);
        if (!isAgentSpeakingRef.current) {
          setAgentState(AgentState.LISTENING);
        }
      };

      recognition.onresult = (event: any) => {
        if (isAgentSpeakingRef.current) return;

        let interim = '';
        let finalTurn = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTurn += chunk;
          } else {
            interim += chunk;
          }
        }

        if (interim) {
          setInterimTranscript(interim.replace(/[\-—–]/g, ' '));
        }

        if (finalTurn && finalTurn.trim().length > 1) {
          setInterimTranscript('');
          processCustomerTurn(finalTurn.trim());
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Microphone access denied. Please grant permission.');
          setIsMicEnabled(false);
          stopAudioAnalyser();
          setAgentState(AgentState.ERROR);
        } else if (event.error === 'network') {
          setErrorMessage('Speech network error. Click retry.');
          setAgentState(AgentState.ERROR);
        }
      };

      recognition.onend = () => {
        if (isMicEnabled && !isAgentSpeakingRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
      return true;
    } catch (err: any) {
      setErrorMessage('Could not initialize speech recognition.');
      setAgentState(AgentState.ERROR);
      return false;
    }
  }, [isMicEnabled, processCustomerTurn]);

  const handleToggleMic = async () => {
    setErrorMessage(null);

    if (isMicEnabled) {
      setIsMicEnabled(false);
      setInterimTranscript('');
      stopAudioAnalyser();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (!isAgentSpeakingRef.current) {
        setAgentState(AgentState.IDLE);
      }
    } else {
      const analyserReady = await initializeAudioAnalyser();
      const ready = initSpeechRecognition();

      if (ready && recognitionRef.current) {
        setIsMicEnabled(true);
        try {
          recognitionRef.current.start();
          setAgentState(AgentState.LISTENING);
        } catch (err) {}
      } else if (!analyserReady) {
        setErrorMessage('Unable to activate microphone. Please check permissions.');
      }
    }
  };

  const handleRetryMic = () => {
    setErrorMessage(null);
    setIsMicEnabled(false);
    stopAudioAnalyser();
    setTimeout(() => {
      handleToggleMic();
    }, 200);
  };

  const handleFallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fallbackTextInput.trim()) return;
    const text = fallbackTextInput;
    setFallbackTextInput('');
    processCustomerTurn(text);
  };

  const handleTestVoicePreview = () => {
    speakReply("Sound check! My vocal cords are swift, deep, and ready for action.");
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#08090d] text-[#f8fafc] font-sans overflow-hidden select-none">
      {/* Sleek Top Bar with SAMUAI and Buttons only */}
      <SupportHeader
        agentState={agentState}
        isListeningActive={isMicEnabled && agentState === AgentState.LISTENING}
        isAmbientActive={isAmbientActive}
        onToggleMic={handleToggleMic}
        onToggleAmbient={handleToggleAmbient}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
      />

      {/* Error Banner if mic fails */}
      {errorMessage && (
        <div className="bg-[#e11d48]/90 border-b border-[#e11d48] px-4 py-2 text-xs text-[#f8fafc] flex items-center justify-between z-40 absolute top-16 left-0 right-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#f8fafc] flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={handleRetryMic}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#08090d] hover:bg-[#171923] text-[#d97706] font-semibold transition text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 3D Scene with Scenery Backgrounds and Dais Waves */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ThreeAgentCanvas
            agentState={agentState}
            analyserNode={analyserNode}
            ambientActive={isAmbientActive}
            bellResonanceTrigger={bellResonanceTrigger}
          />
        </div>

        {/* Minimal Dissolving Subtitles (Zero Windows or Card Boxes) */}
        {interimTranscript && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-xl w-[90%] text-center pointer-events-none z-20">
            <p className="text-base md:text-lg font-cinzel font-semibold text-[#d97706] tracking-wider drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              &ldquo;{interimTranscript}&rdquo;
            </p>
          </div>
        )}

        {/* Start Speaking Big Action on Initial Land */}
        {!isMicEnabled && agentState !== AgentState.ERROR && (
          <div className="absolute top-[54%] -translate-y-1/2 left-1/2 -translate-x-1/2 z-20">
            <button
              onClick={handleToggleMic}
              className="group flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#e11d48] via-[#be123c] to-[#9f1239] hover:from-[#be123c] hover:to-[#e11d48] text-[#f8fafc] font-cinzel font-bold text-sm tracking-widest shadow-2xl shadow-[#e11d48]/50 transition-all hover:scale-105 active:scale-95 border border-[#d97706]/40"
            >
              <Mic className="w-5 h-5 text-[#f8fafc] animate-bounce" />
              <span>TALK OUT LOUD</span>
            </button>
          </div>
        )}

        {/* Sleek Floating Input Pill at Bottom */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-xl z-20">
          <div className="p-1.5 bg-[#08090d]/85 backdrop-blur-xl border border-[#272a38] rounded-2xl shadow-2xl">
            <form onSubmit={handleFallbackSubmit} className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMic}
                title={isMicEnabled ? 'Mute' : 'Speak'}
                className={`p-2.5 rounded-xl border transition flex-shrink-0 ${
                  isMicEnabled
                    ? 'bg-[#e11d48] border-[#e11d48] text-[#f8fafc] shadow-lg shadow-[#e11d48]/25'
                    : 'bg-[#171923] border-[#272a38] text-slate-400 hover:text-[#f8fafc]'
                }`}
              >
                {isMicEnabled ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={fallbackTextInput}
                onChange={(e) => setFallbackTextInput(e.target.value)}
                placeholder={isMicEnabled ? "Listening to your voice..." : "Speak out loud or type..."}
                className="flex-1 bg-[#171923]/90 border border-[#272a38] rounded-xl px-4 py-2 text-xs text-[#f8fafc] placeholder-slate-500 focus:outline-none focus:border-[#d97706] transition"
              />

              <button
                type="submit"
                disabled={!fallbackTextInput.trim() || agentState === AgentState.THINKING}
                className="p-2.5 rounded-xl bg-[#e11d48] hover:bg-[#be123c] disabled:opacity-40 text-[#f8fafc] transition flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Voice Calibration Modal */}
      <VoiceSettingsModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        availableVoices={availableVoices}
        voiceConfig={voiceConfig}
        onChangeConfig={(newCfg) => setVoiceConfig((prev) => ({ ...prev, ...newCfg }))}
        onTestVoice={handleTestVoicePreview}
      />
    </div>
  );
}
