export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
}

export type TaskFilter = 'all' | 'completed' | 'incomplete';