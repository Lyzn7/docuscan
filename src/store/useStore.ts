import { create } from 'zustand';
import { Document, Page } from '../types';

interface AppState {
    documents: Document[];
    setDocuments: (documents: Document[]) => void;
    addDocument: (document: Document) => void;
    removeDocument: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
    documents: [],
    setDocuments: (documents) => set({ documents }),
    addDocument: (document) => set((state) => ({ documents: [document, ...state.documents] })),
    removeDocument: (id) => set((state) => ({ documents: state.documents.filter((d) => d.id !== id) })),
}));
