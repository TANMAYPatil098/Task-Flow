
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserAvatar from './UserAvatar';
import ThemeToggle from './ThemeToggle';
import { Plus, LogOut } from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { boards, activeBoard, setActiveBoard, createBoard } = useTaskContext();
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newBoardTitle, setNewBoardTitle] = React.useState('');

  const handleCreateBoard = () => {
    if (newBoardTitle.trim()) {
      createBoard(newBoardTitle.trim());
      setNewBoardTitle('');
      setIsDialogOpen(false);
    }
  };

  return (
    <header className="border-b px-4 py-3 flex items-center justify-between bg-background">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          TaskFlow
        </h1>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="min-w-[150px] justify-start">
              {activeBoard ? activeBoard.title : 'Select Board'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[200px]">
            <div className="py-2">
              {boards.map(board => (
                <Button
                  key={board.id}
                  variant={activeBoard?.id === board.id ? "secondary" : "ghost"}
                  className="w-full justify-start rounded-none"
                  onClick={() => setActiveBoard(board.id)}
                >
                  {board.title}
                </Button>
              ))}
              
              <Button 
                variant="ghost" 
                className="w-full justify-start rounded-none"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Board
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <UserAvatar />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={logout}
            aria-label="Logout"
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="board-title">Board Title</Label>
            <Input 
              id="board-title" 
              value={newBoardTitle} 
              onChange={e => setNewBoardTitle(e.target.value)} 
              placeholder="Enter board title"
              className="mt-2"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateBoard}>Create Board</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Navigation;
