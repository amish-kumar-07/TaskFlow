import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskItem } from "@/components/task-item"; // Adjust path as needed
import { Task } from '@/types/task';

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatString) => {
    const d = new Date(date);
    if (formatString === 'yyyy-MM-dd') {
      return d.toISOString().split('T')[0];
    }
    if (formatString === 'MMM dd, yyyy') {
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric' 
      });
    }
    return d.toString();
  }),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    isLoading,
    variant,
    size,
    className,
    'aria-label': ariaLabel,
    ...props
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={className}
      aria-label={ariaLabel}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}));



jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="task-card">
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={className} data-variant={variant} data-testid="badge">
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, disabled, type, ...props }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      type={type}
      data-testid={`input-${placeholder?.toLowerCase().replace(/\s+/g, '-') || type || 'input'}`}
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder, disabled, rows, ...props }: any) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      data-testid="textarea-task-description"
      {...props}
    />
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckCircle: (props: any) => <div data-testid="check-circle" {...props} />,
  Circle: (props: any) => <div data-testid="circle" {...props} />,
  Edit3: (props: any) => <div data-testid="edit3" {...props} />,
  Trash2: (props: any) => <div data-testid="trash2" {...props} />,
  Calendar: (props: any) => <div data-testid="calendar" {...props} />,
  Save: (props: any) => <div data-testid="save" {...props} />,
  X: (props: any) => <div data-testid="x" {...props} />,
  Loader2: (props: any) => <div data-testid="loader2" {...props} />,
}));

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  completed: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  dueDate: '2024-12-31T23:59:59Z',
};

const mockTaskWithoutDescription: Task = {
  id: '2',
  title: 'Task Without Description',
  completed: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockCompletedTask: Task = {
  id: '3',
  title: 'Completed Task',
  description: 'Completed Description',
  completed: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  dueDate: '2024-01-01T00:00:00Z', // Past due date
};

const mockOverdueTask: Task = {
  id: '4',
  title: 'Overdue Task',
  completed: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  dueDate: '2023-12-31T23:59:59Z', // Past due date
};

describe('TaskItem Component', () => {
  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock current date to be consistent
    jest.spyOn(Date, 'now').mockImplementation(() => new Date('2024-06-01T00:00:00Z').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Task Display', () => {
    it('should render task with all information', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByTestId('circle')).toBeInTheDocument();
      expect(screen.getByTestId('edit3')).toBeInTheDocument();
      expect(screen.getByTestId('trash2')).toBeInTheDocument();
    });

    it('should render task without description', () => {
      render(
        <TaskItem
          task={mockTaskWithoutDescription}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Task Without Description')).toBeInTheDocument();
      expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
    });

    it('should render completed task with appropriate styling', () => {
      render(
        <TaskItem
          task={mockCompletedTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Completed Task')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle')).toBeInTheDocument();
      expect(screen.queryByTestId('circle')).not.toBeInTheDocument();
    });

    it('should display creation date', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Created/)).toBeInTheDocument();
    });

    it('should display due date badge when task has due date', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('badge')).toBeInTheDocument();
      expect(screen.getByTestId('calendar')).toBeInTheDocument();
      expect(screen.getByText(/Due/)).toBeInTheDocument();
    });

    it('should not display due date badge when task has no due date', () => {
      render(
        <TaskItem
          task={mockTaskWithoutDescription}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
      expect(screen.queryByTestId('calendar')).not.toBeInTheDocument();
    });

    it('should show overdue styling for overdue tasks', () => {
      render(
        <TaskItem
          task={mockOverdueTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'destructive');
    });

    it('should not show overdue styling for completed overdue tasks', () => {
      const completedOverdueTask = { ...mockOverdueTask, completed: true };
      render(
        <TaskItem
          task={completedOverdueTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'secondary');
    });
  });

  describe('Task Completion Toggle', () => {
    it('should toggle task completion when circle is clicked', async () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const toggleButton = screen.getByLabelText('toggle complete');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('1', { completed: true });
      });
    });

    it('should toggle completed task to incomplete', async () => {
      render(
        <TaskItem
          task={mockCompletedTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const toggleButton = screen.getByLabelText('toggle complete');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('3', { completed: false });
      });
    });

    it('should disable toggle button when loading', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      const toggleButton = screen.getByLabelText('toggle complete');
      expect(toggleButton).toBeDisabled();
    });
  });

  describe('Task Editing', () => {
    it('should enter edit mode when edit button is clicked', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText('edit task');
      fireEvent.click(editButton);

      expect(screen.getByTestId('input-task-title')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-task-description')).toBeInTheDocument();
      expect(screen.getByTestId('input-date')).toBeInTheDocument();
      expect(screen.getByLabelText('save changes')).toBeInTheDocument();
      expect(screen.getByLabelText('cancel edit')).toBeInTheDocument();
    });

    it('should populate edit form with current task data', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText('edit task');
      fireEvent.click(editButton);

      expect(screen.getByTestId('input-task-title')).toHaveValue('Test Task');
      expect(screen.getByTestId('textarea-task-description')).toHaveValue('Test Description');
      expect(screen.getByTestId('input-date')).toHaveValue('2024-12-31');
    });

    it('should populate edit form with empty values for optional fields', () => {
      render(
        <TaskItem
          task={mockTaskWithoutDescription}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText('edit task');
      fireEvent.click(editButton);

      expect(screen.getByTestId('input-task-title')).toHaveValue('Task Without Description');
      expect(screen.getByTestId('textarea-task-description')).toHaveValue('');
      expect(screen.getByTestId('input-date')).toHaveValue('');
    });

    it('should update input values when typing', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText('edit task');
      fireEvent.click(editButton);

      const titleInput = screen.getByTestId('input-task-title');
      const descriptionInput = screen.getByTestId('textarea-task-description');
      const dateInput = screen.getByTestId('input-date');

      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
      fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });
      fireEvent.change(dateInput, { target: { value: '2024-07-01' } });

      expect(titleInput).toHaveValue('Updated Title');
      expect(descriptionInput).toHaveValue('Updated Description');
      expect(dateInput).toHaveValue('2024-07-01');
    });

    it('should save changes when save button is clicked', async () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText('edit task');
      fireEvent.click(editButton);

      const titleInput = screen.getByTestId('input-task-title');
      const descriptionInput = screen.getByTestId('textarea-task-description');
      const dateInput = screen.getByTestId('input-date');

      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
      fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });
      fireEvent.change(dateInput, { target: { value: '2024-07-01' } });

      const saveButton = screen.getByLabelText('save changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('1', {
          title: 'Updated Title',
          description: 'Updated Description',
          dueDate: '2024-07-01',
        });
      });
    });

    it('should save changes with undefined for empty optional fields', async () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText('edit task');
      fireEvent.click(editButton);

      const titleInput = screen.getByTestId('input-task-title');
      const descriptionInput = screen.getByTestId('textarea-task-description');
      const dateInput = screen.getByTestId('input-date');

      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
      fireEvent.change(descriptionInput, { target: { value: '' } });
      fireEvent.change(dateInput, { target: { value: '' } });

      const saveButton = screen.getByLabelText('save changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('1', {
          title: 'Updated Title',
          description: undefined,
          dueDate: undefined,
        });
      });
    });

    it('should not save when title is empty', async () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText('edit task');
      fireEvent.click(editButton);

      const titleInput = screen.getByTestId('input-task-title');
      fireEvent.change(titleInput, { target: { value: '' } });

      const saveButton = screen.getByLabelText('save changes');
      fireEvent.click(saveButton);

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('should not save when title is only whitespace', async () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText('edit task');
      fireEvent.click(editButton);

      const titleInput = screen.getByTestId('input-task-title');
      fireEvent.change(titleInput, { target: { value: '   ' } });

      const saveButton = screen.getByLabelText('save changes');
      fireEvent.click(saveButton);

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('should cancel edit and restore original values', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText('edit task');
      fireEvent.click(editButton);

      // Make changes
      const titleInput = screen.getByTestId('input-task-title');
      fireEvent.change(titleInput, { target: { value: 'Changed Title' } });

      // Cancel edit
      const cancelButton = screen.getByLabelText('cancel edit');
      fireEvent.click(cancelButton);

      // Should exit edit mode
      expect(screen.queryByTestId('input-task-title')).not.toBeInTheDocument();
      expect(screen.getByText('Test Task')).toBeInTheDocument();

      // Re-enter edit mode to check if values are restored
      fireEvent.click(screen.getByLabelText('edit task'));
      expect(screen.getByTestId('input-task-title')).toHaveValue('Test Task');
    });

    it('should disable save button when title is empty', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText('edit task');
      fireEvent.click(editButton);

      const titleInput = screen.getByTestId('input-task-title');
      fireEvent.change(titleInput, { target: { value: '' } });

      const saveButton = screen.getByLabelText('save changes');
      expect(saveButton).toBeDisabled();
    });

    test('should disable all inputs when loading in edit mode', () => {
  const { rerender } = render(
    <TaskItem
      task={mockTask}
      onUpdate={mockOnUpdate}
      onDelete={mockOnDelete}
      isLoading={false}
    />
  );

  // Enter edit mode
  fireEvent.click(screen.getByLabelText('edit task'));

  // Simulate loading
  rerender(
    <TaskItem
      task={mockTask}
      onUpdate={mockOnUpdate}
      onDelete={mockOnDelete}
      isLoading={true}
    />
  );

  expect(screen.getByTestId('input-task-title')).toBeDisabled();
  expect(screen.getByTestId('textarea-task-description')).toBeDisabled();
  expect(screen.getByTestId('input-date')).toBeDisabled();
  expect(screen.getByLabelText('save changes')).toBeDisabled();
});


    it('should show loading spinner in save button when loading', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      const editButton = screen.getByLabelText('edit task');
      fireEvent.click(editButton);

      expect(screen.getByTestId('loader2')).toBeInTheDocument();
      expect(screen.queryByTestId('save')).not.toBeInTheDocument();
    });

    it('should exit edit mode after successful save', async () => {
      mockOnUpdate.mockResolvedValue(undefined);

      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText('edit task');
      fireEvent.click(editButton);

      const saveButton = screen.getByLabelText('save changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByTestId('input-task-title')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  describe('Task Deletion', () => {
    it('should call onDelete when delete button is clicked', async () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByLabelText('delete task');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith('1');
      });
    });

    it('should disable delete button when loading', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      const deleteButton = screen.getByLabelText('delete task');
      expect(deleteButton).toBeDisabled();
    });

    it('should show loading spinner in delete button when loading', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      // The delete button should show loader when isLoading is true
      expect(screen.getAllByTestId('loader2')).toHaveLength(1);
    });
  });

  describe('Loading States', () => {
    it('should disable edit button when loading', async() => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      const editButton = screen.getByLabelText('edit task');
      await waitFor(() => {
        expect(screen.getByLabelText('edit task')).toBeDisabled();
      });
    });

    it('should handle loading state properly in all interactions', async() => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText('edit task')).toBeDisabled();
        expect(screen.getByLabelText('toggle complete')).toBeDisabled();
        expect(screen.getByLabelText('delete task')).toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels for all buttons', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByLabelText('toggle complete')).toBeInTheDocument();
      expect(screen.getByLabelText('edit task')).toBeInTheDocument();
      expect(screen.getByLabelText('delete task')).toBeInTheDocument();
    });

    it('should have proper aria-labels in edit mode', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText('edit task');
      fireEvent.click(editButton);

      expect(screen.getByLabelText('save changes')).toBeInTheDocument();
      expect(screen.getByLabelText('cancel edit')).toBeInTheDocument();
    });
  });
});