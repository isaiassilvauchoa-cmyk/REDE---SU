import React, { useState, useEffect, useRef } from 'react';
import { AlarmLevel } from '../types';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { playAlarmSound } from '../lib/audio';

interface AlarmOverlayProps {
  alarm: { level: AlarmLevel; sound: boolean; message?: string } | null;
  onClear: () => void;
}

export function AlarmOverlay({ alarm, onClear }: AlarmOverlayProps) {
  const [resolution, setResolution] = useState('');
  const [accepted, setAccepted] = useState(false);
  const soundIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (alarm?.level && alarm.sound && !accepted) {
      playAlarmSound(alarm.level);
      
      if (alarm.level === 'red') {
        soundIntervalRef.current = window.setInterval(() => {
          playAlarmSound(alarm.level);
        }, 1500);
      } else if (alarm.level === 'yellow') {
        soundIntervalRef.current = window.setInterval(() => {
          playAlarmSound(alarm.level);
        }, 2000);
      }
    }

    return () => {
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current);
      }
    };
  }, [alarm, accepted]);

  if (!alarm?.level) return null;

  let bgClass = '';
  let textLabel = '';
  let Icon = Info;
  let flashAnim = '';

  switch (alarm.level) {
    case 'green':
      bgClass = 'bg-green-600 text-white';
      textLabel = 'Aviso de Rotina';
      Icon = Info;
      flashAnim = 'animate-pulse';
      break;
    case 'yellow':
      bgClass = 'bg-amber-500 text-white';
      textLabel = 'Atenção Moderada';
      Icon = AlertTriangle;
      flashAnim = 'animate-pulse';
      break;
    case 'red':
      bgClass = 'bg-red-700/90 text-white';
      textLabel = 'ALERTA CRÍTICO';
      Icon = AlertCircle;
      flashAnim = 'animate-pulse-fast';
      break;
  }

  const handleAccept = () => {
    setAccepted(true);
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
  };

  const handleResolve = () => {
    setResolution('');
    setAccepted(false);
    onClear();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Flashing background layer */}
      <div className={`absolute inset-0 backdrop-blur-sm ${bgClass} ${!accepted ? flashAnim : ''}`}></div>

      {/* Content layer (does not change opacity) */}
      <div className={`relative z-10 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl ${accepted ? 'bg-white text-slate-800' : 'bg-black/70 backdrop-blur-xl border border-white/20'}`}>
        
        {!accepted ? (
          <div className="flex flex-col items-center flex-1 text-white">
            <Icon size={100} className="mb-4 animate-bounce" />
            <h1 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight text-center">{textLabel}</h1>
            
            {alarm.message ? (
              <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-3xl mb-10 w-full shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                <p className="font-black text-3xl sm:text-4xl text-center break-words leading-tight">
                  "{alarm.message}"
                </p>
              </div>
            ) : (
              <p className="text-xl opacity-90 mb-10 text-center">Por favor, verifique a situação imediatamente.</p>
            )}
            
            <button 
              onClick={handleAccept}
              className="w-full py-5 bg-white text-slate-900 font-black text-2xl rounded-2xl hover:bg-gray-100 transition-colors shadow-2xl flex items-center justify-center space-x-3"
            >
              <CheckCircle size={32} />
              <span>CIENTE / ACEITAR</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
              <div className={`p-2 rounded-lg ${alarm.level === 'red' ? 'bg-red-100 text-red-600' : alarm.level === 'yellow' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                <Icon size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Resolução do Alarme</h2>
                <p className="text-sm text-gray-500">Descreva o que foi feito para resolver.</p>
              </div>
            </div>

            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Ex: O problema na linha 3 foi corrigido e a produção foi retomada..."
              className="w-full h-32 p-4 border border-gray-300 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none outline-none"
              autoFocus
            />
            
            <button 
              onClick={handleResolve}
              disabled={false}
              className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-md`}
            >
              Desativar Alarme
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
