
import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronDown, Folder, File, MoreHorizontal, Edit, Trash, FolderPlus, FilePlus, Move } from 'lucide-react';
import { DirectoryItem as DirectoryItemType } from '../../types/directory';
import { useDirectory } from '../../contexts/DirectoryContext';
import { cn } from '../../lib/utils';

// Import UI components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useDrag, useDrop } from 'react-dnd';

interface DirectoryItemProps {
  item: DirectoryItemType;
  level: number;
  expandedFolders: string[];
  onToggleExpand: (id: string) => void;
  onRenameClick: (item: DirectoryItemType) => void;
}

export const DirectoryItem: React.FC<DirectoryItemProps> = ({
  item,
  level,
  expandedFolders,
  onToggleExpand,
  onRenameClick,
}) => {
  const { state, addItem, deleteItem, moveItem, selectItem } = useDirectory();
  const [isHovered, setIsHovered] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  
  const isExpanded = expandedFolders.includes(item.id);
  const isFolder = item.type === 'folder';
  const isSelected = state.selectedItem === item.id;
  
  const childItems = state.items.filter(i => i.parentId === item.id);
  const hasChildren = childItems.length > 0;
  
  // Drag and drop functionality
  const [{ isDragging }, drag] = useDrag({
    type: 'DIRECTORY_ITEM',
    item: { id: item.id, type: item.type },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'DIRECTORY_ITEM',
    canDrop: (draggedItem: { id: string, type: string }) => {
      // Cannot drop onto itself
      if (draggedItem.id === item.id) return false;
      
      // Can only drop into folders
      if (item.type !== 'folder') return false;
      
      // Prevent circular references (cannot drop a folder into its descendant)
      let currentParent = item.parentId;
      while (currentParent !== null) {
        if (currentParent === draggedItem.id) return false;
        const parent = state.items.find(i => i.id === currentParent);
        currentParent = parent?.parentId || null;
      }
      
      return true;
    },
    drop: (draggedItem: { id: string }) => {
      moveItem(draggedItem.id, item.id);
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  
  // For root-level drop zone
  const isRoot = level === 0 && item.parentId === null;
  
  // Connect the drag and drop refs
  const dragDropRef = isFolder ? drop(drag(itemRef)) : drag(itemRef);
  
  // Handle item click
  const handleItemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectItem(item.id);
    
    if (isFolder && hasChildren) {
      onToggleExpand(item.id);
    }
  };
  
  // Handle creating a new item
  const handleCreate = (type: 'file' | 'folder') => {
    const itemType = type === 'folder' ? 'folder' : 'file';
    const newName = type === 'folder' ? 'New Folder' : 'New File';
    addItem(newName, itemType, item.id);
    
    // Auto-expand the folder when adding a new item
    if (!isExpanded) {
      onToggleExpand(item.id);
    }
  };
  
  return (
    <div className="directory-item">
      <div
        ref={dragDropRef}
        className={cn(
          'flex items-center py-1 px-2 rounded-md transition-all duration-200 select-none',
          isHovered && 'bg-accent/60',
          isSelected && 'bg-primary/10',
          isDragging && 'opacity-50',
          isOver && canDrop && 'bg-primary/20',
          isOver && !canDrop && 'bg-destructive/20'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleItemClick}
      >
        <div className="flex items-center flex-1 min-w-0">
          {isFolder ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 mr-1 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(item.id);
              }}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )
              ) : (
                <div className="w-4" />
              )}
            </Button>
          ) : (
            <div className="w-5 mr-1" />
          )}
          
          {isFolder ? (
            <Folder className="h-4 w-4 mr-2 text-primary" />
          ) : (
            <File className="h-4 w-4 mr-2 text-muted-foreground" />
          )}
          
          <span className="truncate text-sm">{item.name}</span>
        </div>
        
        {(isHovered || isSelected) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 glass-panel">
              <DropdownMenuItem onClick={() => onRenameClick(item)}>
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => deleteItem(item.id)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
              
              {isFolder && (
                <>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => handleCreate('folder')}>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Folder
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => handleCreate('file')}>
                    <FilePlus className="h-4 w-4 mr-2" />
                    New File
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {isFolder && isExpanded && hasChildren && (
        <div className="transition-all duration-300 animate-accordion-down">
          {childItems
            .sort((a, b) => {
              // Sort folders first, then files, then alphabetically
              if (a.type === 'folder' && b.type !== 'folder') return -1;
              if (a.type !== 'folder' && b.type === 'folder') return 1;
              return a.name.localeCompare(b.name);
            })
            .map((childItem) => (
              <DirectoryItem
                key={childItem.id}
                item={childItem}
                level={level + 1}
                expandedFolders={expandedFolders}
                onToggleExpand={onToggleExpand}
                onRenameClick={onRenameClick}
              />
            ))}
        </div>
      )}
    </div>
  );
};
