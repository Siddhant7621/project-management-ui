import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import type { Project } from "../types";
import toast from "react-hot-toast";

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  console.log("user", user);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-700">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <h1 className="text-2xl font-bold text-indigo-600">TaskFlow</h1>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center space-x-4">
              <span className="text-gray-700 font-medium">
                Hello, {user?.name}
              </span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="sm:hidden text-gray-700 hover:text-indigo-600 transition"
            >
              {menuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="sm:hidden bg-white shadow-md border-t border-gray-200">
            <div className="flex flex-col px-4 py-3 space-y-3">
              <span className="text-gray-700 font-medium">
                Hello, {user?.name}
              </span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 pt-20">
        {/* Header & New Project Button */}
        <div className="flex justify-between items-center mb-8 px-3 sm:px-0">
          <h2 className="sm:text-3xl text-2xl font-bold text-gray-900">
            My Projects
          </h2>
          <Link
            to="/projects/new"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-md"
          >
            + New Project
          </Link>
        </div>

        {/* Empty State */}
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              No projects yet. Create your first project!
            </p>
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:px-0 px-3 ">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition hover:scale-[1.02]"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-4">{project.description}</p>

                <div className="flex justify-between items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {project.status.toUpperCase()}
                  </span>

                  <div className="flex space-x-3">
                    <Link
                      to={`/projects/${project._id}`}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      View
                    </Link>
                    <Link
                      to={`/projects/${project._id}/edit`}
                      className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteProjectId(project._id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {deleteProjectId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 sm:w-96">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this project? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteProjectId(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!deleteProjectId) return;
                  try {
                    await api.delete(`/projects/${deleteProjectId}`);
                    setProjects(
                      projects.filter((p) => p._id !== deleteProjectId)
                    );
                    toast.success("Project deleted successfully!");
                  } catch (error) {
                    toast.error("Failed to delete project");
                  } finally {
                    setDeleteProjectId(null);
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

export default Dashboard;
