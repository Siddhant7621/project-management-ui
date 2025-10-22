import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import api from '../utils/api';
import type { Project } from '../types';
import toast from 'react-hot-toast';

interface TaskFormData {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
  project: string;
}

// Validation schema
const schema = Yup.object().shape({
  title: Yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: Yup.string().max(500, 'Description cannot exceed 500 characters'),
  status: Yup.string().oneOf(['todo', 'in-progress', 'done'], 'Invalid status').required(),
  project: Yup.string().required('Project is required'),
  dueDate: Yup.date().nullable().notRequired(),
});

const TaskForm: React.FC = () => {
  const { id, projectId } = useParams<{ id: string; projectId: string }>();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      dueDate: '',
      project: projectId || '',
    },
  });

  useEffect(() => {
    fetchProjects();
    if (isEditing) fetchTask();
  }, [id]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch {
      toast.error('Failed to fetch projects');
    }
  };

  const fetchTask = async () => {
    try {
      const response = await api.get(`/tasks/project/${projectId}`);
      const task = response.data.find((t: any) => t._id === id);
      if (task) {
        reset({
          title: task.title,
          description: task.description,
          status: task.status,
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
          project: task.project,
        });
      }
    } catch {
      toast.error('Failed to fetch task');
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/tasks/${id}`, data);
        toast.success('Task updated successfully!');
      } else {
        await api.post('/tasks', data);
        toast.success('Task created successfully!');
      }
      navigate(`/projects/${data.project}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <h1 className="text-3xl font-semibold mb-6 text-gray-800">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                {...register('title')}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                  ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter task title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={4}
                placeholder="Write a short description about the task..."
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                  ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Project */}
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                Project *
              </label>
              <select
                id="project"
                {...register('project')}
                disabled={Boolean(projectId)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                  ${errors.project ? 'border-red-500' : 'border-gray-300'} ${projectId ? 'bg-gray-100' : ''}`}
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
              {errors.project && <p className="text-red-500 text-sm mt-1">{errors.project.message}</p>}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                {...register('status')}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                  ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                {...register('dueDate')}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                  ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>}
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() =>
                  navigate(projectId ? `/projects/${projectId}` : '/dashboard')
                }
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {loading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
