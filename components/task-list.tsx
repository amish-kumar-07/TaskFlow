'use client';

import { Task, UpdateTaskData } from '@/types/task';
import { TaskItem } from './task-item';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onUpdate: (id: string, data: UpdateTaskData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function TaskList({ tasks, onUpdate, onDelete, isLoading }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card className="border-0 bg-card/30">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No tasks found
          </h3>
          <p className="text-sm text-muted-foreground">
            Add a new task to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}