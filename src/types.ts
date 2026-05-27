export type TabType = 'home' | 'chats' | 'calls' | 'groups' | 'alarms' | 'files' | 'alarm-history';
export type AlarmLevel = 'green' | 'yellow' | 'red' | null;

export interface HistoricalAlarm {
  id: string;
  level: AlarmLevel;
  message: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy';
}

export interface Group {
  id: string;
  name: string;
  members: string[]; // List of user IDs
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  text: string;
  timestamp: string;
  audioUrl?: string;
}

