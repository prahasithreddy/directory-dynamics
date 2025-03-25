
import React, { useState } from 'react';
import { DirectoryProvider } from '../contexts/DirectoryContext';
import { DirectoryExplorer } from '../components/directory/DirectoryExplorer';
import { DirectoryView } from '../components/directory/DirectoryView';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

const FileDirectory: React.FC = () => {
  const [sidebarSize, setSidebarSize] = useState(30);
  
  const handleResizeEnd = (sizes: number[]) => {
    setSidebarSize(sizes[0]);
  };
  
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b px-6 py-3 glass-panel">
        <h1 className="text-xl font-semibold tracking-tight">File Directory</h1>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <DirectoryProvider>
          <ResizablePanelGroup
            direction="horizontal"
            onLayout={handleResizeEnd}
            className="h-full"
          >
            <ResizablePanel
              defaultSize={sidebarSize}
              minSize={20}
              maxSize={40}
              className="bg-accent/40 backdrop-blur-sm"
            >
              <DirectoryExplorer />
            </ResizablePanel>
            
            <ResizableHandle withHandle className="bg-border/50" />
            
            <ResizablePanel defaultSize={100 - sidebarSize} minSize={30}>
              <DirectoryView />
            </ResizablePanel>
          </ResizablePanelGroup>
        </DirectoryProvider>
      </main>
    </div>
  );
};

export default FileDirectory;
