import React from 'react';
import { History, Trash2, Home, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { TabType, AlarmLevel, HistoricalAlarm } from '../types';

interface AlarmHistoryProps {
  setActiveTab: (tab: TabType) => void;
  history: HistoricalAlarm[];
  onClearHistory: () => void;
}

export function AlarmHistory({ setActiveTab, history, onClearHistory }: AlarmHistoryProps) {
  const getAlarmIcon = (level: AlarmLevel) => {
    switch (level) {
      case 'red': return <AlertCircle size={20} className="text-red-500" />;
      case 'yellow': return <AlertTriangle size={20} className="text-amber-500" />;
      case 'green': return <ShieldAlert size={20} className="text-green-500" />;
      default: return <ShieldAlert size={20} className="text-gray-500" />;
    }
  };

  const getAlarmTitle = (level: AlarmLevel) => {
    switch (level) {
      case 'red': return 'ALERTA CRÍTICO';
      case 'yellow': return 'ATENÇÃO';
      case 'green': return 'MENSAGEM';
      default: return 'Alarme';
    }
  };

  return (
    <div className="flex-1 h-full bg-[#0B1120] text-white pt-2 px-3 pb-3 sm:pt-4 sm:px-6 sm:pb-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700/50">
              <History className="text-gray-300" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Histórico de Alarmes</h2>
              <p className="text-gray-400 text-sm sm:text-base">Registro de todos os alertas disparados</p>
            </div>
          </div>
          
          <button 
            onClick={onClearHistory}
            className="flex items-center space-x-2 px-4 py-2.5 bg-red-900/40 text-red-400 hover:bg-red-900/60 hover:text-red-300 rounded-lg transition-colors font-medium border border-red-500/30"
            disabled={history.length === 0}
          >
            <Trash2 size={18} />
            <span>Apagar Tudo</span>
          </button>
        </div>

        <div className="bg-[#1e293b] rounded-2xl shadow-lg border border-slate-700/50 overflow-hidden mb-8">
          {history.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {history.map((alarm) => (
                <div key={alarm.id} className="p-4 sm:p-6 hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1 bg-slate-800/50 p-2 rounded-lg border border-slate-700/30">
                      {getAlarmIcon(alarm.level)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-100">{getAlarmTitle(alarm.level)}</h4>
                      <p className="text-gray-400 mt-1">{alarm.message || 'Sem mensagem'}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-slate-500 whitespace-nowrap bg-slate-900 px-3 py-1 rounded-md">
                    {alarm.timestamp}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <History size={48} className="text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-400">Nenhum alarme no histórico</h3>
              <p className="text-slate-500 mt-1">O histórico de alarmes está vazio no momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
