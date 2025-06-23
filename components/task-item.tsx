'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  Circle,
  Edit3,
  Trash2,
  Calendar,
  Save,
  X,
  Loader2,
} from 'lucide-react';
import { Task, UpdateTaskData } from '@/types/task';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, data: UpdateTaskData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function TaskItem({ task, onUpdate, onDelete, isLoading }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editDueDate, setEditDueDate] = useState(
    task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''
  );

  const handleToggleComplete = async () => {
    await onUpdate(task.id, { completed: !task.completed });
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    await onUpdate(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      dueDate: editDueDate || undefined,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDueDate(task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '');
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(task.id);
  };

  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md border-0 bg-card/50 backdrop-blur',
        task.completed && 'opacity-75',
        isOverdue && 'border-l-4 border-l-destructive'
      )}
      data-testid="task-card"
    >
      <CardContent className="p-4" data-testid="card-content">
        {isEditing ? (
          <div className="space-y-3">
            <Input
              data-testid="input-task-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task title"
              disabled={isLoading}
            />
            <Textarea
              data-testid="textarea-task-description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Task description"
              disabled={isLoading}
              rows={2}
            />
            <Input
              data-testid="input-date"
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSaveEdit}
                disabled={!editTitle.trim() || isLoading}
                size="sm"
                aria-label="save changes"
              >
                {isLoading ? (
                  <Loader2 data-testid="loader2" className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                size="sm"
                disabled={isLoading}
                aria-label="cancel edit"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <Button
                  onClick={handleToggleComplete}
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  className="mt-0.5 p-0 h-auto hover:bg-transparent"
                  aria-label="toggle complete"
                >
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle
                      data-testid="circle"
                      className="h-5 w-5 text-muted-foreground hover:text-green-500 transition-colors"
                    />
                  )}
                </Button>

                <div className="flex-1 space-y-1">
                  <h3
                    className={cn(
                      'font-medium transition-all duration-200',
                      task.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p
                      className={cn(
                        'text-sm text-muted-foreground',
                        task.completed && 'line-through'
                      )}
                    >
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>Created {format(new Date(task.createdAt), 'MMM dd, yyyy')}</span>
                    {task.dueDate && (
                      <Badge
                        variant={isOverdue ? 'destructive' : 'secondary'}
                        className="text-xs"
                        data-testid="badge"
                        data-variant={isOverdue ? 'destructive' : 'secondary'}
                      >
                        <Calendar className="mr-1 h-3 w-3" data-testid="calendar" />
                        Due {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-1">
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  className="h-8 w-8 p-0 hover:bg-muted"
                  aria-label="edit task"
                >
                  <Edit3 className="h-4 w-4" data-testid="edit3" />
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  aria-label="delete task"
                >
                  {isLoading ? (
                    <Loader2 data-testid="loader2" className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
