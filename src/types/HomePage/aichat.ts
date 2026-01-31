export type ChatRole = 'user' | 'assistant';

export interface ChatMessageType {
  id: string;
  role: ChatRole;
  text: string;
}

export interface ChatHistoryItemType {
  id: string;
  title: string;
}
