import React from 'react';
import { Video, Phone, Mic, Upload, MessageSquare, Users, AlertTriangle, Clock, Wifi, Bell } from 'lucide-react';
import { AlarmLevel, TabType } from '../types';

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
    <div className="flex-1 h-full overflow-y-auto bg-[#0B1120] text-white p-3 sm:p-6 flex flex-col items-center">
      
      {/* Header Profile */}
      <div className="flex flex-col items-center mt-2 sm:mt-4 mb-4 sm:mb-6 text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#22c55e] rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mb-2 sm:mb-3 shadow-lg text-white tracking-widest pl-1">
          I
        </div>
        <h2 className="text-lg sm:text-2xl font-bold mb-0.5 tracking-tight leading-tight">Bem-vindo, ISU!</h2>
        <div className="flex items-center text-[#22c55e] text-xs sm:text-sm font-medium">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#22c55e] mr-1.5 sm:mr-2 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
          Conectado
        </div>
      </div>

      {/* Missed Call Banner */}
      {missedCalls.length > 0 && (
        <div className="w-full max-w-2xl bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mr-4">
              <Phone size={24} className="animate-pulse" />
            </div>
            <div>
              <h4 className="font-black text-red-500 text-sm tracking-tight">CHAMADA NÃO ATENDIDA</h4>
              <p className="text-xs text-red-200/70">
                {missedCalls.length} {missedCalls.length === 1 ? 'chamada' : 'chamadas'} de {lastMissedCall.type === 'video' ? 'Vídeo' : 'Áudio'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <button 
              onClick={onClearMissedCalls}
              className="p-3 text-red-200/50 hover:text-red-200 transition-colors"
            >
              Limpar
            </button>
            <button 
              onClick={() => {
                onClearMissedCalls();
                setPendingAutoJoin(true);
                setActiveTab('calls', lastMissedCall.type);
              }}
              className="flex-1 sm:flex-initial bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-500/20 transition-transform active:scale-95"
            >
              <Phone size={16} />
              <span>RETORNAR AGORA</span>
            </button>
          </div>
        </div>
      )}

      {/* Background & Lock Screen Settings Panel */}
      <div className="w-full max-w-2xl bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 mb-6 shadow-xl">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center space-x-2 px-1">
          <Clock size={16} className="text-blue-400 animate-pulse" />
          <span>Configuração para Tela Bloqueada e Segundo Plano</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Config Item 1: Auto Answer */}
          <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <div className={`p-2 rounded-xl shrink-0 ${autoAnswer ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-705/30 text-slate-500'}`}>
                  <Bell size={18} className={autoAnswer ? 'animate-bounce' : ''} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-200 text-xs sm:text-sm tracking-tight leading-none">Auto Atender</h4>
                  <span className="text-[9px] text-[#22c55e] font-semibold tracking-wider">Mão Livres</span>
                </div>
              </div>
              <button 
                onClick={() => setAutoAnswer(!autoAnswer)}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                  autoAnswer ? 'bg-blue-500' : 'bg-slate-600'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${autoAnswer ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 leading-snug">Conecta e abre chamados de rede automaticamente em 2s sem cliques.</p>
          </div>

          {/* Config Item 2: Native Notifications (Lock screen) */}
          <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <div className={`p-2 rounded-xl shrink-0 ${notificationPermission === 'granted' ? 'bg-green-500/20 text-green-400' : 'bg-slate-705/30 text-slate-500'}`}>
                  <Wifi size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-200 text-xs sm:text-sm tracking-tight leading-none text-ellipsis overflow-hidden whitespace-nowrap">Notificações</h4>
                  <span className={`text-[9px] font-semibold tracking-wider ${notificationPermission === 'granted' ? 'text-green-400' : 'text-slate-400'}`}>
                    {notificationPermission === 'granted' ? 'Habilitado' : 'Desativado'}
                  </span>
                </div>
              </div>
              {notificationPermission !== 'granted' ? (
                <button 
                  onClick={requestNotificationPermission}
                  className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[9px] font-bold transition-all shrink-0 uppercase tracking-wider"
                >
                  Permitir
                </button>
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] shrink-0 self-center" />
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 leading-snug">Garante o recebimento de chamadas com alertas sonoros no bloqueio de tela.</p>
          </div>

          {/* Config Item 3: Prevent Screen Lock / Awake */}
          <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <div className={`p-2 rounded-xl shrink-0 ${wakeLockActive ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-slate-705/30 text-slate-500'}`}>
                  <Clock size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-200 text-xs sm:text-sm tracking-tight leading-none">Evitar Bloqueio</h4>
                  <span className={`text-[9px] font-semibold tracking-wider ${wakeLockActive ? 'text-amber-400' : 'text-slate-400'}`}>
                    {wakeLockActive ? 'Manter Awake' : 'Inativo'}
                  </span>
                </div>
              </div>
              <button 
                onClick={toggleWakeLock}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                  wakeLockActive ? 'bg-amber-500' : 'bg-slate-600'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${wakeLockActive ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 leading-snug">Previne a suspensão de rede no celular mantendo o navegador 100% acordado.</p>

            {wakeLockError && (
              <div className="mt-1 text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 flex flex-col leading-snug space-y-1 select-none">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1 text-[10px]">
                  <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                  <span>Restrição Iframe</span>
                </span>
                <span>
                  O editor do AI Studio bloqueia o 'Wake Lock' no frame interno. Abra o aplicativo em uma aba dedicada para usá-lo.
                </span>
                <a 
                  href={window.location.href} 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-bold text-sky-400 hover:text-sky-300 transition-colors uppercase tracking-widest text-[8px] mt-1.5 text-center bg-sky-500/10 py-1.5 rounded border border-sky-500/20"
                >
                  Abrir Aba Exclusiva ↗
                </a>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full max-w-2xl px-1 sm:px-0 flex-1 content-center">
        {/* Row 1 */}
        <button 
          onClick={() => setActiveTab('calls', 'video')}
          className="bg-[#22c55e] hover:bg-[#16a34a] transition-colors rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col items-center justify-center min-h-[105px] sm:min-h-[130px] shadow-lg group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
            <Video size={20} className="text-white group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-bold text-white text-sm sm:text-base leading-tight w-full truncate text-center">Chamada de Vídeo</span>
          <span className="text-green-100/90 text-[10px] sm:text-xs mt-0.5">Face a face</span>
        </button>

        <button 
          onClick={() => setActiveTab('calls', 'audio')}
          className="bg-[#facc15] hover:bg-[#eab308] transition-colors rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col items-center justify-center min-h-[105px] sm:min-h-[130px] shadow-lg group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/30 flex items-center justify-center mb-2">
            <Phone size={20} className="text-white group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-bold text-white text-sm sm:text-base leading-tight w-full truncate text-center">Chamada de Áudio</span>
          <span className="text-yellow-50 text-[10px] sm:text-xs mt-0.5">Voz</span>
        </button>

        {/* Row 2 */}
        <button 
          onClick={() => setActiveTab('groups')}
          className="bg-[#3b82f6] hover:bg-[#2563eb] transition-colors rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col items-center justify-center min-h-[105px] sm:min-h-[130px] shadow-lg group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
            <Mic size={20} className="text-white group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-bold text-white text-sm sm:text-base leading-tight w-full truncate text-center">Mensagem de Áudio</span>
          <span className="text-blue-100/90 text-[10px] sm:text-xs mt-0.5">Gravar</span>
        </button>

        <button 
          onClick={() => setActiveTab('files')}
          className="bg-white hover:bg-gray-50 transition-colors rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col items-center justify-center min-h-[105px] sm:min-h-[130px] shadow-lg group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
            <Upload size={20} className="text-slate-700 group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-bold text-slate-800 text-sm sm:text-base leading-tight w-full truncate text-center">Compartilhar</span>
          <span className="text-gray-500 text-[10px] sm:text-xs mt-0.5">Arquivos</span>
        </button>

        {/* Row 3 - Smaller buttons */}
        <button 
          onClick={() => setActiveTab('chats')}
          className="bg-[#1e293b] hover:bg-slate-800 transition-colors rounded-xl sm:rounded-2xl p-3 py-3.5 flex flex-col items-center justify-center shadow-lg group border border-slate-700/30"
        >
          <MessageSquare size={20} className="mb-1.5 text-gray-300 group-hover:text-white transition-colors" />
          <span className="font-semibold text-white text-sm">Conversas</span>
          <span className="text-gray-500 text-[10px] mt-0.5">3 ativas</span>
        </button>

        <button 
          onClick={() => setActiveTab('groups')}
          className="bg-[#1e293b] hover:bg-slate-800 transition-colors rounded-xl sm:rounded-2xl p-3 py-3.5 flex flex-col items-center justify-center shadow-lg group border border-slate-700/30"
        >
          <Users size={20} className="mb-1.5 text-gray-300 group-hover:text-white transition-colors" />
          <span className="font-semibold text-white text-sm">Grupos</span>
          <span className="text-gray-500 text-[10px] mt-0.5">Gerenciar</span>
        </button>

        {/* Row 4 */}
        <button 
          onClick={() => setActiveTab('alarms')}
          className="bg-[#1e293b] hover:bg-slate-800 transition-colors rounded-xl sm:rounded-2xl p-3 py-3.5 flex flex-col items-center justify-center shadow-lg group border border-slate-700/30"
        >
          <AlertTriangle size={20} className="mb-1.5 text-gray-300 group-hover:text-white transition-colors" />
          <span className="font-semibold text-white text-sm">Alarmes</span>
          <span className="text-gray-500 text-[10px] mt-0.5">Nenhum ativo</span>
        </button>

        <button 
          onClick={() => setActiveTab('alarm-history')}
          className="bg-[#1e293b] hover:bg-slate-800 transition-colors rounded-xl sm:rounded-2xl p-3 py-3.5 flex flex-col items-center justify-center shadow-lg group border border-slate-700/30"
        >
          <Clock size={20} className="mb-1.5 text-gray-300 group-hover:text-white transition-colors" />
          <span className="font-semibold text-white text-sm">Histórico</span>
          <span className="text-gray-500 text-[10px] mt-0.5">Chamadas</span>
        </button>
      </div>

      {/* Network Status */}
      <div className="mt-4 mb-2 w-full max-w-2xl bg-[#1e293b] rounded-lg sm:rounded-xl p-2.5 shadow-lg border border-slate-700/30 px-4 mx-2 flex items-center justify-between">
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
