
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, FolderTree } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-accent/30">
      <div className="container max-w-3xl mx-auto px-8 py-12 animate-fade-in">
        <div className="glass-panel rounded-2xl p-10 shadow-md">
          <div className="flex justify-center mb-8">
            <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FolderTree className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-center mb-4 tracking-tight">File Directory Explorer</h1>
          
          <p className="text-lg text-center text-muted-foreground mb-8">
            A beautiful, intuitive interface to manage your files and folders with ease
          </p>
          
          <div className="flex justify-center">
            <Button
              size="lg"
              className="gap-2 text-base px-8 py-6 rounded-full shadow-md transition-all duration-300 hover:shadow-lg"
              onClick={() => navigate('/directory')}
            >
              Explore Files
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Feature 
              title="Create & Organize" 
              description="Create new files and folders to organize your digital workspace efficiently."
            />
            <Feature 
              title="Drag & Drop" 
              description="Easily move files between folders with intuitive drag and drop functionality."
            />
            <Feature 
              title="Persistent State" 
              description="Your file structure is saved automatically and persists across page reloads."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Feature = ({ title, description }: { title: string; description: string }) => (
  <div className="glass-panel p-6 rounded-xl directory-item">
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Index;
