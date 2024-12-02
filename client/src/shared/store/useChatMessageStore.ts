import { create } from 'zustand';
import { ChatMessageState } from './state/chatState';

export const useChatMessageStore = create<ChatMessageState>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
}));
