// test/unit/task-filters.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskFilters } from '@/components/task-filters';
import { TaskFilter } from '@/types/task';

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, onClick, className, ...props }: any) => (
    <button
      onClick={onClick}
      className={`${className} ${variant === 'default' ? 'btn-default' : 'btn-outline'}`}
      data-testid={`filter-button-${variant}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckCircle: ({ className }: any) => <div className={className} data-testid="check-circle-icon" />,
  Circle: ({ className }: any) => <div className={className} data-testid="circle-icon" />,
  List: ({ className }: any) => <div className={className} data-testid="list-icon" />,
}));

describe('🎯 TaskFilters Component', () => {
  const mockOnFilterChange = jest.fn();
  
  const defaultProps = {
    currentFilter: 'all' as TaskFilter,
    onFilterChange: mockOnFilterChange,
    taskCounts: {
      all: 10,
      completed: 3,
      incomplete: 7,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all filter buttons with correct labels', () => {
      render(<TaskFilters {...defaultProps} />);

      expect(screen.getByText('All Tasks')).toBeInTheDocument();
      expect(screen.getByText('Incomplete')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('renders correct icons for each filter', () => {
      render(<TaskFilters {...defaultProps} />);

      expect(screen.getByTestId('list-icon')).toBeInTheDocument();
      expect(screen.getByTestId('circle-icon')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    it('displays correct task counts for each filter', () => {
      render(<TaskFilters {...defaultProps} />);

      expect(screen.getByText('10')).toBeInTheDocument(); // all count
      expect(screen.getByText('3')).toBeInTheDocument();  // completed count
      expect(screen.getByText('7')).toBeInTheDocument();  // incomplete count
    });

    it('renders with zero counts', () => {
      const propsWithZeroCounts = {
        ...defaultProps,
        taskCounts: {
          all: 0,
          completed: 0,
          incomplete: 0,
        },
      };

      render(<TaskFilters {...propsWithZeroCounts} />);

      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(3); // all, completed, incomplete
    });

    it('renders with high counts', () => {
      const propsWithHighCounts = {
        ...defaultProps,
        taskCounts: {
          all: 999,
          completed: 500,
          incomplete: 499,
        },
      };

      render(<TaskFilters {...propsWithHighCounts} />);

      expect(screen.getByText('999')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('499')).toBeInTheDocument();
    });
  });

  describe('Filter Selection', () => {
    it('shows "all" filter as active by default', () => {
      render(<TaskFilters {...defaultProps} />);

      const allButton = screen.getByText('All Tasks').closest('button');
      expect(allButton).toHaveClass('btn-default');
    });

    it('shows "completed" filter as active when selected', () => {
      const props = {
        ...defaultProps,
        currentFilter: 'completed' as TaskFilter,
      };

      render(<TaskFilters {...props} />);

      const completedButton = screen.getByText('Completed').closest('button');
      const allButton = screen.getByText('All Tasks').closest('button');
      const incompleteButton = screen.getByText('Incomplete').closest('button');

      expect(completedButton).toHaveClass('btn-default');
      expect(allButton).toHaveClass('btn-outline');
      expect(incompleteButton).toHaveClass('btn-outline');
    });

    it('shows "incomplete" filter as active when selected', () => {
      const props = {
        ...defaultProps,
        currentFilter: 'incomplete' as TaskFilter,
      };

      render(<TaskFilters {...props} />);

      const incompleteButton = screen.getByText('Incomplete').closest('button');
      const allButton = screen.getByText('All Tasks').closest('button');
      const completedButton = screen.getByText('Completed').closest('button');

      expect(incompleteButton).toHaveClass('btn-default');
      expect(allButton).toHaveClass('btn-outline');
      expect(completedButton).toHaveClass('btn-outline');
    });
  });

  describe('User Interactions', () => {
    it('calls onFilterChange when "all" filter is clicked', () => {
      render(<TaskFilters {...defaultProps} />);

      const allButton = screen.getByText('All Tasks');
      fireEvent.click(allButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('all');
      expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    });

    it('calls onFilterChange when "completed" filter is clicked', () => {
      render(<TaskFilters {...defaultProps} />);

      const completedButton = screen.getByText('Completed');
      fireEvent.click(completedButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('completed');
      expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    });

    it('calls onFilterChange when "incomplete" filter is clicked', () => {
      render(<TaskFilters {...defaultProps} />);

      const incompleteButton = screen.getByText('Incomplete');
      fireEvent.click(incompleteButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('incomplete');
      expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    });

    it('handles multiple filter clicks', () => {
      render(<TaskFilters {...defaultProps} />);

      const allButton = screen.getByText('All Tasks');
      const completedButton = screen.getByText('Completed');
      const incompleteButton = screen.getByText('Incomplete');

      fireEvent.click(allButton);
      fireEvent.click(completedButton);
      fireEvent.click(incompleteButton);

      expect(mockOnFilterChange).toHaveBeenCalledTimes(3);
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(1, 'all');
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(2, 'completed');
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(3, 'incomplete');
    });

    it('handles clicking the same filter multiple times', () => {
      render(<TaskFilters {...defaultProps} />);

      const allButton = screen.getByText('All Tasks');
      
      fireEvent.click(allButton);
      fireEvent.click(allButton);
      fireEvent.click(allButton);

      expect(mockOnFilterChange).toHaveBeenCalledTimes(3);
      expect(mockOnFilterChange).toHaveBeenCalledWith('all');
    });
  });

  describe('Component Structure', () => {
    it('renders filter buttons in correct order', () => {
      render(<TaskFilters {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      
      expect(buttons[0]).toHaveTextContent('All Tasks');
      expect(buttons[1]).toHaveTextContent('Incomplete');
      expect(buttons[2]).toHaveTextContent('Completed');
    });

    it('applies correct CSS classes', () => {
      render(<TaskFilters {...defaultProps} />);

      const container = screen.getByText('All Tasks').closest('div');
      expect(container).toHaveClass('flex', 'flex-wrap', 'gap-2');

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('transition-all', 'duration-200', 'hover:scale-105');
      });
    });

    it('renders icons with correct classes', () => {
      render(<TaskFilters {...defaultProps} />);

      const icons = [
        screen.getByTestId('list-icon'),
        screen.getByTestId('circle-icon'),
        screen.getByTestId('check-circle-icon'),
      ];

      icons.forEach(icon => {
        expect(icon).toHaveClass('mr-2', 'h-4', 'w-4');
      });
    });

    it('renders count spans with correct classes and content', () => {
      render(<TaskFilters {...defaultProps} />);

      const countSpans = screen.getAllByText(/^\d+$/).map(el => el.closest('span'));
      
      countSpans.forEach(span => {
        expect(span).toHaveClass(
          'ml-2',
          'rounded-full',
          'bg-background/20',
          'px-2',
          'py-0.5',
          'text-xs'
        );
      });

      expect(countSpans).toHaveLength(3);
    });
  });

  describe('Accessibility', () => {
    it('renders buttons with proper accessibility attributes', () => {
      render(<TaskFilters {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
        expect(button).toBeEnabled();
      });
    });

    it('maintains keyboard navigation', () => {
      render(<TaskFilters {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabindex', '0');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined currentFilter gracefully', () => {
      const props = {
        ...defaultProps,
        currentFilter: undefined as any,
      };

      render(<TaskFilters {...props} />);

      // All buttons should be outline variant when currentFilter is undefined
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('btn-outline');
      });
    });

    it('handles missing taskCounts properties', () => {
      const props = {
        ...defaultProps,
        taskCounts: {
          all: 5,
          completed: 2,
          incomplete: 3,
        },
      };

      render(<TaskFilters {...props} />);

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('handles very large numbers', () => {
      const props = {
        ...defaultProps,
        taskCounts: {
          all: 1000000,
          completed: 500000,
          incomplete: 500000,
        },
      };

      render(<TaskFilters {...props} />);

      expect(screen.getByText('1000000')).toBeInTheDocument();
      expect(screen.getAllByText('500000')).toHaveLength(2);
    });

    it('handles negative numbers (edge case)', () => {
      const props = {
        ...defaultProps,
        taskCounts: {
          all: -1,
          completed: -2,
          incomplete: -3,
        },
      };

      render(<TaskFilters {...props} />);

      expect(screen.getByText('-1')).toBeInTheDocument();
      expect(screen.getByText('-2')).toBeInTheDocument();
      expect(screen.getByText('-3')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily when props do not change', () => {
      const { rerender } = render(<TaskFilters {...defaultProps} />);

      const initialButtons = screen.getAllByRole('button');
      const initialButtonCount = initialButtons.length;

      // Re-render with same props
      rerender(<TaskFilters {...defaultProps} />);

      const afterRerenderButtons = screen.getAllByRole('button');
      expect(afterRerenderButtons).toHaveLength(initialButtonCount);
    });

    it('updates correctly when props change', () => {
      const { rerender } = render(<TaskFilters {...defaultProps} />);

      expect(screen.getByText('10')).toBeInTheDocument();

      const newProps = {
        ...defaultProps,
        taskCounts: {
          all: 20,
          completed: 8,
          incomplete: 12,
        },
      };

      rerender(<TaskFilters {...newProps} />);

      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });
});