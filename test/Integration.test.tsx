import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { toast } from 'sonner';
import Home from '../app/page';

// Mock the entire API module
jest.mock('@/lib/api', () => ({
  taskAPI: {
    getAllTasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  },
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));


afterAll(() => {
  jest.restoreAllMocks();
});

// Mock the child components to focus on integration logic
jest.mock('@/components/task-form', () => ({
  TaskForm: ({ onSubmit, isLoading }: any) => (
    <div data-testid="task-form">
      <input
        data-testid="task-title-input"
        placeholder="Task title"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSubmit({
              title: (e.target as HTMLInputElement).value,
              description: 'Test description',
              priority: 'medium',
            });
          }
        }}
      />
      <button
        data-testid="create-task-btn"
        disabled={isLoading}
        onClick={() =>
          onSubmit({
            title: 'New Task',
            description: 'Test description',
            priority: 'medium',
          })
        }
      >
        {isLoading ? 'Creating...' : 'Create Task'}
      </button>
    </div>
  ),
}));

jest.mock('@/components/task-list', () => ({
  TaskList: ({ tasks, onUpdate, onDelete }: any) => (
    <div data-testid="task-list">
      {tasks.map((task: any) => (
        <div key={task.id} data-testid={`task-${task.id}`}>
          <span data-testid={`task-title-${task.id}`}>{task.title}</span>
          <span data-testid={`task-description-${task.id}`}>{task.description}</span>
          <span data-testid={`task-status-${task.id}`}>
            {task.completed ? 'Completed' : 'Incomplete'}
          </span>
          <button
            data-testid={`toggle-task-${task.id}`}
            onClick={() => onUpdate(task.id, { completed: !task.completed })}
          >
            {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
          </button>
          <button
            data-testid={`delete-task-${task.id}`}
            onClick={() => onDelete(task.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@/components/task-filters', () => ({
  TaskFilters: ({ currentFilter, onFilterChange, taskCounts }: any) => (
    <div data-testid="task-filters">
      <button
        data-testid="filter-all"
        onClick={() => onFilterChange('all')}
        className={currentFilter === 'all' ? 'active' : ''}
      >
        All ({taskCounts.all})
      </button>
      <button
        data-testid="filter-completed"
        onClick={() => onFilterChange('completed')}
        className={currentFilter === 'completed' ? 'active' : ''}
      >
        Completed ({taskCounts.completed})
      </button>
      <button
        data-testid="filter-incomplete"
        onClick={() => onFilterChange('incomplete')}
        className={currentFilter === 'incomplete' ? 'active' : ''}
      >
        Incomplete ({taskCounts.incomplete})
      </button>
    </div>
  ),
}));

jest.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Toggle Theme</button>,
}));

import { taskAPI } from '@/lib/api';

const mockTaskAPI = taskAPI as jest.Mocked<typeof taskAPI>;

describe('TaskFlow Integration Tests', () => {
  const mockTasks = [
    {
      id: '1',
      title: 'Complete project',
      description: 'Finish the TaskFlow application',
      completed: false,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Review code',
      description: 'Review pull requests',
      completed: true,
      createdAt: '2024-01-02T11:00:00Z',
      updatedAt: '2024-01-02T11:30:00Z',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Write tests',
      description: 'Add integration tests',
      completed: false,
      createdAt: '2024-01-03T12:00:00Z',
      updatedAt: '2024-01-03T12:00:00Z',
      priority: 'low',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset toast mocks
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
  });

  describe('Initial Load and Display', () => {
    it('should load and display tasks on initial render', async () => {
      mockTaskAPI.getAllTasks.mockResolvedValue(mockTasks);

      render(<Home />);

      // Check loading state
      expect(screen.getByText(/loading your tasks/i)).toBeInTheDocument();

      // Wait for tasks to load
      await waitFor(() => {
        expect(screen.queryByText(/loading your tasks/i)).not.toBeInTheDocument();
      });

      // Check that TaskFlow header is displayed
      expect(screen.getByText('TaskFlow')).toBeInTheDocument();
      expect(screen.getByText('Stay organized, get things done')).toBeInTheDocument();

      // Check that all tasks are displayed
      expect(screen.getByTestId('task-1')).toBeInTheDocument();
      expect(screen.getByTestId('task-2')).toBeInTheDocument();
      expect(screen.getByTestId('task-3')).toBeInTheDocument();

      // Verify task content
      expect(screen.getByTestId('task-title-1')).toHaveTextContent('Complete project');
      expect(screen.getByTestId('task-description-1')).toHaveTextContent('Finish the TaskFlow application');
      expect(screen.getByTestId('task-status-1')).toHaveTextContent('Incomplete');
      expect(screen.getByTestId('task-status-2')).toHaveTextContent('Completed');
    });

    it('should handle API error on initial load', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockTaskAPI.getAllTasks.mockRejectedValue(new Error('Network error'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.queryByText(/loading your tasks/i)).not.toBeInTheDocument();
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to load tasks');
      expect(screen.getByText('TaskFlow')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Task Creation Integration', () => {
    it('should create a new task and update the UI', async () => {
      const newTask = {
        id: '4',
        title: 'New Task',
        description: 'Test description',
        completed: false,
        createdAt: '2024-01-04T13:00:00Z',
        updatedAt: '2024-01-04T13:00:00Z',
        priority: 'medium',
      };

      mockTaskAPI.getAllTasks.mockResolvedValue(mockTasks);
      mockTaskAPI.createTask.mockResolvedValue(newTask);

      render(<Home />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByText(/loading your tasks/i)).not.toBeInTheDocument();
      });

      // Create a new task
      const createButton = screen.getByTestId('create-task-btn');
      
      await act(async () => {
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(mockTaskAPI.createTask).toHaveBeenCalledWith({
          title: 'New Task',
          description: 'Test description',
          priority: 'medium',
        });
      });

      expect(toast.success).toHaveBeenCalledWith('Task created successfully!');
      
      // Verify the new task appears in the list
      await waitFor(() => {
        expect(screen.getByTestId('task-4')).toBeInTheDocument();
      });
    });

    it('should handle task creation error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockTaskAPI.getAllTasks.mockResolvedValue(mockTasks);
      mockTaskAPI.createTask.mockRejectedValue(new Error('Failed to create'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.queryByText(/loading your tasks/i)).not.toBeInTheDocument();
      });

      const createButton = screen.getByTestId('create-task-btn');
      
      await act(async () => {
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to create task');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Task Update Integration', () => {
    it('should toggle task completion status', async () => {
      const updatedTask = { ...mockTasks[0], completed: true, updatedAt: '2024-01-01T14:00:00Z' };
      
      mockTaskAPI.getAllTasks.mockResolvedValue(mockTasks);
      mockTaskAPI.updateTask.mockResolvedValue(updatedTask);

      render(<Home />);

      await waitFor(() => {
        expect(screen.queryByText(/loading your tasks/i)).not.toBeInTheDocument();
      });

      // Initially incomplete
      expect(screen.getByTestId('task-status-1')).toHaveTextContent('Incomplete');

      // Toggle completion
      const toggleButton = screen.getByTestId('toggle-task-1');
      
      await act(async () => {
        fireEvent.click(toggleButton);
      });

      await waitFor(() => {
        expect(mockTaskAPI.updateTask).toHaveBeenCalledWith('1', { completed: true });
      });

      expect(toast.success).toHaveBeenCalledWith('Task completed!');
      
      // Verify status updated
      await waitFor(() => {
        expect(screen.getByTestId('task-status-1')).toHaveTextContent('Completed');
      });
    });

    it('should handle task update error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockTaskAPI.getAllTasks.mockResolvedValue(mockTasks);
      mockTaskAPI.updateTask.mockRejectedValue(new Error('Update failed'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.queryByText(/loading your tasks/i)).not.toBeInTheDocument();
      });

      const toggleButton = screen.getByTestId('toggle-task-1');
      
      await act(async () => {
        fireEvent.click(toggleButton);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to update task');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Task Deletion Integration', () => {
    it('should delete a task and update the UI', async () => {
      mockTaskAPI.getAllTasks.mockResolvedValue(mockTasks);
      mockTaskAPI.deleteTask.mockResolvedValue(undefined);

      render(<Home />);

      await waitFor(() => {
        expect(screen.queryByText(/loading your tasks/i)).not.toBeInTheDocument();
      });

      // Verify task exists
      expect(screen.getByTestId('task-1')).toBeInTheDocument();

      // Delete the task
      const deleteButton = screen.getByTestId('delete-task-1');
      
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(mockTaskAPI.deleteTask).toHaveBeenCalledWith('1');
      });

      expect(toast.success).toHaveBeenCalledWith('Task deleted successfully!');
      
      // Verify task is removed from UI
      await waitFor(() => {
        expect(screen.queryByTestId('task-1')).not.toBeInTheDocument();
      });
    });

    it('should handle task deletion error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockTaskAPI.getAllTasks.mockResolvedValue(mockTasks);
      mockTaskAPI.deleteTask.mockRejectedValue(new Error('Delete failed'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.queryByText(/loading your tasks/i)).not.toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-task-1');
      
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to delete task');
      });

      // Verify task is still in UI
      expect(screen.getByTestId('task-1')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Task Filtering Integration', () => {
    it('should filter tasks correctly', async () => {
      mockTaskAPI.getAllTasks.mockResolvedValue(mockTasks);

      render(<Home />);

      await waitFor(() => {
        expect(screen.queryByText(/loading your tasks/i)).not.toBeInTheDocument();
      });

      // Initially all tasks should be visible
      expect(screen.getByTestId('task-1')).toBeInTheDocument();
      expect(screen.getByTestId('task-2')).toBeInTheDocument();
      expect(screen.getByTestId('task-3')).toBeInTheDocument();

      // Filter to completed tasks
      const completedFilter = screen.getByTestId('filter-completed');
      fireEvent.click(completedFilter);

      await waitFor(() => {
        expect(screen.queryByTestId('task-1')).not.toBeInTheDocument();
        expect(screen.getByTestId('task-2')).toBeInTheDocument();
        expect(screen.queryByTestId('task-3')).not.toBeInTheDocument();
      });

      // Filter to incomplete tasks
      const incompleteFilter = screen.getByTestId('filter-incomplete');
      fireEvent.click(incompleteFilter);

      await waitFor(() => {
        expect(screen.getByTestId('task-1')).toBeInTheDocument();
        expect(screen.queryByTestId('task-2')).not.toBeInTheDocument();
        expect(screen.getByTestId('task-3')).toBeInTheDocument();
      });

      // Back to all tasks
      const allFilter = screen.getByTestId('filter-all');
      fireEvent.click(allFilter);

      await waitFor(() => {
        expect(screen.getByTestId('task-1')).toBeInTheDocument();
        expect(screen.getByTestId('task-2')).toBeInTheDocument();
        expect(screen.getByTestId('task-3')).toBeInTheDocument();
      });
    });

    it('should update task counts correctly', async () => {
      mockTaskAPI.getAllTasks.mockResolvedValue(mockTasks);

      render(<Home />);

      await waitFor(() => {
        expect(screen.queryByText(/loading your tasks/i)).not.toBeInTheDocument();
      });

      // Check initial counts (3 total, 1 completed, 2 incomplete)
      expect(screen.getByTestId('filter-all')).toHaveTextContent('All (3)');
      expect(screen.getByTestId('filter-completed')).toHaveTextContent('Completed (1)');
      expect(screen.getByTestId('filter-incomplete')).toHaveTextContent('Incomplete (2)');
    });
  });

  describe('Complete User Journey Integration', () => {
    it('should handle complete task lifecycle', async () => {
      const newTask = {
        id: '4',
        title: 'Integration Test Task',
        description: 'Testing complete flow',
        completed: false,
        createdAt: '2024-01-04T13:00:00Z',
        updatedAt: '2024-01-04T13:00:00Z',
        priority: 'high',
      };

      const updatedTask = { ...newTask, completed: true, updatedAt: '2024-01-04T14:00:00Z' };

      mockTaskAPI.getAllTasks.mockResolvedValue(mockTasks);
      mockTaskAPI.createTask.mockResolvedValue(newTask);
      mockTaskAPI.updateTask.mockResolvedValue(updatedTask);
      mockTaskAPI.deleteTask.mockResolvedValue(undefined);

      render(<Home />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByText(/loading your tasks/i)).not.toBeInTheDocument();
      });

      // Step 1: Create a new task
      const createButton = screen.getByTestId('create-task-btn');
      await act(async () => {
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('task-4')).toBeInTheDocument();
        expect(screen.getByTestId('task-status-4')).toHaveTextContent('Incomplete');
      });

      // Step 2: Mark task as complete
      const toggleButton = screen.getByTestId('toggle-task-4');
      await act(async () => {
        fireEvent.click(toggleButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('task-status-4')).toHaveTextContent('Completed');
      });

      // Step 3: Filter to completed tasks
      const completedFilter = screen.getByTestId('filter-completed');
      fireEvent.click(completedFilter);

      await waitFor(() => {
        expect(screen.getByTestId('task-4')).toBeInTheDocument();
        expect(screen.queryByTestId('task-1')).not.toBeInTheDocument();
      });

      // Step 4: Switch back to all tasks and delete the task
      const allFilter = screen.getByTestId('filter-all');
      fireEvent.click(allFilter);

      await waitFor(() => {
        expect(screen.getByTestId('task-4')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-task-4');
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('task-4')).not.toBeInTheDocument();
      });

      // Verify all API calls were made
      expect(mockTaskAPI.getAllTasks).toHaveBeenCalledTimes(1);
      expect(mockTaskAPI.createTask).toHaveBeenCalledTimes(1);
      expect(mockTaskAPI.updateTask).toHaveBeenCalledTimes(1);
      expect(mockTaskAPI.deleteTask).toHaveBeenCalledTimes(1);

      // Verify toast notifications
      expect(toast.success).toHaveBeenCalledWith('Task created successfully!');
      expect(toast.success).toHaveBeenCalledWith('Task completed!');
      expect(toast.success).toHaveBeenCalledWith('Task deleted successfully!');
    });
  });
});