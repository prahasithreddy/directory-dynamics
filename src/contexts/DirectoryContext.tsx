
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { DirectoryItem, DirectoryState, DirectoryAction } from '../types/directory';
import { directoryApi } from '../api/directoryApi';
import { toast } from 'sonner';

// Initial state
const initialState: DirectoryState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null
};

// Create context
const DirectoryContext = createContext<{
  state: DirectoryState;
  dispatch: React.Dispatch<DirectoryAction>;
  addItem: (name: string, type: 'file' | 'folder', parentId: string | null) => Promise<void>;
  updateItem: (id: string, name: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  moveItem: (id: string, parentId: string | null) => Promise<void>;
  selectItem: (id: string | null) => void;
}>({
  state: initialState,
  dispatch: () => null,
  addItem: async () => {},
  updateItem: async () => {},
  deleteItem: async () => {},
  moveItem: async () => {},
  selectItem: () => {},
});

// Reducer
const directoryReducer = (state: DirectoryState, action: DirectoryAction): DirectoryState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id 
            ? { ...item, name: action.payload.name, updatedAt: new Date().toISOString() } 
            : item
        ),
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload && item.parentId !== action.payload),
        selectedItem: state.selectedItem === action.payload ? null : state.selectedItem,
      };
    case 'MOVE_ITEM':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id 
            ? { ...item, parentId: action.payload.parentId, updatedAt: new Date().toISOString() } 
            : item
        ),
      };
    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// Provider
export const DirectoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(directoryReducer, initialState);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const items = await directoryApi.getItems();
        dispatch({ type: 'SET_ITEMS', payload: items });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch directory items' });
        toast.error('Failed to load directory structure');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchData();
  }, []);

  // Action creators
  const addItem = async (name: string, type: 'file' | 'folder', parentId: string | null) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newItem = await directoryApi.createItem({ name, type, parentId });
      dispatch({ type: 'ADD_ITEM', payload: newItem });
      toast.success(`${type === 'folder' ? 'Folder' : 'File'} created successfully`);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create item' });
      toast.error('Failed to create item');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateItem = async (id: string, name: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await directoryApi.updateItem(id, name);
      dispatch({ type: 'UPDATE_ITEM', payload: { id, name } });
      toast.success('Item renamed successfully');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update item' });
      toast.error('Failed to rename item');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteItem = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await directoryApi.deleteItem(id);
      
      // Find all children to remove them from state
      const childrenIds = getChildrenIds(id, state.items);
      [id, ...childrenIds].forEach(itemId => {
        dispatch({ type: 'DELETE_ITEM', payload: itemId });
      });
      
      toast.success('Item deleted successfully');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete item' });
      toast.error('Failed to delete item');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Helper function to get all child IDs
  const getChildrenIds = (parentId: string, items: DirectoryItem[]): string[] => {
    const children = items.filter(item => item.parentId === parentId);
    return children.reduce((ids, child) => {
      return [...ids, child.id, ...getChildrenIds(child.id, items)];
    }, [] as string[]);
  };

  const moveItem = async (id: string, parentId: string | null) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await directoryApi.moveItem(id, parentId);
      dispatch({ type: 'MOVE_ITEM', payload: { id, parentId } });
      toast.success('Item moved successfully');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to move item' });
      toast.error('Failed to move item');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const selectItem = (id: string | null) => {
    dispatch({ type: 'SELECT_ITEM', payload: id });
  };

  const value = {
    state,
    dispatch,
    addItem,
    updateItem,
    deleteItem,
    moveItem,
    selectItem,
  };

  return <DirectoryContext.Provider value={value}>{children}</DirectoryContext.Provider>;
};

// Custom hook for using the directory context
export const useDirectory = () => {
  const context = useContext(DirectoryContext);
  if (!context) {
    throw new Error('useDirectory must be used within a DirectoryProvider');
  }
  return context;
};
