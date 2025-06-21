import { Task, CreateTaskData, UpdateTaskData } from '@/types/task';

export const taskAPI = {
  async getAllTasks(): Promise<Task[]> {
    const response = await fetch('/api/fetchdata');

    if (!response.ok) {
      const { message } = await response.json();
      throw new Error(message || 'Failed to fetch tasks');
    }

    const { data } = await response.json();
    return data;
  },

  async createTask(data: CreateTaskData): Promise<Task> {
    const response = await fetch('/api/createtasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || 'Failed to create task');
    }

    const task = await response.json();
    return task;
  },

  async updateTask(id: string, data: UpdateTaskData): Promise<Task> {
    const response = await fetch(`/api/update?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to update task');
      }

      const result = await response.json();
      return result.data;
    },


  async deleteTask(id: string): Promise<void> {
    const response = await fetch(`/api/delete?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || 'Failed to delete task');
    }
  },
};
