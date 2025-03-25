
import React from 'react';
import { Check, Folder, File, Clock, AlertCircle } from 'lucide-react';
import { useDirectory } from '../../contexts/DirectoryContext';
import { format } from 'date-fns';

export const DirectoryView: React.FC = () => {
  const { state } = useDirectory();
  const { selectedItem, items } = state;
  
  if (!selectedItem) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
        <h3 className="text-lg font-medium mb-2">No item selected</h3>
        <p className="text-center text-sm">
          Select a file or folder from the explorer to view its details
        </p>
      </div>
    );
  }
  
  const item = items.find(i => i.id === selectedItem);
  
  if (!item) {
    return null;
  }
  
  const isFolder = item.type === 'folder';
  const childItems = isFolder ? items.filter(i => i.parentId === item.id) : [];
  const childFolders = childItems.filter(i => i.type === 'folder');
  const childFiles = childItems.filter(i => i.type === 'file');
  
  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center mb-6">
        {isFolder ? (
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
            <Folder className="h-8 w-8 text-primary" />
          </div>
        ) : (
          <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center mr-4">
            <File className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-medium">{item.name}</h2>
          <p className="text-sm text-muted-foreground">
            {isFolder ? 'Folder' : 'File'} • Last modified: {format(new Date(item.updatedAt), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      
      {isFolder && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          <div className="glass-panel p-4 rounded-lg">
            <h3 className="text-base font-medium mb-2 flex items-center">
              <Folder className="h-4 w-4 mr-2 text-primary" />
              Folders
            </h3>
            
            {childFolders.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No folders</p>
            ) : (
              <ul className="space-y-1">
                {childFolders.map(folder => (
                  <li key={folder.id} className="text-sm py-1 px-2 rounded-md item-hover">
                    {folder.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="glass-panel p-4 rounded-lg">
            <h3 className="text-base font-medium mb-2 flex items-center">
              <File className="h-4 w-4 mr-2 text-muted-foreground" />
              Files
            </h3>
            
            {childFiles.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No files</p>
            ) : (
              <ul className="space-y-1">
                {childFiles.map(file => (
                  <li key={file.id} className="text-sm py-1 px-2 rounded-md item-hover">
                    {file.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-6 glass-panel p-4 rounded-lg">
        <h3 className="text-base font-medium mb-3">Details</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">Type</span>
            <span>{isFolder ? 'Folder' : 'File'}</span>
          </div>
          
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">Created</span>
            <span>{format(new Date(item.createdAt), 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">Modified</span>
            <span>{format(new Date(item.updatedAt), 'MMM d, yyyy')}</span>
          </div>
          
          {isFolder && (
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Contains</span>
              <span>{childItems.length} item{childItems.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Location</span>
            <span>
              {item.parentId 
                ? `/${getParentPath(item.parentId, items)}`
                : '/'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get the full path of an item
const getParentPath = (parentId: string, items: any[]): string => {
  const parent = items.find(item => item.id === parentId);
  if (!parent) return '';
  
  const parentPath = parent.parentId 
    ? getParentPath(parent.parentId, items) 
    : '';
  
  return `${parentPath}${parent.name}/`;
};
