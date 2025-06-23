// test/task-list.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskList } from '@/components/task-list';
import { Task } from '@/types/task';

// 👇 Mock TaskItem for this test only
jest.mock('@/components/task-item', () => ({
  TaskItem: ({ task }: { task: Task }) => (
    <div data-testid="mock-task-item">{task.title}</div>
  ),
}));

describe('📋 TaskList Component', () => {
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  it('renders empty state when no tasks exist', () => {
    render(<TaskList tasks={[]} onUpdate={mockUpdate} onDelete={mockDelete} />);
    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
    expect(screen.getByText(/add a new task to get started/i)).toBeInTheDocument();
  });

  it('renders a list of task items', () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Task One',
        description: 'First task',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Task Two',
        description: 'Second task',
        completed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    render(<TaskList tasks={mockTasks} onUpdate={mockUpdate} onDelete={mockDelete} />);
    expect(screen.getAllByTestId('mock-task-item')).toHaveLength(2);
    expect(screen.getByText('Task One')).toBeInTheDocument();
    expect(screen.getByText('Task Two')).toBeInTheDocument();
  });
});
