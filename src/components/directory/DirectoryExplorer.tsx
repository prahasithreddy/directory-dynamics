
import React, { useState, useEffect } from 'react';
import { FolderPlus, FilePlus, Loader2 } from 'lucide-react';
import { DirectoryItem } from './DirectoryItem';
import { useDirectory } from '../../contexts/DirectoryContext';
import { DirectoryItem as DirectoryItemType } from '../../types/directory';

// Import UI components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export const DirectoryExplorer: React.FC = () => {
  const { state, addItem, updateItem } = useDirectory();
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newNameValue, setNewNameValue] = useState('');
  const [selectedItemForRename, setSelectedItemForRename] = useState<DirectoryItemType | null>(null);
  
  // Initially expand some folders for better UX
  useEffect(() => {
    if (state.items.length > 0 && expandedFolders.length === 0) {
      // Expand the first level folders by default
      const rootFolders = state.items
        .filter(item => item.type === 'folder' && item.parentId === null)
        .map(folder => folder.id);
      setExpandedFolders(rootFolders);
    }
  }, [state.items, expandedFolders]);
  
  // Handle toggling folder expansion
  const handleToggleExpand = (id: string) => {
    setExpandedFolders(prev => 
      prev.includes(id)
        ? prev.filter(folderId => folderId !== id)
        : [...prev, id]
    );
  };
  
  // Handle creation of new root items
  const handleCreateRootItem = (type: 'file' | 'folder') => {
    const itemType = type === 'folder' ? 'folder' : 'file';
    const newName = type === 'folder' ? 'New Folder' : 'New File';
    addItem(newName, itemType, null);
  };
  
  // Handle opening the rename dialog
  const handleRenameClick = (item: DirectoryItemType) => {
    setSelectedItemForRename(item);
    setNewNameValue(item.name);
    setRenameDialogOpen(true);
  };
  
  // Handle submitting the rename
  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemForRename && newNameValue.trim()) {
      updateItem(selectedItemForRename.id, newNameValue.trim());
      setRenameDialogOpen(false);
    }
  };
  
  // Handle closing the rename dialog
  const handleRenameCancel = () => {
    setRenameDialogOpen(false);
    setSelectedItemForRename(null);
    setNewNameValue('');
  };
  
  // Get root items (items with no parent)
  const rootItems = state.items.filter(item => item.parentId === null);
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-xl font-medium tracking-tight">Explorer</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2"
              onClick={() => handleCreateRootItem('folder')}
            >
              <FolderPlus className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">New Folder</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2"
              onClick={() => handleCreateRootItem('file')}
            >
              <FilePlus className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">New File</span>
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto min-h-0 relative px-2">
          {state.isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : rootItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No items yet. Create a new folder or file to get started.</p>
            </div>
          ) : (
            <div className="pb-4">
              {rootItems
                .sort((a, b) => {
                  // Sort folders first, then files, then alphabetically
                  if (a.type === 'folder' && b.type !== 'folder') return -1;
                  if (a.type !== 'folder' && b.type === 'folder') return 1;
                  return a.name.localeCompare(b.name);
                })
                .map(item => (
                  <DirectoryItem
                    key={item.id}
                    item={item}
                    level={0}
                    expandedFolders={expandedFolders}
                    onToggleExpand={handleToggleExpand}
                    onRenameClick={handleRenameClick}
                  />
                ))}
            </div>
          )}
        </div>
        
        {/* Rename Dialog */}
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent className="glass-panel">
            <DialogHeader>
              <DialogTitle>Rename {selectedItemForRename?.type}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRenameSubmit}>
              <div className="py-4">
                <Label htmlFor="name">New name</Label>
                <Input
                  id="name"
                  value={newNameValue}
                  onChange={(e) => setNewNameValue(e.target.value)}
                  placeholder="Enter new name"
                  className="mt-2"
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleRenameCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  Rename
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
};
