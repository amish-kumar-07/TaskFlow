import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { toast } from 'sonner';
import Home from "@/app/page"; // Adjust path as needed
import { taskAPI } from '@/lib/api';
import { Task } from '@/types/task';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});


jest.mock('@/lib/api', () => ({
  taskAPI: {
    getAllTasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  },
}));

jest.mock('@/components/task-form', () => ({
  TaskForm: ({ onSubmit, isLoading }: any) => (
    <div data-testid="task-form">
      <button
        data-testid="create-task-btn"
        onClick={() => onSubmit({ title: 'New Task', description: 'Test description' })}
        disabled={isLoading}
      >
        {isLoading ? 'Creating...' : 'Create Task'}
      </button>
    </div>
  ),
}));

jest.mock('@/components/task-list', () => ({
  TaskList: ({ tasks, onUpdate, onDelete, isLoading }: any) => (
    <div data-testid="task-list">
      {tasks.map((task: Task) => (
        <div key={task.id} data-testid={`task-${task.id}`}>
          <span data-testid={`task-title-${task.id}`}>{task.title}</span>
          <span data-testid={`task-completed-${task.id}`}>
            {task.completed ? 'completed' : 'incomplete'}
          </span>
          <button
            data-testid={`update-task-${task.id}`}
            onClick={() => onUpdate(task.id, { completed: !task.completed })}
          >
            Toggle Complete
          </button>
          <button
            data-testid={`delete-task-${task.id}`}
            onClick={() => onDelete(task.id)}
          >
            Delete
          </button>
        </div>
      ))}
      {isLoading && <div data-testid="loading-indicator">Loading...</div>}
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

jest.mock('lucide-react', () => ({
  Loader2: ({ className, ...props }: any) => <div className={className} {...props} data-testid="loader2" />,
  ListTodo: ({ className, ...props }: any) => <div className={className} {...props} data-testid="list-todo" />,
}));

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Task 1',
    description: 'Description 1',
    completed: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    dueDate: '2024-12-31T23:59:59Z',
  },
  {
    id: '2',
    title: 'Task 2',
    description: 'Description 2',
    completed: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'Task 3',
    completed: false,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

const mockTaskAPI = taskAPI as jest.Mocked<typeof taskAPI>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTaskAPI.getAllTasks.mockResolvedValue([...mockTasks]);
  });

  describe('Initial Loading', () => {
    it('should show loading state initially', async () => {
      mockTaskAPI.getAllTasks.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 100)));
      
      render(<Home />);
      
      expect(screen.getByTestId('loader2')).toBeInTheDocument();
      expect(screen.getByText('Loading your tasks...')).toBeInTheDocument();
    });

    it('should load tasks on mount', async () => {
      render(<Home />);
      
      await waitFor(() => {
        expect(mockTaskAPI.getAllTasks).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading your tasks...')).not.toBeInTheDocument();
      });
    });

    it('should handle loading tasks error', async () => {
      mockTaskAPI.getAllTasks.mockRejectedValue(new Error('API Error'));
      
      render(<Home />);
      
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to load tasks');
      });
    });
  });

  describe('Task Display and Filtering', () => {
    beforeEach(async () => {
      render(<Home />);
      await waitFor(() => {
        expect(screen.queryByText('Loading your tasks...')).not.toBeInTheDocument();
      });
    });

    it('should display all tasks by default', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('task-1')).toBeInTheDocument();
        expect(screen.getByTestId('task-2')).toBeInTheDocument();
        expect(screen.getByTestId('task-3')).toBeInTheDocument();
      });
    });

    it('should filter completed tasks', async () => {
      fireEvent.click(screen.getByTestId('filter-completed'));
      
      await waitFor(() => {
        expect(screen.getByTestId('task-2')).toBeInTheDocument();
        expect(screen.queryByTestId('task-1')).not.toBeInTheDocument();
        expect(screen.queryByTestId('task-3')).not.toBeInTheDocument();
      });
    });

    it('should filter incomplete tasks', async () => {
      fireEvent.click(screen.getByTestId('filter-incomplete'));
      
      await waitFor(() => {
        expect(screen.getByTestId('task-1')).toBeInTheDocument();
        expect(screen.getByTestId('task-3')).toBeInTheDocument();
        expect(screen.queryByTestId('task-2')).not.toBeInTheDocument();
      });
    });

    it('should show all tasks when switching back to all filter', async () => {
      fireEvent.click(screen.getByTestId('filter-completed'));
      fireEvent.click(screen.getByTestId('filter-all'));
      
      await waitFor(() => {
        expect(screen.getByTestId('task-1')).toBeInTheDocument();
        expect(screen.getByTestId('task-2')).toBeInTheDocument();
        expect(screen.getByTestId('task-3')).toBeInTheDocument();
      });
    });

    it('should display correct task counts', async () => {
      await waitFor(() => {
        expect(screen.getByText('All (3)')).toBeInTheDocument();
        expect(screen.getByText('Completed (1)')).toBeInTheDocument();
        expect(screen.getByText('Incomplete (2)')).toBeInTheDocument();
      });
    });
  });

  describe('Task Creation', () => {
    beforeEach(async () => {
      render(<Home />);
      await waitFor(() => {
        expect(screen.queryByText('Loading your tasks...')).not.toBeInTheDocument();
      });
    });

    it('should create a new task successfully', async () => {
      const newTask: Task = {
        id: '4',
        title: 'New Task',
        description: 'Test description',
        completed: false,
        createdAt: '2024-01-04T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
      };

      mockTaskAPI.createTask.mockResolvedValue(newTask);

      fireEvent.click(screen.getByTestId('create-task-btn'));

      await waitFor(() => {
        expect(mockTaskAPI.createTask).toHaveBeenCalledWith({
          title: 'New Task',
          description: 'Test description',
        });
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Task created successfully!');
      });
    });

    it('should handle task creation error', async () => {
      mockTaskAPI.createTask.mockRejectedValue(new Error('Creation failed'));

      fireEvent.click(screen.getByTestId('create-task-btn'));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to create task');
      });
    });

    it('should show loading state during task creation', async () => {
      mockTaskAPI.createTask.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      fireEvent.click(screen.getByTestId('create-task-btn'));

      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });
  });

  describe('Task Updates', () => {
    beforeEach(async () => {
      render(<Home />);
      await waitFor(() => {
        expect(screen.queryByText('Loading your tasks...')).not.toBeInTheDocument();
      });
    });

    it('should update task completion status', async () => {
      const updatedTask = { ...mockTasks[0], completed: true };
      mockTaskAPI.updateTask.mockResolvedValue(updatedTask);

      fireEvent.click(screen.getByTestId('update-task-1'));

      await waitFor(() => {
        expect(mockTaskAPI.updateTask).toHaveBeenCalledWith('1', { completed: true });
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Task completed!');
      });
    });

    it('should handle marking completed task as incomplete', async () => {
      const updatedTask = { ...mockTasks[1], completed: false };
      mockTaskAPI.updateTask.mockResolvedValue(updatedTask);

      fireEvent.click(screen.getByTestId('update-task-2'));

      await waitFor(() => {
        expect(mockTaskAPI.updateTask).toHaveBeenCalledWith('2', { completed: false });
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Task marked as incomplete');
      });
    });

    it('should handle task update error', async () => {
      mockTaskAPI.updateTask.mockRejectedValue(new Error('Update failed'));

      fireEvent.click(screen.getByTestId('update-task-1'));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to update task');
      });
    });
  });

  describe('Task Deletion', () => {
    beforeEach(async () => {
      render(<Home />);
      await waitFor(() => {
        expect(screen.queryByText('Loading your tasks...')).not.toBeInTheDocument();
      });
    });

    it('should delete a task successfully', async () => {
      mockTaskAPI.deleteTask.mockResolvedValue(undefined);

      fireEvent.click(screen.getByTestId('delete-task-1'));

      await waitFor(() => {
        expect(mockTaskAPI.deleteTask).toHaveBeenCalledWith('1');
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Task deleted successfully!');
      });
    });

    it('should handle task deletion error', async () => {
      mockTaskAPI.deleteTask.mockRejectedValue(new Error('Deletion failed'));

      fireEvent.click(screen.getByTestId('delete-task-1'));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to delete task');
      });
    });
  });

  describe('UI Elements', () => {
    beforeEach(async () => {
      render(<Home />);
      await waitFor(() => {
        expect(screen.queryByText('Loading your tasks...')).not.toBeInTheDocument();
      });
    });

    it('should render header with title and subtitle', () => {
      expect(screen.getByText('TaskFlow')).toBeInTheDocument();
      expect(screen.getByText('Stay organized, get things done')).toBeInTheDocument();
    });

    it('should render theme toggle', () => {
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('should render task form', () => {
      expect(screen.getByTestId('task-form')).toBeInTheDocument();
    });

    it('should render task filters', () => {
      expect(screen.getByTestId('task-filters')).toBeInTheDocument();
    });

    it('should render task list', () => {
      expect(screen.getByTestId('task-list')).toBeInTheDocument();
    });
  });

  describe('Data Normalization', () => {
    it('should normalize completed field for various truthy/falsy values', async () => {
      const tasksWithVariousCompletedValues = [
        { ...mockTasks[0], completed: 1 },
        { ...mockTasks[1], completed: 'true' },
        { ...mockTasks[2], completed: null },
      ];

      mockTaskAPI.getAllTasks.mockResolvedValue(tasksWithVariousCompletedValues as any);

      render(<Home />);

      await waitFor(() => {
        expect(screen.queryByText('Loading your tasks...')).not.toBeInTheDocument();
      });

      // Verify that completed values are normalized to boolean
      expect(screen.getByTestId('task-completed-1')).toHaveTextContent('completed');
      expect(screen.getByTestId('task-completed-2')).toHaveTextContent('completed');
      expect(screen.getByTestId('task-completed-3')).toHaveTextContent('incomplete');
    });
  });

  describe('Task Sorting', () => {
    it('should sort tasks by creation date (newest first)', async () => {
      const unsortedTasks = [
        { ...mockTasks[0], createdAt: '2024-01-01T00:00:00Z' },
        { ...mockTasks[1], createdAt: '2024-01-03T00:00:00Z' },
        { ...mockTasks[2], createdAt: '2024-01-02T00:00:00Z' },
      ];

      mockTaskAPI.getAllTasks.mockResolvedValue(unsortedTasks);

      render(<Home />);

      await waitFor(() => {
        expect(screen.queryByText('Loading your tasks...')).not.toBeInTheDocument();
      });

      const taskElements = screen.getAllByTestId(/^task-\d+$/);
      // Task 2 should be first (newest), then Task 3, then Task 1 (oldest)
      expect(taskElements[0]).toHaveAttribute('data-testid', 'task-2');
      expect(taskElements[1]).toHaveAttribute('data-testid', 'task-3');
      expect(taskElements[2]).toHaveAttribute('data-testid', 'task-1');
    });
  });
});