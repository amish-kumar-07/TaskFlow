'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Loader2, Plus } from 'lucide-react';
import { CreateTaskData } from '@/types/task';

interface TaskFormProps {
  onSubmit: (data: CreateTaskData) => Promise<void>;
  isLoading?: boolean;
}

export function TaskForm({ onSubmit, isLoading }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const taskData: CreateTaskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
    };

    await onSubmit(taskData);

    // Reset form
    setTitle('');
    setDescription('');
    setDueDate('');
  };

  return (
    <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Plus className="h-5 w-5" />
          Add New Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              disabled={isLoading}
              className="transition-all duration-200 focus:scale-[1.01]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              disabled={isLoading}
              className="transition-all duration-200 focus:scale-[1.01] resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isLoading}
              className="transition-all duration-200 focus:scale-[1.01]"
            />
          </div>

          <Button
            type="submit"
            disabled={!title.trim() || isLoading}
            className="w-full transition-all duration-200 hover:scale-[1.02]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Task...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}