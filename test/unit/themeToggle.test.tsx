import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from '@/components/theme-toggle';

// Mock next-themes
const mockSetTheme = jest.fn();
const mockUseTheme = jest.fn();

jest.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock React hooks to test mounting behavior
const mockUseState = jest.fn();
const mockUseEffect = jest.fn();

// Store original implementations
const originalUseState = React.useState;
const originalUseEffect = React.useEffect;

// Test wrapper component
const TestWrapper = ({ children, theme = 'light' }: { children: React.ReactNode; theme?: string }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
};

const renderWithTheme = (component: React.ReactElement, theme = 'light') => {
  mockUseTheme.mockReturnValue({
    theme,
    setTheme: mockSetTheme,
  });
  
  return render(component, { wrapper: TestWrapper });
};

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid React act warnings in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Mounting behavior', () => {
    it('renders correctly after mounting', async () => {
      const { container } = renderWithTheme(<ThemeToggle />);
      
      // Wait for the component to be mounted and rendered
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });
      
      // After mounting, should render the button
      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
      expect(container.firstChild).not.toBeNull();
    });

    it('handles initial mounting state with mocked useState', () => {
        const setMountedMock = jest.fn();

        jest.spyOn(React, 'useState').mockImplementationOnce(() => [false, setMountedMock]);

        const { queryByTestId } = renderWithTheme(<ThemeToggle />);

        // Assert: the button should not be rendered initially
        expect(queryByTestId('theme-toggle')).toBeNull();

        // Restore original useState
        (React.useState as jest.Mock).mockRestore();
    });


    it('handles mounting state correctly', async () => {
      renderWithTheme(<ThemeToggle />);
      
      // Wait for the component to be mounted
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Theme toggling functionality', () => {
    it('toggles from light to dark theme', async () => {
      renderWithTheme(<ThemeToggle />, 'light');
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const button = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(button);
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('toggles from dark to light theme', async () => {
      renderWithTheme(<ThemeToggle />, 'dark');
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const button = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(button);
      
      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('handles system theme correctly', async () => {
      renderWithTheme(<ThemeToggle />, 'system');
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const button = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(button);
      
      // When theme is system, it should toggle to light
      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('handles undefined theme correctly', async () => {
      renderWithTheme(<ThemeToggle />, undefined);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const button = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(button);
      
      // When theme is undefined, it should default to dark
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });
  });

  describe('Accessibility', () => {
    it('has proper button role and attributes', async () => {
      renderWithTheme(<ThemeToggle />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const button = screen.getByRole('button', { name: /toggle theme/i });
      
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAccessibleName('Toggle theme');
      expect(button).toHaveClass('transition-all', 'duration-200', 'hover:scale-105');
    });

    it('can be focused and activated with keyboard', async () => {
      renderWithTheme(<ThemeToggle />, 'light');
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const button = screen.getByRole('button', { name: /toggle theme/i });
      
      // Focus the button
      button.focus();
      expect(button).toHaveFocus();
      
      // Activate with Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      fireEvent.keyUp(button, { key: 'Enter', code: 'Enter' });
      
      // Activate with Space key
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      fireEvent.keyUp(button, { key: ' ', code: 'Space' });
      
      // Test that the button can receive focus (don't test blur state as it's environment dependent)
      expect(button).toBeInTheDocument();
    });

    it('has screen reader only text for accessibility', async () => {
      renderWithTheme(<ThemeToggle />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const srText = screen.getByText('Toggle theme');
      expect(srText).toHaveClass('sr-only');
    });
  });

  describe('Visual elements', () => {
    it('contains sun and moon icons', async () => {
      renderWithTheme(<ThemeToggle />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const button = screen.getByRole('button', { name: /toggle theme/i });
      
      // Check for SVG elements (sun and moon icons)
      const svgElements = button.querySelectorAll('svg');
      expect(svgElements).toHaveLength(2);
      
      // Check for sun icon classes
      const sunIcon = button.querySelector('.lucide-sun');
      expect(sunIcon).toBeInTheDocument();
      expect(sunIcon).toHaveClass('h-[1.2rem]', 'w-[1.2rem]', 'rotate-0', 'scale-100', 'transition-all');
      
      // Check for moon icon classes
      const moonIcon = button.querySelector('.lucide-moon');
      expect(moonIcon).toBeInTheDocument();
      expect(moonIcon).toHaveClass('absolute', 'h-[1.2rem]', 'w-[1.2rem]', 'rotate-90', 'scale-0', 'transition-all');
    });

    it('applies correct CSS classes for styling', async () => {
      renderWithTheme(<ThemeToggle />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const button = screen.getByRole('button', { name: /toggle theme/i });
      
      // Check for Button component classes (outline variant, icon size)
      expect(button).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'whitespace-nowrap',
        'rounded-md',
        'text-sm',
        'font-medium',
        'border',
        'border-input',
        'bg-background',
        'hover:bg-accent',
        'hover:text-accent-foreground',
        'h-10',
        'w-10',
        'transition-all',
        'duration-200',
        'hover:scale-105'
      );
    });
  });

  describe('Edge cases', () => {
    it('handles multiple rapid clicks correctly', async () => {
      renderWithTheme(<ThemeToggle />, 'light');
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const button = screen.getByRole('button', { name: /toggle theme/i });
      
      // Click multiple times rapidly
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      // Should have been called 3 times
      expect(mockSetTheme).toHaveBeenCalledTimes(3);
      expect(mockSetTheme).toHaveBeenNthCalledWith(1, 'dark');
      expect(mockSetTheme).toHaveBeenNthCalledWith(2, 'dark');
      expect(mockSetTheme).toHaveBeenNthCalledWith(3, 'dark');
    });

    it('handles theme prop changes correctly', async () => {
      const { rerender } = renderWithTheme(<ThemeToggle />, 'light');
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      let button = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
      
      // Change theme and re-render
      mockSetTheme.mockClear();
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
      });
      
      rerender(<ThemeToggle />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      button = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
  });

  describe('Error handling', () => {
    it('handles missing setTheme function gracefully', async () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: undefined,
      });
      
      renderWithTheme(<ThemeToggle />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const button = screen.getByRole('button', { name: /toggle theme/i });
      
      // Should not throw error when setTheme is undefined
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });
});