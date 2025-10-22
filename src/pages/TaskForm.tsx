import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../utils/api";
import type { Project } from "../types";
import toast from "react-hot-toast";

interface TaskFormData {
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  dueDate: string;
  project: string;
}

const TaskForm: React.FC = () => {
  const { id, projectId } = useParams<{ id: string; projectId: string }>();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const isEditing = Boolean(id);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      dueDate: "",
      project: projectId || "",
    },
  });

  useEffect(() => {
    fetchProjects();
    
    // If we have a projectId from URL, set it and fetch project details
    if (projectId) {
      setValue("project", projectId);
      fetchProjectDetails(projectId);
    }

    if (isEditing && id && projectId) {
      fetchTask();
    }
  }, [id, isEditing, projectId, setValue]);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch projects");
    }
  };

  const fetchProjectDetails = async (projectId: string) => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      setCurrentProject(response.data);
    } catch (error: any) {
      console.error("Failed to fetch project details:", error);
    }
  };

  const fetchTask = async () => {
    try {
      // For editing, we need to get the task details
      if (!projectId) return;
      
      const tasksResponse = await api.get(`/tasks/project/${projectId}`);
      const task = tasksResponse.data.find((t: any) => t._id === id);
      
      if (task) {
        reset({
          title: task.title,
          description: task.description || "",
          status: task.status,
          dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
          project: projectId, // Use the projectId from URL for editing
        });
        
        // Fetch project details for the task's project
        fetchProjectDetails(projectId);
      } else {
        toast.error("Task not found");
        navigate(`/projects/${projectId}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch task");
      navigate(projectId ? `/projects/${projectId}` : "/dashboard");
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    setLoading(true);
    try {
      if (isEditing && id) {
        await api.put(`/tasks/${id}`, data);
        toast.success("Task updated successfully!");
      } else {
        await api.post("/tasks", data);
        toast.success("Task created successfully!");
      }
      // Always navigate back to the project we're working with
      navigate(`/projects/${data.project}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  // Show project name if we're creating a task for a specific project
  const showProjectInfo = projectId && currentProject;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">
              {isEditing ? "Edit Task" : "Create New Task"}
            </h1>
            {showProjectInfo && (
              <p className="text-gray-600 mt-2">
                for project: <span className="font-medium text-indigo-600">{currentProject.title}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                {...register("title", {
                  required: "Title is required",
                  minLength: {
                    value: 3,
                    message: "Title must be at least 3 characters",
                  },
                })}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                  ${errors.title ? "border-red-500" : "border-gray-300"}`}
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                {...register("description", {
                  maxLength: {
                    value: 500,
                    message: "Description cannot exceed 500 characters",
                  },
                })}
                rows={4}
                placeholder="Write a short description about the task..."
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                  ${errors.description ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Project Selection - Only show if not creating from a specific project */}
            {!projectId ? (
              <div>
                <label
                  htmlFor="project"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project *
                </label>
                <select
                  id="project"
                  {...register("project", { required: "Project is required" })}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                    ${errors.project ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
                {errors.project && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.project.message}
                  </p>
                )}
              </div>
            ) : (
              // Show hidden field with projectId when it comes from URL
              <input type="hidden" {...register("project")} />
            )}

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                {...register("status", { required: "Status is required" })}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                  ${errors.status ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                {...register("dueDate")}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                  ${errors.dueDate ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.dueDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.dueDate.message}
                </p>
              )}
            </div>

            {/* Project Info Display (when project comes from URL) */}
            {projectId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Project:</strong> {currentProject?.title || "Loading..."}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  This task will be added to the current project
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() =>
                  navigate(projectId ? `/projects/${projectId}` : "/dashboard")
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
                {loading
                  ? "Saving..."
                  : isEditing
                  ? "Update Task"
                  : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;