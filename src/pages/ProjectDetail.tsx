import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api';
import type { Project, Task } from '../types';
import toast from 'react-hot-toast';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchProjectAndTasks();
  }, [id, filter]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}${filter ? `?status=${filter}` : ''}`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      toast.error('Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => (t._id === taskId ? response.data : t)));
      toast.success('Task status updated!');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-gray-700">Loading...</div>;
  }

  if (!project) {
    return <div className="flex justify-center items-center min-h-screen text-gray-700">Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-900 font-medium">← Back to Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Project Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
          <p className="text-gray-600 mb-4">{project.description}</p>
          <div className="flex justify-between items-center">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {project.status.toUpperCase()}
            </span>
            <Link
              to={`/projects/${project._id}/tasks/new`}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-md"
            >
              + Add Task
            </Link>
          </div>
        </div>

        {/* Task Filter */}
        <div className="flex justify-between items-center mb-4 px-3 sm:px-0">
          <h2 className="text-2xl font-semibold text-gray-900">Tasks</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Task List */}
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks yet. Add your first task!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-3 sm:px-0">
            {tasks.map(task => (
              <div key={task._id} className="bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition hover:scale-[1.02]">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-gray-600 mt-1 text-sm">{task.description}</p>
                    {task.dueDate && (
                      <p className="text-gray-500 mt-1 text-xs">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <div className="flex space-x-2">
                      <Link to={`/tasks/${task._id}/edit`} className="text-yellow-600 hover:text-yellow-900 text-sm font-medium">
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteTaskId(task._id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Task Modal */}
      {deleteTaskId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 sm:w-96">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteTaskId(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.delete(`/tasks/${deleteTaskId}`);
                    setTasks(tasks.filter(t => t._id !== deleteTaskId));
                    toast.success('Task deleted successfully!');
                  } catch (error) {
                    toast.error('Failed to delete task');
                  } finally {
                    setDeleteTaskId(null);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
