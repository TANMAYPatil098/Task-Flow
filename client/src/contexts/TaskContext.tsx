import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

// Define our data types
export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  createdAt: string;
}

export interface List {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  lists: List[];
  githubRepo?: string;
}

interface TaskContextType {
  boards: Board[];
  activeBoard: Board | null;
  setActiveBoard: (boardId: string) => void;
  createBoard: (title: string) => void;
  createList: (boardId: string, title: string) => void;
  updateListTitle: (boardId: string, listId: string, newTitle: string) => void;
  deleteList: (boardId: string, listId: string) => void;
  createTask: (boardId: string, listId: string, task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (boardId: string, listId: string, taskId: string, updates: Partial<Task>) => void;
  moveTask: (sourceBoardId: string, sourceListId: string, sourceTaskId: string, 
             destBoardId: string, destListId: string) => void;
  deleteTask: (boardId: string, listId: string, taskId: string) => void;
  connectGithubRepo: (boardId: string, repoUrl: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoard, setActiveBoardState] = useState<Board | null>(null);

  useEffect(() => {
    if (user) {
      // In a real app, you'd fetch boards from your API
      // For demo, we'll use localStorage
      const savedBoards = localStorage.getItem(`taskApp_boards_${user.id}`);
      if (savedBoards) {
        try {
          const parsedBoards = JSON.parse(savedBoards);
          setBoards(parsedBoards);
          
          // Set active board if there's at least one board
          if (parsedBoards.length > 0 && !activeBoard) {
            setActiveBoardState(parsedBoards[0]);
          }
        } catch (e) {
          console.error('Failed to parse saved boards:', e);
          // Initialize with empty boards if parsing fails
          setBoards([]);
        }
      } else {
        // Create a default board for new users
        const defaultBoard: Board = {
          id: generateId(),
          title: 'My First Board',
          lists: [
            {
              id: generateId(),
              title: 'To Do',
              tasks: []
            },
            {
              id: generateId(),
              title: 'In Progress',
              tasks: []
            },
            {
              id: generateId(),
              title: 'Done',
              tasks: []
            }
          ]
        };
        
        setBoards([defaultBoard]);
        setActiveBoardState(defaultBoard);
      }
    } else {
      // Clear boards if user logs out
      setBoards([]);
      setActiveBoardState(null);
    }
  }, [user]);

  // Save boards to localStorage whenever they change
  useEffect(() => {
    if (user && boards.length > 0) {
      localStorage.setItem(`taskApp_boards_${user.id}`, JSON.stringify(boards));
    }
  }, [boards, user]);

  const setActiveBoard = (boardId: string) => {
    const board = boards.find(b => b.id === boardId) || null;
    setActiveBoardState(board);
  };

  const createBoard = (title: string) => {
    const newBoard: Board = {
      id: generateId(),
      title,
      lists: [
        {
          id: generateId(),
          title: 'To Do',
          tasks: []
        },
        {
          id: generateId(),
          title: 'In Progress',
          tasks: []
        },
        {
          id: generateId(),
          title: 'Done',
          tasks: []
        }
      ]
    };
    
    setBoards(prev => [...prev, newBoard]);
    setActiveBoardState(newBoard);
    toast.success('Board created');
  };

  const createList = (boardId: string, title: string) => {
    setBoards(prevBoards => 
      prevBoards.map(board => {
        if (board.id === boardId) {
          return {
            ...board,
            lists: [
              ...board.lists,
              {
                id: generateId(),
                title,
                tasks: []
              }
            ]
          };
        }
        return board;
      })
    );
    
    if (activeBoard?.id === boardId) {
      setActiveBoardState(prev => 
        prev ? {
          ...prev,
          lists: [
            ...prev.lists,
            {
              id: generateId(),
              title,
              tasks: []
            }
          ]
        } : null
      );
    }
    
    toast.success('List created');
  };

  const updateListTitle = (boardId: string, listId: string, newTitle: string) => {
    setBoards(prevBoards => 
      prevBoards.map(board => {
        if (board.id === boardId) {
          return {
            ...board,
            lists: board.lists.map(list => {
              if (list.id === listId) {
                return {
                  ...list,
                  title: newTitle
                };
              }
              return list;
            })
          };
        }
        return board;
      })
    );
    
    if (activeBoard?.id === boardId) {
      setActiveBoardState(prev => 
        prev ? {
          ...prev,
          lists: prev.lists.map(list => {
            if (list.id === listId) {
              return {
                ...list,
                title: newTitle
              };
            }
            return list;
          })
        } : null
      );
    }
  };

  const deleteList = (boardId: string, listId: string) => {
    setBoards(prevBoards => 
      prevBoards.map(board => {
        if (board.id === boardId) {
          return {
            ...board,
            lists: board.lists.filter(list => list.id !== listId)
          };
        }
        return board;
      })
    );
    
    if (activeBoard?.id === boardId) {
      setActiveBoardState(prev => 
        prev ? {
          ...prev,
          lists: prev.lists.filter(list => list.id !== listId)
        } : null
      );
    }
  };

  const createTask = (boardId: string, listId: string, taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    
    setBoards(prevBoards => 
      prevBoards.map(board => {
        if (board.id === boardId) {
          return {
            ...board,
            lists: board.lists.map(list => {
              if (list.id === listId) {
                return {
                  ...list,
                  tasks: [...list.tasks, newTask]
                };
              }
              return list;
            })
          };
        }
        return board;
      })
    );
    
    if (activeBoard?.id === boardId) {
      setActiveBoardState(prev => 
        prev ? {
          ...prev,
          lists: prev.lists.map(list => {
            if (list.id === listId) {
              return {
                ...list,
                tasks: [...list.tasks, newTask]
              };
            }
            return list;
          })
        } : null
      );
    }
    
    toast.success('Task created');
  };

  const updateTask = (boardId: string, listId: string, taskId: string, updates: Partial<Task>) => {
    setBoards(prevBoards => 
      prevBoards.map(board => {
        if (board.id === boardId) {
          return {
            ...board,
            lists: board.lists.map(list => {
              if (list.id === listId) {
                return {
                  ...list,
                  tasks: list.tasks.map(task => 
                    task.id === taskId ? { ...task, ...updates } : task
                  )
                };
              }
              return list;
            })
          };
        }
        return board;
      })
    );
    
    if (activeBoard?.id === boardId) {
      setActiveBoardState(prev => 
        prev ? {
          ...prev,
          lists: prev.lists.map(list => {
            if (list.id === listId) {
              return {
                ...list,
                tasks: list.tasks.map(task => 
                  task.id === taskId ? { ...task, ...updates } : task
                )
              };
            }
            return list;
          })
        } : null
      );
    }
    
    toast.success('Task updated');
  };

  const moveTask = (
    sourceBoardId: string, 
    sourceListId: string, 
    sourceTaskId: string, 
    destBoardId: string, 
    destListId: string
  ) => {
    // Find the task in the source list
    let taskToMove: Task | undefined;
    
    const updatedBoards = boards.map(board => {
      if (board.id === sourceBoardId) {
        return {
          ...board,
          lists: board.lists.map(list => {
            if (list.id === sourceListId) {
              // Find the task to move and remove it from the source list
              const taskIndex = list.tasks.findIndex(task => task.id === sourceTaskId);
              if (taskIndex !== -1) {
                taskToMove = list.tasks[taskIndex];
                return {
                  ...list,
                  tasks: [
                    ...list.tasks.slice(0, taskIndex),
                    ...list.tasks.slice(taskIndex + 1)
                  ]
                };
              }
            }
            return list;
          })
        };
      }
      return board;
    });
    
    if (!taskToMove) {
      console.error('Task not found');
      return;
    }
    
    // Add the task to the destination list
    const finalBoards = updatedBoards.map(board => {
      if (board.id === destBoardId) {
        return {
          ...board,
          lists: board.lists.map(list => {
            if (list.id === destListId) {
              return {
                ...list,
                tasks: [...list.tasks, taskToMove!]
              };
            }
            return list;
          })
        };
      }
      return board;
    });
    
    setBoards(finalBoards);
    
    // Update activeBoard if needed
    if (activeBoard && (activeBoard.id === sourceBoardId || activeBoard.id === destBoardId)) {
      const updatedActiveBoard = finalBoards.find(board => board.id === activeBoard.id) || null;
      setActiveBoardState(updatedActiveBoard);
    }
    
    toast.success('Task moved');
  };

  const deleteTask = (boardId: string, listId: string, taskId: string) => {
    setBoards(prevBoards => 
      prevBoards.map(board => {
        if (board.id === boardId) {
          return {
            ...board,
            lists: board.lists.map(list => {
              if (list.id === listId) {
                return {
                  ...list,
                  tasks: list.tasks.filter(task => task.id !== taskId)
                };
              }
              return list;
            })
          };
        }
        return board;
      })
    );
    
    if (activeBoard?.id === boardId) {
      setActiveBoardState(prev => 
        prev ? {
          ...prev,
          lists: prev.lists.map(list => {
            if (list.id === listId) {
              return {
                ...list,
                tasks: list.tasks.filter(task => task.id !== taskId)
              };
            }
            return list;
          })
        } : null
      );
    }
  };

  const connectGithubRepo = (boardId: string, repoUrl: string) => {
    setBoards(prevBoards => 
      prevBoards.map(board => {
        if (board.id === boardId) {
          return {
            ...board,
            githubRepo: repoUrl
          };
        }
        return board;
      })
    );
    
    if (activeBoard?.id === boardId) {
      setActiveBoardState(prev => 
        prev ? {
          ...prev,
          githubRepo: repoUrl
        } : null
      );
    }
    
    toast.success('GitHub repository connected');
  };

  const value = {
    boards,
    activeBoard,
    setActiveBoard,
    createBoard,
    createList,
    updateListTitle,
    deleteList,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    connectGithubRepo
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

// Helper function to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
