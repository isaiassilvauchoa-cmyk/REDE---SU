import React, { useState } from 'react';
import { AlarmLevel, TabType } from '../types';
import { Bell, ShieldAlert, AlertTriangle, Volume2, VolumeX, X, Send, Home } from 'lucide-react';

interface AlarmsProps {
  onTrigger: (level: AlarmLevel, withSound: boolean, message?: string) => void;
  setActiveTab: (tab: TabType) => void;
}

export function Alarms({ onTrigger, setActiveTab }: AlarmsProps) {
  const [withSound, setWithSound] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<AlarmLevel | null>(null);
  const [alarmMessage, setAlarmMessage] = useState('');

  const handleTriggerClick = (level: AlarmLevel) => {
    setSelectedLevel(level);
    setAlarmMessage('');
  };

  const handleConfirm = () => {
    if (selectedLevel) {
      onTrigger(selectedLevel, withSound, alarmMessage.trim());
      setSelectedLevel(null);
    }
  };

  return (
    <div className="flex-1 h-full bg-[#0B1120] text-white pt-2 px-3 pb-3 sm:pt-4 sm:px-6 sm:pb-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700/50">
              <Bell size={24} className="text-gray-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Central de Alarmes</h1>
              <p className="text-gray-400 text-sm sm:text-base">Ative painéis de alerta para a rede local.</p>
            </div>
          </div>
          
          <button 
            onClick={() => setWithSound(!withSound)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors border ${
              withSound 
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30' 
                : 'bg-slate-800 text-gray-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {withSound ? <Volume2 size={20} /> : <VolumeX size={20} />}
            <span className="hidden sm:inline">{withSound ? 'Com Som' : 'Sem Som'}</span>
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Green Alarm */}
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center">
                <Bell size={24} />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-green-500/20 text-green-400 rounded">Rotina</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Alarme Verde</h3>
            <p className="text-gray-400 text-sm mb-6">Usado para notificações de rotina. A tela piscará suavemente verde.</p>
            <button 
              onClick={() => handleTriggerClick('green')}
              className="w-full py-3 bg-slate-700 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>Ativar</span>
              {withSound ? <Volume2 size={16} className="opacity-60" /> : <VolumeX size={16} className="opacity-60" />}
            </button>
          </div>

          {/* Yellow Alarm */}
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-amber-500/20 text-amber-400 rounded">Atenção</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Alarme Amarelo</h3>
            <p className="text-gray-400 text-sm mb-6">Avisos de atenção moderada. Pisca laranja e emite alerta visual.</p>
            <button 
              onClick={() => handleTriggerClick('yellow')}
              className="w-full py-3 bg-slate-700 hover:bg-amber-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>Ativar</span>
              {withSound ? <Volume2 size={16} className="opacity-60" /> : <VolumeX size={16} className="opacity-60" />}
            </button>
          </div>

          {/* Red Alarm */}
          <div className="bg-[#1e293b] border border-red-900/40 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-600/20 text-red-500 rounded-lg flex items-center justify-center">
                <ShieldAlert size={24} />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-red-600/20 text-red-500 rounded">Crítico</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Alarme Vermelho</h3>
            <p className="text-gray-400 text-sm mb-6">Urgência máxima. Tela pisca com alta intensidade.</p>
            <button 
              onClick={() => handleTriggerClick('red')}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] rounded-xl font-bold transition-all flex items-center justify-center space-x-2"
            >
              <span>ATIVAR EMERGÊNCIA</span>
              {withSound ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center">
                Confirmar Disparo
                {selectedLevel === 'red' && <ShieldAlert className="ml-2 text-red-500" size={24} />}
                {selectedLevel === 'yellow' && <AlertTriangle className="ml-2 text-amber-500" size={24} />}
                {selectedLevel === 'green' && <Bell className="ml-2 text-green-500" size={24} />}
              </h2>
              <button 
                onClick={() => setSelectedLevel(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-400 text-sm mb-4">
                Você está prestes a disparar o alarme {
                  selectedLevel === 'red' ? 'vermelho (emergência)' : 
                  selectedLevel === 'yellow' ? 'amarelo (atenção)' : 
                  'verde (rotina)'
                }. Deseja adicionar uma descrição ou instruções? (Opcional)
              </p>
              
              <textarea
                value={alarmMessage}
                onChange={(e) => setAlarmMessage(e.target.value)}
                placeholder="Ex: Fogo no setor secundário, evacuar imediatamente."
                className="w-full h-32 p-4 bg-[#0B1120] border border-slate-700 rounded-xl mb-6 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none outline-none"
                autoFocus
              />

              <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${withSound ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-gray-500'}`}>
                    {withSound ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Sinal Sonoro</p>
                    <p className="text-xs text-gray-400">{withSound ? 'Emitirá alerta auditivo' : 'Alarme silencioso (apenas visual)'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setWithSound(!withSound)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${withSound ? 'bg-blue-600' : 'bg-slate-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${withSound ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-800 flex space-x-3">
              <button 
                onClick={() => setSelectedLevel(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirm}
                className={`flex-1 py-3 rounded-xl font-bold transition-all text-white flex items-center justify-center space-x-2 ${
                  selectedLevel === 'red' ? 'bg-red-600 hover:bg-red-500' :
                  selectedLevel === 'yellow' ? 'bg-amber-600 hover:bg-amber-500' :
                  'bg-green-600 hover:bg-green-500'
                }`}
              >
                <span>Disparar Alarme</span>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
