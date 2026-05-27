import React from 'react';
import { Video, Phone, Mic, Upload, MessageSquare, Users, AlertTriangle, Clock, Wifi, Bell } from 'lucide-react';
import { AlarmLevel, TabType } from '../types';
import { AppLogo } from './AppLogo';

interface DashboardProps {
  setActiveTab: (tab: TabType, callType?: 'video' | 'audio') => void;
  missedCalls: { type: 'video' | 'audio'; timestamp: number }[];
  onClearMissedCalls: () => void;
  autoAnswer: boolean;
  setAutoAnswer: (val: boolean) => void;
  setPendingAutoJoin: (val: boolean) => void;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => void;
  wakeLockActive: boolean;
  toggleWakeLock: () => void;
  wakeLockError: string | null;
  setWakeLockError: (val: string | null) => void;
}

export function Dashboard({ 
  setActiveTab, 
  missedCalls, 
  onClearMissedCalls, 
  autoAnswer, 
  setAutoAnswer, 
  setPendingAutoJoin,
  notificationPermission,
  requestNotificationPermission,
  wakeLockActive,
  toggleWakeLock,
  wakeLockError,
  setWakeLockError
}: DashboardProps) {
  const lastMissedCall = missedCalls[0];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#0B1120] text-white pt-0 px-3 pb-1 sm:pt-0 sm:px-6 sm:pb-2 flex flex-col items-center">
      
      {/* Header Profile */}
      <div className="flex flex-col items-center mt-0 sm:mt-0 mb-1.5 text-center">
        {/* Beautiful Application Icon - full network topology diagram */}
        <div className="relative mb-0.5 sm:mb-1 transition-transform hover:scale-105 duration-300">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-amber-500/10 rounded-full filter blur-xl opacity-40 animate-pulse" />
          <AppLogo mode="full" size={130} className="relative z-10" />
        </div>
        <h2 className="text-base sm:text-xl font-bold mb-0.5 tracking-tight leading-tight">Bem-vindo, ISU!</h2>
        <div className="flex items-center text-[#22c55e] text-[11px] sm:text-xs font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] mr-1.5 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
          Conectado
        </div>
      </div>

      {/* Missed Call Banner */}
      {missedCalls.length > 0 && (
        <div className="w-full max-w-2xl bg-red-500/10 border border-red-500/20 rounded-2xl p-3 mb-3 flex flex-col sm:flex-row items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center mb-3 sm:mb-0">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mr-3">
              <Phone size={20} className="animate-pulse" />
            </div>
            <div>
              <h4 className="font-black text-red-500 text-xs tracking-tight">CHAMADA NÃO ATENDIDA</h4>
              <p className="text-[11px] text-red-200/70">
                {missedCalls.length} {missedCalls.length === 1 ? 'chamada' : 'chamadas'} de {lastMissedCall.type === 'video' ? 'Vídeo' : 'Áudio'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <button 
              onClick={onClearMissedCalls}
              className="p-2 text-red-200/50 hover:text-red-200 transition-colors text-xs"
            >
              Limpar
            </button>
            <button 
              onClick={() => {
                onClearMissedCalls();
                setPendingAutoJoin(true);
                setActiveTab('calls', lastMissedCall.type);
              }}
              className="flex-1 sm:flex-initial bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-500/20 transition-transform active:scale-95"
            >
              <Phone size={14} />
              <span>RETORNAR AGORA</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-2xl px-0.5 sm:px-0">
        {/* Row 1 */}
        <button 
          onClick={() => setActiveTab('calls', 'video')}
          className="bg-[#22c55e] hover:bg-[#16a34a] transition-colors rounded-xl p-2.5 sm:p-4 flex flex-col items-center justify-center min-h-[90px] sm:min-h-[110px] shadow-lg group"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center mb-1.5">
            <Video size={18} className="text-white group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-bold text-white text-xs sm:text-sm leading-tight w-full truncate text-center">Chamada de Vídeo</span>
          <span className="text-green-100/90 text-[9px] sm:text-xxs mt-0.5">Face a face</span>
        </button>

        <button 
          onClick={() => setActiveTab('calls', 'audio')}
          className="bg-[#facc15] hover:bg-[#eab308] transition-colors rounded-xl p-2.5 sm:p-4 flex flex-col items-center justify-center min-h-[90px] sm:min-h-[110px] shadow-lg group"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/30 flex items-center justify-center mb-1.5">
            <Phone size={18} className="text-white group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-bold text-white text-xs sm:text-sm leading-tight w-full truncate text-center">Chamada de Áudio</span>
          <span className="text-yellow-50 text-[9px] sm:text-xxs mt-0.5">Voz</span>
        </button>

        {/* Row 2 */}
        <button 
          onClick={() => setActiveTab('groups')}
          className="bg-[#3b82f6] hover:bg-[#2563eb] transition-colors rounded-xl p-2.5 sm:p-4 flex flex-col items-center justify-center min-h-[90px] sm:min-h-[110px] shadow-lg group"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center mb-1.5">
            <Mic size={18} className="text-white group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-bold text-white text-xs sm:text-sm leading-tight w-full truncate text-center">Mensagem de Áudio</span>
          <span className="text-blue-100/90 text-[9px] sm:text-xxs mt-0.5">Gravar</span>
        </button>

        <button 
          onClick={() => setActiveTab('files')}
          className="bg-white hover:bg-gray-50 transition-colors rounded-xl p-2.5 sm:p-4 flex flex-col items-center justify-center min-h-[90px] sm:min-h-[110px] shadow-lg group"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center mb-1.5">
            <Upload size={18} className="text-slate-700 group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-bold text-slate-800 text-xs sm:text-sm leading-tight w-full truncate text-center">Compartilhar</span>
          <span className="text-gray-500 text-[9px] sm:text-xxs mt-0.5">Arquivos</span>
        </button>

        {/* Row 3 - Smaller buttons */}
        <button 
          onClick={() => setActiveTab('chats')}
          className="bg-[#1e293b] hover:bg-slate-800 transition-colors rounded-xl p-2 sm:p-3 flex flex-col items-center justify-center shadow-lg group border border-slate-700/30"
        >
          <MessageSquare size={18} className="mb-1 text-gray-300 group-hover:text-white transition-colors" />
          <span className="font-semibold text-white text-xs">Conversas</span>
          <span className="text-gray-500 text-[9px] mt-0.5">3 ativas</span>
        </button>

        <button 
          onClick={() => setActiveTab('groups')}
          className="bg-[#1e293b] hover:bg-slate-800 transition-colors rounded-xl p-2 sm:p-3 flex flex-col items-center justify-center shadow-lg group border border-slate-700/30"
        >
          <Users size={18} className="mb-1 text-gray-300 group-hover:text-white transition-colors" />
          <span className="font-semibold text-white text-xs">Grupos</span>
          <span className="text-gray-500 text-[9px] mt-0.5">Gerenciar</span>
        </button>

        {/* Row 4 */}
        <button 
          onClick={() => setActiveTab('alarms')}
          className="bg-[#1e293b] hover:bg-slate-800 transition-colors rounded-xl p-2 sm:p-3 flex flex-col items-center justify-center shadow-lg group border border-slate-700/30"
        >
          <AlertTriangle size={18} className="mb-1 text-gray-300 group-hover:text-white transition-colors" />
          <span className="font-semibold text-white text-xs">Alarmes</span>
          <span className="text-gray-500 text-[9px] mt-0.5">Nenhum ativo</span>
        </button>

        <button 
          onClick={() => setActiveTab('alarm-history')}
          className="bg-[#1e293b] hover:bg-slate-800 transition-colors rounded-xl p-2 sm:p-3 flex flex-col items-center justify-center shadow-lg group border border-slate-700/30"
        >
          <Clock size={18} className="mb-1 text-gray-300 group-hover:text-white transition-colors" />
          <span className="font-semibold text-white text-xs">Histórico</span>
          <span className="text-gray-500 text-[9px] mt-0.5">Chamadas</span>
        </button>
      </div>

      {/* Background & Lock Screen Settings Panel */}
      <div className="w-full max-w-2xl bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3 mb-2 mt-2 shadow-xl">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center space-x-2 px-1">
          <Clock size={15} className="text-blue-400 animate-pulse" />
          <span>Configuração para Tela Bloqueada e Segundo Plano</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          
          {/* Config Item 1: Auto Answer */}
          <div className="bg-slate-800/15 border border-slate-700/20 rounded-xl p-2 flex items-center justify-between gap-2.5 shadow-inner">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className={`p-1 rounded-lg shrink-0 ${autoAnswer ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/40 text-slate-500'}`}>
                <Bell size={14} className={autoAnswer ? 'animate-bounce' : ''} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <h4 className="font-bold text-slate-200 text-xs tracking-tight leading-none">Auto Atender</h4>
                  <span className="text-[7px] text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/15 px-0.5 py-0.5 rounded leading-none font-semibold uppercase tracking-wider shrink-0">Mãos Livres</span>
                </div>
                <p className="text-[8.5px] text-slate-400 leading-tight mt-0.5 line-clamp-1">Conecta chamados automaticamente.</p>
              </div>
            </div>
            <button 
              onClick={() => setAutoAnswer(!autoAnswer)}
              className={`relative inline-flex h-3.5 w-6 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                autoAnswer ? 'bg-blue-500' : 'bg-slate-600'
              }`}
            >
              <span className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${autoAnswer ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Config Item 2: Native Notifications (Lock screen) */}
          <div className="bg-slate-800/15 border border-slate-700/20 rounded-xl p-2 flex items-center justify-between gap-2.5 shadow-inner">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className={`p-1 rounded-lg shrink-0 ${notificationPermission === 'granted' ? 'bg-green-500/20 text-green-400' : 'bg-slate-800/40 text-slate-500'}`}>
                <Wifi size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <h4 className="font-bold text-slate-200 text-xs tracking-tight leading-none">Notificações</h4>
                  <span className={`text-[7px] px-0.5 py-0.5 rounded leading-none font-semibold uppercase tracking-wider shrink-0 ${
                    notificationPermission === 'granted' ? 'text-green-400 bg-green-500/10 border border-green-500/15' : 'text-slate-400 bg-slate-800/40 border border-slate-700/20'
                  }`}>
                    {notificationPermission === 'granted' ? 'Sim' : 'Não'}
                  </span>
                </div>
                <p className="text-[8.5px] text-slate-400 leading-tight mt-0.5 line-clamp-1">Receba com som no bloqueio.</p>
              </div>
            </div>
            {notificationPermission !== 'granted' ? (
              <button 
                onClick={requestNotificationPermission}
                className="px-1.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[7.5px] font-bold transition-all shrink-0 uppercase tracking-wider leading-none"
              >
                Permitir
              </button>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] shrink-0 mr-1" />
            )}
          </div>

          {/* Config Item 3: Prevent Screen Lock / Awake */}
          <div className="bg-slate-800/15 border border-slate-700/20 rounded-xl p-2 flex flex-col justify-center min-w-0 shadow-inner">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div className={`p-1 rounded-lg shrink-0 ${wakeLockActive ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-slate-800/40 text-slate-500'}`}>
                  <Clock size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    <h4 className="font-bold text-slate-200 text-xs tracking-tight leading-none">Evitar Bloqueio</h4>
                    <span className={`text-[7px] px-0.5 py-0.5 rounded leading-none font-semibold uppercase tracking-wider shrink-0 ${
                      wakeLockActive ? 'text-amber-400 bg-amber-500/10 border border-amber-500/15' : 'text-slate-400 bg-slate-800/40 border border-slate-700/20'
                    }`}>
                      {wakeLockActive ? 'Ativo' : 'Não'}
                    </span>
                  </div>
                  <p className="text-[8.5px] text-slate-400 leading-tight mt-0.5 line-clamp-1">Celular acordado.</p>
                </div>
              </div>
              <button 
                onClick={toggleWakeLock}
                className={`relative inline-flex h-3.5 w-6 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                  wakeLockActive ? 'bg-amber-500' : 'bg-slate-600'
                }`}
              >
                <span className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${wakeLockActive ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {wakeLockError && (
              <div className="mt-1 text-[7.5px] text-amber-400 bg-amber-500/5 border border-amber-500/10 rounded-lg p-1 flex flex-col leading-tight select-none">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1 text-[8px]">
                  <AlertTriangle size={8} className="text-amber-500 shrink-0" />
                  <span>Iframe</span>
                </span>
                <span className="text-[7.5px] leading-snug">
                  Abra em aba dedicada para usar Wake Lock.
                </span>
                <a 
                  href={window.location.href} 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-bold text-sky-400 hover:text-sky-300 transition-colors uppercase tracking-widest text-[7px] mt-1 text-center bg-sky-500/5 py-0.5 rounded border border-sky-500/10 animate-pulse"
                >
                  Modo Externo ↗
                </a>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Network Status */}
      <div className="mt-2 mb-1.5 w-full max-w-2xl bg-[#1e293b] rounded-lg sm:rounded-xl p-2 shadow-lg border border-slate-700/30 px-4 flex items-center justify-between">
        <div className="flex items-center text-sm font-semibold text-white">
          <Wifi size={18} className="mr-2 text-[#22c55e]" />
          Rede
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="text-lg font-bold text-[#22c55e] leading-none">1</span>
            <span className="text-xs font-medium text-gray-400">Online</span>
          </div>
          <div className="w-px h-4 bg-slate-700"></div>
          <div className="flex items-center space-x-1.5">
            <span className="text-lg font-bold text-[#3b82f6] leading-none">3</span>
            <span className="text-xs font-medium text-gray-400">Chats</span>
          </div>
        </div>

        <div className="bg-[#0B1120] rounded-lg px-3 py-1.5 flex items-center justify-center text-xs font-medium text-[#22c55e] border border-green-900/40">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] mr-2 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
          Operacional
        </div>
      </div>

    </div>
  );
}
