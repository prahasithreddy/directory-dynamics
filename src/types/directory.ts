
export type FileType = 'file' | 'folder';

export interface DirectoryItem {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderItem extends DirectoryItem {
  type: 'folder';
}

export interface FileItem extends DirectoryItem {
  type: 'file';
}

export type DirectoryState = {
  items: DirectoryItem[];
  selectedItem: string | null;
  isLoading: boolean;
  error: string | null;
};

export type DirectoryAction = 
  | { type: 'SET_ITEMS'; payload: DirectoryItem[] }
  | { type: 'ADD_ITEM'; payload: DirectoryItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; name: string } }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'MOVE_ITEM'; payload: { id: string; parentId: string | null } }
  | { type: 'SELECT_ITEM'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
