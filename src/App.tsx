import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Alarms } from './components/Alarms';
import { Groups } from './components/Groups';
import { Files } from './components/Files';
import { AlarmHistory } from './components/AlarmHistory';
import { AlarmOverlay } from './components/AlarmOverlay';
import { IncomingCallPopup } from './components/IncomingCallPopup';
import { Calls } from './components/Calls';
import { TabType, AlarmLevel, HistoricalAlarm } from './types';
import { PanelLeft, Home, Phone } from 'lucide-react';
// @ts-ignore
import NoSleep from 'nosleep.js';

const socket: Socket = io();

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const activeTabRef = React.useRef<TabType>(activeTab);
  
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const [activeAlarm, setActiveAlarm] = useState<{ level: AlarmLevel; sound: boolean; message?: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [historicalAlarms, setHistoricalAlarms] = useState<HistoricalAlarm[]>([]);
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [groupMessages, setGroupMessages] = useState<any[]>([]);
  const [incomingCall, setIncomingCall] = useState<{ from: string; type: 'audio' | 'video' } | null>(null);
  const [missedCalls, setMissedCalls] = useState<{ type: 'audio' | 'video'; timestamp: number }[]>([]);
  const [autoAnswer, setAutoAnswer] = useState(false);
  const [pendingAutoJoin, setPendingAutoJoin] = useState(false);

  // States & Refs for Lock Screen / Background call reception
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockError, setWakeLockError] = useState<string | null>(null);
  const wakeLockRef = React.useRef<any>(null);
  const noSleepRef = React.useRef<any>(null);
  const activeNotificationRef = React.useRef<Notification | null>(null);

  // Initialize NoSleep instance lazily on client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Redefine navigator.wakeLock to undefined to bypass sandbox / iframe permissions policy blocks.
        // This forces NoSleep.js to fall back to the extremely reliable silent video loop mechanism,
        // which does not require Wake Lock permissions and works beautifully inside iframes.
        try {
          // 1. Delete wakeLock from Navigator prototype so "wakeLock" in navigator returns false
          if (typeof Navigator !== 'undefined' && Navigator.prototype) {
            try {
              delete (Navigator.prototype as any).wakeLock;
            } catch (prErr) {}
          }
          // 2. Clear from navigator instance
          try {
            delete (navigator as any).wakeLock;
          } catch (instErr) {}
          // 3. Redefine to undefined if deletion didn't block it from appearing in checks
          if ('wakeLock' in navigator) {
            Object.defineProperty(navigator, 'wakeLock', {
              get: () => undefined,
              configurable: true,
              enumerable: true
            });
          }
        } catch (e) {
          console.warn('Could not redefine native wakeLock configuration:', e);
        }

        noSleepRef.current = new NoSleep();
      } catch (err) {
        console.warn('NoSleep fallback setup failed:', err);
      }
    }
    return () => {
      if (noSleepRef.current) {
        try {
          noSleepRef.current.disable();
        } catch (e) {}
      }
    };
  }, []);

  // Re-acquire Wake Lock when tab becomes visible again if active
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (wakeLockActive && document.visibilityState === 'visible') {
        let nativeSuccess = false;
        if ('wakeLock' in navigator && (navigator as any).wakeLock !== undefined) {
          try {
            wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
            console.log('Screen Wake Lock acquired natively from visibility change.');
            nativeSuccess = true;
          } catch (err) {
            console.warn('Visibility change native wake lock failed, will attempt fallback:', err);
          }
        }

        if (!nativeSuccess && noSleepRef.current) {
          try {
            await noSleepRef.current.enable();
            console.log('NoSleep fallback wake lock restored from visibility change.');
          } catch (err) {
            console.warn('Visibility change NoSleep loop restore failed:', err);
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [wakeLockActive]);

  // Clean up wake lock on component unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().then(() => {
          wakeLockRef.current = null;
        }).catch(() => {});
      }
    };
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          new Notification("Notificações de Emergência Ativas 📞", {
            body: "Você começará a receber chamados com áudio e vibração mesmo se o dispositivo estiver bloqueado.",
            requireInteraction: false
          });
        }
      } catch (err) {
        console.error('Falha ao requerer permissão de notificação:', err);
      }
    }
  };

  const toggleWakeLock = async () => {
    if (wakeLockActive) {
      // Disabling wake lock
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
        } catch (e) {}
        wakeLockRef.current = null;
      }
      if (noSleepRef.current) {
        try {
          noSleepRef.current.disable();
        } catch (e) {}
      }
      setWakeLockActive(false);
      setWakeLockError(null);
    } else {
      // Enabling wake lock
      setWakeLockError(null);
      let nativeSuccess = false;

      // 1. Try Native Wake Lock API first
      if ('wakeLock' in navigator && (navigator as any).wakeLock !== undefined) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          setWakeLockActive(true);
          setWakeLockError(null);
          console.log('Active Screen Wake Lock acquired via native API.');
          nativeSuccess = true;
        } catch (err: any) {
          console.warn("Native Wake Lock disallowed in sandbox/iframe or failed. Falling back to silent video:", err);
        }
      }

      // 2. Play silent video fallback (NoSleep.js) if Native Wake Lock is rejected or unavailable
      if (!nativeSuccess) {
        if (noSleepRef.current) {
          try {
            await noSleepRef.current.enable();
            setWakeLockActive(true);
            setWakeLockError(null);
            console.log('Screen Wake Lock acquired via NoSleep background video loop fallback.');
          } catch (err: any) {
            console.error("Wake Lock fallback rejected:", err);
            const errorMsg = err?.message || String(err);
            setWakeLockError(errorMsg);
          }
        } else {
          setWakeLockError('not_supported');
        }
      }
    }
  };

  useEffect(() => {
    socket.on('initial-state', (state) => {
      setHistoricalAlarms(state.historicalAlarms);
      setActiveAlarm(state.activeAlarm);
      setSharedFiles(state.sharedFiles || []);
      if (state.groupMessages) setGroupMessages(state.groupMessages);
    });

    socket.on('alarm-triggered', (state) => {
      setHistoricalAlarms(state.historicalAlarms);
      setActiveAlarm(state.activeAlarm);
    });

    socket.on('history-cleared', () => {
      setHistoricalAlarms([]);
    });

    socket.on('active-alarm-cleared', () => {
      setActiveAlarm(null);
    });

    socket.on('file-shared', (files) => {
      setSharedFiles(files);
    });

    socket.on('file-deleted', (files) => {
      setSharedFiles(files);
    });

    socket.on('group-message', (msg) => {
      setGroupMessages(prev => [...prev, msg]);
    });

    socket.on('incoming-call', (data) => {
      if (data.from === socket.id || activeTabRef.current === 'calls') return;
      setIncomingCall(data);

      // Trigger native System Notification to support lock screen & background notifications
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        if (activeNotificationRef.current) {
          activeNotificationRef.current.close();
        }

        const ringTitle = data.type === 'video' ? "📞 Chamada de Vídeo Entrando!" : "📞 Chamada de Áudio Entrando!";
        const ringBody = "Alerta Rede ISU. Toque aqui para abrir o aplicativo e responder o chamado.";
        
        const notification = new Notification(ringTitle, {
          body: ringBody,
          tag: "incoming-call",
          requireInteraction: true,
          silent: false,
          vibrate: [400, 150, 400, 150, 800, 150, 800]
        } as any);

        notification.onclick = () => {
          window.focus();
          handleAcceptCall(data.type);
          notification.close();
        };

        activeNotificationRef.current = notification;
      }
    });

    socket.on('call-cancelled', () => {
      if (activeNotificationRef.current) {
        activeNotificationRef.current.close();
        activeNotificationRef.current = null;
      }
      setIncomingCall(prev => {
        if (prev) {
          setMissedCalls(m => [{ type: prev.type, timestamp: Date.now() }, ...m]);
        }
        return null;
      });
    });

    socket.on('call-picked-up', () => {
      if (activeNotificationRef.current) {
        activeNotificationRef.current.close();
        activeNotificationRef.current = null;
      }
      setIncomingCall(null);
    });

    socket.on('user-disconnected', () => {
      if (activeNotificationRef.current) {
        activeNotificationRef.current.close();
        activeNotificationRef.current = null;
      }
      // Global disconnected notice - clearing incoming calls if any exist
      setIncomingCall(null);
    });

    return () => {
      socket.off('initial-state');
      socket.off('alarm-triggered');
      socket.off('history-cleared');
      socket.off('active-alarm-cleared');
      socket.off('file-shared');
      socket.off('file-deleted');
      socket.off('group-message');
      socket.off('incoming-call');
      socket.off('call-cancelled');
      socket.off('call-picked-up');
      socket.off('user-disconnected');
    };
  }, []);

  const handleAcceptCall = (typeOverride?: any) => {
    if (activeNotificationRef.current) {
      activeNotificationRef.current.close();
      activeNotificationRef.current = null;
    }
    // Ensure typeOverride is a valid string, not an Event object
    const validOverride = typeof typeOverride === 'string' ? typeOverride : undefined;
    const type = validOverride || (incomingCall ? incomingCall.type : 'video');
    socket.emit('accept-call');
    setCallType(type as 'audio' | 'video');
    setPendingAutoJoin(true);
    setActiveTab('calls');
    setIncomingCall(null);
  };

  useEffect(() => {
    if (incomingCall && autoAnswer) {
      const timer = setTimeout(() => {
        handleAcceptCall(incomingCall.type);
      }, 2000); // Wait 2 seconds before auto-answering
      return () => clearTimeout(timer);
    }
  }, [incomingCall, autoAnswer]);

  const handleDeclineCall = () => {
    if (activeNotificationRef.current) {
      activeNotificationRef.current.close();
      activeNotificationRef.current = null;
    }
    setIncomingCall(null);
    socket.emit('decline-call');
  };

  const handleTriggerAlarm = (level: AlarmLevel, sound: boolean, message?: string) => {
    socket.emit('trigger-alarm', { level, sound, message });
  };

  const handleClearHistory = () => {
    socket.emit('clear-history');
  };

  const handleClearActiveAlarm = () => {
    socket.emit('clear-active-alarm');
  };

  const handleShareFile = (file: any) => {
    socket.emit('share-file', file);
  };

  const handleDeleteFile = (fileId: string) => {
    socket.emit('delete-file', fileId);
  };

  const [callType, setCallType] = useState<'video' | 'audio'>('video');

  useEffect(() => {
    if (activeTab === 'calls' && incomingCall) {
      setIncomingCall(null);
    }
    if (activeTab !== 'calls' && pendingAutoJoin) {
      setPendingAutoJoin(false);
    }
  }, [activeTab, pendingAutoJoin, incomingCall]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard 
          setActiveTab={(tab, type) => {
            setActiveTab(tab);
            if (tab === 'calls' && type) {
              setCallType(type);
            }
          }} 
          missedCalls={missedCalls}
          onClearMissedCalls={() => setMissedCalls([])}
          autoAnswer={autoAnswer}
          setAutoAnswer={setAutoAnswer}
          setPendingAutoJoin={setPendingAutoJoin}
          notificationPermission={notificationPermission}
          requestNotificationPermission={requestNotificationPermission}
          wakeLockActive={wakeLockActive}
          toggleWakeLock={toggleWakeLock}
          wakeLockError={wakeLockError}
          setWakeLockError={setWakeLockError}
        />;
      case 'alarms':
        return <Alarms onTrigger={handleTriggerAlarm} setActiveTab={setActiveTab} />;
      case 'alarm-history':
        return <AlarmHistory 
                 setActiveTab={setActiveTab} 
                 history={historicalAlarms} 
                 onClearHistory={handleClearHistory} 
               />;
      case 'calls':
        return <Calls socket={socket} callType={callType} setCallType={setCallType} setActiveTab={setActiveTab} autoJoin={pendingAutoJoin} />;
      case 'chats':
        // For now, map 'chats' to the Groups component as well, or a similar interface
        return <Groups 
                 setActiveTab={setActiveTab} 
                 messages={groupMessages} 
                 socket={socket} 
               />;
      case 'files':
        return <Files 
                 setActiveTab={setActiveTab} 
                 files={sharedFiles}
                 onShareFile={handleShareFile}
                 onDeleteFile={handleDeleteFile}
               />;
      case 'groups':
        return <Groups 
                 setActiveTab={setActiveTab} 
                 messages={groupMessages} 
                 socket={socket} 
               />;
      default:
        // Placeholder for other tabs
        return (
          <div className="flex-1 h-full bg-[#0B1120] flex items-center justify-center text-gray-500">
            Modulo em desenvolvimento para a v1.0
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0B1120] overflow-hidden text-slate-800 font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(t) => { 
            setActiveTab(t); 
            setIsSidebarOpen(false); 
          }} 
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0B1120]">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 border-b border-slate-800/50 text-white py-2 px-4 flex items-center shadow-lg sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-1 mr-4 rounded-md hover:bg-slate-800 text-gray-300 transition-colors"
          >
            <PanelLeft size={24} />
          </button>
          <div className="relative w-10 h-10 mr-3 overflow-hidden rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700/50">
             <Phone size={20} className="text-green-400" />
             <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-slate-900" />
          </div>
          <h1 className="text-xl font-black tracking-tight uppercase text-white">REDE İSU</h1>
        </header>

        {renderContent()}

        {activeTab !== 'home' && (
          <div className="p-4 bg-[#0B1120] border-t border-slate-800/50 mt-auto shadow-[0_-4px_10px_rgba(0,0,0,0.2)] z-10">
            <button 
              onClick={() => setActiveTab('home')}
              className="w-full max-w-md mx-auto flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl transition-all font-bold border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              <Home size={20} className="text-inherit" />
              <span>Voltar para Início</span>
            </button>
          </div>
        )}
      </div>

      {/* Full Screen Alarm Overlay */}
      <AlarmOverlay alarm={activeAlarm} onClear={handleClearActiveAlarm} />

      {/* Incoming Call Notification */}
      <IncomingCallPopup 
        call={incomingCall} 
        onAccept={handleAcceptCall} 
        onDecline={handleDeclineCall} 
        autoAnswer={autoAnswer}
      />
    </div>
  );
}
