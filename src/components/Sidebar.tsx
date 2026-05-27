import React from 'react';
import { Home, MessageSquare, Phone, Users, Bell, Settings, Upload, History } from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: 'home', label: 'Tela Inicial', icon: Home },
    { id: 'chats', label: 'Conversas', icon: MessageSquare },
    { id: 'calls', label: 'Chamadas', icon: Phone },
    { id: 'groups', label: 'Grupos', icon: Users },
    { id: 'files', label: 'Arquivos', icon: Upload },
    { id: 'alarms', label: 'Alarmes', icon: Bell },
    { id: 'alarm-history', label: 'Histórico', icon: History },
  ] as const;

  return (
    <div className="w-64 bg-white flex flex-col h-full border-r border-gray-200">
      <div className="p-4 pt-6 lg:pt-8 pb-8 border-b border-gray-100 flex items-center space-x-3">
        <div className="relative w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-blue-500/30" />
          <Phone className="text-green-500 relative z-10" size={24} />
          <div className="absolute -top-1 -right-1 px-1.5 h-4 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center tracking-tight font-black text-[7px] text-white">
            LIVE
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-slate-800 leading-tight tracking-tight text-lg uppercase leading-none mb-0.5">REDE İSU</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Network System v1.0</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-slate-700 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 px-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Status</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <div className="flex items-center space-x-3">
                <MessageSquare size={14} className="text-gray-400" />
                <span className="text-sm">Conversas Ativas</span>
              </div>
              <span className="text-xs font-medium text-green-500">3</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
              I
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">ISU 1971</p>
              <p className="text-xs text-green-500">Conectado</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
