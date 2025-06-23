import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskForm } from '@/components/task-form';
import '@testing-library/jest-dom';

describe('📝 TaskForm', () => {
  it('renders form inputs and button', () => {
    render(<TaskForm isLoading={false} onSubmit={jest.fn()} />);
    expect(screen.getByPlaceholderText(/what needs to be done/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('calls onSubmit with correct data', async () => {
    const mockSubmit = jest.fn(() => Promise.resolve());

    render(<TaskForm isLoading={false} onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByPlaceholderText(/what needs to be done/i), {
      target: { value: 'New Task' },
    });

    fireEvent.change(screen.getByPlaceholderText(/add more details/i), {
      target: { value: 'Optional description' },
    });

    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: '2025-06-30' },
    });

    fireEvent.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Optional description',
        dueDate: '2025-06-30',
      });
    });
  });

  it('does not submit when title is empty', async () => {
    const mockSubmit = jest.fn();
    render(<TaskForm onSubmit={mockSubmit} />);

    const button = screen.getByRole('button', { name: /add task/i });
    fireEvent.click(button);

    await waitFor(() => {
        expect(mockSubmit).not.toHaveBeenCalled();
    });
    });


  it('does not call onSubmit when title is empty', () => {
        const mockSubmit = jest.fn();
        render(<TaskForm isLoading={false} onSubmit={mockSubmit} />);
        fireEvent.click(screen.getByRole('button', { name: /add task/i }));
        expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('submits with only title and omits optional fields', async () => {
    const mockSubmit = jest.fn();
    render(<TaskForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByPlaceholderText(/what needs to be done/i), {
        target: { value: 'Only Title' },
    });

    fireEvent.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
        title: 'Only Title',
        description: undefined,
        dueDate: undefined,
        });
    });
    });

    it('submits with title, description and dueDate', async () => {
        const mockSubmit = jest.fn();
        render(<TaskForm onSubmit={mockSubmit} />);

        fireEvent.change(screen.getByPlaceholderText(/what needs to be done/i), {
            target: { value: 'Full Task' },
        });
        fireEvent.change(screen.getByPlaceholderText(/add more details/i), {
            target: { value: 'Details' },
        });
        fireEvent.change(screen.getByLabelText(/due date/i), {
            target: { value: '2025-06-30' },
        });

        fireEvent.click(screen.getByRole('button', { name: /add task/i }));

        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalledWith({
            title: 'Full Task',
            description: 'Details',
            dueDate: '2025-06-30',
            });
        });
        });


});
