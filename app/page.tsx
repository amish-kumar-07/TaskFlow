"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Task, CreateTaskData, UpdateTaskData, TaskFilter } from '@/types/task';
import { taskAPI } from '@/lib/api';
import { TaskForm } from '@/components/task-form';
import { TaskList } from '@/components/task-list';
import { TaskFilters } from '@/components/task-filters';
import { ThemeToggle } from '@/components/theme-toggle';
import { Loader2, ListTodo } from 'lucide-react';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [currentFilter, setCurrentFilter] = useState<TaskFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, currentFilter]);

  const normalizeCompleted = (value: any) => Boolean(value);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await taskAPI.getAllTasks();
      const cleaned = fetchedTasks.map(task => ({
        ...task,
        completed: normalizeCompleted(task.completed),
      }));
      setTasks(cleaned);
    } catch (error) {
      toast.error('Failed to load tasks');
      console.error('Error loading tasks:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered: Task[] = [];

    switch (currentFilter) {
      case 'completed':
        filtered = tasks.filter(task => task.completed);
        break;
      case 'incomplete':
        filtered = tasks.filter(task => !task.completed);
        break;
      default:
        filtered = [...tasks];
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (data: CreateTaskData) => {
    setIsLoading(true);
    try {
      const newTask = await taskAPI.createTask(data);
      const fullTask = { ...newTask, completed: normalizeCompleted(newTask.completed) };
      setTasks(prev => [fullTask, ...prev]);
      toast.success('Task created successfully!');
    } catch (error) {
      toast.error('Failed to create task');
      console.error('Error creating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async (id: string, data: UpdateTaskData) => {
    try {
      const updatedTask = await taskAPI.updateTask(id, data);
      const cleanTask = { ...updatedTask, completed: normalizeCompleted(updatedTask.completed) };
      setTasks(prev => prev.map(task => (task.id === id ? cleanTask : task)));

      if (data.completed !== undefined) {
        toast.success(normalizeCompleted(data.completed) ? 'Task completed!' : 'Task marked as incomplete');
      } else {
        toast.success('Task updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update task');
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskAPI.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Task deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };

  const taskCounts = {
    all: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    incomplete: tasks.filter(task => !task.completed).length,
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <ListTodo className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">TaskFlow</h1>
              <p className="text-muted-foreground">Stay organized, get things done</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="mb-8">
          <TaskForm onSubmit={handleCreateTask} isLoading={isLoading} />
        </div>

        <div className="mb-6">
          <TaskFilters
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            taskCounts={taskCounts}
          />
        </div>

        <TaskList
          tasks={filteredTasks}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
