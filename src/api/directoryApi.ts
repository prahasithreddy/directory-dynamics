
import { DirectoryItem } from '../types/directory';

// This is a mock API that persists data to localStorage
// In a real application, this would be replaced with actual API calls

const STORAGE_KEY = 'directory-structure';

// Initialize with some default data if none exists
const initializeData = (): DirectoryItem[] => {
  const existingData = localStorage.getItem(STORAGE_KEY);
  
  if (existingData) {
    return JSON.parse(existingData);
  }
  
  // Create default structure if none exists
  const defaultStructure: DirectoryItem[] = [
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Photos',
      type: 'folder',
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Resume.pdf',
      type: 'file',
      parentId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Project Notes',
      type: 'folder',
      parentId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Vacation.jpg',
      type: 'file',
      parentId: '2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '6',
      name: 'Tasks.txt',
      type: 'file',
      parentId: '4',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStructure));
  return defaultStructure;
};

// Save data to localStorage
const saveData = (data: DirectoryItem[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const directoryApi = {
  // Get all directory items
  getItems: async (): Promise<DirectoryItem[]> => {
    await delay(500); // Simulate network delay
    return initializeData();
  },
  
  // Create a new item
  createItem: async (item: Omit<DirectoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<DirectoryItem> => {
    await delay(300);
    
    const items = initializeData();
    const newItem: DirectoryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    items.push(newItem);
    saveData(items);
    
    return newItem;
  },
  
  // Update an item
  updateItem: async (id: string, name: string): Promise<DirectoryItem> => {
    await delay(300);
    
    const items = initializeData();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      throw new Error('Item not found');
    }
    
    items[itemIndex] = {
      ...items[itemIndex],
      name,
      updatedAt: new Date().toISOString(),
    };
    
    saveData(items);
    
    return items[itemIndex];
  },
  
  // Delete an item
  deleteItem: async (id: string): Promise<void> => {
    await delay(300);
    
    let items = initializeData();
    
    // Find all children (recursive)
    const getChildrenIds = (parentId: string): string[] => {
      const children = items.filter(item => item.parentId === parentId);
      return children.reduce((ids, child) => {
        return [...ids, child.id, ...getChildrenIds(child.id)];
      }, [] as string[]);
    };
    
    const idsToRemove = [id, ...getChildrenIds(id)];
    
    // Remove all items with ids in idsToRemove
    items = items.filter(item => !idsToRemove.includes(item.id));
    
    saveData(items);
  },
  
  // Move an item to a new parent
  moveItem: async (id: string, parentId: string | null): Promise<DirectoryItem> => {
    await delay(300);
    
    const items = initializeData();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      throw new Error('Item not found');
    }
    
    // Prevent moving a folder into its own descendant
    if (parentId !== null) {
      let currentParent = parentId;
      while (currentParent !== null) {
        if (currentParent === id) {
          throw new Error('Cannot move a folder into its own descendant');
        }
        const parent = items.find(item => item.id === currentParent);
        currentParent = parent?.parentId || null;
      }
    }
    
    items[itemIndex] = {
      ...items[itemIndex],
      parentId,
      updatedAt: new Date().toISOString(),
    };
    
    saveData(items);
    
    return items[itemIndex];
  },
};
