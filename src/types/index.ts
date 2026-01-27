export type Document = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  thumbnailUri?: string;
  pageCount: number;
};

export type Page = {
  id: string;
  documentId: string;
  imageUri: string;
  order: number;
  width: number;
  height: number;
};

export type RootStackParamList = {
  Home: undefined;
  Scan: { documentId?: string };
  Edit: { imageUri: string; documentId?: string; pageId?: string };
  Preview: { documentId: string };
  Settings: undefined;
};
