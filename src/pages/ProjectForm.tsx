import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface ProjectFormData {
  title: string;
  description: string;
  status: 'active' | 'completed';
}

// Validation schema
const schema = Yup.object().shape({
  title: Yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: Yup.string().max(500, 'Description cannot exceed 500 characters'),
  status: Yup.string().oneOf(['active', 'completed'], 'Invalid status').required(),
});

const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(Boolean(id));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (isEditing) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      reset(response.data); // populate form with existing data
    } catch (error) {
      toast.error('Failed to fetch project details');
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/projects/${id}`, data);
        toast.success('Project updated successfully!');
      } else {
        await api.post('/projects', data);
        toast.success('Project created successfully!');
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 transition hover:shadow-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {isEditing ? 'Edit Project' : 'Create New Project'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              {...register('title')}
              className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-indigo-500 outline-none transition
                ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter project title"
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
              placeholder="Write a short description about the project..."
              className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-indigo-500 outline-none transition
                ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              {...register('status')}
              className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-indigo-500 outline-none transition
                ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
