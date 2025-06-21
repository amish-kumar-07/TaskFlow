'use client';

import { Button } from '@/components/ui/button';
import { TaskFilter } from '@/types/task';
import { CheckCircle, Circle, List } from 'lucide-react';

interface TaskFiltersProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  taskCounts: {
    all: number;
    completed: number;
    incomplete: number;
  };
}

export function TaskFilters({ currentFilter, onFilterChange, taskCounts }: TaskFiltersProps) {
  const filters = [
    {
      key: 'all' as TaskFilter,
      label: 'All Tasks',
      icon: List,
      count: taskCounts.all,
    },
    {
      key: 'incomplete' as TaskFilter,
      label: 'Incomplete',
      icon: Circle,
      count: taskCounts.incomplete,
    },
    {
      key: 'completed' as TaskFilter,
      label: 'Completed',
      icon: CheckCircle,
      count: taskCounts.completed,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(({ key, label, icon: Icon, count }) => (
        <Button
          key={key}
          variant={currentFilter === key ? 'default' : 'outline'}
          onClick={() => onFilterChange(key)}
          className="transition-all duration-200 hover:scale-105"
        >
          <Icon className="mr-2 h-4 w-4" />
          {label}
          <span className="ml-2 rounded-full bg-background/20 px-2 py-0.5 text-xs">
            {count}
          </span>
        </Button>
      ))}
    </div>
  );
}