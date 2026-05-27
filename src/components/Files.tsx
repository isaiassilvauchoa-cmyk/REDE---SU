import React, { useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Video, Folder, Download, Home, Trash2 } from 'lucide-react';
import { TabType } from '../types';

interface SharedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  sender: string;
  time: string;
  data: string;
}

interface FilesProps {
  setActiveTab: (tab: TabType) => void;
  files: SharedFile[];
  onShareFile: (file: any) => void;
  onDeleteFile: (id: string) => void;
}

export function Files({ setActiveTab, files, onShareFile, onDeleteFile }: FilesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext || '')) return 'img';
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext || '')) return 'video';
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return 'doc';
    return 'other';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onShareFile({
        name: file.name,
        type: getFileType(file.name),
        size: formatFileSize(file.size),
        sender: 'Dispositivo Local',
        data: dataUrl
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = (file: SharedFile) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 h-full bg-[#0B1120] border-l border-slate-800 text-white p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Servidor de Arquivos (LAN)</h1>
            <p className="text-gray-400">Transferência direta via rede local offline.</p>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-95"
          >
            <Upload size={20} />
            <span>Enviar Arquivo</span>
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex space-x-2 sm:space-x-4 overflow-x-auto whitespace-nowrap">
            <button className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-xl text-sm font-bold border border-blue-500/20">Recentes</button>
            <button className="px-4 py-2 text-gray-400 hover:text-white rounded-xl text-sm font-medium transition-colors">Meus Arquivos</button>
            <button className="px-4 py-2 text-gray-400 hover:text-white rounded-xl text-sm font-medium transition-colors">Compartilhados</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-gray-500 uppercase tracking-widest">
                  <th className="p-4 sm:p-6 font-bold">Arquivo</th>
                  <th className="p-4 sm:p-6 font-bold hidden md:table-cell">Tamanho</th>
                  <th className="p-4 sm:p-6 font-bold hidden sm:table-cell">Enviado por</th>
                  <th className="p-4 sm:p-6 font-bold">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {files.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <Folder size={48} className="mb-4 opacity-20" />
                        <span className="text-lg font-medium">Nenhum arquivo compartilhado</span>
                        <span className="text-sm">Envie um arquivo para iniciar o compartilhamento na rede</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  files.map(file => (
                    <tr key={file.id} className="group hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 sm:p-6">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
                            file.type === 'doc' ? 'bg-blue-500/20 text-blue-400' : 
                            file.type === 'img' ? 'bg-emerald-500/20 text-emerald-400' : 
                            file.type === 'video' ? 'bg-purple-500/20 text-purple-400' : 
                            'bg-slate-700/50 text-slate-400'
                          }`}>
                            {file.type === 'doc' ? <FileText size={20} /> : 
                             file.type === 'img' ? <ImageIcon size={20} /> : 
                             file.type === 'video' ? <Video size={20} /> : 
                             <Folder size={20} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{file.name}</span>
                            <span className="text-[10px] text-gray-500 md:hidden">{file.size} • {file.time}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 sm:p-6 text-gray-400 font-medium hidden md:table-cell">{file.size}</td>
                      <td className="p-4 sm:p-6 text-gray-400 font-medium hidden sm:table-cell">
                        <div className="flex flex-col">
                          <span>{file.sender}</span>
                          <span className="text-[10px] text-gray-600">{file.time}</span>
                        </div>
                      </td>
                      <td className="p-4 sm:p-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleDownload(file)}
                            className="p-2 sm:p-3 bg-slate-800 hover:bg-blue-600 rounded-xl text-slate-300 hover:text-white transition-all shadow-sm active:scale-90"
                            title="Descarregar"
                          >
                            <Download size={18} />
                          </button>
                          <button 
                            onClick={() => onDeleteFile(file.id)}
                            className="p-2 sm:p-3 bg-slate-800 hover:bg-red-600 rounded-xl text-slate-400 hover:text-white transition-all shadow-sm active:scale-90"
                            title="Remover"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
