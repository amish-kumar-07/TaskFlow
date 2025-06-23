// test/API.test.ts
import { taskAPI } from '@/lib/api';
import { CreateTaskData, UpdateTaskData } from '@/types/task';

describe('taskAPI', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // mock fetch globally
  });

  afterEach(() => {
    jest.resetAllMocks(); // reset mock state
  });

  it('fetches all tasks successfully', async () => {
    const mockTasks = [{ id: '1', title: 'Test', completed: false, description: '', createdAt: '' }];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockTasks }),
    });

    const tasks = await taskAPI.getAllTasks();
    expect(fetch).toHaveBeenCalledWith('/api/fetchdata');
    expect(tasks).toEqual(mockTasks);
  });

  it('throws error when fetching tasks fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to fetch' }),
    });

    await expect(taskAPI.getAllTasks()).rejects.toThrow('Failed to fetch');
  });

  it('creates a task successfully', async () => {
    const taskData: CreateTaskData = { title: 'New Task', description: 'Hello' };
    const createdTask = { ...taskData, id: '123', completed: false, createdAt: '' };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createdTask,
    });

    const result = await taskAPI.createTask(taskData);
    expect(fetch).toHaveBeenCalledWith('/api/createtasks', expect.any(Object));
    expect(result).toEqual(createdTask);
  });

  it('throws error when task creation fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid data' }),
    });

    await expect(taskAPI.createTask({ title: '', description: '' })).rejects.toThrow('Invalid data');
  });

  it('updates a task successfully', async () => {
    const updatedTask = { id: '1', title: 'Updated', completed: true, description: '', createdAt: '' };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: updatedTask }),
    });

    const result = await taskAPI.updateTask('1', { completed: true });
    expect(fetch).toHaveBeenCalledWith('/api/update?id=1', expect.any(Object));
    expect(result).toEqual(updatedTask);
  });

  it('throws error when update fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Update failed' }),
    });

    await expect(taskAPI.updateTask('1', { completed: true })).rejects.toThrow('Update failed');
  });

  it('deletes a task successfully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    await expect(taskAPI.deleteTask('1')).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith('/api/delete?id=1', { method: 'DELETE' });
  });

  it('throws error when delete fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Delete failed' }),
    });

    await expect(taskAPI.deleteTask('1')).rejects.toThrow('Delete failed');
  });
});
