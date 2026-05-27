import React, { useState, useRef, useEffect } from 'react';
import { Users, Plus, Send, Settings, ArrowLeft, X, Check, Home, Mic, Square } from 'lucide-react';
import { User, Group, GroupMessage, TabType } from '../types';
import { Socket } from 'socket.io-client';

const MOCK_USERS: User[] = [
  { id: '1', name: 'ISU 1971 (Você)', status: 'online' },
  { id: '2', name: 'Maria (RH)', status: 'online' },
  { id: '3', name: 'Carlos (Eng)', status: 'busy' },
  { id: '4', name: 'João (Produção)', status: 'offline' },
  { id: '5', name: 'Ana (TI)', status: 'online' },
];

const INITIAL_GROUPS: Group[] = [
  { id: 'g1', name: 'Equipe Geral', members: ['1', '2', '3', '4', '5'] },
  { id: 'g2', name: 'Engenharia', members: ['1', '3'] },
];

const INITIAL_MESSAGES: GroupMessage[] = [
  { id: 'm1', groupId: 'g1', senderId: '2', text: 'Bom dia pessoal!', timestamp: '08:00' },
  { id: 'm2', groupId: 'g1', senderId: '3', text: 'Bom dia. Os relatórios já estão no servidor.', timestamp: '08:05' },
];

interface GroupsProps {
  setActiveTab: (tab: TabType) => void;
  messages: GroupMessage[];
  socket: Socket;
}

export function Groups({ setActiveTab, messages, socket }: GroupsProps) {
  const CURRENT_USER_ID = '1';
  
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isManagingMembers, setIsManagingMembers] = useState(false);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([CURRENT_USER_ID]);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("A gravação de áudio não é suportada neste navegador.");
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length === 0) {
          console.error("No audio data recorded.");
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          return;
        }

        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        const reader = new FileReader();
        reader.onloadend = () => {
           const audioUrl = reader.result as string;
           sendAudioMessage(audioUrl);
        };
        reader.readAsDataURL(audioBlob);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(`Error accessing microphone: ${err instanceof Error ? err.message : String(err)}`);
      alert("Erro ao acessar o microfone. Verifique as permissões de áudio do seu navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.requestData();
      } catch (e) {
        console.error(`Error requesting data: ${e instanceof Error ? e.message : String(e)}`);
      }
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const sendAudioMessage = (audioUrl: string) => {
    if (!activeGroupId) return;
    const newMessage: GroupMessage = {
      id: Date.now().toString(),
      groupId: activeGroupId,
      senderId: CURRENT_USER_ID,
      text: 'Mensagem de áudio',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      audioUrl
    };
    socket.emit('send-group-message', newMessage);
  };

  const activeGroup = groups.find(g => g.id === activeGroupId);
  const activeGroupMessages = messages.filter(m => m.groupId === activeGroupId);

  const handleSendMessage = () => {
    if (!newMessageText.trim() || !activeGroupId) return;
    
    const newMessage: GroupMessage = {
      id: Date.now().toString(),
      groupId: activeGroupId,
      senderId: CURRENT_USER_ID,
      text: newMessageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    socket.emit('send-group-message', newMessage);
    setNewMessageText('');
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup: Group = {
      id: `g${Date.now()}`,
      name: newGroupName.trim(),
      members: selectedUsers
    };
    
    setGroups([...groups, newGroup]);
    setIsCreatingGroup(false);
    setNewGroupName('');
    setSelectedUsers([CURRENT_USER_ID]);
    setActiveGroupId(newGroup.id);
  };

  const handleToggleMember = (userId: string) => {
    if (userId === CURRENT_USER_ID) return; // Cannot remove self during creation
    
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleUpdateGroupMembers = () => {
    if (!activeGroup) return;
    
    const updatedGroups = groups.map(g => {
      if (g.id === activeGroup.id) {
        return { ...g, members: selectedUsers };
      }
      return g;
    });
    
    setGroups(updatedGroups);
    setIsManagingMembers(false);
  };

  const getUserName = (userId: string) => {
    return MOCK_USERS.find(u => u.id === userId)?.name || 'Usuário Desconhecido';
  };

  // Render group list
  const renderGroupList = () => (
    <div className={`flex-1 flex flex-col h-full ${activeGroupId ? 'hidden md:flex' : 'flex'} md:w-1/3 md:flex-none border-r border-slate-800 bg-[#0B1120]`}>
      <div className="p-4 sm:p-6 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center text-white">
            <Users className="mr-2 text-blue-500" size={24} />
            Grupos
          </h2>
          <button 
            onClick={() => {
              setSelectedUsers([CURRENT_USER_ID]);
              setIsCreatingGroup(true);
            }}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center"
          >
            <Plus size={20} />
          </button>
        </div>
        <input 
          type="text" 
          placeholder="Buscar grupos..." 
          className="w-full bg-[#1e293b] border border-slate-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {groups.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">Nenhum grupo criado.</div>
        ) : (
          groups.map(group => (
            <button
              key={group.id}
              onClick={() => setActiveGroupId(group.id)}
              className={`w-full text-left p-4 rounded-xl transition-colors border ${
                activeGroupId === group.id 
                  ? 'bg-blue-900/30 border-blue-500/50' 
                  : 'bg-[#1e293b] border-slate-700/50 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-white mb-1">{group.name}</div>
              <div className="text-sm text-gray-400 flex items-center">
                <Users size={14} className="mr-1" />
                {group.members.length} membros
              </div>
            </button>
          ))
        )}
      </div>

    </div>
  );

  // Render Active Group Chat
  const renderChat = () => {
    if (!activeGroup) {
      return (
        <div className="hidden md:flex flex-1 items-center justify-center bg-[#0B1120]">
          <div className="text-center text-gray-500 bg-[#1e293b] p-8 rounded-2xl border border-slate-800/50">
            <Users size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-lg">Selecione um grupo para iniciar a comunicação.</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex-1 flex flex-col h-full bg-[#0B1120] ${!activeGroupId ? 'hidden' : 'flex'}`}>
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-[#1e293b]">
          <div className="flex items-center">
            <button 
              onClick={() => setActiveGroupId(null)}
              className="md:hidden mr-4 text-gray-400 hover:text-white"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">{activeGroup.name}</h2>
              <p className="text-sm text-gray-400">
                {activeGroup.members.length} participantes
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setSelectedUsers(activeGroup.members);
              setIsManagingMembers(true);
            }}
            className="p-2 text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            title="Gerenciar Membros"
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeGroupMessages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              Nenhuma mensagem ainda. Envie a primeira mensagem para o grupo.
            </div>
          ) : (
            activeGroupMessages.map(msg => {
              const isMine = msg.senderId === CURRENT_USER_ID;
              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  {!isMine && (
                    <span className="text-xs text-blue-400 font-medium mb-1 ml-1">{getUserName(msg.senderId)}</span>
                  )}
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    isMine 
                      ? 'bg-blue-600 text-white rounded-br-sm' 
                      : 'bg-[#1e293b] text-gray-200 border border-slate-700/50 rounded-bl-sm'
                  }`}>
                    <p>{msg.text}</p>
                    {msg.audioUrl && (
                      <audio controls src={msg.audioUrl} className="max-w-[200px] sm:max-w-xs mt-2" />
                    )}
                    <div className={`text-[10px] mt-1 text-right ${isMine ? 'text-blue-200' : 'text-gray-500'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 bg-[#1e293b] border-t border-slate-800">
          <div className="flex items-center space-x-2 w-full max-w-4xl mx-auto relative">
            <input 
              type="text" 
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isRecording ? "Gravando áudio..." : "Digite sua mensagem para o grupo..."} 
              disabled={isRecording}
              className="flex-1 bg-[#0B1120] border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            {isRecording ? (
              <button 
                onClick={stopRecording}
                className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors flex items-center justify-center animate-pulse"
              >
                <Square size={20} className="fill-current" />
              </button>
            ) : (
              <button 
                onClick={startRecording}
                className="p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors flex items-center justify-center"
              >
                <Mic size={20} />
              </button>
            )}
            <button 
              onClick={handleSendMessage}
              disabled={!newMessageText.trim() || isRecording}
              className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Modal (Create or Manage Members)
  const renderMembersModal = () => {
    if (!isCreatingGroup && !isManagingMembers) return null;
    
    const isEditing = isManagingMembers;
    const title = isEditing ? 'Gerenciar Membros' : 'Novo Grupo';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-[#1e293b] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button 
              onClick={() => {
                setIsCreatingGroup(false);
                setIsManagingMembers(false);
              }}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 text-white">
            {!isEditing && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Nome do Grupo</label>
                <input 
                  type="text" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ex: Operações Manhã" 
                  className="w-full bg-[#0B1120] border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Selecione os Participantes</label>
              <div className="space-y-2 border border-slate-700/50 rounded-xl p-2 bg-[#0B1120]">
                {MOCK_USERS.map(user => {
                  const isSelected = selectedUsers.includes(user.id);
                  const isCurrentUser = user.id === CURRENT_USER_ID;
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleToggleMember(user.id)}
                      disabled={isCurrentUser}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isSelected ? 'bg-blue-900/30 text-white' : 'hover:bg-slate-800 text-gray-400'
                      } ${isCurrentUser ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          user.status === 'online' ? 'bg-green-500' : 
                          user.status === 'busy' ? 'bg-amber-500' : 'bg-gray-500'
                        }`}></div>
                        <span>{user.name}</span>
                      </div>
                      {isSelected && <Check size={18} className="text-blue-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-slate-800">
            <button 
              onClick={isEditing ? handleUpdateGroupMembers : handleCreateGroup}
              disabled={(!isEditing && !newGroupName.trim()) || selectedUsers.length === 0}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors"
            >
              {isEditing ? 'Salvar Alterações' : 'Criar Grupo'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 h-full flex overflow-hidden text-slate-800 font-sans">
      {renderGroupList()}
      {renderChat()}
      {renderMembersModal()}
    </div>
  );
}
