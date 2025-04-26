
import React, { useState } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import TaskList from './TaskList';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Board = () => {
  const { activeBoard, createList, deleteList, updateListTitle } = useTaskContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [editingList, setEditingList] = useState({ id: '', title: '' });
  const [isGithubDialogOpen, setIsGithubDialogOpen] = useState(false);
  const [githubRepo, setGithubRepo] = useState('');

  const handleCreateList = () => {
    if (newListTitle.trim() && activeBoard) {
      createList(activeBoard.id, newListTitle.trim());
      setNewListTitle('');
      setIsDialogOpen(false);
      toast.success(`List "${newListTitle.trim()}" created successfully`);
    } else {
      toast.error("List title cannot be empty");
    }
  };

  const handleEditList = () => {
    if (editingList.title.trim() && activeBoard) {
      updateListTitle(activeBoard.id, editingList.id, editingList.title);
      setIsEditDialogOpen(false);
      toast.success(`List renamed to "${editingList.title}"`);
    } else {
      toast.error("List title cannot be empty");
    }
  };

  const handleDeleteList = (listId: string, listTitle: string) => {
    if (activeBoard) {
      deleteList(activeBoard.id, listId);
      toast.success(`List "${listTitle}" deleted`);
    }
  };

  const openEditDialog = (list: { id: string, title: string }) => {
    setEditingList({ id: list.id, title: list.title });
    setIsEditDialogOpen(true);
  };

  const handleConnectGithub = () => {
    if (githubRepo.trim() && activeBoard) {
      // Validate GitHub repo URL format
      const githubUrlPattern = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-_\.]+\/?$/;
      
      if (!githubUrlPattern.test(githubRepo.trim())) {
        toast.error("Please enter a valid GitHub repository URL");
        return;
      }
      
      // In a real implementation, this would validate and setup GitHub webhooks
      const { connectGithubRepo } = useTaskContext();
      connectGithubRepo(activeBoard.id, githubRepo.trim());
      setGithubRepo('');
      setIsGithubDialogOpen(false);
    } else {
      toast.error("GitHub repository URL cannot be empty");
    }
  };

  if (!activeBoard) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">No Board Selected</h2>
          <p className="text-muted-foreground">
            Please select or create a board to get started.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{activeBoard.title}</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsGithubDialogOpen(true)}
            >
              {activeBoard.githubRepo ? 'Change GitHub Repo' : 'Connect GitHub Repo'}
            </Button>
          </div>
        </div>
        
        <div className="board-container justify-center">
          {activeBoard.lists.map(list => (
            <div key={list.id} className="flex flex-col">
              <div className="flex items-center justify-between mb-2 px-4">
                <h3 className="font-semibold">{list.title}</h3>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => openEditDialog(list)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-destructive" 
                    onClick={() => handleDeleteList(list.id, list.title)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <TaskList key={list.id} list={list} boardId={activeBoard.id} />
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="flex-shrink-0 h-12 px-4 bg-background"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add List
          </Button>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="list-title">List Title</Label>
            <Input 
              id="list-title"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="Enter list title"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateList}>Create List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit List</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-list-title">List Title</Label>
            <Input 
              id="edit-list-title"
              value={editingList.title}
              onChange={(e) => setEditingList({...editingList, title: e.target.value})}
              placeholder="Enter list title"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditList}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isGithubDialogOpen} onOpenChange={setIsGithubDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect GitHub Repository</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="github-repo">Repository URL</Label>
            <Input 
              id="github-repo"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Connecting a GitHub repository will allow tasks to be automatically closed when a commit message contains the task ID.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsGithubDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConnectGithub}>Connect Repository</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Board;
