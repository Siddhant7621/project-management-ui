import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import ProjectForm from './pages/ProjectForm';
import TaskForm from './pages/TaskForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/projects/new" element={
            <PrivateRoute>
              <ProjectForm />
            </PrivateRoute>
          } />
          <Route path="/projects/:id/edit" element={
            <PrivateRoute>
              <ProjectForm />
            </PrivateRoute>
          } />
          <Route path="/projects/:id" element={
            <PrivateRoute>
              <ProjectDetail />
            </PrivateRoute>
          } />
          <Route path="/projects/:projectId/tasks/new" element={
            <PrivateRoute>
              <TaskForm />
            </PrivateRoute>
          } />
          <Route path="/tasks/:id/edit" element={
            <PrivateRoute>
              <TaskForm />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;