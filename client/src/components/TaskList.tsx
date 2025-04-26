
import React, { useState } from 'react';
import { useTaskContext, List, Task } from '@/contexts/TaskContext';
import TaskCard from './TaskCard';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface TaskListProps {
  list: List;
  boardId: string;
}

const listColors = {
  'To Do': 'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800',
  'In Progress': 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
  'Done': 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
};

const TaskList = ({ list, boardId }: TaskListProps) => {
  const { createTask, moveTask } = useTaskContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    dueDate: null,
    priority: 'medium',
    status: 'todo',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      createTask(boardId, list.id, newTask);
      setNewTask({
        title: '',
        description: '',
        dueDate: null,
        priority: 'medium',
        status: 'todo',
      });
      setIsDialogOpen(false);
    } else {
      toast.error("Task title cannot be empty");
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceListId', list.id);
    e.dataTransfer.setData('sourceBoardId', boardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const sourceListId = e.dataTransfer.getData('sourceListId');
    const sourceBoardId = e.dataTransfer.getData('sourceBoardId');
    
    if (sourceListId !== list.id) {
      moveTask(sourceBoardId, sourceListId, taskId, boardId, list.id);
    }
  };

  const listClassName = `list-container ${listColors[list.title] || 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700'}`;

  return (
    <div 
      className={listClassName}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex-grow overflow-y-auto space-y-2 px-2">
        {list.tasks.map(task => (
          <div 
            key={task.id} 
            draggable 
            onDragStart={(e) => handleDragStart(e, task.id)}
            className="transform transition-transform duration-200 hover:scale-105"
          >
            <TaskCard task={task} boardId={boardId} listId={list.id} />
          </div>
        ))}
      </div>
      <div className="pt-3 mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-center" 
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                name="title"
                value={newTask.title}
                onChange={handleChange}
                placeholder="Task title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                value={newTask.description}
                onChange={handleChange}
                placeholder="Task description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input 
                id="dueDate"
                name="dueDate"
                type="date"
                value={newTask.dueDate || ''}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newTask.priority}
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
            <Button onClick={handleCreateTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;
