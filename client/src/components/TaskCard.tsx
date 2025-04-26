
import React from 'react';
import { useTaskContext, Task } from '@/contexts/TaskContext';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TaskCardProps {
  task: Task;
  boardId: string;
  listId: string;
}

const priorityColors = {
  low: 'bg-blue-500/80',
  medium: 'bg-yellow-500/80',
  high: 'bg-red-500/80'
};

const TaskCard = ({ task, boardId, listId }: TaskCardProps) => {
  const { updateTask, deleteTask } = useTaskContext();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editedTask, setEditedTask] = React.useState<Task>({ ...task });

  const handleSave = () => {
    if (!editedTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    updateTask(boardId, listId, task.id, editedTask);
    setIsDialogOpen(false);
    toast.success('Task updated successfully');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(boardId, listId, task.id);
    toast.success('Task deleted successfully');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <div 
        className="task-card group animate-task-appear cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
        draggable
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm truncate text-gray-800 dark:text-gray-200">{task.title}</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`}></div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
            </Button>
          </div>
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
        )}
        {task.dueDate && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                name="title"
                value={editedTask.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                value={editedTask.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input 
                id="dueDate"
                name="dueDate"
                type="date"
                value={editedTask.dueDate || ''}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={editedTask.priority}
                onValueChange={(value) => handleSelectChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskCard;
