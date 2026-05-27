import React, { useEffect, useRef } from 'react';
import { Phone, Video, X, Check, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IncomingCallPopupProps {
  call: { from: string; type: 'audio' | 'video' } | null;
  onAccept: () => void;
  onDecline: () => void;
  autoAnswer?: boolean;
}

export function IncomingCallPopup({ call, onAccept, onDecline, autoAnswer }: IncomingCallPopupProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (call) {
      // Play a ringtone sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = audioCtx;

        const playTone = () => {
          const osc1 = audioCtx.createOscillator();
          const osc2 = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc1.type = 'sine';
          osc2.type = 'triangle';
          
          // Different frequencies for audio vs video
          const baseFreq = call.type === 'video' ? 440 : 330;
          osc1.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
          osc2.frequency.setValueAtTime(baseFreq * 1.5, audioCtx.currentTime);

          gain.gain.setValueAtTime(0, audioCtx.currentTime);
          gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(audioCtx.destination);

          osc1.start();
          osc2.start();
          osc1.stop(audioCtx.currentTime + 1.5);
          osc2.stop(audioCtx.currentTime + 1.5);
        };

        const interval = setInterval(playTone, 2000);
        playTone(); // Start immediately

        return () => {
          clearInterval(interval);
          if (audioCtx.state !== 'closed') {
            audioCtx.close();
          }
        };
      } catch (e) {
        console.error(`Failed to play ringtone: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }, [call]);

  return (
    <AnimatePresence>
      {call && (
        <>
          {/* Full Screen Flashing Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[90] flex items-center justify-center ${
              call.type === 'video' 
                ? 'bg-green-600' 
                : 'bg-yellow-500'
            } animate-pulse-fast backdrop-blur-md`}
          />

          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 sm:top-12 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md bg-slate-900 border border-slate-700/50 rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center space-y-6"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "easeInOut"
                }}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg ${
                  call.type === 'video' 
                    ? 'bg-green-500 shadow-green-500/40' 
                    : 'bg-yellow-500 shadow-yellow-500/40'
                }`}
              >
                {call.type === 'video' ? <Video size={48} /> : <Phone size={48} />}
              </motion.div>
              <motion.div 
                animate={{ 
                  scale: [1, 1.8, 1], 
                  opacity: [0.6, 0, 0.6] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5 
                }}
                className={`absolute -inset-4 rounded-full -z-10 ${
                  call.type === 'video' ? 'bg-green-500/30' : 'bg-yellow-500/30'
                }`}
              />
              <motion.div 
                animate={{ 
                  scale: [1, 2.5, 1], 
                  opacity: [0.3, 0, 0.3] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  delay: 0.5
                }}
                className={`absolute -inset-8 rounded-full -z-20 ${
                  call.type === 'video' ? 'bg-green-500/10' : 'bg-yellow-500/10'
                }`}
              />
            </div>

            <div className="text-center">
              <div className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3 ${
                call.type === 'video' ? 'bg-green-500 text-green-950' : 'bg-yellow-500 text-yellow-950'
              }`}>
                {call.type === 'video' ? 'Chamada de Vídeo' : 'Chamada de Áudio'}
              </div>
              <h3 className="text-3xl font-black text-white mb-2 leading-tight">CHAMADA RECEBIDA</h3>
              <p className="text-slate-400 font-medium flex items-center justify-center">
                <Bell size={18} className={`mr-2 ${call.type === 'video' ? 'text-green-500 shadow-glow' : 'text-yellow-500 shadow-glow'}`} />
                <span>
                  {autoAnswer ? (
                    <span className="text-blue-400 animate-pulse font-bold">Atendendo automaticamente em 2s...</span>
                  ) : (
                    'Ouvindo dispositivo da rede...'
                  )}
                </span>
              </p>
            </div>

            <div className="flex w-full space-x-4 pt-4">
              <button
                onClick={() => onDecline()}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-4 rounded-2xl font-black flex items-center justify-center space-x-2 transition-all border border-red-500/20 active:scale-95"
              >
                <X size={24} />
                <span>RECUSAR</span>
              </button>
              <button
                onClick={() => onAccept()}
                className={`flex-1 ${
                  call.type === 'video' ? 'bg-green-500 hover:bg-green-400' : 'bg-yellow-500 hover:bg-yellow-400'
                } text-slate-900 py-4 rounded-2xl font-black flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-95`}
              >
                <Check size={24} />
                <span>ATENDER</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
